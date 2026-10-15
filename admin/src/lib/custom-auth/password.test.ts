import { describe, expect, it } from "vitest";
import {
  hashPassword,
  isArgon2idHash,
  validatePasswordStrength,
  verifyPassword,
} from "./password";

describe("password hashing (Argon2id)", () => {
  it("stores argon2id hashes, not plaintext", async () => {
    const password = "CorrectHorseBattery1!";
    const hash = await hashPassword(password);
    expect(hash).not.toEqual(password);
    expect(isArgon2idHash(hash)).toBe(true);
    expect(hash.includes(password)).toBe(false);
  });

  it("produces independently salted hashes for the same password", async () => {
    const password = "SamePasswordAcrossUsers9";
    const a = await hashPassword(password);
    const b = await hashPassword(password);
    expect(a).not.toEqual(b);
    expect(await verifyPassword(a, password)).toBe(true);
    expect(await verifyPassword(b, password)).toBe(true);
  });

  it("rejects incorrect passwords", async () => {
    const hash = await hashPassword("RightPassword123");
    expect(await verifyPassword(hash, "WrongPassword123")).toBe(false);
  });

  it("enforces minimum password length", () => {
    expect(validatePasswordStrength("short")).toMatch(/at least/i);
    expect(validatePasswordStrength("longenough")).toBeNull();
  });
});
