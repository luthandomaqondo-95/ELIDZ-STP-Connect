"use server"

import { revalidatePath } from "next/cache"

import {
  buildNewsImagePath,
  isAllowedNewsImageType,
  NEWS_IMAGE_ALLOWED_TYPES,
  NEWS_IMAGE_BUCKET,
  NEWS_IMAGE_MAX_BYTES,
} from "@/lib/news"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/authz"
import { notifySuperAdminsOfAdminAction } from "@/lib/admin/super-admin-alerts"

async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await requireAdmin()
  return userId
}

export type PublishMobileNewsInput = {
  title: string
  content: string
  imageUrl?: string
  publishedAtValue?: string
  imageFile?: FormDataEntryValue | null
}

export type PublishNewsResult = {
  success?: true
  error?: string
}

async function publishMobileNews(input: PublishMobileNewsInput) {
  const { userId, role, profile } = await requireAdmin()

  const title = input.title.trim()
  const content = input.content.trim()
  const imageUrl = input.imageUrl?.trim() || ""
  const publishedAtValue = input.publishedAtValue?.trim() || ""
  const imageFile = input.imageFile

  if (!title || !content) {
    throw new Error("Title and content are required.")
  }

  if (imageUrl && !(imageFile instanceof File && imageFile.size > 0)) {
    try {
      new URL(imageUrl)
    } catch {
      throw new Error("Please enter a valid image URL.")
    }
  }

  let publishedAt = new Date().toISOString()

  if (publishedAtValue) {
    const parsedDate = new Date(publishedAtValue)
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("Please provide a valid publish date.")
    }
    publishedAt = parsedDate.toISOString()
  }

  const adminSupabase = createAdminClient()
  let resolvedImageUrl = imageUrl || null

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!isAllowedNewsImageType(imageFile.type)) {
      throw new Error(
        `Please upload a valid image file (${NEWS_IMAGE_ALLOWED_TYPES.join(", ")}).`
      )
    }

    if (imageFile.size > NEWS_IMAGE_MAX_BYTES) {
      throw new Error("The selected image is too large. Please use an image under 5 MB.")
    }

    const { error: bucketError } = await adminSupabase.storage.createBucket(NEWS_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: NEWS_IMAGE_MAX_BYTES,
      allowedMimeTypes: [...NEWS_IMAGE_ALLOWED_TYPES],
    })

    if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
      console.error("Error creating news images bucket:", bucketError)
      throw new Error(bucketError.message || "Failed to prepare storage for the uploaded image.")
    }

    const filePath = buildNewsImagePath(userId ?? "anonymous", imageFile.name, imageFile.type)
    const fileBuffer = await imageFile.arrayBuffer()
    const { error: uploadError } = await adminSupabase.storage
      .from(NEWS_IMAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading news image:", uploadError)
      throw new Error(uploadError.message || "Failed to upload the selected image.")
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from(NEWS_IMAGE_BUCKET)
      .getPublicUrl(filePath)

    resolvedImageUrl = publicUrlData.publicUrl
  }

  const { error } = await adminSupabase.from("news").insert({
    title,
    content,
    author_id: userId,
    image_url: resolvedImageUrl,
    published_at: publishedAt,
  })

  if (error) {
    console.error("Error publishing news:", error)
    throw new Error(error.message || "Failed to publish news.")
  }

  await notifySuperAdminsOfAdminAction({
    action: "Published news",
    actorId: userId,
    actorName: (profile?.name as string | undefined) ?? null,
    actorRole: role,
    details: `News "${title}" published to the mobile app.`,
    relatedEntityType: "news",
    relatedEntityId: null,
  })

  revalidatePath("/dashboard/communication/news")
}

export async function publishNews(formData: FormData): Promise<PublishNewsResult> {
  try {
    await publishMobileNews({
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      imageUrl: String(formData.get("image_url") ?? ""),
      publishedAtValue: String(formData.get("published_at") ?? ""),
      imageFile: formData.get("image_file"),
    })

    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to publish news.",
    }
  }
}

export async function deleteNews(id: string): Promise<PublishNewsResult> {
  try {
    await getAuthenticatedUserId()

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from("news").delete().eq("id", id)

    if (error) {
      console.error("Error deleting news:", error)
      throw new Error(error.message || "Failed to delete news.")
    }

    revalidatePath("/dashboard/communication/news")
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete news.",
    }
  }
}

