import { NextRequest, NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/custom-auth/service";
import { enforceRateLimit, jsonError, requestMeta } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-login", 30, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");
    if (!email || !password) {
      return jsonError("Invalid email or password.", 401);
    }

    const session = await loginWithPassword(email, password, requestMeta(request));
    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid email or password.";
    const status = /suspended/i.test(message) ? 403 : /confirm your password|confirm your account|Too many failed/i.test(message) ? 403 : 401;
    return jsonError(message, status);
  }
}
