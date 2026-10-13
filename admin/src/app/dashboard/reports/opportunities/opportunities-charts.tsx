"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const STATUS_COLORS = ["#10b981", "#f43f5e"]
const TYPE_COLORS = ["#f59e0b", "#6366f1", "#10b981", "#f43f5e", "#8b5cf6", "#0ea5e9"]
const APP_STATUS_COLORS: Record<string, string> = {
    Pending: "#f59e0b",
    Accepted: "#10b981",
    Rejected: "#f43f5e",
}

const creationConfig = {
    opportunities: { label: "Opportunities", color: "#f59e0b" },
} satisfies ChartConfig

const appStatusConfig = {
    count: { label: "Applications", color: "#6366f1" },
} satisfies ChartConfig

interface OpportunitiesChartsProps {
    statusData: { name: string; value: number }[]
    typeData: { name: string; count: number }[]
    creationTrend: { month: string; opportunities: number }[]
    appStatusData: { name: string; count: number }[]
}

export function OpportunitiesCharts({
    statusData,
    typeData,
    creationTrend,
    appStatusData,
}: OpportunitiesChartsProps) {
    const total = statusData.reduce((s, d) => s + d.value, 0)

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Status donut */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Opportunity Status</CardTitle>
                    <CardDescription>
                        Active vs. closed opportunities
                        {total > 0 && <> — <strong>{total}</strong> total</>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] flex items-center justify-center">
                    {total === 0 ? (
                        <p className="text-sm text-muted-foreground">No opportunities posted yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={68}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {statusData.map((_, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v) => {
                                        const numericValue =
                                            typeof v === "number" ? v : Number(v ?? 0)
                                        return [numericValue.toLocaleString(), "Opportunities"]
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Opportunities by type */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>By Opportunity Type</CardTitle>
                    <CardDescription>Number of opportunities per category</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px]">
                    {typeData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeData} layout="vertical" margin={{ left: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(v) => {
                                        const numericValue =
                                            typeof v === "number" ? v : Number(v ?? 0)
                                        return [numericValue.toLocaleString(), "Opportunities"]
                                    }}
                                />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {typeData.map((_, i) => (
                                        <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Monthly creation trend */}
            <Card className="col-span-1 md:col-span-1 rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Monthly Creation Trend</CardTitle>
                    <CardDescription>New opportunities posted each month</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px]">
                    <ChartContainer config={creationConfig} className="h-full w-full">
                        <AreaChart data={creationTrend}>
                            <defs>
                                <linearGradient id="fillOpps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Area
                                dataKey="opportunities"
                                type="monotone"
                                fill="url(#fillOpps)"
                                stroke="#f59e0b"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Application status breakdown */}
            <Card className="col-span-1 md:col-span-1 rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Application Status Breakdown</CardTitle>
                    <CardDescription>Pending, accepted, and rejected applications</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px]">
                    {appStatusData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No applications received yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={appStatusData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    formatter={(v) => {
                                        const numericValue =
                                            typeof v === "number" ? v : Number(v ?? 0)
                                        return [numericValue.toLocaleString(), "Applications"]
                                    }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {appStatusData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={APP_STATUS_COLORS[entry.name] || TYPE_COLORS[i % TYPE_COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
