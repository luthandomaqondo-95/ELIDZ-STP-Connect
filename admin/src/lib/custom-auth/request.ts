import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, type AccessTokenClaims } from "./tokens";
import { assertSessionActive } from "./session";
import { clientIp, rateLimit } from "./rate-limit";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function requireAccessAuth(request: NextRequest): Promise<
  | { ok: true; claims: AccessTokenClaims }
  | { ok: false; response: NextResponse }
> {
  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, response: jsonError("Unauthorized", 401) };
  }
  try {
    const claims = await verifyAccessToken(token);
    await assertSessionActive(claims.sid, claims.sub);
    return { ok: true, claims };
  } catch {
    return { ok: false, response: jsonError("Unauthorized", 401) };
  }
}

export function enforceRateLimit(
  request: NextRequest,
  bucket: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip = clientIp(request);
  const result = rateLimit(`${bucket}:${ip}`, limit, windowMs);
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSec) },
      }
    );
  }
  return null;
}

export function requestMeta(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent"),
    ip: clientIp(request),
  };
}
