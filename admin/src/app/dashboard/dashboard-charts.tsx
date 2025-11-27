"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Mock data for charts that don't have schema support yet
const chartDataUserGrowth = [
  { region: "East London", users: 186 },
  { region: "Port Elizabeth", users: 305 },
  { region: "Mthatha", users: 237 },
  { region: "Bhisho", users: 73 },
  { region: "Other", users: 209 },
]

const chartConfigUserGrowth = {
  users: {
    label: "Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const chartDataServices = [
  { service: "Food & Water Lab", visitors: 450, fill: "var(--color-fw)" },
  { service: "Renewable Energy", visitors: 320, fill: "var(--color-re)" },
  { service: "Design Centre", visitors: 210, fill: "var(--color-dc)" },
  { service: "Automotive Incubator", visitors: 150, fill: "var(--color-ai)" },
]

const chartConfigServices = {
  visitors: {
    label: "Visitors",
  },
  fw: {
    label: "Food & Water Lab",
    color: "var(--chart-1)",
  },
  re: {
    label: "Renewable Energy",
    color: "var(--chart-2)",
  },
  dc: {
    label: "Design Centre",
    color: "var(--chart-3)",
  },
  ai: {
    label: "Automotive Incubator",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function DashboardCharts() {
    const totalVisitors = React.useMemo(() => {
        return chartDataServices.reduce((acc, curr) => acc + curr.visitors, 0)
    }, [])

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>User Registrations</CardTitle>
                    <CardDescription>User growth by region for the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigUserGrowth} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartDataUserGrowth}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="region"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value: string) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="users" fill="var(--color-users)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Showing total visitors for the last 6 months
                    </div>
                </CardFooter>
            </Card>

            <Card className="col-span-3">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Popular Services</CardTitle>
                    <CardDescription>Most visited product lines this month.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer
                        config={chartConfigServices}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartDataServices}
                                dataKey="visitors"
                                nameKey="service"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                <Label
                                    content={({ viewBox }: { viewBox: { cx: number; cy: number } }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalVisitors.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        Visitors
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none">
                        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Showing total visitors for the last 6 months
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

