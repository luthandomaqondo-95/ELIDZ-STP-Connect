"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

export type RoleSummary = {
  role: string;
  users: number;
  permissions: string[];
};

export type PermissionDef = {
  permission_key: string;
  name: string;
  description: string;
  category: string;
};

export async function getCurrentAdminRole() {
  const { role } = await requireAdmin();
  return role;
}

export async function getRoleSummaries(): Promise<RoleSummary[]> {
  await requireAdmin();

  const supabase = await createClient();
  const adminDb = createAdminClient();

  const [profilesRes, rolePermsRes] = await Promise.all([
    supabase.from("profiles").select("role"),
    adminDb.from("role_permissions").select("role, permission_key, name"),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);

  const counts = new Map<string, number>();
  for (const row of profilesRes.data ?? []) {
    const role = row.role ? String(row.role) : "User";
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }

  const permsByRole = new Map<string, string[]>();
  for (const row of rolePermsRes.data ?? []) {
    const arr = permsByRole.get(row.role) ?? [];
    arr.push(row.name);
    permsByRole.set(row.role, arr);
  }

  return Array.from(counts.entries())
    .map(([role, users]) => ({
      role,
      users,
      permissions: permsByRole.get(role) ?? [],
    }))
    .sort((a, b) => a.role.localeCompare(b.role));
}

/** Returns all distinct permissions using Super Admin as the master list. */
export async function getAllPermissions(): Promise<PermissionDef[]> {
  await requireAdmin();
  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("role_permissions")
    .select("permission_key, name, description, category")
    .eq("role", "Super Admin")
    .order("category")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as PermissionDef[];
}

/** Returns a map of role → permission_key[] for all roles. */
export async function getAllRolePermissions(): Promise<Record<string, string[]>> {
  await requireAdmin();
  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("role_permissions")
    .select("role, permission_key");
  if (error) throw new Error(error.message);

  const result: Record<string, string[]> = {};
  for (const row of data ?? []) {
    if (!result[row.role]) result[row.role] = [];
    result[row.role].push(row.permission_key);
  }
  return result;
}

/** Replaces the permissions for a single role (Super Admin is immutable). */
export async function saveRolePermissions(
  targetRole: string,
  newPermissionKeys: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSuperAdmin();

    if (targetRole === "Super Admin") {
      return { success: false, error: "Super Admin permissions cannot be modified." };
    }

    const adminDb = createAdminClient();

    // Fetch metadata from the master list (Super Admin)
    const { data: masterList, error: masterErr } = await adminDb
      .from("role_permissions")
      .select("permission_key, name, description, category")
      .eq("role", "Super Admin");
    if (masterErr) return { success: false, error: masterErr.message };

    const metaMap = new Map(
      (masterList ?? []).map((p) => [p.permission_key, p])
    );

    // Replace permissions atomically: delete then insert
    const { error: delErr } = await adminDb
      .from("role_permissions")
      .delete()
      .eq("role", targetRole);
    if (delErr) return { success: false, error: delErr.message };

    if (newPermissionKeys.length > 0) {
      const rows = newPermissionKeys.map((key) => {
        const meta = metaMap.get(key);
        return {
          role: targetRole,
          permission_key: key,
          name: meta?.name ?? key,
          description: meta?.description ?? "",
          category: meta?.category ?? "General",
        };
      });
      const { error: insErr } = await adminDb
        .from("role_permissions")
        .insert(rows);
      if (insErr) return { success: false, error: insErr.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

