import { NextRequest, NextResponse } from "next/server";
import { refresh } from "@/lib/custom-auth/service";
import { jsonError, requestMeta } from "@/lib/custom-auth/request";
import { isCustomAuthEnabled } from "@/lib/custom-auth/feature-flag";
import { REFRESH_COOKIE, setSessionCookies, clearSessionCookies } from "@/lib/custom-auth/cookies";
import { isAdminRole } from "@/lib/custom-auth/admin-session";

export async function POST(request: NextRequest) {
  if (!isCustomAuthEnabled()) {
    return jsonError("Custom auth is disabled", 404);
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    const response = NextResponse.json({ error: "No session" }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  try {
    const session = await refresh(refreshToken, requestMeta(request));
    if (!isAdminRole(session.user.role)) {
      const response = NextResponse.json({ error: "Admin access required" }, { status: 403 });
      clearSessionCookies(response);
      return response;
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
  } catch {
    const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }
}

/**
 * Browser-navigation refresh used by middleware when the short-lived access cookie
 * has expired: rotate the refresh token, set fresh cookies, and bounce back to `next`.
 */
export async function GET(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  const nextParam = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  // Only allow same-origin relative paths to avoid an open redirect.
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!isCustomAuthEnabled() || !refreshToken) {
    const response = NextResponse.redirect(loginUrl);
    clearSessionCookies(response);
    return response;
  }

  try {
    const session = await refresh(refreshToken, requestMeta(request));
    if (!isAdminRole(session.user.role)) {
      const response = NextResponse.redirect(new URL("/auth/unauthorized", request.url));
      clearSessionCookies(response);
      return response;
    }
    const response = NextResponse.redirect(new URL(next, request.url));
    setSessionCookies(response, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    return response;
  } catch {
    // Don't clear cookies here: parallel prefetches race on the same refresh token, and
    // the loser must not wipe the cookies the winner just set.
    return NextResponse.redirect(loginUrl);
  }
}
