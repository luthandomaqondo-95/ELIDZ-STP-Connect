/**
 * Password Reset Service
 * Handles password reset token generation, validation, and password updates
 */

import { db } from "@/db-migration/db/db";
import { users, passwordResetTokens } from "@/db-migration/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email-service";

export class PasswordReset {
  /**
   * Generate and send password reset token
   */
  static async requestReset(email: string): Promise<void> {
    // Find user by email
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success (security: don't reveal if email exists)
    if (userResults.length === 0) {
      return;
    }

    const user = userResults[0];

    // Generate secure random token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    // Send email with reset link
    try {
      await sendPasswordResetEmail(email, token);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      // Don't throw - we still want to return success for security
    }
  }

  /**
   * Validate reset token
   */
  static async validateToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    const tokenResults = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, sql`NOW()`) // Not expired
        )
      )
      .limit(1);

    if (tokenResults.length === 0) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: tokenResults[0].userId,
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password length
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Validate token
    const tokenResults = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, sql`NOW()`) // Not expired
        )
      )
      .limit(1);

    if (tokenResults.length === 0) {
      throw new Error("Invalid or expired reset token");
    }

    const tokenRecord = tokenResults[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, tokenRecord.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenRecord.id));
  }
}

