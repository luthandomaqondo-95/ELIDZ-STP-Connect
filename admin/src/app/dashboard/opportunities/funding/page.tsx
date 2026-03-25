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
import { DollarSign, Search } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"

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
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Funding Information" backHref="/dashboard/opportunities" />
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
                        className="h-11 rounded-3xl border-orange-200/60 bg-white/80 pl-10 shadow-sm dark:bg-slate-900/60 dark:border-orange-800/40"
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
                <div className="flex flex-wrap gap-2">
                    {["All", "Open", "Closed"].map((status) => (
                        <Button
                            key={status}
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFunds.map((fund) => (
                    <Card key={fund.name} className="rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{fund.name}</CardTitle>
                                <Badge
                                    variant={fund.status === "Open" ? "default" : "destructive"}
                                    className={fund.status === "Open" ? "bg-emerald-600 text-white hover:bg-emerald-600" : "bg-red-600 text-white hover:bg-red-600"}
                                >
                                    {fund.status}
                                </Badge>
                            </div>
                            <CardDescription>{fund.provider}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="font-semibold">{fund.amount}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Focus: {fund.focus}
                            </p>
                            <AnimatedDashboardButton
                                label="Visit Website"
                                className="h-10 w-full rounded-3xl"
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
