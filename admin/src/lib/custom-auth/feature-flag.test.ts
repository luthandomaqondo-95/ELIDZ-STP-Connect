import { afterEach, describe, expect, it } from "vitest";
import { isCustomAuthEnabled } from "./feature-flag";

describe("isCustomAuthEnabled", () => {
  const prevEnabled = process.env.CUSTOM_AUTH_ENABLED;
  const prevProvider = process.env.AUTH_PROVIDER;

  afterEach(() => {
    if (prevEnabled === undefined) delete process.env.CUSTOM_AUTH_ENABLED;
    else process.env.CUSTOM_AUTH_ENABLED = prevEnabled;
    if (prevProvider === undefined) delete process.env.AUTH_PROVIDER;
    else process.env.AUTH_PROVIDER = prevProvider;
  });

  it("defaults to false when unset", () => {
    delete process.env.CUSTOM_AUTH_ENABLED;
    delete process.env.AUTH_PROVIDER;
    expect(isCustomAuthEnabled()).toBe(false);
  });

  it("enables via CUSTOM_AUTH_ENABLED", () => {
    delete process.env.AUTH_PROVIDER;
    process.env.CUSTOM_AUTH_ENABLED = "true";
    expect(isCustomAuthEnabled()).toBe(true);
    process.env.CUSTOM_AUTH_ENABLED = "0";
    expect(isCustomAuthEnabled()).toBe(false);
  });

  it("enables via AUTH_PROVIDER=custom", () => {
    delete process.env.CUSTOM_AUTH_ENABLED;
    process.env.AUTH_PROVIDER = "custom";
    expect(isCustomAuthEnabled()).toBe(true);
    process.env.AUTH_PROVIDER = "supabase";
    expect(isCustomAuthEnabled()).toBe(false);
  });
});
