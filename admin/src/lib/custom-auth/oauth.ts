import { OAuth2Client } from "google-auth-library";
import { createRemoteJWKSet, jwtVerify } from "jose";

const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

function googleAudiences(): string[] {
  const raw = process.env.GOOGLE_CLIENT_IDS?.trim() || process.env.GOOGLE_CLIENT_ID?.trim() || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function appleAudiences(): string[] {
  const raw =
    process.env.APPLE_CLIENT_IDS?.trim() ||
    process.env.APPLE_CLIENT_ID?.trim() ||
    process.env.APPLE_BUNDLE_ID?.trim() ||
    "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type VerifiedOAuthIdentity = {
  provider: "google" | "apple";
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
};

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedOAuthIdentity> {
  const audiences = googleAudiences();
  if (audiences.length === 0) {
    throw new Error("GOOGLE_CLIENT_IDS is not configured on the server.");
  }

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: audiences,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new Error("Invalid Google ID token");
  }

  return {
    provider: "google",
    subject: payload.sub,
    email: payload.email?.toLowerCase() ?? null,
    emailVerified: Boolean(payload.email_verified),
    name: payload.name ?? null,
  };
}

export async function verifyAppleIdToken(idToken: string): Promise<VerifiedOAuthIdentity> {
  const audiences = appleAudiences();
  if (audiences.length === 0) {
    throw new Error("APPLE_CLIENT_ID / APPLE_CLIENT_IDS is not configured on the server.");
  }

  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: audiences,
  });

  const subject = typeof payload.sub === "string" ? payload.sub : null;
  if (!subject) {
    throw new Error("Invalid Apple identity token");
  }

  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  const emailVerified =
    payload.email_verified === true ||
    payload.email_verified === "true" ||
    // Apple may omit email on subsequent sign-ins
    Boolean(email);

  return {
    provider: "apple",
    subject,
    email,
    emailVerified,
    name: null,
  };
}
