import { createAdminClient } from "@/lib/supabase/admin";
import { assertChatParticipant } from "./guards";
import { signPrivateStorageUrl, signPrivateStorageUrls } from "@/lib/storage-signing";

export async function listOwnChats(userId: string, limit: number) {
  const supabase = createAdminClient();

  const { data: participants, error: pErr } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", userId);

  if (pErr) throw new Error(pErr.message);
  const chatIds = (participants || []).map((p) => p.chat_id);
  if (chatIds.length === 0) return [];

  const { data: chats, error: cErr } = await supabase
    .from("chats")
    .select("*")
    .in("id", chatIds)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (cErr) throw new Error(cErr.message);

  const { data: allParticipants, error: apErr } = await supabase
    .from("chat_participants")
    .select("*, user:profiles(id, name, email, role, avatar, organization)")
    .in("chat_id", chatIds);

  if (apErr) throw new Error(apErr.message);

  const { data: recentMessages, error: mErr } = await supabase
    .from("messages")
    .select("id, chat_id, sender_id, content, created_at, read_at, attachment_url, attachment_type")
    .in("chat_id", chatIds)
    .order("created_at", { ascending: false })
    .limit(Math.min(limit * 3, 200));

  if (mErr) throw new Error(mErr.message);

  const signedMessages = await signPrivateStorageUrls(recentMessages || [], "attachment_url");
  const lastByChat = new Map<string, (typeof recentMessages)[0]>();
  for (const msg of signedMessages) {
    if (!lastByChat.has(msg.chat_id)) lastByChat.set(msg.chat_id, msg);
  }

  return (chats || []).map((chat) => {
    const parts = (allParticipants || []).filter((p) => p.chat_id === chat.id);
    const other = parts.find((p) => p.user_id !== userId);
    return {
      ...chat,
      participants: parts,
      lastMessage: lastByChat.get(chat.id) || null,
      otherUser: other?.user || null,
    };
  });
}

export async function listChatMessages(userId: string, chatId: string, limit: number) {
  if (!(await assertChatParticipant(chatId, userId))) {
    throw new Error("Forbidden");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, chat_id, sender_id, content, attachment_url, attachment_type, read_at, created_at, sender:profiles(id, name, avatar, role)"
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (await signPrivateStorageUrls(data || [], "attachment_url")).reverse();
}

export async function sendChatMessage(
  userId: string,
  chatId: string,
  content: string,
  attachment?: { url?: string; type?: string }
) {
  if (!(await assertChatParticipant(chatId, userId))) {
    throw new Error("Forbidden");
  }

  const text = content?.trim() ?? "";
  if (!text && !attachment?.url) {
    throw new Error("Message content is required");
  }
  if (text.length > 5000) throw new Error("Message too long");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: userId,
      content: text || "(attachment)",
      attachment_url: attachment?.url || null,
      attachment_type: attachment?.type || null,
    })
    .select(
      "id, chat_id, sender_id, content, attachment_url, attachment_type, read_at, created_at"
    )
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);

  return signPrivateStorageUrl(data, "attachment_url");
}

export async function createDirectChat(userId: string, otherUserId: string) {
  if (userId === otherUserId) throw new Error("Cannot create a chat with yourself");

  const supabase = createAdminClient();

  // Find existing direct chat with exactly these two participants
  const { data: myChats } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", userId);

  const myChatIds = (myChats || []).map((c) => c.chat_id);
  if (myChatIds.length > 0) {
    const { data: shared } = await supabase
      .from("chat_participants")
      .select("chat_id, chats!inner(id, type)")
      .eq("user_id", otherUserId)
      .in("chat_id", myChatIds);

    const existing = (shared || []).find((row: { chats?: { type?: string } | { type?: string }[] }) => {
      const chat = Array.isArray(row.chats) ? row.chats[0] : row.chats;
      return chat?.type === "direct";
    });
    if (existing) {
      const { data: chat } = await supabase
        .from("chats")
        .select("*")
        .eq("id", existing.chat_id)
        .single();
      if (chat) return chat;
    }
  }

  const { data: chat, error } = await supabase
    .from("chats")
    .insert({ type: "direct", created_by: userId })
    .select("*")
    .single();

  if (error || !chat) throw new Error(error?.message || "Failed to create chat");

  const { error: partError } = await supabase.from("chat_participants").insert([
    { chat_id: chat.id, user_id: userId },
    { chat_id: chat.id, user_id: otherUserId },
  ]);

  if (partError) {
    await supabase.from("chats").delete().eq("id", chat.id);
    throw new Error(partError.message);
  }

  return chat;
}

export async function markOwnMessagesRead(userId: string, chatId: string) {
  if (!(await assertChatParticipant(chatId, userId))) {
    throw new Error("Forbidden");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
}

export async function reportMessage(
  userId: string,
  payload: { messageId: string; chatId: string; reportedUserId: string; reason: string }
) {
  if (!(await assertChatParticipant(payload.chatId, userId))) {
    throw new Error("Forbidden");
  }

  const reason = payload.reason?.trim();
  if (!reason || reason.length < 3 || reason.length > 500) {
    throw new Error("Reason must be between 3 and 500 characters");
  }

  const supabase = createAdminClient();
  const { data: message } = await supabase
    .from("messages")
    .select("id, chat_id, sender_id")
    .eq("id", payload.messageId)
    .eq("chat_id", payload.chatId)
    .maybeSingle();

  if (!message) throw new Error("Message not found");

  // Always attribute the reported user from the message row — never trust client IDs.
  const { error } = await supabase.from("message_reports").insert({
    message_id: payload.messageId,
    chat_id: payload.chatId,
    reporter_id: userId,
    reported_user_id: message.sender_id,
    reason,
    status: "pending",
  });

  if (error) throw new Error(error.message);
}
