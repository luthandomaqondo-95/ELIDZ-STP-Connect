import { Suspense } from "react"
import { Newspaper } from "lucide-react"

import { NewsPublisher, PublishedNewsList } from "@/components/communication/publish-ui"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublishedNewsForAdmin } from "@/lib/news"

function PublishedNewsListFallback() {
  return (
    <div className="rounded-3xl border-0 bg-white/90 p-6 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
      <Skeleton className="mb-2 h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <Skeleton className="mb-6 h-4 max-w-xl rounded-lg bg-slate-200 dark:bg-slate-700" />
      <Skeleton className="mb-3 h-11 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-700" />
        <Skeleton className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}

async function PublishedNewsSection() {
  const items = await getPublishedNewsForAdmin()
  return <PublishedNewsList items={items} />
}

export default function PublishNewsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader title="Publish News" icon={<Newspaper className="h-5 w-5" />} />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Add mobile news updates for the ELIDZ Science and Technology Park app. Articles are saved
        to Supabase and then shown in the app&apos;s news tab.
      </p>
      <NewsPublisher />
      <Suspense fallback={<PublishedNewsListFallback />}>
        <PublishedNewsSection />
      </Suspense>
    </div>
  )
}
