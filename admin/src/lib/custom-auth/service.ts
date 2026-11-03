import { randomBytes, randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isProfileSuspended } from "@/lib/account-status";
import {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
} from "@/lib/email-service";
import { isMobileRole, isValidEmail, normalizeEmail, type MobileRole } from "./normalize";
import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from "./password";
import {
  createSession,
  revokeAllSessionsForUser,
  revokeSessionByRefreshToken,
  rotateRefreshToken,
  type SessionBundle,
} from "./session";
import { generateOpaqueToken, hashOpaqueToken } from "./tokens";
import {
  verifyAppleIdToken,
  verifyGoogleIdToken,
  type VerifiedOAuthIdentity,
} from "./oauth";

const GENERIC_AUTH_ERROR = "Invalid email or password.";
const MAX_FAILED_LOGINS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const ACCOUNT_SUSPENDED_MESSAGE =
  "Your account has been suspended. If you believe this is a mistake, please contact support.";

type Profile = {
  id: string;
  email: string;
  role: string;
  name: string;
  verification_status?: string | null;
  status?: string | null;
};

type Credentials = {
  user_id: string;
  password_hash: string | null;
  email_verified_at: string | null;
  must_reset_password: boolean;
  failed_login_count: number;
  locked_until: string | null;
};

function publicProfile(profile: Profile) {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name,
  };
}

/**
 * Temporary FK bridge: profiles.id still references auth.users.
 * Create a stub Auth user with a random unusable password so the real password
 * exists only as Argon2id in auth_credentials. Remove after FK drop.
 */
async function createAuthUserStub(email: string, userId: string): Promise<void> {
  const supabase = createAdminClient();
  const randomPassword = randomBytes(32).toString("base64url");
  const { error } = await supabase.auth.admin.createUser({
    id: userId,
    email,
    password: randomPassword,
    email_confirm: true,
  });
  if (error) {
    throw new Error(error.message);
  }
}

async function deleteAuthUserStub(userId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.auth.admin.deleteUser(userId);
  } catch {
    // best-effort cleanup
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  address: string;
  idNumber?: string | null;
}): Promise<{ user: ReturnType<typeof publicProfile>; requiresEmailConfirmation: boolean }> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const address = input.address.trim();
  const idNumber = (input.idNumber ?? "").trim() || null;

  if (!name) throw new Error("Name is required.");
  if (!isValidEmail(email)) throw new Error("A valid email address is required.");
  if (!address) throw new Error("Address is required.");
  if (!isMobileRole(input.role)) throw new Error("Invalid role.");
  const passwordError = validatePasswordStrength(input.password);
  if (passwordError) throw new Error(passwordError);

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    throw new Error("This email is already registered. Please log in or use a different email.");
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(input.password);

  await createAuthUserStub(email, userId);

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    name,
    email,
    role: input.role as MobileRole,
    address,
    id_number: idNumber,
  });

  if (profileError) {
    await deleteAuthUserStub(userId);
    if (profileError.code === "23505") {
      throw new Error("This email is already registered. Please log in or use a different email.");
    }
    throw new Error(profileError.message);
  }

  const { error: credError } = await supabase.from("auth_credentials").insert({
    user_id: userId,
    password_hash: passwordHash,
    password_algo: "argon2id",
    password_updated_at: new Date().toISOString(),
    email_verified_at: null,
    must_reset_password: false,
  });

  if (credError) {
    await supabase.from("profiles").delete().eq("id", userId);
    await deleteAuthUserStub(userId);
    throw new Error(credError.message);
  }

  await issueEmailVerification(userId, email);

  return {
    user: publicProfile({ id: userId, email, role: input.role, name }),
    requiresEmailConfirmation: true,
  };
}

async function issueEmailVerification(userId: string, email: string): Promise<void> {
  const supabase = createAdminClient();
  const raw = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(raw);
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS).toISOString();

  await supabase.from("auth_email_verification_tokens").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  try {
    await sendEmailVerificationEmail(email, raw);
  } catch (err) {
    console.error("Failed to send verification email");
    // Do not leak token
    void err;
  }
}

export async function loginWithPassword(
  emailRaw: string,
  password: string,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<SessionBundle> {
  const email = normalizeEmail(emailRaw);
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, name, verification_status")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    // Dummy work to reduce timing oracle
    await hashPassword(password).catch(() => undefined);
    throw new Error(GENERIC_AUTH_ERROR);
  }

  if (isProfileSuspended(profile)) {
    throw new Error(ACCOUNT_SUSPENDED_MESSAGE);
  }

  const { data: creds } = await supabase
    .from("auth_credentials")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!creds) {
    throw new Error(GENERIC_AUTH_ERROR);
  }

  const credentials = creds as Credentials;

  if (credentials.locked_until && new Date(credentials.locked_until).getTime() > Date.now()) {
    throw new Error("Too many failed login attempts. Please try again later.");
  }

  if (credentials.must_reset_password || !credentials.password_hash) {
    throw new Error(
      "Please reset your password to continue. Use Forgot password — existing accounts must set a new password."
    );
  }

  if (!credentials.email_verified_at) {
    throw new Error("Please check your email and confirm your account before logging in.");
  }

  const ok = await verifyPassword(credentials.password_hash, password);
  if (!ok) {
    const failed = (credentials.failed_login_count || 0) + 1;
    const patch: Record<string, unknown> = {
      failed_login_count: failed,
      updated_at: new Date().toISOString(),
    };
    if (failed >= MAX_FAILED_LOGINS) {
      patch.locked_until = new Date(Date.now() + LOCKOUT_MS).toISOString();
      patch.failed_login_count = 0;
    }
    await supabase.from("auth_credentials").update(patch).eq("user_id", profile.id);
    throw new Error(GENERIC_AUTH_ERROR);
  }

  await supabase
    .from("auth_credentials")
    .update({
      failed_login_count: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.id);

  return createSession(profile as Profile, meta);
}

export async function logout(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return;
  await revokeSessionByRefreshToken(refreshToken);
}

export async function refresh(refreshToken: string, meta?: { userAgent?: string | null; ip?: string | null }) {
  return rotateRefreshToken(refreshToken, meta);
}

export async function requestPasswordReset(emailRaw: string): Promise<void> {
  const email = normalizeEmail(emailRaw);
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  // Always succeed (do not reveal registration)
  if (!profile) return;

  const raw = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(raw);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

  await supabase.from("auth_password_reset_tokens").insert({
    user_id: profile.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  try {
    await sendPasswordResetEmail(profile.email, raw);
  } catch {
    console.error("Failed to send password reset email");
  }
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const passwordError = validatePasswordStrength(newPassword);
  if (passwordError) throw new Error(passwordError);

  const supabase = createAdminClient();
  const tokenHash = hashOpaqueToken(token);
  const nowIso = new Date().toISOString();

  const { data: row } = await supabase
    .from("auth_password_reset_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row || row.used_at || row.expires_at <= nowIso) {
    throw new Error("Invalid or expired reset token");
  }

  const passwordHash = await hashPassword(newPassword);

  const { data: existingCred } = await supabase
    .from("auth_credentials")
    .select("email_verified_at")
    .eq("user_id", row.user_id)
    .maybeSingle();

  const { error: credError } = await supabase.from("auth_credentials").upsert({
    user_id: row.user_id,
    password_hash: passwordHash,
    password_algo: "argon2id",
    password_updated_at: nowIso,
    must_reset_password: false,
    failed_login_count: 0,
    locked_until: null,
    email_verified_at: existingCred?.email_verified_at ?? nowIso,
    updated_at: nowIso,
  });

  if (credError) {
    throw new Error(credError.message);
  }

  await supabase
    .from("auth_password_reset_tokens")
    .update({ used_at: nowIso })
    .eq("id", row.id);

  await revokeAllSessionsForUser(row.user_id);
}

export async function verifyEmailWithToken(token: string): Promise<void> {
  const supabase = createAdminClient();
  const tokenHash = hashOpaqueToken(token);
  const nowIso = new Date().toISOString();

  const { data: row } = await supabase
    .from("auth_email_verification_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row || row.used_at || row.expires_at <= nowIso) {
    throw new Error("Invalid or expired verification token");
  }

  await supabase
    .from("auth_credentials")
    .update({
      email_verified_at: nowIso,
      updated_at: nowIso,
    })
    .eq("user_id", row.user_id);

  await supabase
    .from("auth_email_verification_tokens")
    .update({ used_at: nowIso })
    .eq("id", row.id);
}

export async function resendVerification(emailRaw: string): Promise<void> {
  const email = normalizeEmail(emailRaw);
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (!profile) return;

  const { data: creds } = await supabase
    .from("auth_credentials")
    .select("email_verified_at")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (creds?.email_verified_at) return;

  await issueEmailVerification(profile.id, profile.email);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const passwordError = validatePasswordStrength(newPassword);
  if (passwordError) throw new Error(passwordError);

  const supabase = createAdminClient();
  const { data: creds } = await supabase
    .from("auth_credentials")
    .select("password_hash")
    .eq("user_id", userId)
    .maybeSingle();

  if (!creds?.password_hash) {
    throw new Error("Password change is not available for this account.");
  }

  const ok = await verifyPassword(creds.password_hash, currentPassword);
  if (!ok) throw new Error("Current password is incorrect.");

  const passwordHash = await hashPassword(newPassword);
  const nowIso = new Date().toISOString();

  await supabase
    .from("auth_credentials")
    .update({
      password_hash: passwordHash,
      password_updated_at: nowIso,
      must_reset_password: false,
      updated_at: nowIso,
    })
    .eq("user_id", userId);

  await revokeAllSessionsForUser(userId);
}

export async function getMe(userId: string) {
  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, role, name, address, organization, bio, avatar, verification_status, created_at")
    .eq("id", userId)
    .single();

  if (error || !profile) throw new Error("User not found");

  const { data: creds } = await supabase
    .from("auth_credentials")
    .select("email_verified_at, must_reset_password")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    ...profile,
    email_verified: Boolean(creds?.email_verified_at),
    must_reset_password: Boolean(creds?.must_reset_password),
  };
}

async function linkOrCreateFromOAuth(
  identity: VerifiedOAuthIdentity,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<SessionBundle> {
  const supabase = createAdminClient();

  const { data: linked } = await supabase
    .from("auth_identities")
    .select("user_id")
    .eq("provider", identity.provider)
    .eq("provider_subject", identity.subject)
    .maybeSingle();

  let userId = linked?.user_id as string | undefined;

  // Auto-link by email only when the IdP cryptographically asserts a verified email.
  // Never take over an account solely because a submitted/claimed email matches.
  if (!userId && identity.email) {
    const email = normalizeEmail(identity.email);
    const { data: byEmail } = await supabase
      .from("profiles")
      .select("id, email, role, name, verification_status")
      .eq("email", email)
      .maybeSingle();

    if (byEmail) {
      if (!identity.emailVerified) {
        throw new Error(
          "An account already exists for this email. Sign in with that account first, then link this provider from settings."
        );
      }
      userId = byEmail.id;
      await supabase.from("auth_identities").upsert(
        {
          user_id: userId,
          provider: identity.provider,
          provider_subject: identity.subject,
        },
        { onConflict: "provider,provider_subject" }
      );
    }
  }

  if (!userId) {
    if (!identity.email) {
      throw new Error(
        "Unable to create an account from this social login because no email was provided. Sign in with an account that shares an email, or register with email first."
      );
    }

    const email = normalizeEmail(identity.email);
    userId = randomUUID();
    const name = identity.name?.trim() || email.split("@")[0] || "User";

    await createAuthUserStub(email, userId);

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      name,
      email,
      role: "Entrepreneur",
    });

    if (profileError) {
      await deleteAuthUserStub(userId);
      throw new Error(profileError.message);
    }

    await supabase.from("auth_credentials").insert({
      user_id: userId,
      password_hash: null,
      password_algo: "argon2id",
      email_verified_at: identity.emailVerified ? new Date().toISOString() : null,
      must_reset_password: false,
    });

    await supabase.from("auth_identities").insert({
      user_id: userId,
      provider: identity.provider,
      provider_subject: identity.subject,
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, name, verification_status")
    .eq("id", userId)
    .single();

  if (!profile) throw new Error("User not found");
  if (isProfileSuspended(profile)) throw new Error(ACCOUNT_SUSPENDED_MESSAGE);

  // Ensure identity row exists
  await supabase.from("auth_identities").upsert(
    {
      user_id: profile.id,
      provider: identity.provider,
      provider_subject: identity.subject,
    },
    { onConflict: "provider,provider_subject" }
  );

  // Mark email verified when provider asserts it
  if (identity.emailVerified) {
    await supabase
      .from("auth_credentials")
      .update({
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id)
      .is("email_verified_at", null);
  }

  return createSession(profile as Profile, meta);
}

export async function loginWithGoogleIdToken(
  idToken: string,
  meta?: { userAgent?: string | null; ip?: string | null }
) {
  const identity = await verifyGoogleIdToken(idToken);
  return linkOrCreateFromOAuth(identity, meta);
}

export async function loginWithAppleIdToken(
  idToken: string,
  meta?: { userAgent?: string | null; ip?: string | null }
) {
  const identity = await verifyAppleIdToken(idToken);
  return linkOrCreateFromOAuth(identity, meta);
}

const ADMIN_ROLES = new Set(["Admin", "Super Admin"]);

/**
 * Provision an invited user under custom auth (profile + credentials, must reset).
 * Does not grant Admin/Super Admin unless caller already authorized that role.
 * Existing profile UUIDs are never overwritten — duplicate email fails.
 */
export async function provisionInvitedUser(input: {
  email: string;
  name: string;
  role: string;
  organization?: string | null;
  verificationStatus?: string | null;
  allowAdminRoles?: boolean;
}): Promise<{ userId: string }> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  if (!name) throw new Error("Name is required.");
  if (!isValidEmail(email)) throw new Error("A valid email address is required.");

  if (ADMIN_ROLES.has(input.role) && !input.allowAdminRoles) {
    throw new Error("Cannot provision administrator accounts through this path.");
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    throw new Error("This email is already registered.");
  }

  const userId = randomUUID();
  await createAuthUserStub(email, userId);

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    name,
    email,
    role: input.role,
    organization: input.organization ?? null,
    verification_status: input.verificationStatus ?? null,
  });

  if (profileError) {
    await deleteAuthUserStub(userId);
    if (profileError.code === "23505") {
      throw new Error("This email is already registered.");
    }
    throw new Error(profileError.message);
  }

  const nowIso = new Date().toISOString();
  const { error: credError } = await supabase.from("auth_credentials").insert({
    user_id: userId,
    password_hash: null,
    password_algo: "argon2id",
    email_verified_at: nowIso,
    must_reset_password: true,
    password_updated_at: null,
  });

  if (credError) {
    await supabase.from("profiles").delete().eq("id", userId);
    await deleteAuthUserStub(userId);
    throw new Error(credError.message);
  }

  // Invite = password reset email (token never logged)
  await requestPasswordReset(email);

  return { userId };
}

/** Soft-delete custom auth rows then Auth stub + profile (FK order). */
export async function deleteProvisionedUser(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await revokeAllSessionsForUser(userId);
  await supabase.from("auth_password_reset_tokens").delete().eq("user_id", userId);
  await supabase.from("auth_email_verification_tokens").delete().eq("user_id", userId);
  await supabase.from("auth_identities").delete().eq("user_id", userId);
  await supabase.from("auth_credentials").delete().eq("user_id", userId);
  await supabase.from("auth_sessions").delete().eq("user_id", userId);
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId);
  if (profileError) {
    // Usually an FK from user-owned rows; surface it instead of reporting a half-delete as success.
    throw new Error(`Failed to delete profile: ${profileError.message}`);
  }
  await deleteAuthUserStub(userId);
}
