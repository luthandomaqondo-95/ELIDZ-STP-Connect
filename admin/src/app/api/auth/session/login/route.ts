import { NextRequest, NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/custom-auth/service";
import { jsonError, requestMeta } from "@/lib/custom-auth/request";
import { enforceRateLimit } from "@/lib/custom-auth/request";
import { isCustomAuthEnabled } from "@/lib/custom-auth/feature-flag";
import { setSessionCookies } from "@/lib/custom-auth/cookies";
import { isAdminRole } from "@/lib/custom-auth/admin-session";

/**
 * Admin cookie login — only active when CUSTOM_AUTH_ENABLED / AUTH_PROVIDER=custom.
 * Sets HTTP-only access + refresh cookies. Rejects non-admin roles for dashboard use.
 */
export async function POST(request: NextRequest) {
  if (!isCustomAuthEnabled()) {
    return jsonError("Custom auth is disabled", 404);
  }

  const limited = enforceRateLimit(request, "auth-session-login", 30, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");
    const session = await loginWithPassword(email, password, requestMeta(request));

    if (!isAdminRole(session.user.role)) {
      return jsonError("Admin access required", 403);
    }

    const response = NextResponse.json({
      user: session.user,
      accessExpiresAt: session.accessExpiresAt,
    });
    setSessionCookies(response, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    const status = /suspended/i.test(message)
      ? 403
      : /reset your password|confirm your account/i.test(message)
        ? 403
        : 401;
    return jsonError(message, status);
  }
}
