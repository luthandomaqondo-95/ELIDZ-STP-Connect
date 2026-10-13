import Link from "next/link"
import {
    Users,
    TrendingUp,
    Briefcase,
    BadgeCheck,
    ShieldAlert,
    ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard-page-header"

const reports = [
    {
        title: "User Demographics",
        description:
            "Understand your user base — role distribution, geographic spread across provinces, and month-by-month registration growth. Essential for measuring platform reach.",
        href: "/dashboard/reports/demographics",
        icon: Users,
        color: "bg-blue-50/90 dark:bg-blue-900/20",
        iconColor: "bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700/50",
        tags: ["User Growth", "Role Breakdown", "Geographic Distribution"],
    },
    {
        title: "Platform Engagement",
        description:
            "Track how users interact with the platform — visits to facilities, services, and products. Identify the most active facilities and peak engagement periods.",
        href: "/dashboard/reports/engagement",
        icon: TrendingUp,
        color: "bg-indigo-50/90 dark:bg-indigo-900/20",
        iconColor: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-700/50",
        tags: ["Visit Analytics", "Top Facilities", "Engagement Trends"],
    },
    {
        title: "Opportunities Pipeline",
        description:
            "Monitor the full opportunities funnel — total postings, active vs. closed, type breakdown, application volumes, and acceptance rates across all tenants.",
        href: "/dashboard/reports/opportunities",
        icon: Briefcase,
        color: "bg-amber-50/90 dark:bg-amber-900/20",
        iconColor: "bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50",
        tags: ["Opportunity Status", "Applications Funnel", "Tenant Activity"],
    },
    {
        title: "SMME & Business Directory",
        description:
            "Analyse the SMME ecosystem — verification rates, services and products by category, business growth trends, and the breakdown of active vs. pending listings.",
        href: "/dashboard/reports/smme",
        icon: BadgeCheck,
        color: "bg-emerald-50/90 dark:bg-emerald-900/20",
        iconColor: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/50",
        tags: ["Verified Businesses", "Services & Products", "Category Breakdown"],
    },
    {
        title: "Moderation & Safety",
        description:
            "Review platform safety health — message report volumes, resolution rates by status, top reported reasons, and monthly moderation workload trends.",
        href: "/dashboard/reports/moderation",
        icon: ShieldAlert,
        color: "bg-rose-50/90 dark:bg-rose-900/20",
        iconColor: "bg-rose-100 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-700/50",
        tags: ["Report Status", "Resolution Rate", "Monthly Trends"],
    },
]

export default function ReportsPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 pt-0">
            <DashboardPageHeader title="Reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                In-depth analytics across users, engagement, opportunities, SMMEs, and platform safety — the data investors and administrators need to assess ELIDZ STP Connect performance.
            </p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {reports.map((report) => {
                    const Icon = report.icon
                    return (
                        <Card
                            key={report.href}
                            className={`group flex flex-col rounded-3xl border-0 ${report.color} shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(249,115,22,0.18)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${report.iconColor}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold leading-tight">
                                            {report.title}
                                        </CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col gap-4">
                                <CardDescription className="text-sm leading-relaxed">
                                    {report.description}
                                </CardDescription>
                                <div className="flex flex-wrap gap-1.5">
                                    {report.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-auto pt-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="w-full rounded-2xl border-0 bg-white/80 shadow-sm hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80"
                                    >
                                        <Link href={report.href} className="flex items-center justify-center gap-2">
                                            View Report
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
