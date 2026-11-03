"use client"

import { createClient } from "@/lib/supabase/client"
import { createImageUpload, type ImageUploadKind } from "@/lib/image-uploads"

/** Upload an image straight to Storage via a signed URL and return its public URL. */
export async function uploadImageDirect(kind: ImageUploadKind, file: File): Promise<string> {
  const grant = await createImageUpload(kind, { name: file.name, type: file.type, size: file.size })
  if (!grant.success) throw new Error(grant.error)

  const { error } = await createClient()
    .storage.from(grant.bucket)
    .uploadToSignedUrl(grant.path, grant.token, file, { contentType: file.type })
  if (error) throw new Error(`Upload failed: ${error.message}`)

  return grant.publicUrl
}
