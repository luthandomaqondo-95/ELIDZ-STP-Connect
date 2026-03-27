"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/authz";

export type RoleSummary = {
  role: string;
  users: number;
};

export async function getCurrentAdminRole() {
  const { role } = await requireAdmin();
  return role;
}

export async function getRoleSummaries(): Promise<RoleSummary[]> {
  // Require dashboard access first (Admin/Super Admin only).
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = (await supabase
    .from("profiles")
    .select("role")) as { data: Array<{ role: string | null }> | null; error: { message?: string } | null };
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const role = row.role ? String(row.role) : "User";
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([role, users]) => ({ role, users }))
    .sort((a, b) => a.role.localeCompare(b.role));
}

