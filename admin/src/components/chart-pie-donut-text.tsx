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
import { cn } from "@/lib/utils"

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
  chartClassName?: string
  showFooter?: boolean
  showLegend?: boolean
}

export function ChartPieDonutText({
  title = "Pie Chart - Donut with Text",
  description = "January - June 2024",
  totalLabel = "Total",
  data,
  innerRadius = 60,
  outerRadius = 80,
  cardClassName = "",
  chartClassName = "",
  showFooter = false,
  showLegend = true,
}: ChartPieDonutTextProps) {
  // Default demo data (backward compatible)
  const fallbackData: DonutDatum[] = [
    { name: "Chrome", value: 275, fill: "var(--chart-1)" },
    { name: "Safari", value: 200, fill: "var(--chart-2)" },
    { name: "Firefox", value: 287, fill: "var(--chart-3)" },
    { name: "Edge", value: 173, fill: "var(--chart-4)" },
    { name: "Other", value: 190, fill: "var(--chart-5)" },
  ]

  const chartData: DonutDatum[] = data ?? fallbackData

  // Auto-generate chart config colors when not provided via fill
  const autoConfigColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]

  // Slice ids keep config keys CSS-safe, since names may contain spaces
  const computedData = chartData.map((d, i) => ({
    ...d,
    slice: `slice${i + 1}`,
    fill: d.fill || autoConfigColors[i % autoConfigColors.length],
  }))

  const total = React.useMemo(() => {
    return computedData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
  }, [computedData])

  const chartConfig = computedData.reduce((acc, curr) => {
    ;(acc as any)[curr.slice] = { label: curr.name, color: curr.fill }
    return acc
  }, { value: { label: totalLabel } } as ChartConfig)

  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const CHART_HEIGHT = 230
  const maxFit = width ? Math.min(width, CHART_HEIGHT) / 2 - 4 : outerRadius
  const outer = Math.max(40, Math.min(outerRadius, maxFit))
  const inner = innerRadius > 0 ? Math.round((outer * innerRadius) / outerRadius) : 0

  return (
    <Card className={cn("@container flex flex-col", cardClassName)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center gap-4 pb-0 @[22rem]:flex-row">
        <div ref={wrapperRef} className="w-full min-w-0 flex-1">
        <ChartContainer
          config={chartConfig}
          className={cn("mx-auto aspect-auto h-[230px] w-full max-w-[230px]", chartClassName)}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="slice" hideLabel />}
            />
            <Pie
              data={computedData}
              dataKey="value"
              nameKey="slice"
              innerRadius={inner}
              outerRadius={outer}
              paddingAngle={inner > 0 ? 2 : 0}
              cornerRadius={inner > 0 ? 4 : 0}
              stroke="var(--card)"
              strokeWidth={inner > 0 ? 2 : 3}
            >
              {inner > 0 && <Label
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
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-muted-foreground text-sm"
                        >
                          {totalLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />}
            </Pie>
          </PieChart>
        </ChartContainer>
        </div>
        {showLegend && (
          <ul className="flex w-full shrink-0 flex-col gap-2.5 text-sm @[22rem]:w-[42%] @[22rem]:max-w-[220px]">
            {computedData.map((d) => (
              <li key={d.slice} className="flex items-start gap-2">
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-[3px]"
                  style={{ backgroundColor: d.fill }}
                />
                <span className="min-w-0 flex-1 break-words leading-snug text-foreground">{d.name}</span>
                <span className="font-semibold tabular-nums text-foreground">{Number(d.value).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
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
