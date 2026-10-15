import { NextRequest, NextResponse } from "next/server";
import { parseLimit, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import {
  getOwnUnreadCount,
  listOwnNotifications,
  markAllOwnNotificationsRead,
} from "@/lib/mobile-bff/notifications";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const unreadOnly = request.nextUrl.searchParams.get("unread") === "1";
  const countOnly = request.nextUrl.searchParams.get("count") === "1";

  try {
    if (countOnly) {
      const count = await getOwnUnreadCount(auth.auth.userId);
      return NextResponse.json({ count });
    }
    const notifications = await listOwnNotifications(auth.auth.userId, limit, unreadOnly);
    return NextResponse.json({ notifications });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to load notifications", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.action === "mark_all_read") {
      await markAllOwnNotificationsRead(auth.auth.userId);
      return NextResponse.json({ ok: true });
    }
    return jsonError("Unsupported action", 400);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
