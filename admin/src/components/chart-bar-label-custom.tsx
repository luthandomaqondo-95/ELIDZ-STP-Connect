"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A bar chart with a custom label"

type DefaultBarDatum = {
  month: string
  desktop: number
  mobile?: number
}

const chartData: DefaultBarDatum[] = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

interface ChartBarLabelCustomProps<T extends Record<string, any> = DefaultBarDatum> {
  title?: string
  description?: string
  data?: T[]
  categoryKey?: keyof T & string
  valueKey?: keyof T & string
  cardClassName?: string
  containerClassName?: string
  tooltipIndicator?: "line" | "dot" | "dashed"
  getBarFill?: (item: T, index: number) => string
}

export function ChartBarLabelCustom<T extends Record<string, any> = DefaultBarDatum>({
  title = "Bar Chart - Custom Label",
  description = "January - June 2024",
  data,
  categoryKey = "month" as keyof T & string,
  valueKey = "desktop" as keyof T & string,
  cardClassName = "",
  containerClassName = "",
  tooltipIndicator = "line",
  getBarFill,
}: ChartBarLabelCustomProps<T>) {
  const resolvedData = (data?.length ? data : (chartData as unknown as T[]))

  return (
    <Card className={cardClassName}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={containerClassName}>
          <BarChart
            accessibilityLayer
            data={resolvedData}
            layout="vertical"
            barCategoryGap="8%"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey={categoryKey}
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey={valueKey} type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator={tooltipIndicator} />}
            />
            <Bar dataKey={valueKey} fill="var(--color-desktop)" radius={[0, 24, 24, 0]} barSize={28}>
              {resolvedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarFill ? getBarFill(entry, index) : "var(--color-desktop)"}
                />
              ))}
              <LabelList
                dataKey={categoryKey}
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey={valueKey}
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
