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
        <div className="grid gap-4 md:grid-cols-2 mt-4">
            {/* Visits by Type (Service vs Product) */}
            <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                    <CardTitle>Visits by Type</CardTitle>
                    <CardDescription>Comparison of Facilities vs Labs</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
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

            {/* Top Visited Entities */}
            <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                    <CardTitle>Top Visited Items</CardTitle>
                    <CardDescription>Most popular services and products</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
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

