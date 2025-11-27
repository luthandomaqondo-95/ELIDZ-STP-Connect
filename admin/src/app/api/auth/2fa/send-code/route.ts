import { NextRequest, NextResponse } from "next/server";
import { Authentication } from "@/application-logic/authentication/Authentication";
import { TwoFactorAuth } from "@/application-logic/two-factor/TwoFactorAuth";
import { withRateLimit, RateLimits } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

/**
 * POST /api/auth/2fa/send-code
 * Resend 2FA verification code
 */
const sendCodeHandler = async (request: NextRequest) => {
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

    // Get user by email
    const user = await Authentication.getUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({
        success: true,
        message: "If an account exists, a verification code has been sent.",
      });
    }

    // Check if phone number exists
    if (!user.phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Resend 2FA code
    try {
      await TwoFactorAuth.resendCode(user.id, user.email, user.phone);
      return NextResponse.json({
        success: true,
        message: "Verification code sent. Please check your phone or email.",
      });
    } catch (error) {
      console.error("Failed to resend 2FA code:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(RateLimits.STRICT, sendCodeHandler);

