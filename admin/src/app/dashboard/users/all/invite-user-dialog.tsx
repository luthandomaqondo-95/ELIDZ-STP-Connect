"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { inviteUser } from "@/app/actions"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <Plus className="mr-2 h-4 w-4" />
            Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new user. They will be able to set their password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
            <div className="grid gap-4 py-4">
                {error && (
                    <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                        {error}
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" required defaultValue="Tenant">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Super Admin">Super Admin</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Tenant">Tenant</SelectItem>
                            <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                            <SelectItem value="Researcher">Researcher</SelectItem>
                            <SelectItem value="SME">SME</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Investor">Investor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Invitation
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
