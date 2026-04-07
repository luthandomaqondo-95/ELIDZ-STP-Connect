import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeCheck, Package, Store, Wrench } from "lucide-react"
import { SmmeCharts } from "./smme-charts"

export default async function SmmeBusinessPage() {
    const adminDb = createAdminClient()

    const [
        { data: smmeProfiles },
        { data: servicesProducts },
    ] = await Promise.all([
        // SMMEs are profiles with role SME or SMME
        adminDb
            .from("profiles")
            .select("id, verification_status, created_at, role, organization")
            .in("role", ["SME", "SMME"]),
        adminDb
            .from("smme_services_products")
            .select("id, type, category, status, created_at"),
    ])

    const total = smmeProfiles?.length || 0
    const verified = smmeProfiles?.filter((p) => p.verification_status === "verified").length || 0
    const pending = smmeProfiles?.filter((p) => p.verification_status === "pending").length || 0
    const rejected = smmeProfiles?.filter((p) => p.verification_status === "rejected").length || 0
    const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0

    const services = servicesProducts?.filter((s) => s.type === "Service") || []
    const products = servicesProducts?.filter((s) => s.type === "Product") || []
    const totalListings = servicesProducts?.length || 0
    const activeListings = servicesProducts?.filter((s) => s.status === "active").length || 0

    // Verification breakdown for donut
    const verificationData = [
        { name: "Verified", value: verified },
        { name: "Pending", value: pending },
        { name: "Rejected", value: rejected },
    ].filter((d) => d.value > 0)

    // Category breakdown (top 8)
    const categoryCounts: Record<string, number> = {}
    servicesProducts?.forEach((s) => {
        const cat = s.category || "Uncategorised"
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })
    const categoryData = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

    // Services vs Products split
    const listingTypeData = [
        { name: "Services", value: services.length },
        { name: "Products", value: products.length },
    ].filter((d) => d.value > 0)

    // Monthly SMME registration trend
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyRegistrations: Record<string, number> = {}
    smmeProfiles?.forEach((p) => {
        const month = new Date(p.created_at).toLocaleString("default", { month: "short" })
        monthlyRegistrations[month] = (monthlyRegistrations[month] || 0) + 1
    })
    const registrationTrend = months.map((m) => ({
        month: m,
        businesses: monthlyRegistrations[m] || 0,
    }))

    const base = "rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
    const iconBox = "inline-flex h-8 w-8 items-center justify-center rounded-2xl"

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="SMME & Business Directory" backHref="/dashboard/reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Measure the health of the ELIDZ SMME ecosystem — verification rates, services and products by category, active listing counts, and business registration growth over time. Key indicators for investors assessing economic impact.
            </p>

            {/* KPI cards */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <Card className={`${base} bg-emerald-50/90 dark:bg-emerald-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registered Businesses</CardTitle>
                        <div className={`${iconBox} bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/50`}>
                            <Store className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{verificationRate}% verification rate</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-blue-50/90 dark:bg-blue-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified SMMEs</CardTitle>
                        <div className={`${iconBox} bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700/50`}>
                            <BadgeCheck className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{verified.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{pending} pending review</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-indigo-50/90 dark:bg-indigo-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                        <div className={`${iconBox} bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-700/50`}>
                            <Wrench className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalListings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Services & products</p>
                    </CardContent>
                </Card>

                <Card className={`${base} bg-amber-50/90 dark:bg-amber-900/20`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                        <div className={`${iconBox} bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50`}>
                            <Package className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeListings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {services.length} services · {products.length} products
                        </p>
                    </CardContent>
                </Card>
            </div>

            <SmmeCharts
                verificationData={verificationData}
                categoryData={categoryData}
                listingTypeData={listingTypeData}
                registrationTrend={registrationTrend}
            />
        </div>
    )
}
