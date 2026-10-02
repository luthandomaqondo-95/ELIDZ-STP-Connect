"use client"

import { useMemo, useState } from "react"
import { Mail, Search, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { EventRsvpPerson } from "@/lib/events"

function formatJoinedAt(value: string | null) {
  if (!value) return "Unknown date"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Unknown date"
  return parsed.toLocaleString()
}

export function EventRsvpsClient({ rsvps }: { rsvps: EventRsvpPerson[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rsvps
    return rsvps.filter((person) => {
      return (
        (person.name || "").toLowerCase().includes(q) ||
        (person.email || "").toLowerCase().includes(q) ||
        (person.organization || "").toLowerCase().includes(q) ||
        (person.role || "").toLowerCase().includes(q)
      )
    })
  }, [rsvps, query])

  return (
    <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-orange-600" />
            Attendees
          </CardTitle>
          <CardDescription>
            Full list of people who RSVP&apos;d for this event.
          </CardDescription>
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search attendees by name, email, org..."
            className="h-11 rounded-2xl border-orange-200/60 bg-white/80 pl-10 shadow-sm dark:bg-slate-900/60 dark:border-orange-800/40"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200/70 px-4 py-10 text-center text-sm text-muted-foreground dark:border-orange-800/40">
            {rsvps.length === 0 ? "No RSVPs yet for this event." : "No attendees match your search."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-orange-100/80 dark:border-slate-700">
            <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr] gap-3 bg-orange-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-orange-800 dark:bg-slate-800/80 dark:text-orange-200 md:grid">
              <span>Name</span>
              <span>Email</span>
              <span>Organisation</span>
              <span>Role</span>
              <span>RSVP date</span>
            </div>
            <ul className="divide-y divide-orange-100/80 dark:divide-slate-700">
              {filtered.map((person) => (
                <li
                  key={person.id}
                  className="grid gap-2 px-4 py-3 md:grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr] md:items-center md:gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {person.name || "Unnamed attendee"}
                    </p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {person.email || "No email"}
                    </p>
                  </div>
                  <p className="hidden items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200 md:flex">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{person.email || "No email"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="md:hidden">Org: </span>
                    {person.organization || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="md:hidden">Role: </span>
                    {person.role || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="md:hidden">RSVP date: </span>
                    {formatJoinedAt(person.joinedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
