import { createClient } from "@/lib/supabase/server";

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

export async function getAuthedProfile() {
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

