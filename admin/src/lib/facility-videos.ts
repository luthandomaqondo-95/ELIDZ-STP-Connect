"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/authz"

const VIDEO_BUCKET = "videos"

type Result<T> = ({ success: true } & T) | { success: false; error: string }

/**
 * Issue a one-time signed upload URL so the browser can upload large videos straight
 * to storage (server actions cap request bodies) without needing a Supabase Auth session.
 */
export async function createFacilityVideoUpload(
  facilityId: string,
  fileName: string
): Promise<Result<{ path: string; token: string }>> {
  try {
    await requireAdmin()
    const safeName = fileName.replace(/[^\w.\-]+/g, "_")
    const path = `${facilityId}/${Date.now()}-${safeName}`
    const { data, error } = await createAdminClient()
      .storage.from(VIDEO_BUCKET)
      .createSignedUploadUrl(path)
    if (error || !data) {
      return { success: false, error: error?.message || "Could not start upload." }
    }
    return { success: true, path: data.path, token: data.token }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not start upload." }
  }
}

/** Point the facility at an uploaded video and return the refreshed video list. */
export async function saveFacilityVideo(
  facilityId: string,
  path: string
): Promise<Result<{ videos: { id: string; video_url: string | null; title: string | null }[] }>> {
  try {
    await requireAdmin()
    if (!path.startsWith(`${facilityId}/`)) {
      return { success: false, error: "Invalid upload path." }
    }
    const supabase = createAdminClient()
    const {
      data: { publicUrl },
    } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path)

    const { error: updateError } = await supabase
      .from("facilities")
      .update({ video_url: publicUrl })
      .eq("service_id", facilityId)
    if (updateError) {
      return { success: false, error: updateError.message }
    }

    const { data: videos } = await supabase
      .from("facilities")
      .select("id, video_url, title")
      .eq("service_id", facilityId)
      .not("video_url", "is", null)
      .order("updated_at", { ascending: false })

    return { success: true, videos: videos ?? [] }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save video." }
  }
}
