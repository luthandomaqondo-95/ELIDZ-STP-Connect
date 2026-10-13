import { ResetPasswordForm } from "@/components/reset-password-form"

/** Same token handling as /auth/reset-password — add this URL to Supabase Redirect URLs if you use it for OAuth or invites. */
export default function AuthCallbackPage() {
  return <ResetPasswordForm />
}
