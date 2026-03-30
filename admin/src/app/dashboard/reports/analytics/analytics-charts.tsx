"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const TYPE_COLORS = ['#8884d8', '#82ca9d', '#FFBB28', '#0088FE'];

interface AnalyticsChartsProps {
    visitsByType: { name: string; count: number }[]
    topEntities: { name: string; count: number }[]
}

export function AnalyticsCharts({ visitsByType, topEntities }: AnalyticsChartsProps) {
    return (
        <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* User Distribution by Role */}
            <Card className="col-span-2 rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm md:col-span-1 dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-1 md:pb-2">
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Distribution of users across different roles.</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={visitsByType}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="count"
                            >
                                {visitsByType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top System Entities */}
            <Card className="col-span-2 rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm md:col-span-1 dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="pb-1 md:pb-2">
                    <CardTitle>Top Visited Items</CardTitle>
                    <CardDescription>Most popular services and products</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={topEntities}
                                cx="50%"
                                cy="50%"
                                innerRadius={0} // Full pie for variety
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="count"
                            >
                                {topEntities.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

