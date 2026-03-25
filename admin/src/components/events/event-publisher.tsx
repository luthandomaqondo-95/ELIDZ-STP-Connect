"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CalendarDays, Grid2x2, Home, MessageCircle, Search, Shield } from "lucide-react"
import { toast } from "sonner"

import { publishEvent } from "@/lib/publish-events"
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/floating-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function createInitialForm() {
  return {
    title: "",
    date: "",
    location: "",
    description: "",
  }
}

export function EventPublisher() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(createInitialForm)

  const previewDateLabel = useMemo(() => {
    if (!form.date) return "Event date"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "Event date"
    return value.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }, [form.date])

  const previewMonthSection = useMemo(() => {
    if (!form.date) return "Upcoming Events"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "Upcoming Events"
    return value.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    })
  }, [form.date])

  const previewMonthShort = useMemo(() => {
    if (!form.date) return "MON"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "MON"
    return value
      .toLocaleDateString(undefined, { month: "short" })
      .toUpperCase()
      .slice(0, 3)
  }, [form.date])

  const previewDay = useMemo(() => {
    if (!form.date) return "15"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "15"
    return String(value.getDate())
  }, [form.date])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await publishEvent(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Event published to the mobile app.")
    setForm(createInitialForm())
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>
              Publish an event directly to the app&apos;s ELIDZ-STP events tab.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FloatingLabelInput
                id="title"
                name="title"
                label="Event Title"
                placeholder="e.g. ELIDZ Innovation Demo Day"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                required
              />

              <div className="space-y-1.5">
                <label htmlFor="date" className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Event Date & Time
                </label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <FloatingLabelInput
              id="location"
              name="location"
              label="Location"
              placeholder="ELIDZ Innovation Centre, East London"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
            />

            <FloatingLabelTextarea
              id="description"
              name="description"
              label="Description"
              placeholder="Describe what this event is about..."
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-[220px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
            />
          </CardContent>
        </Card>

        <div className="flex w-full flex-col gap-4 lg:w-[380px]">
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-3xl border border-orange-200/60 bg-orange-100/80 px-6 text-sm text-orange-800 shadow-sm hover:bg-orange-200/80 dark:border-orange-800/40 dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/50"
            >
              {loading ? "Publishing..." : "Publish Event"}
            </Button>
          </div>

          <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
            <CardHeader>
              <CardTitle>Mobile Preview</CardTitle>
              <CardDescription>
                This gives you a quick sense of how the event will read in the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6">
              <div className="mx-auto h-[390px] w-[220px] overflow-hidden rounded-[2rem] border border-[#1f3557] bg-[#0a1628] shadow-[0_24px_50px_rgba(2,8,24,0.55)]">
                <div className="flex h-full flex-col">
                  <div className="bg-gradient-to-r from-[#002147] to-[#003366] px-3 pb-3 pt-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold leading-none text-white">Events</p>
                        <p className="mt-1 text-[8px] text-white/80">
                          Discover upcoming ELIDZ-STP events
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5 text-white/90" />
                        <div className="h-5 w-5 rounded-full border border-white/35 bg-gradient-to-br from-[#f4b25f] to-[#2a4f89]" />
                      </div>
                    </div>

                    <div className="flex h-7 items-center rounded-full border border-white/20 bg-white/10 px-2.5">
                      <Search className="h-3 w-3 text-white/70" />
                      <p className="ml-2 text-[8px] text-white/55">Search events...</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 overflow-hidden bg-[#0a1628] p-2">
                    <p className="text-[11px] font-semibold text-white">{previewMonthSection}</p>

                    <article className="rounded-xl border border-[#3a5377] bg-[#112846] p-2.5">
                      <div className="flex gap-2.5">
                        <div className="flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#002147] text-white">
                          <span className="text-[7px] font-semibold">{previewMonthShort}</span>
                          <span className="text-[15px] font-bold leading-none">{previewDay}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white">
                            {form.title.trim() || "Your event title will appear here"}
                          </p>
                          <p className="mt-1 text-[8px] font-semibold text-[#f4b25f]">{previewDateLabel}</p>
                          <p className="mt-1.5 line-clamp-1 text-[8px] text-[#c3d0e3]">
                            {form.location.trim() || "ELIDZ STP, East London"}
                          </p>
                        </div>
                      </div>
                    </article>

                  </div>

                  <div className="grid grid-cols-5 border-t border-[#31496c] bg-[#081326] px-1.5 py-1.5">
                    <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                      <Home className="h-3.5 w-3.5" />
                      <span className="text-[7px]">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                      <Grid2x2 className="h-3.5 w-3.5" />
                      <span className="text-[7px]">Services</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-[#f38c1e]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="text-[7px]">Events</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="text-[7px]">SMME&apos;s</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="text-[7px]">Messages</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
