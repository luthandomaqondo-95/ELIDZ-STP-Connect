import { createAdminClient } from "@/lib/supabase/admin";

export async function assertChatParticipant(
  chatId: string,
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chat_participants")
    .select("id")
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function assertConnectionParty(
  connectionId: string,
  userId: string
): Promise<{
  id: string;
  user_id: string;
  connected_user_id: string;
  status: string;
} | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("connections")
    .select("id, user_id, connected_user_id, status")
    .eq("id", connectionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  if (data.user_id !== userId && data.connected_user_id !== userId) return null;
  return data;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "Admin" || role === "Super Admin";
}
