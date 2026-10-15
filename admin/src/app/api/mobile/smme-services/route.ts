import { NextRequest, NextResponse } from "next/server";
import { isUuid, parseLimit, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import {
  createOwnServiceProduct,
  listActiveServicesProducts,
} from "@/lib/mobile-bff/smme-services";

/** Public-ish catalogue of active items — still requires auth to reduce scraping; only returns active rows. */
export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  const smmeId = request.nextUrl.searchParams.get("smmeId");
  if (smmeId && !isUuid(smmeId)) return jsonError("Invalid smmeId", 400);

  try {
    const items = await listActiveServicesProducts(
      smmeId || undefined,
      parseLimit(request.nextUrl.searchParams.get("limit"), { defaultLimit: 100, max: 200 })
    );
    return NextResponse.json({ items });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    // Ignore client smme_id — always use session user as owner
    const item = await createOwnServiceProduct(auth.auth.userId, body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
