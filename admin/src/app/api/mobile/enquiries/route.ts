import { NextRequest, NextResponse } from "next/server";
import { parseLimit, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { createOwnEnquiry, listOwnEnquiries } from "@/lib/mobile-bff/enquiries";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const enquiries = await listOwnEnquiries(
      auth.auth.userId,
      parseLimit(request.nextUrl.searchParams.get("limit"))
    );
    return NextResponse.json({ enquiries });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const enquiry = await createOwnEnquiry(auth.auth.userId, body);
    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
