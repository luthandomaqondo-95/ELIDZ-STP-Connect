import { NextRequest, NextResponse } from "next/server";
import { isUuid, parseLimit, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import {
  listOwnAccepted,
  listOwnRequests,
  sendConnectionRequest,
} from "@/lib/mobile-bff/connections";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  const status = request.nextUrl.searchParams.get("status") || "accepted";
  try {
    if (status === "pending") {
      const connections = await listOwnRequests(auth.auth.userId);
      return NextResponse.json({ connections });
    }
    const connections = await listOwnAccepted(
      auth.auth.userId,
      parseLimit(request.nextUrl.searchParams.get("limit"), { defaultLimit: 100, max: 200 })
    );
    return NextResponse.json({ connections });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const addresseeId = String(body.addresseeId ?? body.connected_user_id ?? "");
    if (!isUuid(addresseeId)) return jsonError("Valid addresseeId is required", 400);
    // Ignore client requesterId — always use session user
    const connection = await sendConnectionRequest(auth.auth.userId, addresseeId);
    return NextResponse.json({ connection }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
