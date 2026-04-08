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
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const TYPE_COLORS = ["#6366f1", "#10b981", "#f59e0b"]

const trendChartConfig = {
    facility: { label: "Facilities", color: "#6366f1" },
    service: { label: "Services", color: "#10b981" },
    product: { label: "Products", color: "#f59e0b" },
} satisfies ChartConfig

interface EngagementChartsProps {
    trendData: { month: string; facility: number; service: number; product: number }[]
    typeBreakdown: { name: string; value: number }[]
}

export function EngagementCharts({ trendData, typeBreakdown }: EngagementChartsProps) {
    const total = typeBreakdown.reduce((s, d) => s + d.value, 0)

    // Only render bars for types that have at least 1 visit
    const hasServiceVisits = trendData.some((d) => d.service > 0)
    const hasProductVisits = trendData.some((d) => d.product > 0)

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Monthly visit trend */}
            <Card className="col-span-2 md:col-span-1 rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Monthly Visit Trend</CardTitle>
                    <CardDescription>
                        {hasServiceVisits || hasProductVisits
                            ? "Visits to facilities, services, and products by month"
                            : "Facility visits by month — service & product browsing not yet recorded"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                    <ChartContainer config={trendChartConfig} className="h-full w-full">
                        <BarChart data={trendData} barCategoryGap="25%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="facility" stackId="a" fill="var(--color-facility)" radius={[6, 6, 0, 0]} />
                            {hasServiceVisits && (
                                <Bar dataKey="service" stackId="a" fill="var(--color-service)" radius={[0, 0, 0, 0]} />
                            )}
                            {hasProductVisits && (
                                <Bar dataKey="product" stackId="a" fill="var(--color-product)" radius={[6, 6, 0, 0]} />
                            )}
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Visit type donut */}
            <Card className="col-span-2 md:col-span-1 rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-2">
                    <CardTitle>Visits by Content Type</CardTitle>
                    <CardDescription>
                        Proportion of visits across facilities, services, and products
                        {total > 0 && <> — <strong>{total.toLocaleString()}</strong> total</>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] flex items-center justify-center">
                    {total === 0 ? (
                        <p className="text-sm text-muted-foreground">No visit data recorded yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={72}
                                    outerRadius={105}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => {
                                        const safePercent = (percent ?? 0) * 100
                                        return `${name} ${safePercent.toFixed(0)}%`
                                    }}
                                    labelLine={false}
                                >
                                    {typeBreakdown.map((_, index) => (
                                        <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => {
                                        const numericValue =
                                            typeof value === "number"
                                                ? value
                                                : Number(value ?? 0)
                                        return [numericValue.toLocaleString(), "Visits"]
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
