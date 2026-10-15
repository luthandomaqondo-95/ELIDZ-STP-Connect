import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/custom-auth/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken =
      typeof body.refreshToken === "string"
        ? body.refreshToken
        : typeof body.refresh_token === "string"
          ? body.refresh_token
          : null;
    await logout(refreshToken);
  } catch {
    // Always succeed for logout
  }
  return NextResponse.json({ ok: true });
}
