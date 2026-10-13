"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { FloatingLabelInput, FloatingLabelSelect, FloatingLabelTextarea, SelectItem } from "@/components/floating-input"

type OpportunityForm = {
  title: string
  type: string
  location: string
  deadline: string
  description: string
  requirements: string
}

export default function EditOpportunityPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<OpportunityForm>({
    title: "",
    type: "tender",
    location: "",
    deadline: "",
    description: "",
    requirements: "",
  })

  useEffect(() => {
    async function fetchOpportunity() {
      const { data, error: fetchError } = await supabase
        .from("opportunities")
        .select("title, type, location, deadline, description, requirements")
        .eq("id", params.id)
        .single()

      if (fetchError || !data) {
        setError(fetchError?.message || "Failed to load opportunity.")
        setLoading(false)
        return
      }

      setForm({
        title: data.title || "",
        type: data.type || "tender",
        location: data.location || "",
        deadline: data.deadline ? String(data.deadline).slice(0, 10) : "",
        description: data.description || "",
        requirements: data.requirements || "",
      })
      setLoading(false)
    }

    fetchOpportunity()
  }, [params.id, supabase])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from("opportunities")
      .update({
        title: form.title,
        type: form.type,
        location: form.location,
        deadline: form.deadline || null,
        description: form.description,
        requirements: form.requirements || null,
      })
      .eq("id", params.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message || "Failed to update opportunity.")
      return
    }

    router.push(`/dashboard/opportunities/${params.id}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
      <DashboardPageHeader title="Edit Opportunity" backHref={`/dashboard/opportunities/${params.id}`} />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Update the opportunity details and save your changes.
      </p>

      <Card className="w-full rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]">
        <CardHeader>
          <CardTitle className="text-xl">Opportunity Details</CardTitle>
          <CardDescription className="text-sm">
            Edit fields below then save.
          </CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4 sm:space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 p-2 text-sm text-red-500 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.35)] dark:bg-red-950/30 dark:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.8)]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <FloatingLabelInput
                id="title"
                label="Title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                required
              />
              <FloatingLabelSelect
                label="Type"
                value={form.type}
                onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
              >
                <SelectItem value="tender">Tender</SelectItem>
                <SelectItem value="challenge">Challenge</SelectItem>
                <SelectItem value="funding">Funding</SelectItem>
                <SelectItem value="program">Program</SelectItem>
              </FloatingLabelSelect>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <FloatingLabelInput
                id="location"
                label="Location"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
              />
              <FloatingLabelInput
                id="deadline"
                label="Deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
              />
            </div>

            <FloatingLabelTextarea
              id="description"
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-[150px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
              required
            />

            <FloatingLabelTextarea
              id="requirements"
              label="Requirements"
              value={form.requirements}
              onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))}
              className="min-h-[120px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
            />
          </CardContent>

          <CardFooter className="justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:bg-red-700 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)] dark:bg-red-700 dark:hover:bg-red-800"
              onClick={() => router.push(`/dashboard/opportunities/${params.id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <AnimatedDashboardButton
              type="submit"
              variant="green"
              disabled={saving}
              className="h-10 rounded-3xl px-5"
              label={saving ? "Saving..." : "Save Changes"}
            />
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

