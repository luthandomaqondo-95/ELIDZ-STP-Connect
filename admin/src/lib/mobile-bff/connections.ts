import { createAdminClient } from "@/lib/supabase/admin";
import { assertConnectionParty } from "./guards";

export async function listOwnAccepted(userId: string, limit: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("connections")
    .select(
      `
      *,
      requester:profiles!connections_user_id_fkey(id, name, email, role, avatar, organization, verification_status),
      addressee:profiles!connections_connected_user_id_fkey(id, name, email, role, avatar, organization, verification_status)
    `
    )
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
    .eq("status", "accepted")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    requester_id: row.user_id,
    addressee_id: row.connected_user_id,
  }));
}

export async function listOwnRequests(userId: string) {
  const supabase = createAdminClient();
  const [incoming, outgoing] = await Promise.all([
    supabase
      .from("connections")
      .select(
        `*, requester:profiles!connections_user_id_fkey(id, name, email, role, avatar, organization, verification_status)`
      )
      .eq("connected_user_id", userId)
      .eq("status", "pending"),
    supabase
      .from("connections")
      .select(
        `*, addressee:profiles!connections_connected_user_id_fkey(id, name, email, role, avatar, organization, verification_status)`
      )
      .eq("user_id", userId)
      .eq("status", "pending"),
  ]);

  if (incoming.error) throw new Error(incoming.error.message);
  if (outgoing.error) throw new Error(outgoing.error.message);

  const incomingMapped = (incoming.data || []).map((row: Record<string, unknown>) => ({
    ...row,
    requester_id: row.user_id,
    addressee_id: row.connected_user_id,
    user: row.requester,
    isIncoming: true,
  }));

  const outgoingMapped = (outgoing.data || []).map((row: Record<string, unknown>) => ({
    ...row,
    requester_id: row.user_id,
    addressee_id: row.connected_user_id,
    user: row.addressee,
    isIncoming: false,
  }));

  return [...incomingMapped, ...outgoingMapped];
}

export async function sendConnectionRequest(requesterId: string, addresseeId: string) {
  if (requesterId === addresseeId) {
    throw new Error("Cannot connect with yourself");
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("connections")
    .select("id, status, user_id, connected_user_id")
    .or(
      `and(user_id.eq.${requesterId},connected_user_id.eq.${addresseeId}),and(user_id.eq.${addresseeId},connected_user_id.eq.${requesterId})`
    )
    .limit(5);

  if (existing?.some((r) => r.status === "blocked")) {
    throw new Error("Unable to send connection request");
  }
  if (existing?.some((r) => r.status === "accepted" || r.status === "pending")) {
    throw new Error("A connection already exists with this user");
  }

  const { data, error } = await supabase
    .from("connections")
    .insert({
      user_id: requesterId,
      connected_user_id: addresseeId,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    requester_id: data.user_id,
    addressee_id: data.connected_user_id,
  };
}

export async function acceptOwnConnection(userId: string, connectionId: string) {
  const row = await assertConnectionParty(connectionId, userId);
  if (!row) throw new Error("Connection not found");
  if (row.connected_user_id !== userId) {
    throw new Error("Only the recipient can accept this request");
  }
  if (row.status !== "pending") throw new Error("Connection is not pending");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("connections")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", connectionId)
    .eq("connected_user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function declineOwnConnection(userId: string, connectionId: string) {
  const row = await assertConnectionParty(connectionId, userId);
  if (!row) throw new Error("Connection not found");
  if (row.connected_user_id !== userId && row.user_id !== userId) {
    throw new Error("Forbidden");
  }

  const supabase = createAdminClient();
  // Recipient declines or sender cancels pending
  if (row.status !== "pending") throw new Error("Connection is not pending");

  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

  if (error) throw new Error(error.message);
}

export async function blockUser(blockerId: string, blockedUserId: string) {
  if (blockerId === blockedUserId) throw new Error("Cannot block yourself");
  const supabase = createAdminClient();

  // Remove any pending/accepted links then upsert blocked from blocker -> blocked
  await supabase
    .from("connections")
    .delete()
    .or(
      `and(user_id.eq.${blockerId},connected_user_id.eq.${blockedUserId}),and(user_id.eq.${blockedUserId},connected_user_id.eq.${blockerId})`
    );

  const { error } = await supabase.from("connections").insert({
    user_id: blockerId,
    connected_user_id: blockedUserId,
    status: "blocked",
  });

  if (error) throw new Error(error.message);
}

export async function unblockUser(currentUserId: string, otherUserId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("connections")
    .delete()
    .eq("status", "blocked")
    .eq("user_id", currentUserId)
    .eq("connected_user_id", otherUserId)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length || 0) > 0;
}

export async function getBlockStatus(currentUserId: string, otherUserId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("connections")
    .select("id, user_id, connected_user_id, status")
    .eq("status", "blocked")
    .or(
      `and(user_id.eq.${currentUserId},connected_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},connected_user_id.eq.${currentUserId})`
    )
    .limit(10);

  if (error) throw new Error(error.message);
  const blockedByCurrentUser = (data || []).some(
    (row) => row.user_id === currentUserId && row.connected_user_id === otherUserId
  );
  const blockedByOtherUser = (data || []).some(
    (row) => row.user_id === otherUserId && row.connected_user_id === currentUserId
  );
  return {
    isBlocked: blockedByCurrentUser || blockedByOtherUser,
    blockedByCurrentUser,
    blockedByOtherUser,
  };
}
