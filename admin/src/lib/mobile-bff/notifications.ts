import { createAdminClient } from "@/lib/supabase/admin";

export async function listOwnNotifications(userId: string, limit: number, unreadOnly = false) {
  const supabase = createAdminClient();
  let query = supabase
    .from("notifications")
    .select(
      "id, user_id, title, message, type, related_entity_type, related_entity_id, read_at, created_at, updated_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.is("read_at", null);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getOwnUnreadCount(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
  return count || 0;
}

export async function markOwnNotificationRead(userId: string, notificationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Notification not found");
  return data;
}

export async function markAllOwnNotificationsRead(userId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
}

export async function deleteOwnNotification(userId: string, notificationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Notification not found");
}
