import * as React from "react"
import {
    Activity,
    BriefcaseBusiness,
    UsersRound,
    CalendarCheck,
    BadgeCheck,
    MessageSquareWarning,
    FileBarChart2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import Link from "next/link"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

export default async function Page() {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    // Resolve current user display name
    const { data: auth } = await supabase.auth.getUser()
    let displayName = "there"
    if (auth?.user?.id) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", auth.user.id)
            .single()
        displayName = (profile?.name || auth.user.email || "there").split(" ")[0]
    }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

    // Fetch all KPI data in parallel
    const [
        { count: totalUsers },
        { count: newUsersThisMonth },
        { count: newUsersLastMonth },
        { count: activeOpportunities },
        { count: totalVisits },
        { count: verifiedSmmesCount },
        { count: pendingApplications },
        { count: pendingReports },
        { data: allProfiles },
    ] = await Promise.all([
        adminDb.from("profiles").select("*", { count: "exact", head: true }),
        adminDb.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thisMonthStart),
        adminDb.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd),
        adminDb.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "active"),
        adminDb.from("analytics_visits").select("*", { count: "exact", head: true }),
        adminDb.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
        adminDb.from("applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        adminDb.from("message_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        adminDb.from("profiles").select("created_at"),
    ])

    // Build monthly registration trend
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const trendData: Record<string, number> = {}
    allProfiles?.forEach((p) => {
        const month = new Date(p.created_at).toLocaleString("default", { month: "short" })
        trendData[month] = (trendData[month] || 0) + 1
    })
    const registrationTrend = months.map((m) => ({ month: m, registrations: trendData[m] || 0 }))

    // Month-over-month growth
    const userGrowth =
        newUsersLastMonth && newUsersLastMonth > 0
            ? Math.round((((newUsersThisMonth || 0) - newUsersLastMonth) / newUsersLastMonth) * 100)
            : null

    const base =
        "rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
    const iconBox = "inline-flex h-8 w-8 items-center justify-center rounded-2xl"

    return (
        <>
            {/* Welcome banner */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-800 via-orange-200/15 to-cyan-900 text-white px-5 md:px-6 py-2 md:py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/15">
                        <Image
                            src="/user.jpg"
                            alt="Profile"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold tracking-tight leading-none">
                            <span className="italic text-orange-100">Welcome back,</span>{" "}
                            <span className="bg-gradient-to-r from-orange-300 to-emerald-300 bg-clip-text text-transparent">
                                {displayName}
                            </span>{" "}
                            <span aria-hidden className="inline-block origin-[70%_70%] animate-[wave_1.8s_ease-in-out_infinite]">
                                👋
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-white/80 flex items-center gap-2 translate-y-[6px] md:translate-y-[8px]">
                            <CalendarCheck className="h-4 w-4 text-emerald-300" />
                            Platform snapshot — key metrics across all ELIDZ systems.
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex self-stretch items-end">
                    <Image
                        src="/admin.png"
                        alt="Admin illustration"
                        width={224}
                        height={120}
                        className="block h-24 w-56 object-contain object-bottom animate-[adminDrift_4s_ease-in-out_infinite]"
                        priority
                    />
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-sm italic text-muted-foreground">
                    Real-time overview of ELIDZ STP Connect.{" "}
                    <Link
                        href="/dashboard/reports"
                        className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700 dark:text-orange-400"
                    >
                        View detailed reports →
                    </Link>
                </p>

                {/* KPI grid — 2 cols on mobile, 3 on desktop */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                    {/* Total Users */}
                    <Card className={`${base} bg-blue-50/90 dark:bg-blue-900/20`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <div className={`${iconBox} bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700/50`}>
                                <UsersRound className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(totalUsers || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {newUsersThisMonth || 0} joined this month
                                {userGrowth !== null && (
                                    <span className={userGrowth >= 0 ? " text-emerald-600" : " text-red-500"}>
                                        {" "}· {userGrowth >= 0 ? "↑" : "↓"}{Math.abs(userGrowth)}% vs last
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Opportunities */}
                    <Card className={`${base} bg-amber-50/90 dark:bg-amber-900/20`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
                            <div className={`${iconBox} bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50`}>
                                <BriefcaseBusiness className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(activeOpportunities || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Open for applications</p>
                        </CardContent>
                    </Card>

                    {/* Verified SMMEs */}
                    <Card className={`${base} bg-emerald-50/90 dark:bg-emerald-900/20`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Verified SMMEs</CardTitle>
                            <div className={`${iconBox} bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/50`}>
                                <BadgeCheck className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(verifiedSmmesCount || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Verified businesses on platform</p>
                        </CardContent>
                    </Card>

                    {/* Platform Visits */}
                    <Card className={`${base} bg-indigo-50/90 dark:bg-indigo-900/20`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Visits</CardTitle>
                            <div className={`${iconBox} bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-700/50`}>
                                <Activity className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(totalVisits || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Facility, service & product views</p>
                        </CardContent>
                    </Card>

                    {/* Pending Applications */}
                    <Card className={`${base} bg-orange-50/90 dark:bg-orange-900/20`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                            <div className={`${iconBox} bg-orange-100 text-orange-700 ring-1 ring-orange-300 dark:bg-orange-900/40 dark:text-orange-200 dark:ring-orange-700/50`}>
                                <FileBarChart2 className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(pendingApplications || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Opportunity applications to review</p>
                        </CardContent>
                    </Card>

                    {/* Moderation Queue */}
                    <Card className={`${base} bg-rose-50/90 dark:bg-rose-900/20`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Moderation Queue</CardTitle>
                            <div className={`${iconBox} bg-rose-100 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-700/50`}>
                                <MessageSquareWarning className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(pendingReports || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Chat reports pending review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Registration trend */}
                <ChartAreaInteractive
                    title="User Registration Trend"
                    description="Monthly new user registrations across the platform"
                    cardClassName="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] pt-0"
                    data={registrationTrend}
                    xKey="month"
                    primaryKey="registrations"
                    secondaryKey=""
                    showTimeRange={false}
                    forceAllTicks={true}
                />
            </div>

            <style>{`
                @keyframes wave {
                    0%, 60%, 100% { transform: rotate(0deg); }
                    10% { transform: rotate(14deg); }
                    20% { transform: rotate(-8deg); }
                    30% { transform: rotate(14deg); }
                    40% { transform: rotate(-4deg); }
                    50% { transform: rotate(10deg); }
                }
                @keyframes adminDrift {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(10px); }
                }
            `}</style>
        </>
    )
}
