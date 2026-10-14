"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Search, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { FILTER_ROW_CLASS } from "@/lib/utils"

interface OpportunityItem {
  id: string
  title: string
  description: string
  status: string
  type: string
  deadline?: string | null
  location?: string | null
}

const INFO_TILE_CLASS =
  "flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-100/80 px-1.5 py-1.5 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.4)] sm:gap-2 sm:px-2.5 sm:py-2 dark:bg-slate-800/70 dark:shadow-[0_6px_16px_-6px_rgba(0,0,0,0.85)]"
const INFO_ICON_CLASS =
  "flex size-6 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.25)] sm:size-7 dark:bg-slate-900 dark:shadow-[0_3px_10px_rgba(0,0,0,0.7)]"
const INFO_TEXT_CLASS = "min-w-0 truncate"

const OPPORTUNITY_FILTER_COLORS: Record<string, string> = {
  All: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80",
  Active: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/35 dark:text-emerald-200 dark:hover:bg-emerald-900/50",
  Inactive: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/35 dark:text-rose-200 dark:hover:bg-rose-900/50",
}

export function OpportunitiesList({ opportunities }: { opportunities: OpportunityItem[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (opp.title || "").toLowerCase().includes(q) ||
        (opp.description || "").toLowerCase().includes(q) ||
        (opp.type || "").toLowerCase().includes(q) ||
        (opp.location || "").toLowerCase().includes(q)

      const status = (opp.status || "").toLowerCase()
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && (status === "active" || status === "open")) ||
        (statusFilter === "Inactive" && status !== "active" && status !== "open")

      return matchesSearch && matchesStatus
    })
  }, [opportunities, searchQuery, statusFilter])

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
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
          {["All", "Active", "Inactive"].map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={`h-8 max-sm:h-8! shrink-0 rounded-3xl px-3 text-xs sm:h-9 sm:px-4 sm:text-sm border-0 shadow-[0_6px_14px_-4px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-6px_rgba(0,0,0,0.5)] dark:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.85)] dark:hover:shadow-[0_10px_20px_-6px_rgba(0,0,0,0.95)] ${
                statusFilter === status
                  ? "bg-orange-500 text-white hover:bg-orange-500/90"
                  : OPPORTUNITY_FILTER_COLORS[status]
              }`}
            >
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${statusFilter === status ? "bg-emerald-400" : "bg-zinc-400"}`} />
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {filtered.map((opp) => (
          <Card
            key={opp.id}
            className="group flex min-w-0 flex-col gap-2.5 overflow-hidden rounded-3xl border-0 py-3 sm:gap-6 sm:py-6 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.55),0_6px_14px_rgba(0,0,0,0.25)] dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]"
          >
            <CardHeader className="gap-1.5 px-3 sm:gap-3 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-1">
                <Badge
                  variant={opp.status === "active" || opp.status === "Active" ? "default" : "secondary"}
                  className={`px-1.5 text-[10px] sm:px-2 sm:text-xs ${opp.status === "active" || opp.status === "Active" ? "bg-emerald-600 text-white hover:bg-emerald-600" : "bg-red-600 text-white hover:bg-red-600"}`}
                >
                  {opp.status}
                </Badge>
                <span className="max-w-full truncate rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-orange-800 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.4)] sm:px-2.5 sm:py-1 sm:text-[11px] dark:bg-orange-900/40 dark:text-orange-200 dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.85)]">
                  {opp.type}
                </span>
              </div>
              <CardTitle className="line-clamp-2 text-sm leading-snug font-semibold tracking-tight text-slate-900 sm:line-clamp-1 sm:text-lg sm:leading-none dark:text-slate-100">
                {opp.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                {opp.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-3 sm:px-6">
              <div className="space-y-1.5 text-xs text-slate-600 sm:space-y-2.5 sm:text-sm dark:text-slate-300">
                <div className={INFO_TILE_CLASS}>
                  <span className={INFO_ICON_CLASS}>
                    <Calendar className="h-3.5 w-3.5 text-orange-600 dark:text-orange-300" />
                  </span>
                  <span className={INFO_TEXT_CLASS}>
                    <span className="max-sm:hidden">Deadline: </span>
                    {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "No deadline"}
                  </span>
                </div>
                <div className={INFO_TILE_CLASS}>
                  <span className={INFO_ICON_CLASS}>
                    <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
                  </span>
                  <span className={INFO_TEXT_CLASS}>{opp.location || "ELIDZ STP"}</span>
                </div>
                <div className={INFO_TILE_CLASS}>
                  <span className={INFO_ICON_CLASS}>
                    <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                  </span>
                  <span className={INFO_TEXT_CLASS}>{0} Applicants</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-3 sm:px-6">
              <AnimatedDashboardButton
                label="View Details"
                className="h-10 w-full rounded-3xl max-sm:px-3 max-sm:text-xs"
                onClick={() => router.push(`/dashboard/opportunities/${opp.id}`)}
              />
            </CardFooter>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p>No opportunities found.</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/dashboard/opportunities/create">Create your first opportunity</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

