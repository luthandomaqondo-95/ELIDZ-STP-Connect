import { NextRequest, NextResponse } from "next/server";
import { Authentication } from "@/application-logic/authentication/Authentication";
import { TwoFactorAuth } from "@/application-logic/two-factor/TwoFactorAuth";
import { withRateLimit, RateLimits } from "@/lib/rate-limit";

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA code and return session token
 */
const verify2FAHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await Authentication.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify 2FA code and get session token
    try {
      const sessionToken = await TwoFactorAuth.verifyCode(user.id, user.email, code);

      return NextResponse.json({
        success: true,
        sessionToken,
        message: "Verification successful",
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || "Invalid or expired verification code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(RateLimits.STRICT, verify2FAHandler);

