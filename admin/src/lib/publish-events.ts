"use server"

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache"
import { cookies } from "next/headers"

import type { PublishedEventItem } from "@/lib/events"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type EventRsvpRelation = {
  user_id: string
  created_at: string | null
  profiles: Array<{
    name: string | null
    email: string | null
  }> | null
}

type EventRecord = {
  id: string
  title: string | null
  description: string | null
  date: string | null
  location: string | null
  created_at: string | null
  event_rsvps: EventRsvpRelation[] | null
}

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

const ADMIN_EVENTS_LIST_TAG = "admin-published-events"

/** Cap rows; nested RSVPs can be heavy. Cache is safe here (service client, no cookies). */
const ADMIN_EVENTS_LIST_LIMIT = 200

const getPublishedEventsForAdminCached = unstable_cache(
  async (): Promise<PublishedEventItem[]> => {
    const supabase = createAdminClient()

    const { data: rawEvents } = await supabase
      .from("events")
      .select(
        "id, title, description, date, location, created_at, event_rsvps(user_id, created_at, profiles(name, email))"
      )
      .order("created_at", { ascending: false })
      .limit(ADMIN_EVENTS_LIST_LIMIT)

    return ((rawEvents || []) as EventRecord[]).map((event) => ({
      id: event.id,
      title: event.title ?? null,
      description: event.description ?? null,
      date: event.date ?? null,
      location: event.location ?? null,
      rsvps: (event.event_rsvps || []).map((rsvp) => ({
        id: rsvp.user_id,
        name: rsvp.profiles?.[0]?.name ?? null,
        email: rsvp.profiles?.[0]?.email ?? null,
        joinedAt: rsvp.created_at,
      })),
    }))
  },
  ["admin-published-events-v1"],
  { revalidate: 30, tags: [ADMIN_EVENTS_LIST_TAG] }
)

export async function getPublishedEventsForAdmin(): Promise<PublishedEventItem[]> {
  return getPublishedEventsForAdminCached()
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
    revalidateTag(ADMIN_EVENTS_LIST_TAG, "max")
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
    revalidateTag(ADMIN_EVENTS_LIST_TAG, "max")
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete event.",
    }
  }
}
