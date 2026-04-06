'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { getAuthedProfile } from "@/lib/authz"
import { getAppOrigin } from "@/lib/app-url"
import { revalidatePath } from "next/cache"

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

  if (actorRole !== "Admin" && actorRole !== "Super Admin") {
    return { error: "Forbidden" }
  }

  if (actorRole === "Admin" && role === "Super Admin") {
    return { error: "Only a Super Admin can invite another Super Admin" }
  }

  try {
    const supabaseAdmin = createAdminClient()

    // Supabase sends the invite email (configure SMTP under Project Settings → Auth).
    // redirectTo must be listed under Auth → URL Configuration → Redirect URLs (exact match or wildcard).
    // Site URL in Supabase should be your Vercel app, not *.supabase.co — otherwise the email link can
    // land on the project host and show {"error":"requested path is invalid"}.
    const origin = getAppOrigin()
    const { data: authData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
        data: {
          full_name: name,
          role,
        },
      })

    if (inviteError) {
      console.error("Invite error:", inviteError)
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

    revalidatePath("/dashboard/users/all")
    return { success: true }
  } catch (err: unknown) {
    console.error("Server action error:", err)
    const message = err instanceof Error ? err.message : "Failed to invite admin"
    return { error: message }
  }
}
