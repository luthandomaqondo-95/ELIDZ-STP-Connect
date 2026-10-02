"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Building2, MapPin, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import type { TenantRecord } from "@/lib/tenants"

export function TenantsList({ tenants }: { tenants: TenantRecord[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [industryFilter, setIndustryFilter] = useState("All")

  const industries = useMemo(() => {
    const values = Array.from(
      new Set(
        tenants
          .map((tenant) => tenant.industry?.trim())
          .filter((industry): industry is string => Boolean(industry))
      )
    ).sort((a, b) => a.localeCompare(b))
    return ["All", ...values]
  }, [tenants])

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return tenants.filter((tenant) => {
      const matchesSearch =
        (tenant.name || "").toLowerCase().includes(q) ||
        (tenant.description || "").toLowerCase().includes(q) ||
        (tenant.industry || "").toLowerCase().includes(q) ||
        (tenant.location || "").toLowerCase().includes(q)

      const matchesIndustry =
        industryFilter === "All" ||
        (tenant.industry || "").toLowerCase() === industryFilter.toLowerCase()

      return matchesSearch && matchesIndustry
    })
  }, [tenants, searchQuery, industryFilter])

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-2xl border-orange-200/60 bg-white/80 pl-10 shadow-sm dark:bg-slate-900/60 dark:border-orange-800/40"
          />
        </div>
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-orange-200/70 dark:border-orange-800/40" />
          </div>
          <div className="relative flex justify-start">
            <span className="rounded-full bg-background px-3 text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-300">
              Industry
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => (
            <Button
              key={industry}
              variant="ghost"
              size="sm"
              onClick={() => setIndustryFilter(industry)}
              className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
                industryFilter === industry
                  ? "bg-orange-500 text-white hover:bg-orange-500/90"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
              }`}
            >
              {industry}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No tenants match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tenant) => {
            const initials = (tenant.name || "T")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()

            return (
              <Card
                key={tenant.id}
                className="group flex flex-col overflow-hidden rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(249,115,22,0.22)] dark:bg-slate-900/75"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-2xl border border-border bg-white">
                      <AvatarImage src={tenant.logo_url || undefined} alt={tenant.name} className="object-contain" />
                      <AvatarFallback className="rounded-2xl bg-orange-100 text-orange-800">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="line-clamp-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {tenant.name}
                      </CardTitle>
                      <p className="text-xs font-medium uppercase tracking-wide text-orange-700 dark:text-orange-300">
                        {tenant.industry || "Uncategorised"}
                      </p>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {tenant.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{tenant.location || "ELIDZ-STP"}</span>
                  </div>
                  {tenant.facility_id && (
                    <div className="flex items-start gap-2">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{tenant.facility_id}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href={`/dashboard/tenants/${tenant.id}`} className="w-full">
                    <AnimatedDashboardButton label="View / Edit" className="w-full" />
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
