import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import {
  deleteOwnNotification,
  markOwnNotificationRead,
} from "@/lib/mobile-bff/notifications";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.action === "read" || body?.read === true) {
      await markOwnNotificationRead(auth.auth.userId, id);
      return NextResponse.json({ ok: true });
    }
    return jsonError("Unsupported action", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, message === "Notification not found" ? 404 : 400);
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    await deleteOwnNotification(auth.auth.userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, message === "Notification not found" ? 404 : 400);
  }
}
