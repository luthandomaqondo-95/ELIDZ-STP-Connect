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

// Simple replacement for the deleted getPublishedEventsForAdmin function
export async function getPublishedEventsForAdmin(): Promise<PublishedEventItem[]> {
  // For now, return empty array - the list functionality can be implemented later
  // with a separate API route or by querying the database directly
  return []
}
