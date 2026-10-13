"use client"

import { useState } from "react"
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
import { inviteUser } from "@/app/actions"
import { useRouter } from "next/navigation"
import { MODAL_CANCEL_BUTTON_CLASS, MODAL_FIELD_CLASS } from "@/lib/utils"

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState("Tenant")
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await inviteUser(formData)

    setLoading(false)

    if (result.error) {
        setError(result.error)
    } else {
        setOpen(false)
        setRole("Tenant")
        router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AnimatedDashboardButton label="+ Invite User" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new user. They will be able to set their password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
            <div className="grid gap-3 sm:gap-4 py-4">
                {error && (
                    <div className="rounded-xl bg-red-50 p-2 text-sm text-red-500 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.35)] dark:bg-red-950/30 dark:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.8)]">
                        {error}
                    </div>
                )}
                <FloatingLabelInput
                  id="name"
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  className={MODAL_FIELD_CLASS}
                  required
                />
                <FloatingLabelInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="john@example.com"
                  className={MODAL_FIELD_CLASS}
                  required
                />
                <FloatingLabelSelect
                  label="Role"
                  value={role}
                  onValueChange={setRole}
                  className={MODAL_FIELD_CLASS}
                >
                            <SelectItem value="Super Admin">Super Admin</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Tenant">Tenant</SelectItem>
                            <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                            <SelectItem value="Researcher">Researcher</SelectItem>
                            <SelectItem value="SME">SME</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Investor">Investor</SelectItem>
                </FloatingLabelSelect>
                <input type="hidden" name="role" value={role} />
            </div>
            <DialogFooter className="justify-center sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  className={MODAL_CANCEL_BUTTON_CLASS}
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
                  label={loading ? "Sending Invitation..." : "Send Invitation"}
                />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
