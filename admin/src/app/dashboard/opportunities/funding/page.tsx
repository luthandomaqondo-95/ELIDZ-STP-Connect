"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Search, Banknote } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { FILTER_ROW_CLASS } from "@/lib/utils"

const funds = [
    {
        name: "SEFA SMME Fund",
        provider: "Small Enterprise Finance Agency",
        amount: "R50k - R5m",
        focus: "Small Business Development",
        status: "Open"
    },
    {
        name: "Technology Innovation Agency Seed Fund",
        provider: "TIA",
        amount: "Up to R1m",
        focus: "Tech Innovation",
        status: "Open"
    },
    {
        name: "NEF Women Empowerment Fund",
        provider: "National Empowerment Fund",
        amount: "R250k - R75m",
        focus: "Women-owned Businesses",
        status: "Open"
    },
    {
        name: "IDC Green Energy Fund",
        provider: "Industrial Development Corporation",
        amount: "Variable",
        focus: "Green Energy Projects",
        status: "Closed"
    },
]

const FUND_FILTER_COLORS: Record<string, string> = {
    All: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80",
    Open: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/35 dark:text-emerald-200 dark:hover:bg-emerald-900/50",
    Closed: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/35 dark:text-rose-200 dark:hover:bg-rose-900/50",
}

export default function FundingInfoPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    const filteredFunds = useMemo(() => {
        return funds.filter((fund) => {
            const q = searchQuery.toLowerCase()
            const matchesSearch =
                fund.name.toLowerCase().includes(q) ||
                fund.provider.toLowerCase().includes(q) ||
                fund.focus.toLowerCase().includes(q)

            const matchesStatus =
                statusFilter === "All" ||
                (statusFilter === "Open" && fund.status === "Open") ||
                (statusFilter === "Closed" && fund.status === "Closed")

            return matchesSearch && matchesStatus
        })
    }, [searchQuery, statusFilter])

    return (
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
            <DashboardPageHeader title="Funding Information" icon={<Banknote className="h-5 w-5" />} />
            <p className="text-muted-foreground">
                Available funding sources and grants for ELIDZ tenants and STP partners.
            </p>
            <div className="space-y-3">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search funding..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-3xl border-0 bg-white/80 pl-10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] dark:bg-slate-900/60 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]"
                    />
                </div>
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-orange-200/70 dark:border-orange-800/40" />
                    </div>
                    <div className="relative flex justify-start">
                        <span className="rounded-full bg-background px-3 text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-300">
                            Filters
                        </span>
                    </div>
                </div>
                <div className={FILTER_ROW_CLASS}>
                    {["All", "Open", "Closed"].map((status) => (
                        <Button
                            key={status}
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className={`h-8 max-sm:h-8! shrink-0 rounded-3xl px-3 text-xs sm:h-9 sm:px-4 sm:text-sm border-0 shadow-[0_6px_14px_-4px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-6px_rgba(0,0,0,0.5)] dark:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.85)] dark:hover:shadow-[0_10px_20px_-6px_rgba(0,0,0,0.95)] ${
                                statusFilter === status
                                    ? "bg-orange-500 text-white hover:bg-orange-500/90"
                                    : FUND_FILTER_COLORS[status]
                            }`}
                        >
                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${statusFilter === status ? "bg-emerald-400" : "bg-zinc-400"}`} />
                            {status}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                {filteredFunds.map((fund) => (
                    <Card key={fund.name} className="flex min-w-0 flex-col gap-2.5 overflow-hidden rounded-3xl border-0 py-3 sm:gap-6 sm:py-6 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]">
                        <CardHeader className="gap-1.5 px-3 pb-0 sm:gap-2 sm:px-6 sm:pb-2">
                            <div className="flex flex-col-reverse items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-2">
                                <CardTitle className="line-clamp-2 text-sm leading-snug sm:line-clamp-none sm:text-lg">{fund.name}</CardTitle>
                                <Badge
                                    variant={fund.status === "Open" ? "default" : "destructive"}
                                    className={`shrink-0 px-1.5 text-[10px] sm:px-2 sm:text-xs ${fund.status === "Open" ? "bg-emerald-600 text-white hover:bg-emerald-600" : "bg-red-600 text-white hover:bg-red-600"}`}
                                >
                                    {fund.status}
                                </Badge>
                            </div>
                            <CardDescription className="truncate text-xs sm:text-sm">{fund.provider}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col px-3 sm:px-6">
                            <div className="mb-2 flex min-w-0 items-center gap-1.5 sm:mb-4 sm:gap-2">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 shadow-[0_4px_10px_rgba(0,0,0,0.35)] sm:size-8 dark:bg-green-900/40 dark:shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                                    <DollarSign className="size-3.5 text-green-600 sm:size-4" />
                                </div>
                                <span className="min-w-0 truncate text-sm font-semibold sm:text-base">{fund.amount}</span>
                            </div>
                            <p className="mb-3 line-clamp-2 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
                                <span className="max-sm:hidden">Focus: </span>
                                {fund.focus}
                            </p>
                            <AnimatedDashboardButton
                                label="Visit Website"
                                className="mt-auto h-10 w-full rounded-3xl max-sm:px-3 max-sm:text-xs"
                            />
                        </CardContent>
                    </Card>
                ))}
                {filteredFunds.length === 0 && (
                    <div className="col-span-full flex items-center justify-center py-10 text-sm text-muted-foreground">
                        No funding entries found.
                    </div>
                )}
            </div>
        </div>
    );
}
