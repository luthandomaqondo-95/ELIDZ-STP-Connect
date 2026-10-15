import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { createOwnedUploadGrant } from "@/lib/mobile-bff/uploads";
import { assertChatParticipant } from "@/lib/mobile-bff/guards";

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const bucket = String(body.bucket ?? "");
    const chatId = body.chatId ? String(body.chatId) : undefined;

    if (bucket === "chat-attachments") {
      if (!chatId || !isUuid(chatId)) return jsonError("Valid chatId is required", 400);
      if (!(await assertChatParticipant(chatId, auth.auth.userId))) {
        return jsonError("Forbidden", 403);
      }
    }

    const grant = await createOwnedUploadGrant(auth.auth.userId, {
      bucket,
      filename: body.filename ? String(body.filename) : undefined,
      contentType: body.contentType ? String(body.contentType) : undefined,
      chatId,
    });

    return NextResponse.json({ grant });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, /Forbidden|not allowed/i.test(message) ? 403 : 400);
  }
}
