"use client"

import * as React from "react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { AnalyticsCharts } from "../analytics/analytics-charts"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedTable } from "@/components/animated-table"
import { TableCell } from "@/components/ui/table"

const MONTHS = [
    "January",
    "February", 
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const

interface SystemUsageData {
    weeklyActivity: { day: string; activity: number }[]
    userDistribution: { name: string; count: number }[]
    totalUsers: number
    newUsersThisMonth: number
    totalFacilities: number
    totalServices: number
    totalProducts: number
    systemMetrics: {
        totalContent: number
        estimatedStorage: string
        contentGrowth: number
        avgUsersPerFacility: number
    }
    realData: boolean
}

const systemLogs = [
    {
        event: "Database Backup",
        details: "Completed successfully",
        status: "Success",
        timestamp: "2024-03-12 02:00:00",
    },
    {
        event: "Security Scan",
        details: "No threats detected",
        status: "Success",
        timestamp: "2024-03-11 23:15:00",
    },
    {
        event: "API Gateway",
        details: "Latency normalized",
        status: "Success",
        timestamp: "2024-03-11 19:42:00",
    },
    {
        event: "Storage Sync",
        details: "Replication completed",
        status: "Success",
        timestamp: "2024-03-11 16:08:00",
    },
    {
        event: "Service Health Check",
        details: "All systems operational",
        status: "Success",
        timestamp: "2024-03-11 09:30:00",
    },
]

export default function SystemUsagePage() {
    const currentMonth = new Date().toLocaleString("en-US", { month: "long" })
    const [selectedMonth, setSelectedMonth] = React.useState(
        MONTHS.includes(currentMonth as (typeof MONTHS)[number]) ? currentMonth : "January"
    )
    const [usageData, setUsageData] = React.useState<SystemUsageData | null>(null)
    const [loading, setLoading] = React.useState(true)

    // Fetch system usage data
    React.useEffect(() => {
        fetchUsageData()
    }, [selectedMonth])

    const fetchUsageData = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/analytics/system/usage?month=${selectedMonth}`)
            
            if (!response.ok) {
                throw new Error("Failed to fetch system usage data")
            }
            
            const data = await response.json()
            setUsageData(data)
        } catch (error) {
            console.error("Error fetching system usage data:", error)
            toast.error("Failed to load system usage data")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <DashboardPageHeader title="System Usage" backHref="/dashboard/reports" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading system usage data...</div>
                </div>
            </div>
        )
    }

    if (!usageData) {
        return (
            <div className="flex flex-1 flex-col gap-4 pt-0">
                <DashboardPageHeader title="System Usage" backHref="/dashboard/reports" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Failed to load system usage data</div>
                </div>
            </div>
        )
    }

    return (
        <>
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="System Usage" backHref="/dashboard/reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Monitor infrastructure health, resource consumption, and platform activity to maintain stable operations across ELIDZ systems.
                {usageData.realData ? " Showing real system data." : " Showing simulated system data."}
            </p>
            
            {/* System Overview Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{usageData.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+{usageData.newUsersThisMonth} this month</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{usageData.systemMetrics.totalContent}</div>
                        <p className="text-xs text-muted-foreground">Facilities, services & products</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{usageData.systemMetrics.estimatedStorage}</div>
                        <p className="text-xs text-muted-foreground">Estimated content storage</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Users per Facility</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{usageData.systemMetrics.avgUsersPerFacility}</div>
                        <p className="text-xs text-muted-foreground">Average engagement ratio</p>
                    </CardContent>
                </Card>
            </div>

            {/* User Activity Chart */}
            <div className="grid gap-4">
                <ChartAreaInteractive
                    title="User Activity"
                    description="Number of user registrations per day for the current week."
                    cardClassName="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] pt-0"
                    data={usageData.weeklyActivity}
                    xKey="day"
                    primaryKey="activity"
                    secondaryKey=""
                    showTimeRange={false}
                    forceAllTicks={true}
                    headerControl={
                        <div className="hidden sm:block w-[220px]">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="h-10 rounded-3xl border-orange-200/60 bg-white/80 shadow-sm dark:border-orange-800/40 dark:bg-slate-900/60">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    }
                />
            </div>

            {/* Analytics Charts */}
            <AnalyticsCharts 
                visitsByType={usageData.userDistribution}
                topEntities={usageData.userDistribution.slice(0, 10)}
            />
        </div>
        <style jsx>{`
            @keyframes wave {
                0%,
                60%,
                100% { transform: rotate(0deg); }
                10% { transform: rotate(14deg); }
                20% { transform: rotate(-8deg); }
                30% { transform: rotate(14deg); }
                40% { transform: rotate(-4deg); }
                50% { transform: rotate(10deg); }
            }
            @keyframes adminDrift {
                0%,
                100% { transform: translateX(0); }
                50% { transform: translateX(10px); }
            }
        `}</style>
    </>
    )
}
