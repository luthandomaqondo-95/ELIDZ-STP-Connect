import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { acceptOwnConnection, declineOwnConnection } from "@/lib/mobile-bff/connections";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    if (action === "accept") {
      const connection = await acceptOwnConnection(auth.auth.userId, id);
      return NextResponse.json({ connection });
    }
    if (action === "decline" || action === "cancel") {
      await declineOwnConnection(auth.auth.userId, id);
      return NextResponse.json({ ok: true });
    }
    return jsonError("Unsupported action", 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = /not found/i.test(message) ? 404 : /Only the recipient|Forbidden/i.test(message) ? 403 : 400;
    return jsonError(message, status);
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    await declineOwnConnection(auth.auth.userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
