"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A donut chart with text"

type DonutDatum = {
  name: string
  value: number
  fill?: string
}

type ChartPieDonutTextProps = {
  title?: string
  description?: string
  totalLabel?: string
  data?: DonutDatum[]
  innerRadius?: number
  outerRadius?: number
  cardClassName?: string
  showFooter?: boolean
}

export function ChartPieDonutText({
  title = "Pie Chart - Donut with Text",
  description = "January - June 2024",
  totalLabel = "Total",
  data,
  innerRadius = 60,
  outerRadius = 80,
  cardClassName = "",
  showFooter = false,
}: ChartPieDonutTextProps) {
  // Default demo data (backward compatible)
  const fallbackData: DonutDatum[] = [
    { name: "Chrome", value: 275, fill: "var(--chart-1)" },
    { name: "Safari", value: 200, fill: "var(--chart-2)" },
    { name: "Firefox", value: 287, fill: "var(--chart-3)" },
    { name: "Edge", value: 173, fill: "var(--chart-4)" },
    { name: "Other", value: 190, fill: "var(--chart-5)" },
  ]

  const chartData: DonutDatum[] = data?.length ? data : fallbackData

  // Auto-generate chart config colors when not provided via fill
  const autoConfigColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]

  const computedData = chartData.map((d, i) => ({
    ...d,
    fill: d.fill || autoConfigColors[i % autoConfigColors.length],
  }))

  const total = React.useMemo(() => {
    return computedData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
  }, [computedData])

  // Build a minimal config so ChartContainer sets CSS vars for colors if needed
  const chartConfig = computedData.reduce((acc, curr, i) => {
    const key = `slice${i + 1}`
    ;(acc as any)[key] = { label: curr.name, color: curr.fill }
    return acc
  }, { visitors: { label: totalLabel } } as ChartConfig)

  return (
    <Card className={`flex flex-col ${cardClassName}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={computedData}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
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
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {totalLabel}
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
      {showFooter && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing totals for the last 6 months
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
