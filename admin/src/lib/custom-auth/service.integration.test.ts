/**
 * Integration tests against the live Supabase project using the service role.
 * Skipped unless RUN_AUTH_INTEGRATION=1 and required env vars are present.
 *
 * Creates a disposable user, exercises reset/login/logout, then cleans up.
 * Does not delete pre-existing profiles.
 */
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { randomUUID } from "crypto";

const run = process.env.RUN_AUTH_INTEGRATION === "1";

const describeIntegration = run ? describe : describe.skip;

describeIntegration("custom auth integration", () => {
  const email = `auth-mig-test-${randomUUID().slice(0, 8)}@example.com`;
  const password = "IntegrationTestPass9!";
  let userId: string | null = null;
  let refreshToken: string | null = null;

  beforeAll(() => {
    if (!process.env.AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET.length < 32) {
      process.env.AUTH_JWT_SECRET = "test-auth-jwt-secret-at-least-32-chars-long!!";
    }
  });

  afterAll(async () => {
    if (!userId) return;
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    await supabase.from("auth_sessions").delete().eq("user_id", userId);
    await supabase.from("auth_credentials").delete().eq("user_id", userId);
    await supabase.from("auth_identities").delete().eq("user_id", userId);
    await supabase.from("auth_password_reset_tokens").delete().eq("user_id", userId);
    await supabase.from("auth_email_verification_tokens").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);
    try {
      await supabase.auth.admin.deleteUser(userId);
    } catch {
      // ignore
    }
  });

  it("registers, verifies email, logs in, rejects bad password, refreshes, logs out", async () => {
    const service = await import("./service");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const registered = await service.registerUser({
      name: "Auth Mig Test",
      email,
      password,
      role: "Entrepreneur",
      address: "1 Test Street",
    });
    userId = registered.user.id;
    expect(registered.requiresEmailConfirmation).toBe(true);

    const { data: cred } = await supabase
      .from("auth_credentials")
      .select("password_hash")
      .eq("user_id", userId)
      .single();
    expect(cred?.password_hash?.startsWith("$argon2id$")).toBe(true);
    expect(cred?.password_hash).not.toContain(password);

    // Mark verified directly (email delivery may be stubbed)
    await supabase
      .from("auth_credentials")
      .update({ email_verified_at: new Date().toISOString() })
      .eq("user_id", userId);

    await expect(service.loginWithPassword(email, "WrongPassword!!!")).rejects.toThrow(
      /Invalid email or password/i
    );

    const session = await service.loginWithPassword(email, password);
    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    refreshToken = session.refreshToken;

    const rotated = await service.refresh(refreshToken);
    expect(rotated.accessToken).toBeTruthy();
    expect(rotated.refreshToken).not.toEqual(refreshToken);

    // Old refresh should fail after rotation
    await expect(service.refresh(refreshToken)).rejects.toThrow();

    await service.logout(rotated.refreshToken);
    await expect(service.refresh(rotated.refreshToken)).rejects.toThrow();
  }, 60000);

  it("password reset is single-use and unlocks must_reset accounts", async () => {
    if (!userId) throw new Error("depends on prior test user");
    const service = await import("./service");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { generateOpaqueToken, hashOpaqueToken } = await import("./tokens");
    const supabase = createAdminClient();

    await supabase
      .from("auth_credentials")
      .update({ must_reset_password: true, password_hash: null })
      .eq("user_id", userId);

    const raw = generateOpaqueToken();
    await supabase.from("auth_password_reset_tokens").insert({
      user_id: userId,
      token_hash: hashOpaqueToken(raw),
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    const nextPassword = "ResetPasswordValue9!";
    await service.resetPasswordWithToken(raw, nextPassword);

    await expect(service.resetPasswordWithToken(raw, nextPassword)).rejects.toThrow(
      /Invalid or expired/i
    );

    const session = await service.loginWithPassword(email, nextPassword);
    expect(session.user.id).toBe(userId);
  }, 60000);
});
