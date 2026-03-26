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
      <DialogContent className="sm:max-w-[460px] rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.12)] backdrop-blur-sm dark:bg-slate-900/80 dark:shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new user. They will be able to set their password.
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
                  placeholder="John Doe"
                  className="rounded-3xl bg-gray-800"
                  required
                />
                <FloatingLabelInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="john@example.com"
                  className="rounded-3xl bg-gray-800"
                  required
                />
                <FloatingLabelSelect
                  label="Role"
                  value={role}
                  onValueChange={setRole}
                  className="rounded-3xl bg-gray-800"
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
                <Button type="button" variant="outline" className="rounded-2xl mt-1" onClick={() => setOpen(false)} disabled={loading}>
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
