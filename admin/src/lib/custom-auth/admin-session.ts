import { createAdminClient } from "@/lib/supabase/admin";
import { isProfileSuspended } from "@/lib/account-status";
import { assertSessionActive } from "./session";
import { verifyAccessToken } from "./tokens-jwt";

export type CustomAdminSession = {
  userId: string;
  email: string;
  role: string;
  name: string;
  sessionId: string;
};

/**
 * Resolve an active custom admin session from an access JWT cookie value.
 * Throws on invalid/expired/revoked tokens.
 */
export async function resolveCustomAdminSession(
  accessToken: string | undefined | null
): Promise<CustomAdminSession | null> {
  if (!accessToken) return null;

  const claims = await verifyAccessToken(accessToken);
  await assertSessionActive(claims.sid, claims.sub);

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    // `profiles` has verification_status (not a separate `status` column).
    .select("id, email, role, name, verification_status")
    .eq("id", claims.sub)
    .maybeSingle();

  if (error || !profile) return null;
  if (isProfileSuspended(profile)) {
    throw new Error("Account suspended");
  }

  return {
    userId: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name,
    sessionId: claims.sid,
  };
}

export function isAdminRole(role: string): boolean {
  return role === "Admin" || role === "Super Admin";
}
