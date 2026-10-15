import argon2 from "argon2";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Argon2id parameters (OWASP minimum guidance):
 * - type: argon2id
 * - memoryCost: 65536 KiB (64 MiB)
 * - timeCost: 3
 * - parallelism: 1
 * Benchmark on deploy host if login latency is too high; do not go below OWASP floors.
 */
function applyPepper(password: string): string {
  const pepper = process.env.AUTH_PEPPER?.trim();
  if (!pepper) return password;
  return createHmac("sha256", pepper).update(password, "utf8").digest("hex") + ":" + password;
}

export async function hashPassword(password: string): Promise<string> {
  // Argon2id — memoryCost 65536 KiB (64 MiB), timeCost 3, parallelism 1 (OWASP floor+)
  return argon2.hash(applyPepper(password), {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, applyPepper(password));
  } catch {
    return false;
  }
}

export function isArgon2idHash(hash: string): boolean {
  return hash.startsWith("$argon2id$");
}

/** Constant-time compare for equal-length buffers/strings used in token checks. */
export function safeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export const PASSWORD_MIN_LENGTH = 8;

export function validatePasswordStrength(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > 128) {
    return "Password must be at most 128 characters.";
  }
  return null;
}
