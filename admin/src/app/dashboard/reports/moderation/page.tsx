import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Flag, ShieldAlert } from "lucide-react"
import { ModerationCharts } from "./moderation-charts"

export default async function ModerationSafetyPage() {
    const adminDb = createAdminClient()

    const { data: reports } = await adminDb
        .from("message_reports")
        .select("id, status, reason, created_at")
        .order("created_at", { ascending: false })

    const total = reports?.length || 0
    const pending = reports?.filter((r) => r.status === "pending").length || 0
    const reviewing = reports?.filter((r) => r.status === "reviewing").length || 0
    const resolved = reports?.filter((r) => r.status === "resolved").length || 0
    const dismissed = reports?.filter((r) => r.status === "dismissed").length || 0
    const resolutionRate =
        total > 0 ? Math.round(((resolved + dismissed) / total) * 100) : 0
    const actionRequired = pending + reviewing

    // Status breakdown for donut
    const statusData = [
        { name: "Pending", value: pending },
        { name: "Reviewing", value: reviewing },
        { name: "Resolved", value: resolved },
        { name: "Dismissed", value: dismissed },
    ].filter((d) => d.value > 0)

    // Reason breakdown
    const reasonCounts: Record<string, number> = {}
    reports?.forEach((r) => {
        const reason = r.reason || "Not specified"
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
    const reasonData = Object.entries(reasonCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

    // Monthly trend
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyReports: Record<string, number> = {}
    const monthlyResolved: Record<string, number> = {}
    reports?.forEach((r) => {
        const month = new Date(r.created_at).toLocaleString("default", { month: "short" })
        monthlyReports[month] = (monthlyReports[month] || 0) + 1
        if (r.status === "resolved" || r.status === "dismissed") {
            monthlyResolved[month] = (monthlyResolved[month] || 0) + 1
        }
    })
    const trendData = months.map((m) => ({
        month: m,
        reported: monthlyReports[m] || 0,
        resolved: monthlyResolved[m] || 0,
    }))

    const base = "rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
    const iconBox = "inline-flex h-8 w-8 items-center justify-center rounded-2xl"

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Moderation & Safety" backHref="/dashboard/reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Monitor the health and safety of the ELIDZ STP Connect platform. Track message report volumes, resolution rates, and the most commonly reported issues to maintain a trusted environment for users and businesses.
            </p>

            {/* KPI cards */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <Card className={`${base} bg-slate-50/90 dark:bg-slate-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <div className={`${iconBox} bg-slate-100 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800/40 dark:text-slate-200 dark:ring-slate-600/50`}>
                            <Flag className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All time message reports</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-rose-50/90 dark:bg-rose-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                        <div className={`${iconBox} bg-rose-100 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-700/50`}>
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{actionRequired.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{pending} pending · {reviewing} under review</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-emerald-50/90 dark:bg-emerald-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                        <div className={`${iconBox} bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/50`}>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resolutionRate}%</div>
                        <p className="text-xs text-muted-foreground">{resolved + dismissed} resolved or dismissed</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-amber-50/90 dark:bg-amber-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                        <div className={`${iconBox} bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50`}>
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reviewing.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Currently being reviewed</p>
                    </CardContent>
                </Card>
            </div>

            <ModerationCharts
                statusData={statusData}
                reasonData={reasonData}
                trendData={trendData}
            />
        </div>
    )
}
