import { createAdminClient } from "@/lib/supabase/admin";
import { isProfileSuspended } from "@/lib/account-status";
import {
  generateOpaqueToken,
  hashOpaqueToken,
  refreshExpiryDate,
  signAccessToken,
  signSupabaseDataToken,
} from "./tokens";

export type SessionBundle = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  sessionId: string;
  supabaseDataToken: string | null;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
};

type ProfileRow = {
  id: string;
  email: string;
  role: string;
  name: string;
};

export async function createSession(
  profile: ProfileRow,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<SessionBundle> {
  const supabase = createAdminClient();
  const refreshToken = generateOpaqueToken();
  const refreshHash = hashOpaqueToken(refreshToken);
  const expiresAt = refreshExpiryDate();

  const { data: session, error } = await supabase
    .from("auth_sessions")
    .insert({
      user_id: profile.id,
      refresh_token_hash: refreshHash,
      expires_at: expiresAt.toISOString(),
      user_agent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
    })
    .select("id")
    .single();

  if (error || !session) {
    throw new Error(error?.message || "Failed to create session");
  }

  const { token: accessToken, expiresAt: accessExpiresAt } = await signAccessToken({
    userId: profile.id,
    role: profile.role,
    sessionId: session.id,
    email: profile.email,
  });

  const supabaseDataToken = await signSupabaseDataToken(profile.id);

  return {
    accessToken,
    refreshToken,
    accessExpiresAt: accessExpiresAt.toISOString(),
    sessionId: session.id,
    supabaseDataToken,
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name,
    },
  };
}

export async function rotateRefreshToken(
  rawRefreshToken: string,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<SessionBundle> {
  const supabase = createAdminClient();
  const hash = hashOpaqueToken(rawRefreshToken);
  const nowIso = new Date().toISOString();

  const { data: existing, error } = await supabase
    .from("auth_sessions")
    .select("id, user_id, expires_at, revoked_at")
    .eq("refresh_token_hash", hash)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!existing || existing.revoked_at || existing.expires_at <= nowIso) {
    throw new Error("Invalid or expired refresh token");
  }

  // Revoke old session (rotation). Conditional on still being active so two concurrent
  // refreshes with the same token can't both succeed.
  const { data: revoked, error: revokeError } = await supabase
    .from("auth_sessions")
    .update({ revoked_at: nowIso })
    .eq("id", existing.id)
    .is("revoked_at", null)
    .select("id");
  if (revokeError) throw new Error(revokeError.message);
  if (!revoked || revoked.length === 0) {
    throw new Error("Invalid or expired refresh token");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, name, verification_status")
    .eq("id", existing.user_id)
    .single();

  if (profileError || !profile) {
    throw new Error("User not found");
  }
  if (isProfileSuspended(profile)) {
    throw new Error("Account suspended");
  }

  return createSession(profile as ProfileRow, meta);
}

export async function revokeSessionByRefreshToken(rawRefreshToken: string): Promise<void> {
  const supabase = createAdminClient();
  const hash = hashOpaqueToken(rawRefreshToken);
  await supabase
    .from("auth_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("refresh_token_hash", hash)
    .is("revoked_at", null);
}

export async function revokeSessionById(sessionId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("auth_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", sessionId)
    .is("revoked_at", null);
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("auth_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);
}

export async function assertSessionActive(sessionId: string, userId: string): Promise<void> {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("auth_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("revoked_at", null)
    .gt("expires_at", nowIso)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Session revoked or expired");
}
