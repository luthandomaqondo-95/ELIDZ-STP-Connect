import { Suspense } from "react"
import { ShieldAlert } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { UserReportsTable } from "@/components/users/reports-ui"
import { Skeleton } from "@/components/ui/skeleton"
import { getMessageReportsForAdmin } from "@/lib/message-reports"

function ReportsTableFallback() {
  return (
    <div className="rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/30 via-white to-white p-4 dark:border-orange-800/40 dark:from-orange-950/20 dark:via-slate-900 dark:to-slate-900">
      <Skeleton className="mb-3 h-11 w-full rounded-3xl bg-slate-200/70 dark:bg-slate-700/60" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-16 rounded-3xl bg-slate-200/70 dark:bg-slate-700/60" />
        <Skeleton className="h-9 w-24 rounded-3xl bg-slate-200/70 dark:bg-slate-700/60" />
        <Skeleton className="h-9 w-24 rounded-3xl bg-slate-200/70 dark:bg-slate-700/60" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl bg-slate-200/70 dark:bg-slate-700/50" />
    </div>
  )
}

async function ReportsSection() {
  const items = await getMessageReportsForAdmin()
  return <UserReportsTable reports={items} />
}

export default function UserMessageReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-0 md:px-0 py-0 pt-0">
      <DashboardPageHeader title="Message Reports" icon={<ShieldAlert className="h-5 w-5" />} />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Review user-submitted chat reports, track abuse trends, and update moderation status.
      </p>
      <Suspense fallback={<ReportsTableFallback />}>
        <ReportsSection />
      </Suspense>
    </div>
  )
}

