import { createAdminClient } from "@/lib/supabase/admin";

export async function hasOwnRsvp(userId: string, eventId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function createOwnRsvp(userId: string, eventId: string) {
  const supabase = createAdminClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) throw new Error(eventError.message);
  if (!event) throw new Error("Event not found");

  const { data, error } = await supabase
    .from("event_rsvps")
    .upsert(
      { event_id: eventId, user_id: userId },
      { onConflict: "event_id,user_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function cancelOwnRsvp(userId: string, eventId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("event_rsvps")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
