export type EventRsvpPerson = {
  id: string
  name: string | null
  email: string | null
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
