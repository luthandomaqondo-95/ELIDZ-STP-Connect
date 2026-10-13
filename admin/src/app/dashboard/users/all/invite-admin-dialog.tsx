"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FloatingLabelInput, FloatingLabelSelect, SelectItem } from "@/components/floating-input"
import { inviteAdminUser } from "@/app/actions"
import { useRouter } from "next/navigation"

type InviteAdminDialogProps = {
  /** Super Admins may invite Admin or Super Admin; Admins may invite Admin only. */
  canInviteSuperAdmin: boolean
}

export function InviteAdminDialog({ canInviteSuperAdmin }: InviteAdminDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<"Admin" | "Super Admin">("Admin")
  const router = useRouter()

  useEffect(() => {
    if (!canInviteSuperAdmin && role === "Super Admin") {
      setRole("Admin")
    }
  }, [canInviteSuperAdmin, role])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await inviteAdminUser(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      setRole("Admin")
      router.refresh()
      window.alert(
        "Invitation sent. The recipient should check their inbox and spam folder. If nothing arrives, verify SMTP and email templates in the Supabase dashboard."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AnimatedDashboardButton label="+ Invite Admin" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px] rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.12)] backdrop-blur-sm dark:bg-slate-900/80 dark:shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
        <DialogHeader>
          <DialogTitle>Invite Admin</DialogTitle>
          <DialogDescription>
            The invitation email is sent by Supabase (not this app). Configure SMTP and email templates in the
            Supabase dashboard under Authentication, and allow your app origin plus{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">/auth/reset-password</code> in Redirect URLs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-500 dark:border-red-900/40 dark:bg-red-950/20">
                {error}
              </div>
            )}
            <FloatingLabelInput
              id="name"
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              className="rounded-3xl bg-gray-800"
              required
            />
            <FloatingLabelInput
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="jane@example.com"
              className="rounded-3xl bg-gray-800"
              required
            />
            <FloatingLabelSelect
              label="Admin role"
              value={role}
              onValueChange={(v) => setRole(v as "Admin" | "Super Admin")}
              className="rounded-3xl bg-gray-800"
            >
              <SelectItem value="Admin">Admin</SelectItem>
              {canInviteSuperAdmin ? (
                <SelectItem value="Super Admin">Super Admin</SelectItem>
              ) : null}
            </FloatingLabelSelect>
            <input type="hidden" name="role" value={role} />
          </div>
          <DialogFooter className="justify-center sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl mt-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <AnimatedDashboardButton
              type="submit"
              variant="green"
              disabled={loading}
              className="rounded-3xl h-10 px-5"
              label={loading ? "Sending…" : "Send invitation"}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
