'use server'

import { suspendProfileById, unsuspendProfileById } from "@/lib/admin/profile-suspend"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkManageableTarget, getAuthedProfile, requireAdminApi } from "@/lib/authz"
import { deleteUserAccount } from "@/lib/admin/user-delete"
import { revalidatePath } from "next/cache"

export async function approveUser(userId: string) {
  try {
    const { user, profile } = await getAuthedProfile()
    if (!user || !profile) {
      return { success: false, error: "Unauthorized" }
    }
    const actorRole = String(profile.role ?? "")
    if (actorRole !== "Admin" && actorRole !== "Super Admin") {
      return { success: false, error: "Forbidden" }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: "verified" })
      .eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/users/all")
    return { success: true }
  } catch (error) {
    console.error("Error approving user:", error)
    return { success: false, error: "Internal server error" }
  }
}

/** Returns an error message when the caller may not act on this account. */
async function authorizeTargetAction(userId: string): Promise<string | null> {
    const auth = await requireAdminApi()
    if (!auth.ok) return "Unauthorized"
    const rejection = await checkManageableTarget(auth, userId)
    return rejection?.error ?? null
}

export async function deleteUser(userId: string) {
    try {
        const denied = await authorizeTargetAction(userId)
        if (denied) return { success: false, error: denied }

        const result = await deleteUserAccount(userId)
        if (!result.ok) {
            return { success: false, error: result.error }
        }

        revalidatePath('/dashboard/users/all')
        return { success: true }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function suspendUser(userId: string) {
    try {
        const denied = await authorizeTargetAction(userId)
        if (denied) return { success: false, error: denied }

        const result = await suspendProfileById(userId)
        if (!result.ok) {
            const msg = result.details
                ? `${result.error}: ${result.details}`
                : result.error
            return { success: false, error: msg }
        }
        revalidatePath('/dashboard/users/all')
        return {
            success: true,
            data: {
                success: true,
                message: "User suspended successfully",
                user: result.user,
            },
        }
    } catch (error) {
        console.error("Error suspending user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function unsuspendUser(userId: string) {
    try {
        const denied = await authorizeTargetAction(userId)
        if (denied) return { success: false, error: denied }

        const result = await unsuspendProfileById(userId)
        if (!result.ok) {
            const msg = result.details
                ? `${result.error}: ${result.details}`
                : result.error
            return { success: false, error: msg }
        }
        revalidatePath('/dashboard/users/all')
        return {
            success: true,
            data: {
                success: true,
                message: "User unsuspended successfully",
                user: result.user,
            },
        }
    } catch (error) {
        console.error("Error unsuspending user:", error)
        return { success: false, error: "Internal server error" }
    }
}
