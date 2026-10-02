export const TENANT_LOGO_BUCKET = "tenant-logos"
export const TENANT_LOGO_MAX_BYTES = 5 * 1024 * 1024
export const TENANT_LOGO_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const
export const TENANT_LOGO_ACCEPT = TENANT_LOGO_ALLOWED_TYPES.join(",")

export type TenantFacilityOption = {
  service_id: string
  service_name: string
}

export type TenantRecord = {
  id: string
  name: string
  description?: string | null
  industry?: string | null
  logo_url?: string | null
  website?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  location?: string | null
  facility_id?: string | null
  building?: string | null
  address?: string | null
  services?: string | null
  capabilities?: string | null
  social_media_links?: string | null
  application_url?: string | null
  opening_hours?: string | null
  additional_contact_email?: string | null
  key_personnel?: string | null
  partners?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type TenantFormValues = {
  name: string
  description: string
  industry: string
  logo_url: string
  website: string
  contact_email: string
  contact_phone: string
  location: string
  facility_id: string
  building: string
  address: string
  services: string
  capabilities: string
  social_media_links: string
  application_url: string
  opening_hours: string
  additional_contact_email: string
  key_personnel: string
  partners: string
}

export function createEmptyTenantForm(): TenantFormValues {
  return {
    name: "",
    description: "",
    industry: "",
    logo_url: "",
    website: "",
    contact_email: "",
    contact_phone: "",
    location: "",
    facility_id: "",
    building: "",
    address: "",
    services: "",
    capabilities: "",
    social_media_links: "",
    application_url: "",
    opening_hours: "",
    additional_contact_email: "",
    key_personnel: "",
    partners: "",
  }
}

export function tenantToFormValues(tenant: TenantRecord): TenantFormValues {
  return {
    name: tenant.name || "",
    description: tenant.description || "",
    industry: tenant.industry || "",
    logo_url: tenant.logo_url || "",
    website: tenant.website || "",
    contact_email: tenant.contact_email || "",
    contact_phone: tenant.contact_phone || "",
    location: tenant.location || "",
    facility_id: tenant.facility_id || "",
    building: tenant.building || "",
    address: tenant.address || "",
    services: tenant.services || "",
    capabilities: tenant.capabilities || "",
    social_media_links: tenant.social_media_links || "",
    application_url: tenant.application_url || "",
    opening_hours: tenant.opening_hours || "",
    additional_contact_email: tenant.additional_contact_email || "",
    key_personnel: tenant.key_personnel || "",
    partners: tenant.partners || "",
  }
}

export function isAllowedTenantLogoType(type: string) {
  return TENANT_LOGO_ALLOWED_TYPES.includes(
    type as (typeof TENANT_LOGO_ALLOWED_TYPES)[number]
  )
}

function getLogoExtension(fileName: string, mimeType: string) {
  const fileNameExtension = fileName.split(".").pop()?.toLowerCase()
  if (fileNameExtension) return fileNameExtension

  switch (mimeType) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "jpg"
  }
}

export function buildTenantLogoPath(userId: string, fileName: string, mimeType: string) {
  const extension = getLogoExtension(fileName, mimeType)
  const baseName = fileName.replace(/\.[^.]+$/, "")
  const sanitizedBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "logo"

  return `${userId}/${Date.now()}-${sanitizedBaseName}.${extension}`
}

export function nullIfEmpty(value: string | null | undefined) {
  const trimmed = String(value ?? "").trim()
  return trimmed ? trimmed : null
}
