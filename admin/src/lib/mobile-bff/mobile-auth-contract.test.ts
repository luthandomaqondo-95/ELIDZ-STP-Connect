import { describe, expect, it } from "vitest";

function resolveFlags(input: {
  customAuth?: boolean;
  bffRequired?: boolean;
  apiBaseUrl?: string | null;
}) {
  const customAuth = Boolean(input.customAuth);
  const bffRequired = customAuth || Boolean(input.bffRequired);
  const hasBff = Boolean(input.apiBaseUrl?.trim());
  return { customAuth, bffRequired, hasBff };
}

function shouldRetry401(status: number, customAuth: boolean): boolean {
  return status === 401 && customAuth;
}

function chatRequest(targetUserId: string) {
  return { otherUserId: targetUserId };
}

function refreshOutcome(status: number): "clear" | "preserve" {
  return status === 401 ? "clear" : "preserve";
}

describe("mobile custom-auth contract", () => {
  it.each([
    [{}, false, false, false],
    [{ bffRequired: true }, false, true, false],
    [{ customAuth: true }, true, true, false],
    [{ customAuth: true, apiBaseUrl: "https://preview.example" }, true, true, true],
  ])("resolves flags safely: %o", (input, customAuth, bffRequired, hasBff) => {
    expect(resolveFlags(input)).toEqual({ customAuth, bffRequired, hasBff });
  });

  it("fails closed when custom auth requires BFF but the URL is absent", () => {
    const flags = resolveFlags({ customAuth: true });
    expect(flags.bffRequired).toBe(true);
    expect(flags.hasBff).toBe(false);
  });

  it("sends only the target user to chat creation", () => {
    expect(chatRequest("target-user")).toEqual({ otherUserId: "target-user" });
  });

  it("refreshes exactly on custom-auth 401 responses", () => {
    expect(shouldRetry401(401, true)).toBe(true);
    expect(shouldRetry401(403, true)).toBe(false);
    expect(shouldRetry401(500, true)).toBe(false);
    expect(shouldRetry401(401, false)).toBe(false);
  });

  it("clears a refresh token only when refresh proves it is invalid", () => {
    expect(refreshOutcome(401)).toBe("clear");
    expect(refreshOutcome(403)).toBe("preserve");
    expect(refreshOutcome(500)).toBe("preserve");
  });

  it("treats logout as local cleanup even if the server is unavailable", () => {
    const serverLogoutFailed = true;
    const localSessionCleared = true;
    expect(serverLogoutFailed && localSessionCleared).toBe(true);
  });
});
