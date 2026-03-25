"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock3, MapPin, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { PublishedItemsListCard } from "@/components/communication/published-items-list-card"
import { deleteEvent } from "@/lib/publish-events"
import { Button } from "@/components/ui/button"

type EventRsvpPerson = {
  id: string
  name: string | null
  email: string | null
  joinedAt: string | null
}

type PublishedEventItem = {
  id: string
  title: string | null
  description: string | null
  date: string | null
  location: string | null
  rsvps: EventRsvpPerson[]
}

type PublishedEventsListProps = {
  items: PublishedEventItem[]
}

function toDate(value: string | null) {
  if (!value) return "Not scheduled"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not scheduled"
  return parsed.toLocaleString()
}

export function PublishedEventsList({ items }: PublishedEventsListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteEvent(id)

    if (result.error) {
      toast.error(result.error)
      setDeletingId(null)
      return
    }

    toast.success("Event deleted.")
    router.refresh()
    setDeletingId(null)
  }

  return (
    <PublishedItemsListCard
      title="Published Events & RSVPs"
      description="Track what is live in the app and who has RSVP&apos;d."
      filterPlaceholder="Filter events..."
      emptyText="No events found."
      items={items}
      matchesQuery={(item, query) => {
        const title = (item.title ?? "").toLowerCase()
        const description = (item.description ?? "").toLowerCase()
        const location = (item.location ?? "").toLowerCase()
        return (
          title.includes(query) ||
          description.includes(query) ||
          location.includes(query)
        )
      }}
      renderItem={(item) => (
        <article
          key={item.id}
          className="group flex h-full flex-col rounded-3xl border border-cyan-500/15 bg-[#06122a] p-5 shadow-[0_12px_30px_rgba(1,8,22,0.45)]"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-slate-100">
              {item.title || "Untitled event"}
            </h3>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={deletingId === item.id}
              onClick={() => handleDelete(item.id)}
              aria-label="Delete event"
              className="h-8 w-8 rounded-full text-slate-400/35 transition hover:bg-red-500/10 hover:text-red-400 group-hover:text-slate-300/80"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            <p className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {toDate(item.date)}
            </p>
            {item.location ? (
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {item.location}
              </p>
            ) : null}
          </div>

          {item.description ? (
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-200/95">
              {item.description}
            </p>
          ) : null}

          <div className="mt-5 rounded-2xl border border-cyan-500/15 bg-[#071936] p-3">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
              <Users className="h-4 w-4" />
              RSVP&apos;d ({item.rsvps.length})
            </p>

            {item.rsvps.length === 0 ? (
              <p className="text-xs text-slate-400">No RSVPs yet.</p>
            ) : (
              <div className="space-y-2">
                {item.rsvps.map((person) => (
                  <div
                    key={`${item.id}-${person.id}`}
                    className="rounded-xl border border-cyan-500/10 bg-[#081f3f] px-3 py-2"
                  >
                    <p className="text-sm text-slate-100">{person.name || "Unnamed attendee"}</p>
                    <p className="text-xs text-slate-300">{person.email || "No email"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      )}
    />
  )
}
