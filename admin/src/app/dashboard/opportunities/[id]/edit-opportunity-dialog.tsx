"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MODAL_CANCEL_BUTTON_CLASS } from "@/lib/utils"
import { FloatingLabelInput, FloatingLabelSelect, FloatingLabelTextarea, SelectItem } from "@/components/floating-input"

interface EditOpportunityDialogProps {
  id: string
  initial: {
    title: string | null
    type: string | null
    deadline: string | null
    description: string | null
    requirements: string | null
  }
}

export function EditOpportunityDialog({ id, initial }: EditOpportunityDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initial.title || "")
  const [type, setType] = useState(initial.type || "tender")
  const [deadline, setDeadline] = useState(initial.deadline ? String(initial.deadline).slice(0, 10) : "")
  const [description, setDescription] = useState(initial.description || "")
  const [requirements, setRequirements] = useState(initial.requirements || "")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const { data: updatedRow, error: updateError } = await supabase
      .from("opportunities")
      .update({
        title,
        type,
        deadline: deadline || null,
        description,
        requirements: requirements || null,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle()

    setSaving(false)

    if (updateError) {
      setError(updateError.message || "Failed to update opportunity.")
      toast.error(updateError.message || "Failed to update opportunity.")
      return
    }

    if (!updatedRow) {
      const message = "No changes were saved. Please check your permissions."
      setError(message)
      toast.error(message)
      return
    }

    setOpen(false)
    toast.success("Opportunity updated successfully.")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AnimatedDashboardButton label="Edit Opportunity" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit Opportunity</DialogTitle>
          <DialogDescription>Update the details and save changes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-2 text-sm text-red-500 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.35)] dark:bg-red-950/30 dark:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.8)]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <FloatingLabelInput
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
              required
            />
            <FloatingLabelSelect
              label="Type"
              value={type}
              onValueChange={setType}
              className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
            >
              <SelectItem value="tender">Tender</SelectItem>
              <SelectItem value="challenge">Challenge</SelectItem>
              <SelectItem value="funding">Funding</SelectItem>
              <SelectItem value="program">Program</SelectItem>
            </FloatingLabelSelect>
          </div>

          <FloatingLabelInput
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
          />

          <FloatingLabelTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[130px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
            required
          />

          <FloatingLabelTextarea
            label="Requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="min-h-[100px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
          />

          <DialogFooter>
            <Button type="button" variant="ghost" className={MODAL_CANCEL_BUTTON_CLASS} onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <AnimatedDashboardButton
              type="submit"
              variant="green"
              disabled={saving}
              className="rounded-3xl h-10 px-5"
              label={saving ? "Saving..." : "Save Changes"}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

