"use server"

import { randomUUID } from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/authz"
import { isAllowedNewsImageType, NEWS_IMAGE_BUCKET, NEWS_IMAGE_MAX_BYTES } from "@/lib/news"
import { isAllowedTenantLogoType, TENANT_LOGO_BUCKET, TENANT_LOGO_MAX_BYTES } from "@/lib/tenants"

const KINDS = {
  "tenant-logo": { bucket: TENANT_LOGO_BUCKET, maxBytes: TENANT_LOGO_MAX_BYTES, isAllowed: isAllowedTenantLogoType },
  "news-image": { bucket: NEWS_IMAGE_BUCKET, maxBytes: NEWS_IMAGE_MAX_BYTES, isAllowed: isAllowedNewsImageType },
} as const

export type ImageUploadKind = keyof typeof KINDS

/**
 * Signed upload URL for a public image. The browser uploads straight to Storage, so
 * files never pass through a server action / serverless request body (Vercel caps those
 * near 4.5 MB, Next.js server actions at 1 MB by default).
 */
export async function createImageUpload(
  kind: ImageUploadKind,
  file: { name: string; type: string; size: number }
): Promise<
  | { success: true; bucket: string; path: string; token: string; publicUrl: string }
  | { success: false; error: string }
> {
  try {
    const { userId } = await requireAdmin()
    const config = KINDS[kind]
    if (!config) return { success: false, error: "Unknown upload type." }
    if (!config.isAllowed(file.type)) {
      return { success: false, error: "Invalid image type. Only JPEG, PNG, WEBP, and GIF are allowed." }
    }
    if (file.size > config.maxBytes) {
      return { success: false, error: `Image too large. Maximum size is ${Math.round(config.maxBytes / 1024 / 1024)}MB.` }
    }

    const ext = (file.name.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "") || "img"
    const path = `${userId}/${Date.now()}-${randomUUID()}.${ext}`
    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from(config.bucket).createSignedUploadUrl(path)
    if (error || !data) {
      return { success: false, error: error?.message || "Could not start upload." }
    }
    const { data: pub } = supabase.storage.from(config.bucket).getPublicUrl(data.path)
    return { success: true, bucket: config.bucket, path: data.path, token: data.token, publicUrl: pub.publicUrl }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not start upload." }
  }
}
