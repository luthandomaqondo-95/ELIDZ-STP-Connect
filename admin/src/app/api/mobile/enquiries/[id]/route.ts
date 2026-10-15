import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { getOwnEnquiry } from "@/lib/mobile-bff/enquiries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("Invalid id", 400);

  try {
    const enquiry = await getOwnEnquiry(auth.auth.userId, id);
    if (!enquiry) return jsonError("Not found", 404);
    return NextResponse.json({ enquiry });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
