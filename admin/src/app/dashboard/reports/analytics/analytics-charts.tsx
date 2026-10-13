"use client"

import { ChartPieDonutText } from "@/components/chart-pie-donut-text"

const CARD_CLASS = "rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]"

interface AnalyticsChartsProps {
    visitsByType: { name: string; count: number }[]
    topEntities: { name: string; count: number }[]
}

export function AnalyticsCharts({ visitsByType, topEntities }: AnalyticsChartsProps) {
    return (
        <>
            <ChartPieDonutText
                title="Visits by Type"
                description="Distribution of visits across entity categories"
                totalLabel="Visits"
                data={visitsByType.map(v => ({ name: v.name, value: v.count }))}
                innerRadius={70}
                outerRadius={105}
                cardClassName={CARD_CLASS}
            />

            <ChartPieDonutText
                title="Top Visited Items"
                description="Most popular services and products"
                totalLabel="Visits"
                data={topEntities.map(e => ({ name: e.name, value: e.count }))}
                innerRadius={70}
                outerRadius={105}
                cardClassName={CARD_CLASS}
            />
        </>
    )
}
