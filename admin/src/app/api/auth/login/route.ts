import { NextRequest, NextResponse } from "next/server";
import { Authentication } from "@/application-logic/authentication/Authentication";
import { TwoFactorAuth } from "@/application-logic/two-factor/TwoFactorAuth";
import { withRateLimit, RateLimits } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

/**
 * POST /api/login
 * Initial login - validates credentials and sends 2FA code if needed
 */
const loginHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    let { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
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

    // Verify credentials
    let user;
    try {
      user = await Authentication.verifyCredentials({ email, password });
    } catch (error: any) {
      if (error.message === "Your account has been banned") {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if phone number exists (required for 2FA)
    if (!user.phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required for login" },
        { status: 400 }
      );
    }

    // 2FA is always required for credentials login
    // Generate and send 2FA code
    try {
      await TwoFactorAuth.sendCode(user.id, user.email, user.phone);
    } catch (error) {
      console.error("Failed to send 2FA code:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    // Return user data with 2FA requirement
    return NextResponse.json({
      success: true,
      requires2FA: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
      },
      message: "Verification code sent. Please check your phone or email.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(RateLimits.STRICT, loginHandler);

