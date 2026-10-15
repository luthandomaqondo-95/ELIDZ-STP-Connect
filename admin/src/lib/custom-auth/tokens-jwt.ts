/**
 * Edge-safe JWT helpers (jose only — no Node `crypto`).
 * Opaque token hashing stays in `tokens.ts` for Node route handlers.
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ACCESS_TTL_SECONDS = 15 * 60;
const SUPABASE_DATA_TTL_SECONDS = 10 * 60;

export type AccessTokenClaims = JWTPayload & {
  sub: string;
  role: string;
  sid: string;
  typ: "access";
  email?: string;
};

function getAuthJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_JWT_SECRET must be set to a strong secret (min 32 characters).");
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(input: {
  userId: string;
  role: string;
  sessionId: string;
  email?: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + ACCESS_TTL_SECONDS * 1000);
  const token = await new SignJWT({
    role: input.role,
    sid: input.sessionId,
    typ: "access",
    email: input.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(getAuthJwtSecret());

  return { token, expiresAt };
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, getAuthJwtSecret());
  if (payload.typ !== "access" || typeof payload.sub !== "string" || typeof payload.sid !== "string") {
    throw new Error("Invalid access token");
  }
  return payload as AccessTokenClaims;
}

export async function signSupabaseDataToken(userId: string): Promise<string | null> {
  const secret = process.env.SUPABASE_JWT_SECRET?.trim();
  if (!secret) return null;

  return new SignJWT({
    role: "authenticated",
    aud: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SUPABASE_DATA_TTL_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));
}

export { ACCESS_TTL_SECONDS, SUPABASE_DATA_TTL_SECONDS };
