import { Suspense } from "react"
import { Newspaper } from "lucide-react"

import { NewsPublisher, PublishedNewsList } from "@/components/communication/publish-ui"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublishedNewsForAdmin } from "@/lib/publish-news"

function PublishedNewsListFallback() {
  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-[#040c20] p-6 shadow-[0_20px_45px_rgba(2,10,30,0.45)]">
      <Skeleton className="mb-2 h-6 w-48 rounded-lg bg-slate-700/80" />
      <Skeleton className="mb-6 h-4 max-w-xl rounded-lg bg-slate-700/60" />
      <Skeleton className="mb-3 h-12 w-full rounded-full bg-slate-700/70" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-3xl bg-slate-700/50" />
        <Skeleton className="h-48 rounded-3xl bg-slate-700/50" />
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
