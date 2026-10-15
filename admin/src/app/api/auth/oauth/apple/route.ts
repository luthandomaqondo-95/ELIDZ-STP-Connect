import { NextRequest, NextResponse } from "next/server";
import { loginWithAppleIdToken } from "@/lib/custom-auth/service";
import { enforceRateLimit, jsonError, requestMeta } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-apple", 30, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const idToken = String(body.idToken ?? body.identityToken ?? "");
    if (!idToken) return jsonError("Apple identity token is required.", 400);
    const session = await loginWithAppleIdToken(idToken, requestMeta(request));
    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apple sign-in failed";
    const status = /suspended/i.test(message) ? 403 : 401;
    return jsonError(message, status);
  }
}
