"use server"

import { createClient } from "@/lib/supabase/server"
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

