import { Suspense } from "react"
import { CalendarDays } from "lucide-react"

import { EventPublisher, PublishedEventsList } from "@/components/communication/publish-ui"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublishedEventsForAdmin } from "@/lib/events"

function PublishedEventsListFallback() {
  return (
    <div className="rounded-3xl border-0 bg-white/90 p-6 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
      <Skeleton className="mb-2 h-6 w-56 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <Skeleton className="mb-6 h-4 max-w-xl rounded-lg bg-slate-200 dark:bg-slate-700" />
      <Skeleton className="mb-3 h-11 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-700" />
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
