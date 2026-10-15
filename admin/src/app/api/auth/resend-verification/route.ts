import { NextRequest, NextResponse } from "next/server";
import { resendVerification } from "@/lib/custom-auth/service";
import { enforceRateLimit } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-resend", 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    if (email) await resendVerification(email);
  } catch {
    // generic
  }

  return NextResponse.json({
    ok: true,
    message: "If an unverified account exists for that email, a confirmation message has been sent.",
  });
}
