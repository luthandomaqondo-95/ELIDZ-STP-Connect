import { NextRequest, NextResponse } from "next/server";
import { Authentication } from "@/application-logic/authentication/Authentication";
import { withRateLimit, RateLimits } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";

/**
 * POST /api/register
 * Register a new user
 */
const registerHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone, role, location } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !role) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate role
    if (![2, 4, 6].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be 2 (applicant), 4 (funder), or 6 (admin)" },
        { status: 400 }
      );
    }

    // Sanitize email
    let sanitizedEmail: string;
    try {
      sanitizedEmail = sanitizeEmail(email);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Register user
    try {
      const user = await Authentication.registerUser({
        firstName,
        lastName,
        email: sanitizedEmail,
        password,
        phone,
        role,
        location,
      });

      return NextResponse.json({
        success: true,
        message: "User registered successfully. Your account is pending approval.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
        },
      });
    } catch (error: any) {
      if (error.message === "User with this email already exists") {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(RateLimits.STRICT, registerHandler);

