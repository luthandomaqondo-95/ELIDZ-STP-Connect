import { createHash, randomBytes } from "crypto";

export {
  signAccessToken,
  verifyAccessToken,
  signSupabaseDataToken,
  ACCESS_TTL_SECONDS,
  SUPABASE_DATA_TTL_SECONDS,
  type AccessTokenClaims,
} from "./tokens-jwt";

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Node-only opaque token hashing (not imported by Edge middleware). */
export function hashOpaqueToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function refreshExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_TTL_MS);
}

export { REFRESH_TTL_MS };
