import { Suspense } from "react"
import { CalendarDays } from "lucide-react"

import { EventPublisher, PublishedEventsList } from "@/components/communication/publish-ui"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublishedEventsForAdmin } from "@/lib/publish-events"

function PublishedEventsListFallback() {
  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-[#040c20] p-6 shadow-[0_20px_45px_rgba(2,10,30,0.45)]">
      <Skeleton className="mb-2 h-6 w-56 rounded-lg bg-slate-700/80" />
      <Skeleton className="mb-6 h-4 max-w-xl rounded-lg bg-slate-700/60" />
      <Skeleton className="mb-3 h-12 w-full rounded-full bg-slate-700/70" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56 rounded-3xl bg-slate-700/50" />
        <Skeleton className="h-56 rounded-3xl bg-slate-700/50" />
      </div>
    </div>
  )
}

async function PublishedEventsSection() {
  const items = await getPublishedEventsForAdmin()
  return <PublishedEventsList items={items} />
}

export default function EventsManagementPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader title="Publish Events" icon={<CalendarDays className="h-5 w-5" />} />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Add mobile event updates for the ELIDZ Science and Technology Park app and track RSVPs.
      </p>
      <EventPublisher />
      <Suspense fallback={<PublishedEventsListFallback />}>
        <PublishedEventsSection />
      </Suspense>
    </div>
  )
}
