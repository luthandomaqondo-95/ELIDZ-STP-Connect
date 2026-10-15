import { NextRequest, NextResponse } from "next/server";
import { verifyEmailWithToken } from "@/lib/custom-auth/service";
import { enforceRateLimit, jsonError } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-verify", 20, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    if (!token) return jsonError("Token is required.", 400);
    await verifyEmailWithToken(token);
    return NextResponse.json({ ok: true, message: "Email verified. You can log in." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return jsonError(message, 400);
  }
}
