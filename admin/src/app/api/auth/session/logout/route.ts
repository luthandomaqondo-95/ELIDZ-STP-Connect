import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/custom-auth/service";
import { isCustomAuthEnabled } from "@/lib/custom-auth/feature-flag";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies } from "@/lib/custom-auth/cookies";
import { jsonError } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  if (!isCustomAuthEnabled()) {
    return jsonError("Custom auth is disabled", 404);
  }

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value ?? null;
  try {
    await logout(refresh);
  } catch {
    // always clear cookies
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  // also clear if access was somehow present without refresh
  if (request.cookies.get(ACCESS_COOKIE)) {
    clearSessionCookies(response);
  }
  return response;
}
