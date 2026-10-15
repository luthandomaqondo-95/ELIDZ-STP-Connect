/**
 * Authorization / IDOR tests for mobile BFF helpers.
 * Requires RUN_AUTH_INTEGRATION=1 and service-role env (same as auth integration).
 *
 * Creates two disposable users via registerUser(); never selects or mutates existing profiles.
 */
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { randomUUID } from "crypto";

const run = process.env.RUN_AUTH_INTEGRATION === "1";
const describeIntegration = run ? describe : describe.skip;

const TEST_PASSWORD = "IdorTestPass9!";

describeIntegration("mobile BFF authorization", () => {
  let userA: string | null = null;
  let userB: string | null = null;
  let notificationA: string | null = null;
  let enquiryA: string | null = null;
  let chatId: string | null = null;
  let participantId: string | null = null;
  let messageId: string | null = null;
  let serviceProductId: string | null = null;

  beforeAll(async () => {
    if (!process.env.AUTH_JWT_SECRET || process.env.AUTH_JWT_SECRET.length < 32) {
      process.env.AUTH_JWT_SECRET = "test-auth-jwt-secret-at-least-32-chars-long!!";
    }

    const { registerUser } = await import("@/lib/custom-auth/service");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const emailA = `idor-test-${randomUUID()}@example.com`;
    const emailB = `idor-test-${randomUUID()}@example.com`;

    // Capture profile UUIDs immediately so afterAll can clean up even if later setup fails.
    const registeredA = await registerUser({
      name: "IDOR Test User A",
      email: emailA,
      password: TEST_PASSWORD,
      role: "Entrepreneur",
      address: "1 IDOR Test Street",
    });
    userA = registeredA.user.id;

    const registeredB = await registerUser({
      name: "IDOR Test User B",
      email: emailB,
      password: TEST_PASSWORD,
      role: "Entrepreneur",
      address: "2 IDOR Test Street",
    });
    userB = registeredB.user.id;

    const verifiedAt = new Date().toISOString();
    const { error: verifyAError } = await supabase
      .from("auth_credentials")
      .update({ email_verified_at: verifiedAt })
      .eq("user_id", userA);
    if (verifyAError) {
      throw new Error(`Failed to mark user A email verified: ${verifyAError.message}`);
    }

    const { error: verifyBError } = await supabase
      .from("auth_credentials")
      .update({ email_verified_at: verifiedAt })
      .eq("user_id", userB);
    if (verifyBError) {
      throw new Error(`Failed to mark user B email verified: ${verifyBError.message}`);
    }

    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userA,
        title: "IDOR test",
        message: "private",
        type: "other",
      })
      .select("id")
      .single();
    if (notificationError || !notification) {
      throw new Error(
        `Failed to create test notification: ${notificationError?.message ?? "no row returned"}`
      );
    }
    notificationA = notification.id;

    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .insert({
        user_id: userA,
        enquiry_type: "General",
        subject: "IDOR enquiry",
        message: "secret",
        status: "new",
      })
      .select("id")
      .single();
    if (enquiryError || !enquiry) {
      throw new Error(
        `Failed to create test enquiry: ${enquiryError?.message ?? "no row returned"}`
      );
    }
    enquiryA = enquiry.id;

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({ type: "direct", created_by: userA })
      .select("id")
      .single();
    if (chatError || !chat) {
      throw new Error(`Failed to create test chat: ${chatError?.message ?? "no row returned"}`);
    }
    chatId = chat.id;

    // User A is a participant; User B is deliberately not.
    const { data: participant, error: participantError } = await supabase
      .from("chat_participants")
      .insert({ chat_id: chatId, user_id: userA })
      .select("id")
      .single();
    if (participantError || !participant) {
      throw new Error(
        `Failed to create test chat participant: ${participantError?.message ?? "no row returned"}`
      );
    }
    participantId = participant.id;

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: userA,
        content: "private message",
      })
      .select("id")
      .single();
    if (messageError || !message) {
      throw new Error(
        `Failed to create test message: ${messageError?.message ?? "no row returned"}`
      );
    }
    messageId = message.id;

    const { data: serviceProduct, error: serviceProductError } = await supabase
      .from("smme_services_products")
      .insert({
        smme_id: userA,
        type: "Service",
        name: `idor-${randomUUID().slice(0, 8)}`,
        description: "test",
        category: "Other",
        status: "active",
      })
      .select("id")
      .single();
    if (serviceProductError || !serviceProduct) {
      throw new Error(
        `Failed to create test SMME service product: ${serviceProductError?.message ?? "no row returned"}`
      );
    }
    serviceProductId = serviceProduct.id;
  }, 60000);

  afterAll(async () => {
    const cleanupErrors: string[] = [];

    const recordError = (label: string, err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      cleanupErrors.push(`${label}: ${message}`);
    };

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { deleteProvisionedUser } = await import("@/lib/custom-auth/service");
    const supabase = createAdminClient();

    const deleteById = async (
      table: string,
      id: string | null,
      label: string
    ): Promise<void> => {
      if (!id) return;
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        recordError(label, error);
      }
    };

    try {
      // Dependency order: messages → participants → chats → notification/enquiry → SMME product.
      // deleteProvisionedUser only clears custom-auth rows + profile + Auth stub; owned
      // domain rows must be removed first or profile deletes fail on FKs.
      await deleteById("messages", messageId, "delete test message");
      await deleteById("chat_participants", participantId, "delete test chat participant");
      await deleteById("chats", chatId, "delete test chat");
      await deleteById("notifications", notificationA, "delete test notification");
      await deleteById("enquiries", enquiryA, "delete test enquiry");
      await deleteById("smme_services_products", serviceProductId, "delete test SMME service product");
    } finally {
      // Always attempt user cleanup for any IDs captured during setup.
      // deleteProvisionedUser does not always throw on FK-blocked profile deletes,
      // so verify the profile is gone afterward.
      for (const [label, userId] of [
        ["delete provisioned user A", userA],
        ["delete provisioned user B", userB],
      ] as const) {
        if (!userId) continue;
        try {
          await deleteProvisionedUser(userId);
          const { data: leftover, error: leftoverError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .maybeSingle();
          if (leftoverError) {
            recordError(`${label} (verify)`, leftoverError);
          } else if (leftover) {
            recordError(
              label,
              new Error(
                `profile ${userId} still exists after deleteProvisionedUser (likely dependent-row FK)`
              )
            );
          }
        } catch (err) {
          recordError(label, err);
        }
      }
    }

    if (cleanupErrors.length > 0) {
      throw new Error(`IDOR test cleanup failed:\n${cleanupErrors.join("\n")}`);
    }
  }, 60000);

  it("rejects missing bearer conceptually via requireMobileAuth", async () => {
    const { requireMobileAuth } = await import("./auth");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest("http://localhost/api/mobile/profile");
    const result = await requireMobileAuth(req);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it("user B cannot read user A enquiry", async () => {
    const { getOwnEnquiry } = await import("./enquiries");
    if (!enquiryA || !userB) throw new Error("missing enquiry");
    const result = await getOwnEnquiry(userB, enquiryA);
    expect(result).toBeNull();
  });

  it("user B cannot mark user A notification read", async () => {
    const { markOwnNotificationRead } = await import("./notifications");
    if (!notificationA || !userB) throw new Error("missing notification");
    await expect(markOwnNotificationRead(userB, notificationA)).rejects.toThrow(/not found/i);
  });

  it("user B cannot delete user A notification", async () => {
    const { deleteOwnNotification } = await import("./notifications");
    if (!notificationA || !userB) throw new Error("missing notification");
    await expect(deleteOwnNotification(userB, notificationA)).rejects.toThrow(/not found/i);
  });

  it("non-participant cannot read chat messages", async () => {
    const { listChatMessages } = await import("./chats");
    if (!chatId || !userB) throw new Error("missing chat");
    await expect(listChatMessages(userB, chatId, 20)).rejects.toThrow(/Forbidden/i);
  });

  it("non-participant cannot send chat messages", async () => {
    const { sendChatMessage } = await import("./chats");
    if (!chatId || !userB) throw new Error("missing chat");
    await expect(sendChatMessage(userB, chatId, "hack")).rejects.toThrow(/Forbidden/i);
  });

  it("participant can read own chat messages", async () => {
    const { listChatMessages } = await import("./chats");
    if (!chatId || !userA) throw new Error("missing chat");
    const messages = await listChatMessages(userA, chatId, 20);
    expect(messages.some((m) => m.content === "private message")).toBe(true);
  });

  it("user cannot update another user's SMME service", async () => {
    const { updateOwnServiceProduct, deleteOwnServiceProduct } = await import("./smme-services");
    if (!serviceProductId || !userB) throw new Error("failed to create service item");

    await expect(
      updateOwnServiceProduct(userB, serviceProductId, { name: "hijacked" })
    ).rejects.toThrow(/not found/i);

    await expect(deleteOwnServiceProduct(userB, serviceProductId)).rejects.toThrow(/not found/i);
  });

  it("caps pagination limits", async () => {
    const { parseLimit } = await import("./auth");
    expect(parseLimit("9999", { max: 100 })).toBe(100);
    expect(parseLimit("-1")).toBe(50);
    expect(parseLimit("10")).toBe(10);
  });
});
