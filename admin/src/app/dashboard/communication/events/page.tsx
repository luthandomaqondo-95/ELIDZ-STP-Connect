import { CalendarDays } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { EventPublisher } from "@/components/events/event-publisher"
import { PublishedEventsList } from "@/components/events/published-events-list"
import { createAdminClient } from "@/lib/supabase/admin"

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

export default async function EventsManagementPage() {
  const supabase = createAdminClient()

  const { data: rawEvents } = await supabase
    .from("events")
    .select(
      "id, title, description, date, location, created_at, event_rsvps(user_id, created_at, profiles(name, email))"
    )
    .order("created_at", { ascending: false })

  const items = ((rawEvents || []) as EventRecord[]).map((event) => ({
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

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader title="Publish Events" icon={<CalendarDays className="h-5 w-5" />} />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Add mobile event updates for the ELIDZ Science and Technology Park app and track RSVPs.
      </p>

      <EventPublisher />
      <PublishedEventsList items={items} />
    </div>
  )
}
