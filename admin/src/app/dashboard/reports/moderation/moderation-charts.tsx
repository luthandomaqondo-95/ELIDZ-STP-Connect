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
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const STATUS_COLORS: Record<string, string> = {
    Pending: "#f59e0b",
    Reviewing: "#6366f1",
    Resolved: "#10b981",
    Dismissed: "#94a3b8",
}
const REASON_COLORS = ["#f43f5e", "#f59e0b", "#6366f1", "#10b981", "#8b5cf6", "#0ea5e9", "#ec4899", "#14b8a6"]

const trendConfig = {
    reported: { label: "Reported", color: "#f43f5e" },
    resolved: { label: "Resolved", color: "#10b981" },
} satisfies ChartConfig

interface ModerationChartsProps {
    statusData: { name: string; value: number }[]
    reasonData: { name: string; count: number }[]
    trendData: { month: string; reported: number; resolved: number }[]
}

export function ModerationCharts({ statusData, reasonData, trendData }: ModerationChartsProps) {
    const total = statusData.reduce((s, d) => s + d.value, 0)

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Status donut */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Reports by Status</CardTitle>
                    <CardDescription>
                        Current moderation queue breakdown
                        {total > 0 && <> — <strong>{total}</strong> total</>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] flex items-center justify-center">
                    {total === 0 ? (
                        <p className="text-sm text-muted-foreground">No reports submitted yet.</p>
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
                                    {statusData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={STATUS_COLORS[entry.name] || REASON_COLORS[i]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Reports"]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Top reported reasons */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Top Report Reasons</CardTitle>
                    <CardDescription>Most common reasons users flag messages</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px]">
                    {reasonData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No report reasons recorded yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reasonData} layout="vertical" margin={{ left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    width={120}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Reports"]} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {reasonData.map((_, i) => (
                                        <Cell key={i} fill={REASON_COLORS[i % REASON_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Monthly reports vs resolved trend */}
            <Card className="col-span-1 md:col-span-2 rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Monthly Moderation Activity</CardTitle>
                    <CardDescription>
                        Reports submitted vs. reports resolved each month — a widening gap signals a growing backlog
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[260px]">
                    <ChartContainer config={trendConfig} className="h-full w-full">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="fillReported" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Area
                                dataKey="reported"
                                type="monotone"
                                fill="url(#fillReported)"
                                stroke="#f43f5e"
                                strokeWidth={2}
                            />
                            <Area
                                dataKey="resolved"
                                type="monotone"
                                fill="url(#fillResolved)"
                                stroke="#10b981"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
