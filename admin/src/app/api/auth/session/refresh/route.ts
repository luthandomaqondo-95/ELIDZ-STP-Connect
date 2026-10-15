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
