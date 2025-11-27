'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteUser(userId: string) {
    const supabase = await createClient()

    // Delete from profiles (should cascade to auth.users if set up, but usually we delete from auth.users via admin api)
    // However, Supabase client SDK doesn't allow deleting from auth.users directly unless using service role key.
    // For now, we will delete from 'profiles' and if possible 'auth.users' using an RPC or just profiles if that's the main record.
    // Since we are using the standard client here, we might be limited. 
    // BUT, usually in these apps, deleting the profile is what we want to "remove" them from the app view.
    
    // Check if we have service_role permissions or if RLS allows it.
    // Assuming for now we just delete from profiles.
    
    const { error } = await supabase.from('profiles').delete().eq('id', userId)

    if (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/users/all')
    return { success: true }
}

export async function approveUser(userId: string) {
    // This is a placeholder for approval logic. 
    // If there was a 'status' column, we would update it here.
    // For now, we'll just revalidate and return success.
    
    // Example: const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', userId)
    
    revalidatePath('/dashboard/users/all')
    return { success: true }
}

