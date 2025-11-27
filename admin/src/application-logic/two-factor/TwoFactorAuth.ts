/**
 * Two-Factor Authentication Service
 * Handles SMS/Email 2FA code generation, sending, and verification
 */

import { db } from "@/db-migration/db/db";
import { twoFactorCodes, twoFactorSessions } from "@/db-migration/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import crypto from "crypto";
import { send2FACodeSMS } from "@/lib/sms-service";
import { send2FACodeEmail } from "@/lib/email-service";

export class TwoFactorAuth {
  /**
   * Generate a 6-character alphanumeric code
   */
  private static generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Send 2FA code via SMS, with email fallback
   */
  static async sendCode(userId: string, email: string, phone: string | null): Promise<string> {
    // Generate 6-character alphanumeric code
    const code = this.generateCode();

    // Set expiration to 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store code in database
    await db.insert(twoFactorCodes).values({
      userId,
      code,
      expiresAt,
      used: false,
    });

    // Try to send via SMS first
    let smsSent = false;
    if (phone) {
      try {
        await send2FACodeSMS(phone, code);
        smsSent = true;
      } catch (error) {
        console.error("Failed to send SMS, falling back to email:", error);
      }
    }

    // If SMS failed or phone not available, send via email
    if (!smsSent) {
      try {
        await send2FACodeEmail(email, code);
      } catch (error) {
        console.error("Failed to send email:", error);
        throw new Error("Failed to send verification code");
      }
    }

    return code; // Return for testing purposes (in production, don't return)
  }

  /**
   * Verify 2FA code and generate session token
   */
  static async verifyCode(userId: string, email: string, code: string): Promise<string> {
    // Find valid code
    const codeResults = await db
      .select()
      .from(twoFactorCodes)
      .where(
        and(
          eq(twoFactorCodes.userId, userId),
          eq(twoFactorCodes.code, code.toUpperCase()), // Case-insensitive comparison
          eq(twoFactorCodes.used, false),
          gt(twoFactorCodes.expiresAt, sql`NOW()`) // Not expired
        )
      )
      .limit(1);

    if (codeResults.length === 0) {
      throw new Error("Invalid or expired verification code");
    }

    const codeRecord = codeResults[0];

    // Mark code as used
    await db
      .update(twoFactorCodes)
      .set({ used: true })
      .where(eq(twoFactorCodes.id, codeRecord.id));

    // Generate session token (32-byte hex string)
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Store session token (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.insert(twoFactorSessions).values({
      sessionToken,
      userId,
      email,
      expiresAt,
      used: false,
    });

    return sessionToken;
  }

  /**
   * Verify session token (used in NextAuth authorize function)
   */
  static async verifySessionToken(sessionToken: string, email: string): Promise<{ userId: string; email: string } | null> {
    // Find valid session token
    const sessionResults = await db
      .select()
      .from(twoFactorSessions)
      .where(
        and(
          eq(twoFactorSessions.sessionToken, sessionToken),
          eq(twoFactorSessions.email, email),
          eq(twoFactorSessions.used, false),
          gt(twoFactorSessions.expiresAt, sql`NOW()`) // Not expired
        )
      )
      .limit(1);

    if (sessionResults.length === 0) {
      return null;
    }

    const session = sessionResults[0];

    // Mark session as used (one-time use)
    await db
      .update(twoFactorSessions)
      .set({ used: true })
      .where(eq(twoFactorSessions.id, session.id));

    return {
      userId: session.userId,
      email: session.email,
    };
  }

  /**
   * Resend 2FA code
   */
  static async resendCode(userId: string, email: string, phone: string | null): Promise<void> {
    // Invalidate any existing unused codes for this user
    await db
      .update(twoFactorCodes)
      .set({ used: true })
      .where(
        and(
          eq(twoFactorCodes.userId, userId),
          eq(twoFactorCodes.used, false)
        )
      );

    // Send new code
    await this.sendCode(userId, email, phone);
  }
}

