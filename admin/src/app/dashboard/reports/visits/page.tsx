"use client"

import * as React from "react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

const baseWeeklyTraffic = [
    { day: "Mon", visits: 120 },
    { day: "Tue", visits: 150 },
    { day: "Wed", visits: 180 },
    { day: "Thu", visits: 140 },
    { day: "Fri", visits: 200 },
    { day: "Sat", visits: 90 },
    { day: "Sun", visits: 60 },
]

const monthlyTrafficData = Object.fromEntries(
    MONTHS.map((month) => [month, baseWeeklyTraffic])
) as Record<string, { day: string; visits: number }[]>

export default function ProductLineVisitsPage() {
    const currentMonth = new Date().toLocaleString("en-US", { month: "long" })
    const [selectedMonth, setSelectedMonth] = React.useState(
        MONTHS.includes(currentMonth as (typeof MONTHS)[number]) ? currentMonth : "January"
    )

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Product Line Visits" backHref="/dashboard/reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Monitor daily product line traffic to identify peak engagement periods and support better operational planning.
            </p>
            <div className="grid gap-4">
                <ChartAreaInteractive
                    title="Daily Traffic"
                    description="Number of visits per day for the current week."
                    cardClassName="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] pt-0"
                    data={monthlyTrafficData[selectedMonth]}
                    xKey="day"
                    primaryKey="visits"
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
        </div>
    );
}
