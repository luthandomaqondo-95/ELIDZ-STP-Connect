'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function inviteUser(formData: FormData) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    
    if (!email || !name || !role) {
        return { error: "Missing required fields" };
    }

    try {
        const supabaseAdmin = createAdminClient();
        
        // 1. Invite user via email
        const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                full_name: name,
                role: role
            }
        });

        if (inviteError) {
            console.error("Invite error:", inviteError);
            return { error: inviteError.message };
        }

        // 2. Create profile record immediately (so they appear in the list even before accepting)
        if (authData.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    name: name,
                    email: email,
                    role: role,
                    status: 'invited' // You might need to add this status to your check constraint or just use 'Pending' if applicable
                });
            
            if (profileError) {
                 console.error("Profile creation error:", profileError);
                 // Note: triggers might handle this if configured, but explicit insert ensures data immediately
                 // If your trigger creates a profile on insert to auth.users, this might duplicate or conflict.
                 // However, inviteUserByEmail creates the user in auth.users.
                 // Let's assume we might need to update if the trigger created it, or insert if not.
                 
                 // Safe update/upsert
                 await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        name: name,
                        email: email,
                        role: role,
                    });
            }
        }

        revalidatePath("/dashboard/users/all");
        return { success: true };
        
    } catch (err: any) {
        console.error("Server action error:", err);
        return { error: err.message || "Failed to invite user" };
    }
}

