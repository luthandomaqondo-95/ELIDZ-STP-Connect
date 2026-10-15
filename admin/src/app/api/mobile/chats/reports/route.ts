import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { reportMessage } from "@/lib/mobile-bff/chats";

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const messageId = String(body.messageId ?? "");
    const chatId = String(body.chatId ?? "");
    if (!isUuid(messageId) || !isUuid(chatId)) {
      return jsonError("Valid messageId and chatId are required", 400);
    }
    await reportMessage(auth.auth.userId, {
      messageId,
      chatId,
      reportedUserId: String(body.reportedUserId ?? ""),
      reason: String(body.reason ?? ""),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, message === "Forbidden" ? 403 : 400);
  }
}
