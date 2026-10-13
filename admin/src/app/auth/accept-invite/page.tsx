import { ResetPasswordForm } from "@/components/reset-password-form"

/**
 * Invite links redirect here so invited users can set a password first.
 * ResetPasswordForm already supports Supabase invite/recovery token flows.
 */
export default function AcceptInvitePage() {
  return <ResetPasswordForm />
}
