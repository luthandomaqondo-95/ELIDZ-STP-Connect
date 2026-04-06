import { createAdminClient } from "@/lib/supabase/admin"

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  status: string
  company: string
  lastActive: string
  avatar: string | null
}

/** Single source of truth for how profile rows become list status (badge + suspend/unsuspend). */
export function normalizeProfileStatus(profile: Record<string, unknown>): string {
  const vRaw = profile.verification_status
  const sRaw = profile.status
  const v = vRaw != null && vRaw !== "" ? String(vRaw).trim() : ""
  const s = sRaw != null && sRaw !== "" ? String(sRaw).trim() : ""
  const vLower = v.toLowerCase()
  const sLower = s.toLowerCase()

  // Either column can indicate suspension (mixed deployments / legacy data)
  if (vLower === "suspended" || sLower === "suspended") {
    return "Suspended"
  }

  const primary = v || s || "Active"
  const p = primary.toLowerCase()

  if (p === "suspended") return "Suspended"
  if (p === "approved" || p === "verified" || p === "active") return "Active"
  if (p === "pending") return "Pending"
  if (p === "rejected") return "Rejected"
  if (p === "blue") return "Blue"

  return primary.charAt(0).toUpperCase() + primary.slice(1)
}

export function mapProfileToAdminUser(profile: Record<string, unknown>): AdminUserRow {
  const status = normalizeProfileStatus(profile)
  const avatar = profile.avatar
  return {
    id: String(profile.id ?? ""),
    name: (profile.name as string) || "Unknown",
    email: (profile.email as string) || "",
    role: (profile.role as string) || "User",
    status,
    company: (profile.organization as string) || "-",
    lastActive: profile.updated_at
      ? new Date(profile.updated_at as string).toISOString().split("T")[0]
      : "-",
    avatar:
      typeof avatar === "string" && avatar.startsWith("http") ? avatar : null,
  }
}

/**
 * Loads users from Supabase with the service role — same DB as suspend/unsuspend.
 * Use this from server components instead of HTTP fetch to avoid wrong-host / wrong-DB issues.
 */
export async function listAdminUsers(roleFilter?: string | null): Promise<AdminUserRow[]> {
  const supabase = createAdminClient()

  let query = supabase.from("profiles").select("*")

  if (roleFilter && roleFilter !== "All") {
    query = query.eq("role", roleFilter)
  }

  const { data: profiles, error } = await query.order("created_at", {
    ascending: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return (profiles || []).map((p) => mapProfileToAdminUser(p as Record<string, unknown>))
}
