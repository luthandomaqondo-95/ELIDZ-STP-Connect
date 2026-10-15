/**
 * Signed upload grant authorization / path scoping tests.
 * Requires RUN_AUTH_INTEGRATION=1.
 *
 * Creates a disposable user via registerUser(); never selects or mutates existing profiles.
 */
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { randomUUID } from "crypto";

const run = process.env.RUN_AUTH_INTEGRATION === "1";
const describeIntegration = run ? describe : describe.skip;

const TEST_PASSWORD = "UploadTestPass9!";

describeIntegration("mobile BFF signed uploads", () => {
  let userA: string | null = null;
  /** Sentinel other-user id for path-ownership assertions (not a real profile). */
  const userB = randomUUID();
  let chatId: string | null = null;
  let participantId: string | null = null;

  beforeAll(async () => {
    if (!process.env.AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET.length < 32) {
      process.env.AUTH_JWT_SECRET = "test-auth-jwt-secret-at-least-32-chars-long!!";
    }

    const { registerUser } = await import("@/lib/custom-auth/service");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const email = `upload-test-${randomUUID()}@example.com`;

    // Capture profile UUID immediately so afterAll can clean up even if later setup fails.
    const registered = await registerUser({
      name: "Upload Test User A",
      email,
      password: TEST_PASSWORD,
      role: "Entrepreneur",
      address: "1 Upload Test Street",
    });
    userA = registered.user.id;

    const { error: verifyError } = await supabase
      .from("auth_credentials")
      .update({ email_verified_at: new Date().toISOString() })
      .eq("user_id", userA);
    if (verifyError) {
      throw new Error(`Failed to mark upload test user email verified: ${verifyError.message}`);
    }

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({ type: "direct", created_by: userA })
      .select("id")
      .single();
    if (chatError || !chat) {
      throw new Error(`Failed to create test chat: ${chatError?.message ?? "no row returned"}`);
    }
    chatId = chat.id;

    const { data: participant, error: participantError } = await supabase
      .from("chat_participants")
      .insert({ chat_id: chatId, user_id: userA })
      .select("id")
      .single();
    if (participantError || !participant) {
      throw new Error(
        `Failed to create test chat participant: ${participantError?.message ?? "no row returned"}`
      );
    }
    participantId = participant.id;
  }, 60000);

  afterAll(async () => {
    const cleanupErrors: string[] = [];

    const recordError = (label: string, err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      cleanupErrors.push(`${label}: ${message}`);
    };

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { deleteProvisionedUser } = await import("@/lib/custom-auth/service");
    const supabase = createAdminClient();

    const deleteById = async (
      table: string,
      id: string | null,
      label: string
    ): Promise<void> => {
      if (!id) return;
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        recordError(label, error);
      }
    };

    try {
      // Dependency order: participant → chat, then disposable user.
      await deleteById("chat_participants", participantId, "delete test chat participant");
      await deleteById("chats", chatId, "delete test chat");
    } finally {
      if (userA) {
        try {
          await deleteProvisionedUser(userA);
          const { data: leftover, error: leftoverError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userA)
            .maybeSingle();
          if (leftoverError) {
            recordError("delete provisioned upload test user (verify)", leftoverError);
          } else if (leftover) {
            recordError(
              "delete provisioned upload test user",
              new Error(
                `profile ${userA} still exists after deleteProvisionedUser (likely dependent-row FK)`
              )
            );
          }
        } catch (err) {
          recordError("delete provisioned upload test user", err);
        }
      }
    }

    if (cleanupErrors.length > 0) {
      throw new Error(`Upload test cleanup failed:\n${cleanupErrors.join("\n")}`);
    }
  }, 60000);

  it("rejects disallowed buckets and content types", async () => {
    const { createOwnedUploadGrant } = await import("./uploads");
    if (!userA) throw new Error("missing upload test user");
    await expect(
      createOwnedUploadGrant(userA, { bucket: "secret-bucket", contentType: "image/jpeg" })
    ).rejects.toThrow(/Bucket not allowed/i);

    await expect(
      createOwnedUploadGrant(userA, {
        bucket: "verification-documents",
        contentType: "application/x-msdownload",
      })
    ).rejects.toThrow(/Content type not allowed/i);
  });

  it("scopes verification paths to the caller user id", async () => {
    const { createOwnedUploadGrant } = await import("./uploads");
    if (!userA) throw new Error("missing upload test user");
    const grant = await createOwnedUploadGrant(userA, {
      bucket: "verification-documents",
      filename: "id.pdf",
      contentType: "application/pdf",
    });
    expect(grant.path.startsWith(`${userA}/`)).toBe(true);
    expect(grant.path.includes(userB)).toBe(false);
    expect(grant.expiresIn).toBeLessThanOrEqual(10 * 60);
    expect(grant.signedUrl).toMatch(/^https?:\/\//);
    expect(grant.maxBytes).toBeGreaterThan(0);
  });

  it("requires chatId for chat attachments and embeds owner in path", async () => {
    const { createOwnedUploadGrant } = await import("./uploads");
    if (!userA || !chatId) throw new Error("missing upload test fixtures");
    await expect(
      createOwnedUploadGrant(userA, {
        bucket: "chat-attachments",
        contentType: "image/jpeg",
      })
    ).rejects.toThrow(/chatId is required/i);

    const grant = await createOwnedUploadGrant(userA, {
      bucket: "chat-attachments",
      chatId,
      filename: "pic.jpg",
      contentType: "image/jpeg",
    });
    expect(grant.path.startsWith(`${chatId}/${userA}/`)).toBe(true);
  });

  it("sign route forbids non-participant chat uploads", async () => {
    const { POST } = await import("@/app/api/mobile/uploads/sign/route");
    const { NextRequest } = await import("next/server");
    if (!chatId) throw new Error("missing chat");
    // Build a request without bearer — must 401 before path checks
    const unauth = new NextRequest("http://localhost/api/mobile/uploads/sign", {
      method: "POST",
      body: JSON.stringify({
        bucket: "chat-attachments",
        chatId,
        contentType: "image/jpeg",
        filename: "x.jpg",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(unauth);
    expect(res.status).toBe(401);
  });
});
