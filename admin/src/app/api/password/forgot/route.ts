import { NextRequest, NextResponse } from "next/server";
import { PasswordReset } from "@/application-logic/authentication/PasswordReset";
import { withRateLimit, RateLimits } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

/**
 * POST /api/password/forgot
 * Request password reset
 */
const forgotPasswordHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    let { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Sanitize email
    try {
      email = sanitizeEmail(email);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Request password reset (always returns success for security)
    await PasswordReset.requestReset(email);

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(RateLimits.STRICT, forgotPasswordHandler);

