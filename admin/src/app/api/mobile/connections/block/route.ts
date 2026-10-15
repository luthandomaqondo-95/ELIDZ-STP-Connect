import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { blockUser, getBlockStatus, unblockUser } from "@/lib/mobile-bff/connections";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const otherUserId = request.nextUrl.searchParams.get("userId") || "";
  if (!isUuid(otherUserId)) return jsonError("Valid userId is required", 400);

  try {
    const status = await getBlockStatus(auth.auth.userId, otherUserId);
    return NextResponse.json(status);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const otherUserId = String(body.userId ?? body.blockedUserId ?? "");
    if (!isUuid(otherUserId)) return jsonError("Valid userId is required", 400);
    await blockUser(auth.auth.userId, otherUserId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const otherUserId =
      String(body.userId ?? "") || request.nextUrl.searchParams.get("userId") || "";
    if (!isUuid(otherUserId)) return jsonError("Valid userId is required", 400);
    const ok = await unblockUser(auth.auth.userId, otherUserId);
    return NextResponse.json({ ok });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
