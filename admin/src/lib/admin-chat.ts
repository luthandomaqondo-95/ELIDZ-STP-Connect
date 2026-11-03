"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/authz"
import type { Chat, Message, Profile } from "@/types/chat"

/**
 * Admin messaging data access. Runs server-side on the service role, scoped to the
 * signed-in admin, so it works under custom auth where the browser has no Supabase session.
 */

async function assertParticipant(chatId: string, userId: string) {
  const { data } = await createAdminClient()
    .from("chat_participants")
    .select("chat_id")
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .maybeSingle()
  if (!data) throw new Error("Forbidden")
}

export async function getChatCurrentUser(): Promise<Profile | null> {
  const { profile } = await requireAdmin()
  return (profile ?? null) as unknown as Profile | null
}

export async function listAdminChats(): Promise<Chat[]> {
  const { userId } = await requireAdmin()
  const supabase = createAdminClient()

  const { data: participants, error: participantsError } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", userId)
  if (participantsError) throw new Error(participantsError.message)

  const chatIds = (participants ?? []).map((p) => p.chat_id as string)
  if (chatIds.length === 0) return []

  const [chatsResult, allParticipantsResult, allMessagesResult, allUnreadResult] = await Promise.all([
    supabase.from("chats").select("*").in("id", chatIds).order("updated_at", { ascending: false }),
    supabase.from("chat_participants").select("*, user:profiles(*)").in("chat_id", chatIds),
    supabase
      .from("messages")
      .select("*, sender:profiles(*)")
      .in("chat_id", chatIds)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("messages")
      .select("chat_id")
      .in("chat_id", chatIds)
      .is("read_at", null)
      .neq("sender_id", userId),
  ])

  const participantsByChat = new Map<string, Record<string, unknown>[]>()
  for (const p of allParticipantsResult.data ?? []) {
    const list = participantsByChat.get(p.chat_id) ?? []
    list.push(p)
    participantsByChat.set(p.chat_id, list)
  }

  const lastMessageByChat = new Map<string, Message>()
  for (const msg of allMessagesResult.data ?? []) {
    if (!lastMessageByChat.has(msg.chat_id)) lastMessageByChat.set(msg.chat_id, msg as Message)
  }

  const unreadCountByChat = new Map<string, number>()
  for (const msg of allUnreadResult.data ?? []) {
    unreadCountByChat.set(msg.chat_id, (unreadCountByChat.get(msg.chat_id) ?? 0) + 1)
  }

  return (chatsResult.data ?? []).map((chat) => {
    const chatParticipants = participantsByChat.get(chat.id) ?? []
    const other =
      chat.type === "direct" ? chatParticipants.find((p) => p.user_id !== userId) : undefined
    return {
      ...chat,
      participants: chatParticipants,
      lastMessage: lastMessageByChat.get(chat.id),
      unreadCount: unreadCountByChat.get(chat.id) ?? 0,
      otherUser: (other?.user ?? undefined) as Profile | undefined,
    } as Chat
  })
}

export async function listChatMessages(chatId: string): Promise<Message[]> {
  const { userId } = await requireAdmin()
  await assertParticipant(chatId, userId)

  const { data, error } = await createAdminClient()
    .from("messages")
    .select("*, sender:profiles(*)")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return ((data ?? []) as Message[]).reverse()
}

export async function sendChatMessage(chatId: string, content: string): Promise<Message> {
  const { userId } = await requireAdmin()
  const trimmed = content.trim()
  if (!trimmed) throw new Error("Message is empty")
  await assertParticipant(chatId, userId)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, sender_id: userId, content: trimmed })
    .select("*, sender:profiles(*)")
    .single()
  if (error || !data) throw new Error(error?.message || "Failed to send message")

  await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId)
  return data as Message
}

export async function markChatRead(chatId: string): Promise<void> {
  const { userId } = await requireAdmin()
  await assertParticipant(chatId, userId)
  await createAdminClient()
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .is("read_at", null)
    .neq("sender_id", userId)
}
