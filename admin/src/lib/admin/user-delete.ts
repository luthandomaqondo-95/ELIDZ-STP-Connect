import { createAdminClient } from "@/lib/supabase/admin"
import { isCustomAuthEnabled } from "@/lib/custom-auth/feature-flag"
import { deleteProvisionedUser } from "@/lib/custom-auth/service"

export type DeleteUserResult = { ok: true } | { ok: false; error: string }

/** Delete a user account in whichever auth mode is active. Caller must authorize. */
export async function deleteUserAccount(userId: string): Promise<DeleteUserResult> {
  if (isCustomAuthEnabled()) {
    try {
      await deleteProvisionedUser(userId)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Failed to delete user" }
    }
  }

  const supabase = createAdminClient()
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

  if (authError && profileError) {
    console.error("Error deleting user:", { authError, profileError })
    return { ok: false, error: `Failed to delete user: ${profileError.message}` }
  }
  return { ok: true }
}
