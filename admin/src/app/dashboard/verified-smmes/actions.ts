"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type VerificationStatus = "pending" | "verified" | "rejected"

export type DocumentType =
    | "Business Registration"
    | "ID Document"
    | "Business Profile"
    | "Tax Clearance"
    | "Other"

export interface SmmeVerificationRow {
    id: string
    user_id: string
    document_url: string
    document_type: DocumentType
    status: VerificationStatus
    rejection_reason?: string | null
    created_at: string
    updated_at: string
}

export interface SmmeServiceProductRow {
    id: string
    smme_id: string
    type: "Service" | "Product"
    name: string
    description: string
    category: string
    price?: string | null
    image_url?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    website_url?: string | null
    status: "active" | "inactive" | "pending"
    created_at: string
    updated_at: string
}

export async function getSmmeSubmissionDetails(userId: string) {
    // Use admin client so RLS can't hide submitted docs/items from admins
    const supabase = createAdminClient()

    const [{ data: docs, error: docsError }, { data: items, error: itemsError }] =
        await Promise.all([
            supabase
                .from("smme_verifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false }),
            supabase
                .from("smme_services_products")
                .select("*")
                .eq("smme_id", userId)
                .eq("status", "active")
                .order("created_at", { ascending: false }),
        ])

    if (docsError) {
        console.error("Error fetching SMME verification docs:", docsError)
        throw new Error("Failed to load SMME documents")
    }

    if (itemsError) {
        console.error("Error fetching SMME services/products:", itemsError)
        throw new Error("Failed to load SMME products/services")
    }

    const allItems = (items || []) as SmmeServiceProductRow[]
    return {
        documents: (docs || []) as SmmeVerificationRow[],
        products: allItems.filter((i) => i.type === "Product"),
        services: allItems.filter((i) => i.type === "Service"),
    }
}

export async function updateSmmeStatus(
    userId: string,
    status: "pending" | "verified"
) {
    const adminSupabase = createAdminClient()

    // 1) Update profile verification status (used across the app)
    const { error: profileError } = await adminSupabase
        .from("profiles")
        .update({ verification_status: status })
        .eq("id", userId)

    if (profileError) {
        console.error("Error updating SMME profile status:", profileError)
        throw new Error("Failed to update profile status")
    }

    // 2) Keep verification documents in sync for admin review UX
    const docStatus: VerificationStatus = status === "verified" ? "verified" : "pending"
    const { error: docsError } = await adminSupabase
        .from("smme_verifications")
        .update({ status: docStatus, rejection_reason: null })
        .eq("user_id", userId)

    if (docsError) {
        // Don't rollback the profile update; surface a clear error instead.
        console.error("Error updating SMME document statuses:", docsError)
        throw new Error("Updated profile, but failed to update document statuses")
    }

    revalidatePath("/dashboard/verified-smmes")
}

export async function createVerifiedSmme(data: { email: string, name: string, organization: string, role: string }) {
    const supabase = await createClient()
    
    // Verify current user has permission
    /*
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Unauthorized")
    }
    */

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
