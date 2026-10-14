"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
    Bar, 
    BarChart, 
    CartesianGrid, 
    Label,
    XAxis, 
    YAxis,
    PieChart,
    Pie,
    Legend
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { ChartPieDonutText } from "@/components/chart-pie-donut-text"
import { ChartBarLabelCustom } from "@/components/chart-bar-label-custom"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const growthChartConfig = {
    users: {
        label: "Users",
        color: "#16a34a",
    },
} satisfies ChartConfig

interface DemographicsChartsProps {
    roleData: { name: string; count: number }[]
    locationData: { name: string; count: number }[]
    growthData: { name: string; users: number }[]
    totalUsers: number
    showGeographic?: boolean
}

export function UserDemographicsCharts({ roleData, locationData, growthData, totalUsers, showGeographic = true }: DemographicsChartsProps) {
    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            {/* User Growth Chart */}
            <Card className="col-span-2 md:col-span-1 rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]">
                <CardHeader className="pb-1 md:pb-2">
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New user registrations over time (Total: {totalUsers})</CardDescription>
                </CardHeader>
                <CardContent className="h-[190px] px-2 sm:px-2 md:h-[240px] md:px-3">
                    <ChartContainer config={growthChartConfig} className="h-full w-full">
                        <BarChart data={growthData} margin={{ top: 5, right: 4, bottom: 0, left: 0 }} barCategoryGap="6%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} width={32} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="users" fill="var(--color-users)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            
            {/* User Roles Distribution */}
            <ChartPieDonutText
                title="User Roles"
                description="Distribution of user roles"
                totalLabel="Users"
                data={roleData.map(r => ({ name: r.name, value: r.count }))}
                innerRadius={70}
                outerRadius={105}
                cardClassName="col-span-2 md:col-span-1 rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]"
            />

            {showGeographic && <GeographicDistributionChart locationData={locationData} className="col-span-2" />}
        </div>
    )
}

export function GeographicDistributionChart({ locationData, className = "" }: { locationData: { name: string; count: number }[]; className?: string }) {
    return (
        <ChartBarLabelCustom
            title="Geographic Distribution"
            description="Top user locations (Provinces/Cities)"
            data={locationData}
            categoryKey="name"
            valueKey="count"
            tooltipIndicator="dot"
            cardClassName={`rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)] ${className}`}
            containerClassName="h-[230px] w-full"
            getBarFill={(entry, index) =>
                /north.*cape/i.test(String(entry.name))
                    ? "#f97316"
                    : /eastern.*cape/i.test(String(entry.name))
                        ? "#16a34a"
                        : COLORS[index % COLORS.length]
            }
        />
    )
}

