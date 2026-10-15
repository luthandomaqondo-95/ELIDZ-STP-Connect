import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesGet = vi.fn();
const resolveCustomAdminSession = vi.fn();
const createAdminClient = vi.fn();
const createClient = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookiesGet }),
}));

vi.mock("@/lib/custom-auth/feature-flag", () => ({
  isCustomAuthEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/custom-auth/admin-session", () => ({
  resolveCustomAdminSession: (...args: unknown[]) => resolveCustomAdminSession(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: (...args: unknown[]) => createAdminClient(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClient(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

describe("buildSidebarUser / getAuthedProfile (custom auth)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("shows Guest when unauthenticated", async () => {
    const { buildSidebarUser } = await import("./authz");
    expect(buildSidebarUser(null, null)).toEqual({
      name: "Guest",
      email: "",
      avatar: "",
      role: "",
    });
  });

  it("maps Super Admin profile for sidebar after custom-auth session resolve", async () => {
    const { buildSidebarUser } = await import("./authz");
    const sidebar = buildSidebarUser(
      { id: "user-1", email: "tebogo.lekgothoane@appimate.com" },
      {
        name: "Tebogo Lekgothoane",
        role: "Super Admin",
        avatar: "",
      }
    );
    expect(sidebar.name).toBe("Tebogo Lekgothoane");
    expect(sidebar.email).toBe("tebogo.lekgothoane@appimate.com");
    expect(sidebar.role).toBe("Super Admin");
    expect(sidebar.name).not.toBe("Guest");
  });

  it("getAuthedProfile returns null user without access cookie (guest path)", async () => {
    cookiesGet.mockReturnValue(undefined);
    resolveCustomAdminSession.mockResolvedValue(null);

    const { getAuthedProfile } = await import("./authz");
    const result = await getAuthedProfile();
    expect(result.user).toBeNull();
    expect(result.profile).toBeNull();
  });

  it("getAuthedProfile loads Super Admin profile from custom-auth cookie session", async () => {
    cookiesGet.mockReturnValue({ value: "access-token" });
    resolveCustomAdminSession.mockResolvedValue({
      userId: "user-1",
      email: "tebogo.lekgothoane@appimate.com",
      role: "Super Admin",
      name: "Tebogo Lekgothoane",
      sessionId: "sid-1",
    });
    createAdminClient.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: "user-1",
                name: "Tebogo Lekgothoane",
                email: "tebogo.lekgothoane@appimate.com",
                role: "Super Admin",
                avatar: "",
              },
            }),
          }),
        }),
      }),
    });

    const { getAuthedProfile, buildSidebarUser } = await import("./authz");
    const result = await getAuthedProfile();
    expect(result.user?.id).toBe("user-1");
    expect(result.profile?.role).toBe("Super Admin");

    const sidebar = buildSidebarUser(result.user, result.profile);
    expect(sidebar.role).toBe("Super Admin");
    expect(sidebar.name).toBe("Tebogo Lekgothoane");
  });
});

describe("createDashboardClient", () => {
  it("uses service-role admin client when custom auth is enabled after requireAdmin", async () => {
    cookiesGet.mockReturnValue({ value: "access-token" });
    resolveCustomAdminSession.mockResolvedValue({
      userId: "user-1",
      email: "admin@example.com",
      role: "Super Admin",
      name: "Admin",
      sessionId: "sid-1",
    });
    const adminClient = {
      kind: "admin",
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: "user-1",
                role: "Super Admin",
                name: "Admin",
                email: "admin@example.com",
              },
            }),
          }),
        }),
      }),
    };
    createAdminClient.mockReturnValue(adminClient);

    const { createDashboardClient } = await import("./authz");
    const client = await createDashboardClient();
    expect(client).toBe(adminClient);
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe("session cookie helpers", () => {
  it("sets httpOnly access and refresh cookies on login response", async () => {
    const { NextResponse } = await import("next/server");
    const { setSessionCookies, ACCESS_COOKIE, REFRESH_COOKIE } = await import(
      "./custom-auth/cookies"
    );
    const response = NextResponse.json({ ok: true });
    setSessionCookies(response, {
      accessToken: "access-test",
      refreshToken: "refresh-test",
    });
    const access = response.cookies.get(ACCESS_COOKIE);
    const refresh = response.cookies.get(REFRESH_COOKIE);
    expect(access?.value).toBe("access-test");
    expect(refresh?.value).toBe("refresh-test");
    expect(access?.httpOnly).toBe(true);
    expect(refresh?.httpOnly).toBe(true);
    expect(access?.path).toBe("/");
    expect(refresh?.path).toBe("/");
    expect(access?.sameSite).toBe("lax");
  });

  it("clears session cookies on logout response", async () => {
    const { NextResponse } = await import("next/server");
    const { clearSessionCookies, ACCESS_COOKIE, REFRESH_COOKIE } = await import(
      "./custom-auth/cookies"
    );
    const response = NextResponse.json({ ok: true });
    clearSessionCookies(response);
    expect(response.cookies.get(ACCESS_COOKIE)?.value).toBe("");
    expect(response.cookies.get(REFRESH_COOKIE)?.value).toBe("");
    expect(response.cookies.get(ACCESS_COOKIE)?.maxAge).toBe(0);
  });
});
