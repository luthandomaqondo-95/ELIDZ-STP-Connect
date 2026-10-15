import { NextRequest, NextResponse } from "next/server";
import { isUuid, parseLimit, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { applyToOpportunity, listOwnApplications } from "@/lib/mobile-bff/applications";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const applications = await listOwnApplications(
      auth.auth.userId,
      parseLimit(request.nextUrl.searchParams.get("limit"))
    );
    return NextResponse.json({ applications });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const opportunityId = String(body.opportunityId ?? body.opportunity_id ?? "");
    if (!isUuid(opportunityId)) return jsonError("Valid opportunityId is required", 400);
    const result = await applyToOpportunity(
      auth.auth.userId,
      opportunityId,
      body.coverLetter ?? body.cover_letter
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = /already applied/i.test(message) ? 409 : 400;
    return jsonError(message, status);
  }
}
