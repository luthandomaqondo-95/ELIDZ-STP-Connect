import { NextRequest, NextResponse } from "next/server";
import { PasswordReset } from "@/application-logic/authentication/PasswordReset";
import { withRateLimit, RateLimits } from "@/lib/rate-limit";

/**
 * GET /api/password/reset?token=xxx
 * Validate reset token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const validation = await PasswordReset.validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/password/reset
 * Reset password with token
 */
const resetPasswordHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validate required fields
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Reset password
    try {
      await PasswordReset.resetPassword(token, newPassword);
      return NextResponse.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || "Invalid or expired token" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(RateLimits.STRICT, resetPasswordHandler);

