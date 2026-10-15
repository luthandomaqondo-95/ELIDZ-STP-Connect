import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/custom-auth/service";
import { enforceRateLimit, jsonError } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-reset", 20, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? body.newPassword ?? "");
    if (!token || !password) {
      return jsonError("Token and password are required.", 400);
    }
    await resetPasswordWithToken(token, password);
    return NextResponse.json({
      ok: true,
      message: "Password updated. You can log in with your new password.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Password reset failed";
    return jsonError(message, 400);
  }
}
