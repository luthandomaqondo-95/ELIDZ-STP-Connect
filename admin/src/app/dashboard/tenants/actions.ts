"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  buildTenantLogoPath,
  isAllowedTenantLogoType,
  nullIfEmpty,
  TENANT_LOGO_BUCKET,
  TENANT_LOGO_MAX_BYTES,
} from "@/lib/tenants"

type TenantMutationResult =
  | { success: true; id: string }
  | { success: false; error: string }

type DeleteTenantResult = { success: true } | { success: false; error: string }

function readTenantPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: nullIfEmpty(String(formData.get("description") ?? "")),
    industry: nullIfEmpty(String(formData.get("industry") ?? "")),
    logo_url: nullIfEmpty(String(formData.get("logo_url") ?? "")),
    website: nullIfEmpty(String(formData.get("website") ?? "")),
    contact_email: nullIfEmpty(String(formData.get("contact_email") ?? "")),
    contact_phone: nullIfEmpty(String(formData.get("contact_phone") ?? "")),
    location: nullIfEmpty(String(formData.get("location") ?? "")),
    facility_id: nullIfEmpty(String(formData.get("facility_id") ?? "")),
    building: nullIfEmpty(String(formData.get("building") ?? "")),
    address: nullIfEmpty(String(formData.get("address") ?? "")),
    services: nullIfEmpty(String(formData.get("services") ?? "")),
    capabilities: nullIfEmpty(String(formData.get("capabilities") ?? "")),
    social_media_links: nullIfEmpty(String(formData.get("social_media_links") ?? "")),
    application_url: nullIfEmpty(String(formData.get("application_url") ?? "")),
    opening_hours: nullIfEmpty(String(formData.get("opening_hours") ?? "")),
    additional_contact_email: nullIfEmpty(String(formData.get("additional_contact_email") ?? "")),
    key_personnel: nullIfEmpty(String(formData.get("key_personnel") ?? "")),
    partners: nullIfEmpty(String(formData.get("partners") ?? "")),
  }
}

async function resolveLogoUrl(formData: FormData, userId: string, existingLogoUrl?: string | null) {
  const logoFile = formData.get("logo_file")
  const hasFile = logoFile instanceof File && logoFile.size > 0

  if (!hasFile) {
    return nullIfEmpty(String(formData.get("logo_url") ?? "")) ?? existingLogoUrl ?? null
  }

  if (logoFile.size > TENANT_LOGO_MAX_BYTES) {
    throw new Error("Logo file too large. Maximum size is 5MB.")
  }

  if (!isAllowedTenantLogoType(logoFile.type)) {
    throw new Error("Invalid logo type. Only JPEG, PNG, WEBP, and GIF are allowed.")
  }

  const supabaseAdmin = createAdminClient()
  const fileName = buildTenantLogoPath(userId, logoFile.name, logoFile.type)
  const { error: uploadError } = await supabaseAdmin.storage
    .from(TENANT_LOGO_BUCKET)
    .upload(fileName, logoFile, {
      contentType: logoFile.type,
      upsert: true,
    })

  if (uploadError) {
    throw new Error(uploadError.message || "Failed to upload tenant logo.")
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(TENANT_LOGO_BUCKET)
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}

export async function createTenant(formData: FormData): Promise<TenantMutationResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated." }
    }

    const payload = readTenantPayload(formData)
    if (!payload.name) {
      return { success: false, error: "Tenant name is required." }
    }

    const logo_url = await resolveLogoUrl(formData, user.id)

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from("tenants")
      .insert({
        ...payload,
        logo_url,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (error || !data?.id) {
      return { success: false, error: error?.message || "Failed to create tenant." }
    }

    revalidatePath("/dashboard/tenants")
    revalidatePath("/dashboard/opportunities")
    return { success: true, id: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create tenant."
    return { success: false, error: message }
  }
}

export async function updateTenant(tenantId: string, formData: FormData): Promise<TenantMutationResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated." }
    }

    if (!tenantId) {
      return { success: false, error: "Missing tenant id." }
    }

    const payload = readTenantPayload(formData)
    if (!payload.name) {
      return { success: false, error: "Tenant name is required." }
    }

    const supabaseAdmin = createAdminClient()
    const { data: existing } = await supabaseAdmin
      .from("tenants")
      .select("logo_url")
      .eq("id", tenantId)
      .maybeSingle()

    const logo_url = await resolveLogoUrl(formData, user.id, existing?.logo_url)

    const { data, error } = await supabaseAdmin
      .from("tenants")
      .update({
        ...payload,
        logo_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId)
      .select("id")
      .single()

    if (error || !data?.id) {
      return { success: false, error: error?.message || "Failed to update tenant." }
    }

    revalidatePath("/dashboard/tenants")
    revalidatePath(`/dashboard/tenants/${tenantId}`)
    revalidatePath("/dashboard/opportunities")
    return { success: true, id: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update tenant."
    return { success: false, error: message }
  }
}

export async function deleteTenant(tenantId: string): Promise<DeleteTenantResult> {
  try {
    if (!tenantId) {
      return { success: false, error: "Missing tenant id." }
    }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from("tenants").delete().eq("id", tenantId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/tenants")
    revalidatePath("/dashboard/opportunities")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete tenant."
    return { success: false, error: message }
  }
}
