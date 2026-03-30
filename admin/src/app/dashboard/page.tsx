import * as React from "react"
import { Activity, BriefcaseBusiness, UsersRound, CalendarCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserDemographicsCharts } from "./reports/demographics/demographics-charts"

export default async function Page() {
    const supabase = await createClient()
    
    // Resolve current user display name
    const { data: auth } = await supabase.auth.getUser()
    let displayName = "there"
    if (auth?.user?.id) {
        const { data: profile } = await supabase.from("profiles").select("name").eq("id", auth.user.id).single()
        displayName = (profile?.name || auth.user.email || "there").split(" ")[0]
    }
    
    // Fetch real counts from Supabase
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: opportunityCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active')
    const { count: visitCountResult } = await supabase.from('analytics_visits').select('*', { count: 'exact', head: true })
    
    // Fallback if null
    const visitCount = visitCountResult || 0

    // Fetch profile data for charts
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

    // Process data for demographics charts
    const roleCounts: Record<string, number> = {}
    const locationCounts: Record<string, number> = {}
    const growthData: Record<string, number> = {} // Key: Month-Year

    profiles?.forEach(profile => {
        // Role Stats
        const role = profile.role || 'Unknown'
        roleCounts[role] = (roleCounts[role] || 0) + 1

        // Location Stats - Parse "City, Province, Zip" or use as is if simple
        let location = 'Unknown'
        if (profile.address) {
            // Assuming format "City, Province, Zip" from mobile signup
            const parts = profile.address.split(',')
            if (parts.length >= 2) {
                location = parts[1].trim() // Province
            } else {
                location = profile.address // Fallback
            }
        } else if (profile.location) {
             // Fallback to location column if address is empty (legacy/admin created)
             if (typeof profile.location === 'string') {
                 location = profile.location
             } else if (typeof profile.location === 'object' && (profile.location as any)?.province) {
                 location = (profile.location as any).province
             }
        }
        locationCounts[location] = (locationCounts[location] || 0) + 1

        // Growth Stats (Created At)
        const date = new Date(profile.created_at)
        const key = date.toLocaleString('default', { month: 'short' })
        growthData[key] = (growthData[key] || 0) + 1
    })

    // Format data for charts
    const rolesChartData = Object.entries(roleCounts).map(([name, count]) => ({
        name,
        count,
        fill: `var(--color-${name.toLowerCase().replace(/\s+/g, '-')})` 
    }))

    const locationChartData = Object.entries(locationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Top 8 locations

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const growthChartData = months.map(month => ({
        name: month,
        users: growthData[month] || 0
    }))

    return (
    <>
        {/* Welcome banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-800 via-orange-200/15 to-cyan-900 text-white px-5 md:px-6 py-2 md:py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/15">
                    <Image
                        src="/user.jpg"
                        alt="Profile"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div>
                    <div className="text-xl md:text-2xl font-bold tracking-tight leading-none">
                        <span className="italic text-orange-100">Welcome back,</span>{" "}
                        <span className="bg-gradient-to-r from-orange-300 to-emerald-300 bg-clip-text text-transparent">
                            {displayName}
                        </span>{" "}
                        <span aria-hidden className="inline-block origin-[70%_70%] animate-[wave_1.8s_ease-in-out_infinite]">👋</span>
                    </div>
                    <p className="mt-1 text-sm text-white/80 flex items-center gap-2 translate-y-[6px] md:translate-y-[8px]">
                        <CalendarCheck className="h-4 w-4 text-emerald-300" />
                        Review today’s key metrics and recent activity.
                    </p>
                </div>
            </div>
            <div className="hidden md:flex self-stretch items-end">
                <Image
                    src="/admin.png"
                    alt="Admin illustration"
                    width={224}
                    height={120}
                    className="block h-24 w-56 object-contain object-bottom animate-[adminDrift_4s_ease-in-out_infinite]"
                    priority
                />
            </div>
        </div>

        <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <p className="col-span-full text-sm italic text-muted-foreground">
                Track user growth, understand role distribution, and see where users are most active across ELIDZ.
            </p>
            <Card className="rounded-3xl border-0 bg-blue-50/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-blue-900/20 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700/50">
                        <UsersRound className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{userCount || 0}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card className="rounded-3xl border-0 bg-amber-50/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-amber-900/20 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700/50">
                        <BriefcaseBusiness className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{opportunityCount || 0}</div>
                    <p className="text-xs text-muted-foreground">+4 new this week</p>
                </CardContent>
            </Card>
            <Card className="rounded-3xl border-0 bg-emerald-50/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-emerald-900/20 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/50">
                        <Activity className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{visitCountResult || 0}</div>
                    <p className="text-xs text-muted-foreground">Product & Service Views</p>
                </CardContent>
            </Card>
        </div>

        <div>
        <UserDemographicsCharts 
            roleData={rolesChartData} 
            locationData={locationChartData} 
            growthData={growthChartData}
            totalUsers={profiles?.length || 0}
        /></div>
        </div>
        <style>{`
            @keyframes wave {
                0%,
                60%,
                100% { transform: rotate(0deg); }
                10% { transform: rotate(14deg); }
                20% { transform: rotate(-8deg); }
                30% { transform: rotate(14deg); }
                40% { transform: rotate(-4deg); }
                50% { transform: rotate(10deg); }
            }
            @keyframes adminDrift {
                0%,
                100% { transform: translateX(0); }
                50% { transform: translateX(10px); }
            }
        `}</style>
    </>
    )
}
