import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/lib/custom-auth/service";
import { jsonError, requireAccessAuth } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const auth = await requireAccessAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? body.password ?? "");
    await changePassword(auth.claims.sub, currentPassword, newPassword);
    return NextResponse.json({
      ok: true,
      message: "Password updated. Please sign in again.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Password change failed";
    return jsonError(message, 400);
  }
}
