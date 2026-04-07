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

const VERIFICATION_COLORS: Record<string, string> = {
    Verified: "#10b981",
    Pending: "#f59e0b",
    Rejected: "#f43f5e",
}
const LISTING_COLORS = ["#6366f1", "#f59e0b"]
const CATEGORY_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#f43f5e", "#8b5cf6", "#0ea5e9", "#ec4899", "#14b8a6"]

const registrationConfig = {
    businesses: { label: "Businesses", color: "#10b981" },
} satisfies ChartConfig

interface SmmeChartsProps {
    verificationData: { name: string; value: number }[]
    categoryData: { name: string; count: number }[]
    listingTypeData: { name: string; value: number }[]
    registrationTrend: { month: string; businesses: number }[]
}

export function SmmeCharts({
    verificationData,
    categoryData,
    listingTypeData,
    registrationTrend,
}: SmmeChartsProps) {
    const totalSmmes = verificationData.reduce((s, d) => s + d.value, 0)
    const totalListings = listingTypeData.reduce((s, d) => s + d.value, 0)

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Verification breakdown donut */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>
                        SMME account verification breakdown
                        {totalSmmes > 0 && <> — <strong>{totalSmmes}</strong> registered</>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] flex items-center justify-center">
                    {totalSmmes === 0 ? (
                        <p className="text-sm text-muted-foreground">No SMME accounts registered yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={verificationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={68}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {verificationData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={VERIFICATION_COLORS[entry.name] || CATEGORY_COLORS[i]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Businesses"]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Services vs Products split */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Services vs Products</CardTitle>
                    <CardDescription>
                        Listing type split across the platform
                        {totalListings > 0 && <> — <strong>{totalListings}</strong> total</>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] flex items-center justify-center">
                    {totalListings === 0 ? (
                        <p className="text-sm text-muted-foreground">No services or products listed yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={listingTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={68}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {listingTypeData.map((_, i) => (
                                        <Cell key={i} fill={LISTING_COLORS[i % LISTING_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Listings"]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Category breakdown */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Top Categories</CardTitle>
                    <CardDescription>Most common service and product categories</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px]">
                    {categoryData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No category data available.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    width={110}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Listings"]} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Monthly SMME registration trend */}
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Business Registration Trend</CardTitle>
                    <CardDescription>Monthly SMME registrations on the platform</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px]">
                    <ChartContainer config={registrationConfig} className="h-full w-full">
                        <AreaChart data={registrationTrend}>
                            <defs>
                                <linearGradient id="fillBiz" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Area
                                dataKey="businesses"
                                type="monotone"
                                fill="url(#fillBiz)"
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
