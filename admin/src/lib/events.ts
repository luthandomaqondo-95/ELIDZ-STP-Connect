import { createAdminClient } from "@/lib/supabase/admin"

export type EventRsvpPerson = {
  id: string
  name: string | null
  email: string | null
  organization: string | null
  role: string | null
  joinedAt: string | null
}

export type PublishedEventItem = {
  id: string
  title: string | null
  description: string | null
  date: string | null
  location: string | null
  rsvps: EventRsvpPerson[]
}

type RsvpRow = {
  id: string
  created_at: string | null
  user:
    | {
        id: string
        name: string | null
        email: string | null
        organization: string | null
        role: string | null
      }
    | {
        id: string
        name: string | null
        email: string | null
        organization: string | null
        role: string | null
      }[]
    | null
}

type EventRow = {
  id: string
  title: string | null
  description: string | null
  date: string | null
  location: string | null
  event_rsvps: RsvpRow[] | null
}

function normalizeUser(user: RsvpRow["user"]) {
  if (!user) return null
  return Array.isArray(user) ? user[0] ?? null : user
}

function mapEventRow(event: EventRow): PublishedEventItem {
  const rsvps = (event.event_rsvps || [])
    .map((rsvp) => {
      const user = normalizeUser(rsvp.user)
      return {
        id: user?.id || rsvp.id,
        name: user?.name ?? null,
        email: user?.email ?? null,
        organization: user?.organization ?? null,
        role: user?.role ?? null,
        joinedAt: rsvp.created_at ?? null,
      } satisfies EventRsvpPerson
    })
    .sort((a, b) => {
      const aTime = a.joinedAt ? new Date(a.joinedAt).getTime() : 0
      const bTime = b.joinedAt ? new Date(b.joinedAt).getTime() : 0
      return bTime - aTime
    })

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    rsvps,
  }
}

const EVENT_ADMIN_SELECT = `
  id,
  title,
  description,
  date,
  location,
  event_rsvps (
    id,
    created_at,
    user:profiles!event_rsvps_user_id_fkey (
      id,
      name,
      email,
      organization,
      role
    )
  )
`

export async function getPublishedEventsForAdmin(): Promise<PublishedEventItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_ADMIN_SELECT)
    .order("date", { ascending: false })

  if (error) {
    console.error("getPublishedEventsForAdmin error:", error)
    return []
  }

  return ((data || []) as EventRow[]).map(mapEventRow)
}

export async function getEventForAdmin(eventId: string): Promise<PublishedEventItem | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_ADMIN_SELECT)
    .eq("id", eventId)
    .maybeSingle()

  if (error) {
    console.error("getEventForAdmin error:", error)
    return null
  }

  if (!data) return null
  return mapEventRow(data as EventRow)
}
