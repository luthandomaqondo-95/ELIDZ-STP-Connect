import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Building2, Package, Wrench } from "lucide-react"
import { EngagementCharts } from "./engagement-charts"

export default async function PlatformEngagementPage() {
    const adminDb = createAdminClient()

    // Fetch total visits
    const { count: totalVisits } = await adminDb
        .from("analytics_visits")
        .select("*", { count: "exact", head: true })

    // Fetch visits broken down by entity_type
    const { data: visitsByType } = await adminDb
        .from("analytics_visits")
        .select("entity_type")

    // Fetch monthly visit trend (visited_at is the timestamp column)
    const { data: allVisits } = await adminDb
        .from("analytics_visits")
        .select("entity_type, visited_at")

    // Fetch facilities for naming context
    const { data: facilities } = await adminDb
        .from("facilities")
        .select("service_id, service_name")

    // Process entity_type counts
    const typeCounts: Record<string, number> = {}
    visitsByType?.forEach((v) => {
        const t = v.entity_type || "unknown"
        typeCounts[t] = (typeCounts[t] || 0) + 1
    })

    const facilityVisits = typeCounts["facility"] || 0
    const serviceVisits = typeCounts["service"] || 0
    const productVisits = typeCounts["product"] || 0

    // Build monthly trend (Jan–Dec)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyTrend: Record<string, { facility: number; service: number; product: number }> = {}
    months.forEach((m) => {
        monthlyTrend[m] = { facility: 0, service: 0, product: 0 }
    })

    allVisits?.forEach((v) => {
        const month = new Date(v.visited_at).toLocaleString("default", { month: "short" })
        if (monthlyTrend[month] !== undefined) {
            const type = v.entity_type as "facility" | "service" | "product"
            if (type in monthlyTrend[month]) {
                monthlyTrend[month][type]++
            }
        }
    })

    const trendData = months.map((m) => ({
        month: m,
        ...monthlyTrend[m],
    }))

    // Visit type breakdown for donut
    const typeBreakdown = Object.entries(typeCounts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: count,
    }))

    // Total facilities/services/products for context cards
    const { count: facilityCount } = await adminDb.from("facilities").select("*", { count: "exact", head: true })
    const { count: serviceCount } = await adminDb
        .from("smme_services_products")
        .select("*", { count: "exact", head: true })
        .eq("type", "Service")
    const { count: productCount } = await adminDb
        .from("smme_services_products")
        .select("*", { count: "exact", head: true })
        .eq("type", "Product")

    const base = "rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
    const iconBox = "inline-flex h-8 w-8 items-center justify-center rounded-2xl"

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Platform Engagement" backHref="/dashboard/reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Track how users interact with ELIDZ facilities, services, and products. Identify the most visited content types and observe monthly engagement trends to inform investment and content strategy.
            </p>

            {/* KPI cards */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <Card className={`${base} bg-indigo-50/90 dark:bg-indigo-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                        <div className={`${iconBox} bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-700/50`}>
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalVisits || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across all content types</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-blue-50/90 dark:bg-blue-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Facility Visits</CardTitle>
                        <div className={`${iconBox} bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700/50`}>
                            <Building2 className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{facilityVisits.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {facilityCount || 0} facilities listed
                        </p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-emerald-50/90 dark:bg-emerald-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Service Views</CardTitle>
                        <div className={`${iconBox} bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/50`}>
                            <Wrench className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{serviceVisits.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {serviceVisits === 0
                                ? `${serviceCount || 0} services listed — not yet browsed`
                                : `${serviceCount || 0} services available`}
                        </p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-amber-50/90 dark:bg-amber-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Product Views</CardTitle>
                        <div className={`${iconBox} bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50`}>
                            <Package className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productVisits.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {productVisits === 0
                                ? `${productCount || 0} products listed — not yet browsed`
                                : `${productCount || 0} products available`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <EngagementCharts trendData={trendData} typeBreakdown={typeBreakdown} />
        </div>
    )
}
