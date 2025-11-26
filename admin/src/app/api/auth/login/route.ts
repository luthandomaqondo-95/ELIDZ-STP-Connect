import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db-migration/db/db";
import { users } from "@/db-migration/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { withRateLimit, RateLimits } from "@/lib/rate-limit";
import { sanitizeEmail } from "@/lib/sanitize";
import crypto from "crypto";
import { setTempLoginSession, getTempLoginSession, deleteTempLoginSession } from "@/lib/temp-login-sessions";

/**
 * POST /api/auth/login
 * Check credentials and return if 2FA is required
 */
const loginCheckHandler = async (request: NextRequest) => {
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

    // Find user by email
    const userResults = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        fullName: users.fullName,
        role: users.role,
        twoFactorEnabled: users.twoFactorEnabled,
        twoFactorMethod: users.twoFactorMethod,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = userResults[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary session token for 2FA verification
      const sessionToken = crypto.randomBytes(32).toString("hex");
      
      console.log("Creating temp login session for 2FA", {
        userId: user.id,
        email: user.email,
        sessionToken: sessionToken.substring(0, 8) + "...",
        twoFactorMethod: user.twoFactorMethod,
      });

      try {
        await setTempLoginSession(sessionToken, user.id, user.email, 15 * 60 * 1000); // 15 minutes
        console.log("Temp login session created successfully", {
          sessionToken: sessionToken.substring(0, 8) + "...",
        });
      } catch (error) {
        console.error("Error creating temp login session:", error);
        return NextResponse.json(
          { success: false, error: "Failed to create login session. Please try again." },
          { status: 500 }
        );
      }

      // Authenticator app method
      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        sessionToken,
        twoFactorMethod: user.twoFactorMethod || "authenticator",
        message: "Please enter your 2FA code from your authenticator app",
      });
    }

    // 2FA not enabled - login can proceed normally via NextAuth
    return NextResponse.json({
      success: true,
      requiresTwoFactor: false,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(RateLimits.STRICT, loginCheckHandler);

/**
 * GET /api/auth/login?sessionToken=xxx
 * Get temporary login session
 */
export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const sessionToken = searchParams.get("sessionToken");

  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: "Session token required" },
      { status: 400 }
    );
  }

  const session = await getTempLoginSession(sessionToken);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired session" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      userId: session.userId,
      email: session.email,
    },
  });
};

