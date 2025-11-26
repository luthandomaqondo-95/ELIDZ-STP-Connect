/**
 * Temporary login sessions for 2FA verification
 * Now using database storage for persistence
 */

import { db } from "@/db-migration/db/db";
import { tempLoginSessions, verifiedTwoFactorSessions } from "@/db-migration/db/schema";
import { eq, and, lt, gt, sql } from "drizzle-orm";

interface TempLoginSession {
  userId: string;
  email: string;
  expiresAt: Date;
}

interface VerifiedTwoFactorSession {
  userId: string;
  email: string;
  expiresAt: Date;
}

/**
 * Store a temporary login session in database
 */
export async function setTempLoginSession(
  sessionToken: string,
  userId: string,
  email: string,
  expiresInMs: number = 15 * 60 * 1000 // 15 minutes default
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresInMs);
  
  try {
    await db.insert(tempLoginSessions).values({
      sessionToken,
      userId,
      email,
      expiresAt,
      used: false,
    });
    
    console.log("Temp login session created in database", {
      sessionToken: sessionToken.substring(0, 8) + "...",
      userId,
      email,
      expiresIn: Math.round(expiresInMs / 1000) + " seconds",
    });
  } catch (error) {
    console.error("Error creating temp login session:", error);
    throw error;
  }
}

/**
 * Get a temporary login session from database
 */
export async function getTempLoginSession(sessionToken: string): Promise<TempLoginSession | null> {
  try {
    // Use database-level expiration check to avoid timezone/precision issues
    const result = await db
      .select({
        userId: tempLoginSessions.userId,
        email: tempLoginSessions.email,
        expiresAt: tempLoginSessions.expiresAt,
        used: tempLoginSessions.used,
      })
      .from(tempLoginSessions)
      .where(
        and(
          eq(tempLoginSessions.sessionToken, sessionToken),
          eq(tempLoginSessions.used, false),
          gt(tempLoginSessions.expiresAt, sql`NOW()`) // Database-level expiration check
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const session = result[0];

    // Session is valid (database already filtered out expired sessions)
    return {
      userId: session.userId,
      email: session.email,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error("Error getting temp login session:", error);
    return null;
  }
}

/**
 * Delete a temporary login session from database
 */
export async function deleteTempLoginSession(sessionToken: string): Promise<void> {
  try {
    await db
      .update(tempLoginSessions)
      .set({ used: true })
      .where(eq(tempLoginSessions.sessionToken, sessionToken));
  } catch (error) {
    console.error("Error deleting temp login session:", error);
  }
}

/**
 * Clean up expired sessions from database
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    // Use database NOW() for accurate expiration checking
    await db
      .update(tempLoginSessions)
      .set({ used: true })
      .where(lt(tempLoginSessions.expiresAt, sql`NOW()`));
    
    await db
      .update(verifiedTwoFactorSessions)
      .set({ used: true })
      .where(lt(verifiedTwoFactorSessions.expiresAt, sql`NOW()`));
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
}

/**
 * Store a verified 2FA session in database (password already verified, 2FA verified)
 */
export async function setVerifiedTwoFactorSession(
  verifyToken: string,
  userId: string,
  email: string,
  expiresInMs: number = 2 * 60 * 1000 // 2 minutes default
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresInMs);
  
  try {
    await db.insert(verifiedTwoFactorSessions).values({
      verifyToken,
      userId,
      email,
      expiresAt,
      used: false,
    });
  } catch (error) {
    console.error("Error creating verified 2FA session:", error);
    throw error;
  }
}

/**
 * Get and consume a verified 2FA session from database
 */
export async function getAndConsumeVerifiedTwoFactorSession(
  verifyToken: string
): Promise<VerifiedTwoFactorSession | null> {
  try {
    // Use database-level expiration check to avoid timezone/precision issues
    const result = await db
      .select({
        userId: verifiedTwoFactorSessions.userId,
        email: verifiedTwoFactorSessions.email,
        expiresAt: verifiedTwoFactorSessions.expiresAt,
        used: verifiedTwoFactorSessions.used,
      })
      .from(verifiedTwoFactorSessions)
      .where(
        and(
          eq(verifiedTwoFactorSessions.verifyToken, verifyToken),
          eq(verifiedTwoFactorSessions.used, false),
          gt(verifiedTwoFactorSessions.expiresAt, sql`NOW()`) // Database-level expiration check
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const session = result[0];

    // Consume the token (one-time use) - mark as used
    await db
      .update(verifiedTwoFactorSessions)
      .set({ used: true })
      .where(eq(verifiedTwoFactorSessions.verifyToken, verifyToken));

    return {
      userId: session.userId,
      email: session.email,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error("Error getting verified 2FA session:", error);
    return null;
  }
}

// Cleanup expired sessions every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cleanupExpiredSessions().catch((error) => {
      console.error("Error in scheduled cleanup:", error);
    });
  }, 5 * 60 * 1000);
}

