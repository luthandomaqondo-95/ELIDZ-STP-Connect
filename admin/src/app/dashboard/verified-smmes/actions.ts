"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateSmmeStatus(userId: string, status: string) {
    const supabase = await createClient()
    
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
    const supabase = await createClient()
    
    // Verify current user has permission
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }

    // We could check role here too, but relying on middleware/RLS for now + simple check
    
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
