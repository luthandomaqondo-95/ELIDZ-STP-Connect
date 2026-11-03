"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/authz"

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
		const { userId } = await requireAdmin()

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
				posted_by: userId,
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

export async function listTenantOptions(): Promise<{ id: string; name: string }[]> {
	await requireAdmin()
	const { data, error } = await createAdminClient()
		.from("tenants")
		.select("id, name")
		.order("name", { ascending: true })
	if (error) throw new Error(error.message)
	return data ?? []
}

export async function deleteOpportunity(opportunityId: string): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await requireAdmin()
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


export type OpportunityUpdate = {
	title: string
	type: string
	deadline: string | null
	description: string
	requirements: string | null
}

export async function getOpportunityForEdit(
	opportunityId: string
): Promise<{ success: true; data: OpportunityUpdate } | { success: false; error: string }> {
	try {
		await requireAdmin()
		const supabaseAdmin = createAdminClient()
		const { data, error } = await supabaseAdmin
			.from("opportunities")
			.select("title, type, deadline, description, requirements")
			.eq("id", opportunityId)
			.single()

		if (error || !data) {
			return { success: false, error: error?.message || "Failed to load opportunity." }
		}
		return { success: true, data }
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to load opportunity."
		return { success: false, error: message }
	}
}

export async function updateOpportunity(
	opportunityId: string,
	fields: OpportunityUpdate
): Promise<{ success: true } | { success: false; error: string }> {
	if (!fields.title?.trim() || !fields.description?.trim()) {
		return { success: false, error: "Title and description are required." }
	}

	try {
		await requireAdmin()
		const supabaseAdmin = createAdminClient()
		const { data, error } = await supabaseAdmin
			.from("opportunities")
			.update({
				title: fields.title,
				type: fields.type,
				deadline: fields.deadline || null,
				description: fields.description,
				requirements: fields.requirements || null,
			})
			.eq("id", opportunityId)
			.select("id")
			.maybeSingle()

		if (error) {
			return { success: false, error: error.message }
		}
		if (!data) {
			return { success: false, error: "Opportunity not found." }
		}

		revalidatePath("/dashboard/opportunities")
		revalidatePath(`/dashboard/opportunities/${opportunityId}`)
		return { success: true }
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to update opportunity."
		return { success: false, error: message }
	}
}
