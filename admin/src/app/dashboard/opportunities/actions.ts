"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type CreateOpportunityResult =
	| { success: true; id: string }
	| { success: false; error: string }

export async function createOpportunity(formData: FormData): Promise<CreateOpportunityResult> {
	const title = String(formData.get("title") ?? "").trim()
	const type = String(formData.get("type") ?? "").trim()
	const tenant_id = String(formData.get("tenant_id") ?? "").trim()
	const deadline = String(formData.get("deadline") ?? "").trim()
	const description = String(formData.get("description") ?? "").trim()
	const requirements = String(formData.get("requirements") ?? "").trim()

	if (!title || !type || !tenant_id || !description) {
		return { success: false, error: "Missing required fields (title, type, tenant, description)." }
	}

	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return { success: false, error: "Not authenticated." }
		}

		const supabaseAdmin = createAdminClient()
		const { data, error } = await supabaseAdmin
			.from("opportunities")
			.insert({
				title,
				type,
				tenant_id,
				deadline: deadline || null,
				description,
				requirements: requirements || null,
				status: "active",
				posted_by: user.id,
			})
			.select("id")
			.single()

		if (error || !data?.id) {
			return { success: false, error: error?.message || "Failed to create opportunity." }
		}

		revalidatePath("/dashboard/opportunities")
		return { success: true, id: data.id }
	} catch (err: any) {
		const message = err instanceof Error ? err.message : "Failed to create opportunity."
		return { success: false, error: message }
	}
}

export async function deleteOpportunity(opportunityId: string): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const supabaseAdmin = createAdminClient()
		const { error } = await supabaseAdmin.from("opportunities").delete().eq("id", opportunityId)

		if (error) {
			return { success: false, error: error.message }
		}

		revalidatePath("/dashboard/opportunities")
		return { success: true }
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to delete opportunity."
		return { success: false, error: message }
	}
}

