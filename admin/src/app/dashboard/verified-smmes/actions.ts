"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createDashboardClient, requireAdmin, requireSuperAdmin } from "@/lib/authz"
import { isCustomAuthEnabled } from "@/lib/custom-auth/feature-flag"
import { revalidatePath } from "next/cache"

export async function updateSmmeStatus(userId: string, status: string) {
    await requireAdmin()
    const supabase = await createDashboardClient()

    // Verifying must not silently lift a suspension; that goes through unsuspend.
    const { data: current } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', userId)
        .maybeSingle()
    if (current?.verification_status === 'suspended') {
        throw new Error("This account is suspended. Unsuspend it before changing verification.")
    }

    const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId)
        
    if (error) {
        console.error("Error updating SMME status:", error)
        throw new Error("Failed to update status")
    }
    
    revalidatePath('/dashboard/verified-smmes')
}

export async function createVerifiedSmme(data: { email: string, name: string, organization: string, role: string }) {
    // Same rules as POST /api/admin/smmes: Super Admin only, never an admin-role account.
    await requireSuperAdmin()
    if (data.role === "Admin" || data.role === "Super Admin") {
        throw new Error("Cannot create administrator accounts via SMME invite")
    }

    if (isCustomAuthEnabled()) {
        const { provisionInvitedUser } = await import("@/lib/custom-auth/service")
        await provisionInvitedUser({
            email: data.email,
            name: data.name,
            role: data.role,
            organization: data.organization,
            verificationStatus: "verified",
            allowAdminRoles: false,
        })
        revalidatePath('/dashboard/verified-smmes')
        return { success: true }
    }

    const adminSupabase = createAdminClient()

    // 1. Invite User
    const { data: userData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(data.email)
    
    if (inviteError) {
        console.error("Invite error:", inviteError)
        throw new Error(inviteError.message)
    }

    if (!userData.user) {
        throw new Error("Failed to create user")
    }

    // 2. Create Profile
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
            id: userData.user.id,
            name: data.name,
            email: data.email,
            role: data.role,
            organization: data.organization,
            verification_status: 'verified'
        })

    if (profileError) {
        console.error("Profile creation error", profileError)
        // Cleanup user if profile creation fails
        await adminSupabase.auth.admin.deleteUser(userData.user.id)
        throw new Error("Failed to create profile: " + profileError.message)
    }

    revalidatePath('/dashboard/verified-smmes')
    return { success: true }
}
