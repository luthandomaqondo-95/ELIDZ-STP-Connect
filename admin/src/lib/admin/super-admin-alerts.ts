import { createAdminClient } from "@/lib/supabase/admin"

type SuperAdminAlertInput = {
  action: string
  actorId?: string | null
  actorName?: string | null
  actorRole?: string | null
  details?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
}

export async function notifySuperAdminsOfAdminAction(input: SuperAdminAlertInput) {
  try {
    const supabase = createAdminClient()
    const { data: superAdmins, error: superAdminsError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "Super Admin")

    if (superAdminsError || !superAdmins?.length) {
      if (superAdminsError) {
        console.error("Failed to fetch Super Admin profiles:", superAdminsError)
      }
      return
    }

    const actorLabel =
      input.actorName?.trim() ||
      input.actorId?.trim() ||
      "An admin"
    const roleLabel = input.actorRole?.trim() ? ` (${input.actorRole})` : ""

    const title = `Admin action: ${input.action}`
    const messageBase = `${actorLabel}${roleLabel} performed "${input.action}".`
    const message = input.details?.trim()
      ? `${messageBase} ${input.details.trim()}`
      : messageBase

    const now = new Date().toISOString()
    const notifications = superAdmins.map((admin) => ({
      id: crypto.randomUUID(),
      user_id: admin.id as string,
      title,
      message,
      type: "system_alert",
      created_by: input.actorId ?? null,
      related_entity_type: input.relatedEntityType ?? "admin_action",
      related_entity_id: input.relatedEntityId ?? null,
      created_at: now,
      updated_at: now,
    }))

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications)

    if (notificationError) {
      console.error("Failed to create Super Admin alert notifications:", notificationError)
    }
  } catch (error) {
    console.error("Unexpected error while notifying Super Admins:", error)
  }
}
