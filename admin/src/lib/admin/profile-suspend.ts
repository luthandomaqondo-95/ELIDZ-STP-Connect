import { createAdminClient } from "@/lib/supabase/admin"

type ProfileRow = Record<string, unknown>

function buildStatusUpdate(
  existingUser: ProfileRow,
  mode: "suspend" | "unsuspend"
): Record<string, unknown> | null {
  const hasVerificationStatus = "verification_status" in existingUser
  const hasStatus = "status" in existingUser
  if (!hasVerificationStatus && !hasStatus) return null

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (mode === "suspend") {
    if (hasVerificationStatus) update.verification_status = "suspended"
    if (hasStatus) update.status = "Suspended"
  } else {
    if (hasVerificationStatus) update.verification_status = "approved"
    if (hasStatus) update.status = "Active"
  }

  return update
}

export type SuspendResult =
  | { ok: true; user: Record<string, unknown> }
  | { ok: false; status: number; error: string; details?: string }

export async function suspendProfileById(userId: string): Promise<SuspendResult> {
  const supabase = createAdminClient()
  const { data: existingUser, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (fetchError) {
    return {
      ok: false,
      status: 404,
      error: "User not found",
      details: fetchError.message,
    }
  }

  const updateData = buildStatusUpdate(existingUser as ProfileRow, "suspend")
  if (!updateData) {
    return {
      ok: false,
      status: 500,
      error: "No status column found in database",
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      status: 500,
      error: "Failed to suspend user",
      details: error.message,
    }
  }

  return { ok: true, user: data as Record<string, unknown> }
}

export async function unsuspendProfileById(userId: string): Promise<SuspendResult> {
  const supabase = createAdminClient()
  const { data: existingUser, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (fetchError) {
    return {
      ok: false,
      status: 404,
      error: "User not found",
      details: fetchError.message,
    }
  }

  const updateData = buildStatusUpdate(existingUser as ProfileRow, "unsuspend")
  if (!updateData) {
    return {
      ok: false,
      status: 500,
      error: "No status column found in database",
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      status: 500,
      error: "Failed to unsuspend user",
      details: error.message,
    }
  }

  return { ok: true, user: data as Record<string, unknown> }
}
