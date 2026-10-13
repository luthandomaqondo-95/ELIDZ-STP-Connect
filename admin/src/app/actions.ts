'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { getAuthedProfile } from "@/lib/authz"
import { notifySuperAdminsOfAdminAction } from "@/lib/admin/super-admin-alerts"
import { getAppOrigin } from "@/lib/app-url"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

const ADMIN_INVITE_ROLES = new Set(["Admin", "Super Admin"])

export async function inviteAdminUser(formData: FormData) {
  const email = (formData.get("email") as string)?.trim()
  const name = (formData.get("name") as string)?.trim()
  const role = (formData.get("role") as string)?.trim()

  if (!email || !name || !role) {
    return { error: "Missing required fields" }
  }

  if (!ADMIN_INVITE_ROLES.has(role)) {
    return { error: "Only Admin or Super Admin roles can be invited" }
  }

  const { profile } = await getAuthedProfile()
  const actorRole = (profile?.role as string) ?? ""

  if (actorRole !== "Super Admin") {
    return { error: "Only Super Admin can invite users" }
  }

  try {
    const supabaseAdmin = createAdminClient()

    // Supabase sends the invite email (configure SMTP under Project Settings → Auth).
    // redirectTo must be listed under Auth → URL Configuration → Redirect URLs (exact match or wildcard).
    // Site URL in Supabase should be your Vercel app, not *.supabase.co — otherwise the email link can
    // land on the project host and show {"error":"requested path is invalid"}.
    // Prefer request-derived origin so we don't accidentally send localhost in production.
    const h = await headers()
    const host = h.get("x-forwarded-host") ?? h.get("host")
    const forwardedProto = h.get("x-forwarded-proto")
    const proto =
      forwardedProto ??
      (host && /(^localhost(:\d+)?$|^127\.0\.0\.1(:\d+)?$)/.test(host) ? "http" : "https")
    const origin =
      host && proto ? `${proto}://${host}`.replace(/\/$/, "") : getAppOrigin()
    const { data: authData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        // Invite links should land on password setup.
        redirectTo: `${origin}/auth/reset-password`,
        data: {
          full_name: name,
          role,
        },
      })

    if (inviteError) {
      console.error("Invite error:", inviteError)
      // Translate common Supabase error codes into actionable messages.
      const code = (inviteError as { code?: string }).code
      if (code === "over_email_send_rate_limit") {
        return {
          error:
            "Email rate limit reached. Supabase free tier allows only a few invite emails per hour. Wait a few minutes then try again, or use a different email address.",
        }
      }
      return { error: inviteError.message }
    }

    if (authData.user) {
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: authData.user.id,
        name,
        email,
        role,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        await supabaseAdmin.from("profiles").upsert({
          id: authData.user.id,
          name,
          email,
          role,
        })
      }
    }

    await notifySuperAdminsOfAdminAction({
      action: "Invited admin user",
      actorId: (profile?.id as string | undefined) ?? null,
      actorName: (profile?.name as string | undefined) ?? null,
      actorRole,
      details: `Invited ${name} (${email}) with role ${role}.`,
      relatedEntityType: "admin_user",
      relatedEntityId: authData.user?.id ?? null,
    })

    revalidatePath("/dashboard/users/all")
    return { success: true }
  } catch (err: unknown) {
    console.error("Server action error:", err)
    const message = err instanceof Error ? err.message : "Failed to invite admin"
    return { error: message }
  }
}
