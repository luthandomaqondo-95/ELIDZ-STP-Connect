import { NextRequest, NextResponse } from "next/server";
import { isUuid, parseLimit, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { createDirectChat, listOwnChats } from "@/lib/mobile-bff/chats";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const chats = await listOwnChats(
      auth.auth.userId,
      parseLimit(request.nextUrl.searchParams.get("limit"), { defaultLimit: 50, max: 100 })
    );
    return NextResponse.json({ chats });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const otherUserId = String(body.otherUserId ?? body.userId ?? "");
    if (!isUuid(otherUserId)) return jsonError("Valid otherUserId is required", 400);
    const chat = await createDirectChat(auth.auth.userId, otherUserId);
    return NextResponse.json({ chat }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
