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

interface OpportunityItem {
  id: string
  title: string
  description: string
  status: string
  type: string
  deadline?: string | null
  location?: string | null
}

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
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
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
          {["All", "Active", "Inactive"].map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
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

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((opp) => (
          <Card
            key={opp.id}
            className="group flex flex-col overflow-hidden rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(249,115,22,0.22)] dark:bg-slate-900/75"
          >
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-start justify-between">
                <Badge
                  variant={opp.status === "active" || opp.status === "Active" ? "default" : "secondary"}
                  className={opp.status === "active" || opp.status === "Active" ? "bg-emerald-600 text-white hover:bg-emerald-600" : "bg-red-600 text-white hover:bg-red-600"}
                >
                  {opp.status}
                </Badge>
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                  {opp.type}
                </span>
              </div>
              <CardTitle className="line-clamp-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {opp.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {opp.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-2 dark:bg-slate-800/70">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  <span>Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "No deadline"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-2 dark:bg-slate-800/70">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  <span>{opp.location || "ELIDZ STP"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-2 dark:bg-slate-800/70">
                  <Users className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  <span>{0} Applicants</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-1">
              <AnimatedDashboardButton
                label="View Details"
                className="h-10 w-full rounded-3xl"
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

