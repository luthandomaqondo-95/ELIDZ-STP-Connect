import { describe, expect, it, beforeAll } from "vitest";
import {
  generateOpaqueToken,
  hashOpaqueToken,
  signAccessToken,
  verifyAccessToken,
} from "./tokens";

beforeAll(() => {
  if (!process.env.AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET.length < 32) {
    process.env.AUTH_JWT_SECRET = "test-auth-jwt-secret-at-least-32-chars-long!!";
  }
});

describe("tokens", () => {
  it("hashes opaque tokens one-way", () => {
    const raw = generateOpaqueToken();
    const hash = hashOpaqueToken(raw);
    expect(hash).not.toEqual(raw);
    expect(hash).toHaveLength(64);
    expect(hashOpaqueToken(raw)).toEqual(hash);
  });

  it("signs and verifies access JWTs with sid/sub/typ", async () => {
    const { token } = await signAccessToken({
      userId: "11111111-1111-1111-1111-111111111111",
      role: "Entrepreneur",
      sessionId: "22222222-2222-2222-2222-222222222222",
      email: "user@example.com",
    });
    const claims = await verifyAccessToken(token);
    expect(claims.sub).toBe("11111111-1111-1111-1111-111111111111");
    expect(claims.sid).toBe("22222222-2222-2222-2222-222222222222");
    expect(claims.typ).toBe("access");
    expect(claims.role).toBe("Entrepreneur");
    expect(JSON.stringify(claims).toLowerCase()).not.toContain("password");
  });

  it("rejects tokens signed with the wrong secret", async () => {
    const { SignJWT } = await import("jose");
    const bad = await new SignJWT({ typ: "access", sid: "22222222-2222-2222-2222-222222222222", role: "Entrepreneur" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("11111111-1111-1111-1111-111111111111")
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode("totally-different-secret-at-least-32!!"));
    await expect(verifyAccessToken(bad)).rejects.toThrow();
  });

  it("rejects expired tokens and wrong typ claims", async () => {
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET!);
    const expired = await new SignJWT({ typ: "access", sid: "22222222-2222-2222-2222-222222222222", role: "Entrepreneur" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("11111111-1111-1111-1111-111111111111")
      .setExpirationTime("0s")
      .sign(secret);
    await expect(verifyAccessToken(expired)).rejects.toThrow();

    const wrongTyp = await new SignJWT({ typ: "refresh", sid: "22222222-2222-2222-2222-222222222222", role: "Entrepreneur" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("11111111-1111-1111-1111-111111111111")
      .setExpirationTime("15m")
      .sign(secret);
    await expect(verifyAccessToken(wrongTyp)).rejects.toThrow(/Invalid access token/i);
  });
});
