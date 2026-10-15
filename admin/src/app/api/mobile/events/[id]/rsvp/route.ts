import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { cancelOwnRsvp, createOwnRsvp, hasOwnRsvp } from "@/lib/mobile-bff/events";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const rsvped = await hasOwnRsvp(auth.auth.userId, id);
    return NextResponse.json({ rsvped });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const rsvp = await createOwnRsvp(auth.auth.userId, id);
    return NextResponse.json({ rsvp }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    await cancelOwnRsvp(auth.auth.userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
