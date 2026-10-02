import { notFound } from "next/navigation"
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEventForAdmin } from "@/lib/events"
import { EventRsvpsClient } from "./rsvps-client"

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not scheduled"
  return parsed.toLocaleString()
}

export default async function EventRsvpsPage({ params }: PageProps) {
  const { id } = await params
  const event = await getEventForAdmin(id)

  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title={event.title || "Event RSVPs"}
        icon={<CalendarDays className="h-5 w-5" />}
        backHref="/dashboard/communication/events"
        backLabel="Back to events"
        action={
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <Users className="h-4 w-4" />
            {event.rsvps.length} {event.rsvps.length === 1 ? "person" : "people"} RSVP&apos;d
          </div>
        }
      />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        People who RSVP&apos;d for this event in the mobile app.
      </p>

      <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-xl">{event.title || "Untitled event"}</CardTitle>
            <CardDescription className="space-y-1 text-sm">
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formatDate(event.date)}
              </span>
              {event.location ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              ) : null}
            </CardDescription>
          </div>
        </CardHeader>
        {event.description ? (
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {event.description}
            </p>
          </CardContent>
        ) : null}
      </Card>

      <EventRsvpsClient rsvps={event.rsvps} />
    </div>
  )
}
