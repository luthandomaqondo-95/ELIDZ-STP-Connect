import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBearerToken, jsonError } from "@/lib/custom-auth/request";
import { verifyAccessToken } from "@/lib/custom-auth/tokens";
import { assertSessionActive } from "@/lib/custom-auth/session";

export type MobileAuthContext = {
  userId: string;
  role?: string;
  /** Phase 5: live path is supabase; custom is ready for Phase 6 cutover. */
  source: "custom" | "supabase";
};

/**
 * Authenticate mobile BFF requests.
 * Accepts:
 * 1) Custom auth access JWT (sid must be an active auth_sessions row)
 * 2) Supabase Auth access token (verified via Auth Admin getUser) — current production path
 *
 * Never trusts client-supplied user IDs for authorization.
 */
export async function requireMobileAuth(
  request: NextRequest
): Promise<{ ok: true; auth: MobileAuthContext } | { ok: false; response: NextResponse }> {
  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, response: jsonError("Unauthorized", 401) };
  }

  // Prefer custom JWT when AUTH_JWT_SECRET is configured
  if (process.env.AUTH_JWT_SECRET && process.env.AUTH_JWT_SECRET.length >= 32) {
    try {
      const claims = await verifyAccessToken(token);
      await assertSessionActive(claims.sid, claims.sub);
      return {
        ok: true,
        auth: {
          userId: claims.sub,
          role: typeof claims.role === "string" ? claims.role : undefined,
          source: "custom",
        },
      };
    } catch {
      // Fall through to Supabase token verification
    }
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.id) {
      return { ok: false, response: jsonError("Unauthorized", 401) };
    }
    return {
      ok: true,
      auth: { userId: data.user.id, source: "supabase" },
    };
  } catch {
    return { ok: false, response: jsonError("Unauthorized", 401) };
  }
}

export function parseLimit(
  value: string | null,
  { defaultLimit = 50, max = 100 }: { defaultLimit?: number; max?: number } = {}
): number {
  if (value == null || value === "") return defaultLimit;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return defaultLimit;
  return Math.min(n, max);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
