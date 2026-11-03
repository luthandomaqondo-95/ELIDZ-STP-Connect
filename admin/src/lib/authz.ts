import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCustomAuthEnabled } from "@/lib/custom-auth/feature-flag";
import { ACCESS_COOKIE } from "@/lib/custom-auth/cookies";
import { resolveCustomAdminSession } from "@/lib/custom-auth/admin-session";

export type AdminRole = "Admin" | "Super Admin";

export type ProfileRole =
  | "Super Admin"
  | "Admin"
  | "Investor"
  | "Tenant"
  | "SME"
  | "Entrepreneur"
  | "Researcher"
  | string;

export type AuthedProfileResult = {
  user: { id: string; email?: string | null } | null;
  profile: Record<string, unknown> | null;
};

export type SidebarUser = {
  name: string;
  email: string;
  avatar: string;
  role: string;
};

/** Map authz result to sidebar display fields (Guest when unauthenticated). */
export function buildSidebarUser(
  user: AuthedProfileResult["user"],
  profile: AuthedProfileResult["profile"]
): SidebarUser {
  if (!user) {
    return { name: "Guest", email: "", avatar: "", role: "" };
  }
  return {
    name:
      (typeof profile?.name === "string" && profile.name) ||
      user.email ||
      "User",
    email: user.email || "",
    avatar: typeof profile?.avatar === "string" ? profile.avatar : "",
    role: typeof profile?.role === "string" ? profile.role : "",
  };
}

export async function getAuthedProfile() {
  if (isCustomAuthEnabled()) {
    try {
      const jar = await cookies();
      const access = jar.get(ACCESS_COOKIE)?.value;
      const session = await resolveCustomAdminSession(access);
      if (!session) {
        return { user: null, profile: null } satisfies AuthedProfileResult;
      }
      const supabase = createAdminClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.userId)
        .single();
      return {
        user: { id: session.userId, email: session.email },
        profile: (profile ?? null) as unknown as Record<string, unknown> | null,
      } satisfies AuthedProfileResult;
    } catch {
      return { user: null, profile: null } satisfies AuthedProfileResult;
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null } satisfies AuthedProfileResult;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user: { id: user.id, email: user.email },
    profile: (profile ?? null) as unknown as Record<string, unknown> | null,
  } satisfies AuthedProfileResult;
}

export async function requireAdmin() {
  const { user, profile } = await getAuthedProfile();
  const role = (profile?.role ?? "") as ProfileRole;

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (role !== "Admin" && role !== "Super Admin") {
    throw new Error("Forbidden");
  }

  return { userId: user.id, role: role as AdminRole, profile };
}

type ApiAuthResult =
  | { ok: true; userId: string; role: AdminRole; profile: Record<string, unknown> | null }
  | { ok: false; response: NextResponse };

/**
 * Route-handler guard: returns a 401/403 JSON response instead of throwing.
 * Use at the top of every /api/admin/* handler before touching the service role.
 */
export async function requireAdminApi(
  options: { superAdmin?: boolean } = {}
): Promise<ApiAuthResult> {
  const { user, profile } = await getAuthedProfile();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = (profile?.role ?? "") as ProfileRole;
  const allowed = options.superAdmin ? role === "Super Admin" : role === "Admin" || role === "Super Admin";
  if (!allowed) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, userId: user.id, role: role as AdminRole, profile };
}

/**
 * Guard for actions on another user's account (suspend/unsuspend/delete):
 * no acting on yourself, and only Super Admin may act on Admin/Super Admin accounts.
 * Returns the rejection, or null when the action is allowed.
 */
export async function checkManageableTarget(
  actor: { userId: string; role: AdminRole },
  targetUserId: string
): Promise<{ status: number; error: string } | null> {
  if (actor.userId === targetUserId) {
    return { status: 403, error: "You cannot perform this action on your own account" };
  }
  const { data: target } = await createAdminClient()
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();
  if (!target) {
    return { status: 404, error: "User not found" };
  }
  try {
    assertCanManageRole(actor.role, target.role ?? "", target.role ?? "");
  } catch {
    return { status: 403, error: "Only a Super Admin can manage administrator accounts" };
  }
  return null;
}

/** Combined admin + target guard for user-account route handlers. */
export async function requireManageableTargetApi(targetUserId: string): Promise<ApiAuthResult> {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth;
  const rejection = await checkManageableTarget(auth, targetUserId);
  if (rejection) {
    return { ok: false, response: NextResponse.json({ error: rejection.error }, { status: rejection.status }) };
  }
  return auth;
}

export function assertCanManageRole(actor: AdminRole, targetRole: ProfileRole, newRole: ProfileRole) {
  // Super Admin can manage any role.
  if (actor === "Super Admin") return;

  // Admin cannot grant/modify Admin or Super Admin roles.
  const restricted = new Set<ProfileRole>(["Admin", "Super Admin"]);
  if (restricted.has(newRole) || restricted.has(targetRole)) {
    throw new Error("Forbidden");
  }
}

export async function requireSuperAdmin() {
  const { user, profile } = await getAuthedProfile();
  const role = (profile?.role ?? "") as ProfileRole;

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (role !== "Super Admin") {
    throw new Error("Forbidden - Super Admin access required");
  }

  return { userId: user.id, role: role as "Super Admin", profile };
}

/**
 * Authorized DB client for dashboard server components/actions.
 * Custom auth: require Admin/Super Admin session cookies, then use service-role
 * (dashboard has no Supabase Auth cookie / auth.uid() under custom auth).
 * Legacy Supabase Auth: keep the user-scoped SSR anon client + RLS.
 */
export async function createDashboardClient() {
  if (isCustomAuthEnabled()) {
    const { user, profile } = await getAuthedProfile();
    const role = (profile?.role ?? "") as ProfileRole;
    if (!user || (role !== "Admin" && role !== "Super Admin")) {
      // Avoid raw 500s from thrown Unauthorized in Server Components.
      const { redirect } = await import("next/navigation");
      redirect("/auth/login");
    }
    return createAdminClient();
  }
  return createClient();
}

