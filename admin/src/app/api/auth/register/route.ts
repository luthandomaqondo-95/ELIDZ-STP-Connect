import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/custom-auth/service";
import { enforceRateLimit, jsonError } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-register", 10, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const result = await registerUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      role: String(body.role ?? ""),
      address: String(body.address ?? ""),
      idNumber: body.idNumber != null ? String(body.idNumber) : null,
    });

    return NextResponse.json({
      user: result.user,
      requiresEmailConfirmation: result.requiresEmailConfirmation,
      message:
        "Registration successful. Please check your email to confirm your account before logging in.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const status = /already registered/i.test(message) ? 409 : 400;
    return jsonError(message, status);
  }
}
