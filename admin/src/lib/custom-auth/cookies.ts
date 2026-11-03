import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "elidz_access";
export const REFRESH_COOKIE = "elidz_refresh";

const ACCESS_MAX_AGE = 15 * 60; // match access JWT TTL
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Cookie options for writing session cookies via `cookies()` (route handlers / server actions). */
export function sessionCookieOptions(kind: "access" | "refresh") {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: kind === "access" ? ACCESS_MAX_AGE : REFRESH_MAX_AGE,
  };
}

export function setSessionCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
): void {
  const secure = cookieSecure();
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  const secure = cookieSecure();
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
