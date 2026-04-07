import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, CheckCircle2, Clock, Users } from "lucide-react"
import { OpportunitiesCharts } from "./opportunities-charts"

export default async function OpportunitiesPipelinePage() {
    const adminDb = createAdminClient()

    const [
        { data: opportunities },
        { data: applications },
    ] = await Promise.all([
        adminDb.from("opportunities").select("id, status, type, created_at"),
        adminDb.from("applications").select("id, opportunity_id, status, submitted_at"),
    ])

    const total = opportunities?.length || 0
    const active = opportunities?.filter((o) => o.status === "active" || o.status === "open").length || 0
    const closed = total - active
    const totalApplications = applications?.length || 0
    const acceptedApplications = applications?.filter((a) => a.status === "accepted").length || 0
    const acceptanceRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0

    // Opportunities by type
    const typeCounts: Record<string, number> = {}
    opportunities?.forEach((o) => {
        const t = o.type || "Unspecified"
        typeCounts[t] = (typeCounts[t] || 0) + 1
    })
    const typeData = Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

    // Status breakdown for donut
    const statusData = [
        { name: "Active", value: active },
        { name: "Closed", value: closed },
    ].filter((d) => d.value > 0)

    // Monthly opportunity creation trend
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyCreations: Record<string, number> = {}
    opportunities?.forEach((o) => {
        const month = new Date(o.created_at).toLocaleString("default", { month: "short" })
        monthlyCreations[month] = (monthlyCreations[month] || 0) + 1
    })
    const creationTrend = months.map((m) => ({ month: m, opportunities: monthlyCreations[m] || 0 }))

    // Application status breakdown
    const appStatusCounts: Record<string, number> = {}
    applications?.forEach((a) => {
        const s = a.status || "pending"
        appStatusCounts[s] = (appStatusCounts[s] || 0) + 1
    })
    const appStatusData = Object.entries(appStatusCounts)
        .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
        .sort((a, b) => b.count - a.count)

    const base = "rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
    const iconBox = "inline-flex h-8 w-8 items-center justify-center rounded-2xl"

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Opportunities Pipeline" backHref="/dashboard/reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Analyse the full opportunities funnel — from posting through to application and acceptance. Track which opportunity types attract the most interest and how the pipeline has grown over time.
            </p>

            {/* KPI cards */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <Card className={`${base} bg-amber-50/90 dark:bg-amber-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
                        <div className={`${iconBox} bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50`}>
                            <Briefcase className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{active} currently active</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-emerald-50/90 dark:bg-emerald-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                        <div className={`${iconBox} bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/50`}>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{active.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{closed} closed or inactive</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-blue-50/90 dark:bg-blue-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <div className={`${iconBox} bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700/50`}>
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApplications.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{acceptedApplications} accepted</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-indigo-50/90 dark:bg-indigo-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                        <div className={`${iconBox} bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-700/50`}>
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{acceptanceRate}%</div>
                        <p className="text-xs text-muted-foreground">Of all applications submitted</p>
                    </CardContent>
                </Card>
            </div>

            <OpportunitiesCharts
                statusData={statusData}
                typeData={typeData}
                creationTrend={creationTrend}
                appStatusData={appStatusData}
            />
        </div>
    )
}
