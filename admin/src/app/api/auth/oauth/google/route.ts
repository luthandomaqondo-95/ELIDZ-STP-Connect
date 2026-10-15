import { NextRequest, NextResponse } from "next/server";
import { loginWithGoogleIdToken } from "@/lib/custom-auth/service";
import { enforceRateLimit, jsonError, requestMeta } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-google", 30, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const idToken = String(body.idToken ?? body.credential ?? "");
    if (!idToken) return jsonError("Google ID token is required.", 400);
    const session = await loginWithGoogleIdToken(idToken, requestMeta(request));
    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google sign-in failed";
    const status = /suspended/i.test(message) ? 403 : 401;
    return jsonError(message, status);
  }
}
