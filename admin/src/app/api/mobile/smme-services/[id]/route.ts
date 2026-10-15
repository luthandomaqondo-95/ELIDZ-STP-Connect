import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import {
  deleteOwnServiceProduct,
  updateOwnServiceProduct,
} from "@/lib/mobile-bff/smme-services";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const body = await request.json();
    const item = await updateOwnServiceProduct(auth.auth.userId, id, body ?? {});
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, message === "Not found" ? 404 : 400);
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    await deleteOwnServiceProduct(auth.auth.userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return jsonError(message, message === "Not found" ? 404 : 400);
  }
}
