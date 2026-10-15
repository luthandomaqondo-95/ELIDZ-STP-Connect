import { NextRequest, NextResponse } from "next/server";
import { isUuid, parseLimit, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { listChatMessages, markOwnMessagesRead, sendChatMessage } from "@/lib/mobile-bff/chats";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const messages = await listChatMessages(
      auth.auth.userId,
      id,
      parseLimit(request.nextUrl.searchParams.get("limit"), { defaultLimit: 50, max: 100 })
    );
    return NextResponse.json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, message === "Forbidden" ? 403 : 400);
  }
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const body = await request.json();
    if (body?.action === "mark_read") {
      await markOwnMessagesRead(auth.auth.userId, id);
      return NextResponse.json({ ok: true });
    }
    const message = await sendChatMessage(auth.auth.userId, id, String(body.content ?? ""), {
      url: body.attachment_url,
      type: body.attachment_type,
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, message === "Forbidden" ? 403 : 400);
  }
}
