import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/custom-auth/service";
import { enforceRateLimit } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-forgot", 10, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    if (email) {
      await requestPasswordReset(email);
    }
  } catch {
    // Always generic success
  }

  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, password reset instructions have been sent.",
  });
}
