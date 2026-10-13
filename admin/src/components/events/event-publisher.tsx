"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CalendarDays, CalendarPlus, ChevronLeft, Clock, MapPin, Share2 } from "lucide-react"
import { toast } from "sonner"

import { publishEvent } from "@/lib/publish-events"
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/floating-input"
import {
  PhoneAppHeader,
  PhoneBottomNav,
  PhoneChips,
  PhoneFrame,
  PhoneSkeletonCards,
  PreviewModeToggle,
} from "@/components/phone-frame"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const FIELD_CLASS =
  "h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"

const CARD_CLASS =
  "rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]"

function createInitialForm() {
  return {
    title: "",
    date: "",
    location: "",
    description: "",
  }
}

function parseDate(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function EventPublisher() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(createInitialForm)
  const [previewMode, setPreviewMode] = useState<"feed" | "event">("feed")

  const preview = useMemo(() => {
    const date = parseDate(form.date)
    return {
      dateLabel: date
        ? date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
        : "Event date",
      timeLabel: date ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Event time",
      monthSection: date
        ? date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
        : "Upcoming Events",
      monthShort: date ? date.toLocaleDateString(undefined, { month: "short" }).toUpperCase().slice(0, 3) : "MON",
      day: date ? String(date.getDate()) : "15",
    }
  }, [form.date])

  const title = form.title.trim() || "Your event title will appear here"
  const location = form.location.trim() || "ELIDZ STP, East London"

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

  const dateBadge = (
    <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#002147] text-white shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
      <span className="text-[8px] font-semibold tracking-wide text-[#f8a94f]">{preview.monthShort}</span>
      <span className="text-lg font-bold leading-none">{preview.day}</span>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className={`h-full min-w-0 gap-3 sm:gap-4 py-5 ${CARD_CLASS}`}>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Create Event</CardTitle>
            <CardDescription>
              Publish an event directly to the app&apos;s ELIDZ-STP events tab.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-3 sm:gap-4 px-4 sm:px-6">
            <div className="grid gap-3 md:grid-cols-2">
              <FloatingLabelInput
                id="title"
                name="title"
                label="Event Title"
                placeholder="e.g. ELIDZ Innovation Demo Day"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className={FIELD_CLASS}
                required
              />

              <FloatingLabelInput
                id="date"
                name="date"
                type="datetime-local"
                label="Event Date & Time"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className={FIELD_CLASS}
                required
              />
            </div>

            <FloatingLabelInput
              id="location"
              name="location"
              label="Location"
              placeholder="ELIDZ Innovation Centre, East London"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className={FIELD_CLASS}
            />

            <div className="flex flex-1 flex-col [&>div]:flex [&>div]:flex-1 [&>div]:flex-col [&>div>div]:flex-1 [&_textarea]:h-full">
              <FloatingLabelTextarea
                id="description"
                name="description"
                label="Description"
                placeholder="Describe what this event is about..."
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-[200px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="flex sm:justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-3xl border-0 bg-orange-100/80 px-6 text-sm sm:w-auto text-orange-800 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:bg-orange-200/80 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)] dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/50"
              >
                {loading ? "Publishing..." : "Publish Event"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex w-full min-w-0 flex-col lg:w-[380px]">
          <Card className={`h-full flex-1 gap-3 py-5 ${CARD_CLASS}`}>
            <CardHeader className="space-y-3 px-4 sm:px-6">
              <div>
                <CardTitle>Mobile Preview</CardTitle>
                <CardDescription className="mt-1.5">
                  See how the event looks in the app list and when opened.
                </CardDescription>
              </div>
              <PreviewModeToggle modes={["feed", "event"] as const} value={previewMode} onChange={setPreviewMode} />
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center px-2 pb-4 pt-1 sm:px-4">
              <PhoneFrame className="max-[359px]:-my-7 max-[359px]:scale-[0.88]">
                {previewMode === "feed" ? (
                  <div className="flex h-full flex-col">
                    <PhoneAppHeader
                      title="Events"
                      subtitle="Discover upcoming ELIDZ-STP events"
                      searchPlaceholder="Search events..."
                    />

                    <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-20 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <PhoneChips chips={["All", "This week", "Workshops", "Expos"]} />

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa3c0]">
                        {preview.monthSection}
                      </p>

                      <article
                        onClick={() => setPreviewMode("event")}
                        className="cursor-pointer overflow-hidden rounded-2xl bg-[#112846] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.75)] transition-transform hover:-translate-y-0.5"
                      >
                        <div className="relative flex h-24 items-end bg-gradient-to-br from-[#2d4a70] via-[#1a3254] to-[#5a3a1c] p-2.5">
                          <CalendarDays className="absolute right-3 top-3 size-10 text-white/10" />
                          <span className="absolute left-2 top-2 rounded-full bg-[#f38c1e] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide shadow-[0_3px_8px_rgba(0,0,0,0.5)]">
                            Upcoming
                          </span>
                          {dateBadge}
                        </div>
                        <div className="space-y-1.5 p-3">
                          <h3 className="line-clamp-2 text-[12px] font-bold leading-snug">{title}</h3>
                          <p className="flex items-center gap-1 text-[9px] text-[#f8a94f]">
                            <Clock className="size-2.5" />
                            {preview.dateLabel} · {preview.timeLabel}
                          </p>
                          <p className="flex items-center gap-1 text-[9px] text-[#8fa3c0]">
                            <MapPin className="size-2.5 shrink-0" />
                            <span className="line-clamp-1">{location}</span>
                          </p>
                          <p className="flex items-center gap-1 pt-0.5 text-[10px] font-semibold text-[#f38c1e]">
                            View details <ArrowRight className="size-3" />
                          </p>
                        </div>
                      </article>

                      <PhoneSkeletonCards />
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto pb-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="relative h-52 w-full bg-gradient-to-br from-[#2d4a70] via-[#1a3254] to-[#5a3a1c]">
                      <CalendarDays className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-white/10" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0a1628]" />
                      <div className="absolute inset-x-3 top-12 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setPreviewMode("feed")}
                          className="flex size-8 items-center justify-center rounded-full bg-black/40 shadow-[0_4px_10px_rgba(0,0,0,0.5)] backdrop-blur-md"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <span className="flex size-8 items-center justify-center rounded-full bg-black/40 shadow-[0_4px_10px_rgba(0,0,0,0.5)] backdrop-blur-md">
                          <Share2 className="size-3.5" />
                        </span>
                      </div>
                      <div className="absolute bottom-8 left-4">{dateBadge}</div>
                    </div>

                    <div className="relative -mt-6 space-y-3 rounded-t-3xl bg-[#0a1628] px-4 pt-5">
                      <span className="inline-block rounded-full bg-[#f38c1e]/15 px-2.5 py-1 text-[9px] font-semibold text-[#f8a94f] shadow-[0_3px_8px_rgba(0,0,0,0.4)]">
                        ELIDZ-STP Event
                      </span>
                      <h3 className="text-[15px] font-bold leading-snug">{title}</h3>

                      <div className="space-y-2">
                        {[
                          { icon: CalendarDays, text: preview.dateLabel },
                          { icon: Clock, text: preview.timeLabel },
                          { icon: MapPin, text: location },
                        ].map(({ icon: Icon, text }) => (
                          <div
                            key={text}
                            className="flex items-center gap-2 rounded-2xl bg-[#112846] px-2.5 py-2 text-[10px] text-[#c3d0e3] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.7)]"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f38c1e]/15 text-[#f8a94f]">
                              <Icon className="size-3" />
                            </span>
                            <span className="line-clamp-1">{text}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa3c0]">About this event</p>
                      <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#c3d0e3]">
                        {form.description.trim() || "Your event description will appear here as you type."}
                      </p>

                      <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#f38c1e] py-2 text-[10px] font-semibold shadow-[0_8px_18px_-6px_rgba(243,140,30,0.7)]">
                        <CalendarPlus className="size-3.5" />
                        Add to calendar
                      </div>
                    </div>
                  </div>
                )}

                <PhoneBottomNav activeLabel="Events" activeIcon={CalendarDays} />
              </PhoneFrame>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
