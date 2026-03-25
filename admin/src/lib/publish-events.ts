"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

async function isDummyAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("dummy_auth")?.value === "1"
}

async function getAuthenticatedUserId(): Promise<string | null> {
  if (await isDummyAuth()) return null

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("You must be signed in.")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || !["Admin", "Super Admin"].includes(profile.role)) {
    throw new Error("Only admin users can perform this action.")
  }

  return user.id
}

export type PublishEventResult = {
  success?: true
  error?: string
}

function normalizeIsoDate(dateValue: string) {
  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Please provide a valid event date and time.")
  }
  return parsedDate.toISOString()
}

function normalizeOptionalUrl(rawValue: string, label: string) {
  const value = rawValue.trim()
  if (!value) return null

  try {
    new URL(value)
    return value
  } catch {
    throw new Error(`Please provide a valid ${label}.`)
  }
}

export async function publishEvent(formData: FormData): Promise<PublishEventResult> {
  try {
    const organizerId = await getAuthenticatedUserId()

    const title = String(formData.get("title") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const dateValue = String(formData.get("date") ?? "").trim()
    const location = String(formData.get("location") ?? "").trim()
    const imageUrlRaw = String(formData.get("image_url") ?? "")

    if (!title) {
      throw new Error("Event title is required.")
    }

    if (!dateValue) {
      throw new Error("Event date is required.")
    }

    const date = normalizeIsoDate(dateValue)
    const imageUrl = normalizeOptionalUrl(imageUrlRaw, "image URL")

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from("events").insert({
      title,
      description: description || null,
      date,
      location: location || null,
      image_url: imageUrl,
      organizer_id: organizerId,
    })

    if (error) {
      console.error("Error publishing event:", error)
      throw new Error(error.message || "Failed to publish event.")
    }

    revalidatePath("/dashboard/communication/events")
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to publish event.",
    }
  }
}

export async function deleteEvent(id: string): Promise<PublishEventResult> {
  try {
    await getAuthenticatedUserId()

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from("events").delete().eq("id", id)

    if (error) {
      console.error("Error deleting event:", error)
      throw new Error(error.message || "Failed to delete event.")
    }

    revalidatePath("/dashboard/communication/events")
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete event.",
    }
  }
}
