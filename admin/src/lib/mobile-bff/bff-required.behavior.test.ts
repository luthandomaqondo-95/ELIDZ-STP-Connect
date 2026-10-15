/**
 * Documents expected mobile BFF_REQUIRED behavior (mirrors mobile/src/lib/mobile-api.ts).
 * Pure unit tests — no network.
 */
import { describe, expect, it } from "vitest";

function shouldUseBff(opts: {
  apiBaseUrl: string | null;
  bffRequired: boolean;
  customAuth: boolean;
}): boolean {
  const required = opts.customAuth || opts.bffRequired;
  if (opts.apiBaseUrl) return true;
  if (required) {
    throw new Error(
      "BFF is required for this build but EXPO_PUBLIC_API_BASE_URL / extra.apiBaseUrl is not configured."
    );
  }
  return false;
}

describe("BFF_REQUIRED safe failure", () => {
  it("uses BFF when apiBaseUrl is set", () => {
    expect(
      shouldUseBff({
        apiBaseUrl: "https://staging.example",
        bffRequired: true,
        customAuth: false,
      })
    ).toBe(true);
  });

  it("falls back to direct Supabase when BFF not required and url empty", () => {
    expect(
      shouldUseBff({
        apiBaseUrl: null,
        bffRequired: false,
        customAuth: false,
      })
    ).toBe(false);
  });

  it("throws instead of silent fallback when BFF_REQUIRED and url empty", () => {
    expect(() =>
      shouldUseBff({
        apiBaseUrl: null,
        bffRequired: true,
        customAuth: false,
      })
    ).toThrow(/BFF is required/i);
  });

  it("throws when custom auth enabled without apiBaseUrl", () => {
    expect(() =>
      shouldUseBff({
        apiBaseUrl: null,
        bffRequired: false,
        customAuth: true,
      })
    ).toThrow(/BFF is required/i);
  });
});
