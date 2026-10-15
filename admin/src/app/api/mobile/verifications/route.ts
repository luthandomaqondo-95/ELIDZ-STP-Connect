import { NextRequest, NextResponse } from "next/server";
import { requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { listOwnVerifications, submitOwnVerification } from "@/lib/mobile-bff/verifications";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const verifications = await listOwnVerifications(auth.auth.userId);
    return NextResponse.json({ verifications });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    // Ignore client userId — always bind to session
    const verification = await submitOwnVerification(
      auth.auth.userId,
      String(body.document_url ?? body.documentUrl ?? ""),
      String(body.document_type ?? body.documentType ?? "")
    );
    return NextResponse.json({ verification }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed", 400);
  }
}
