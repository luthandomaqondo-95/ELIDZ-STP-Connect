import * as React from "react"
import { Activity, Briefcase, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserDemographicsCharts } from "./reports/demographics/demographics-charts"
import { AnalyticsCharts } from "./reports/analytics/analytics-charts"

export default async function Page() {
    const supabase = await createClient()
    
    // Fetch real counts from Supabase
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: opportunityCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active')
    const { count: visitCountResult } = await supabase.from('analytics_visits').select('*', { count: 'exact', head: true })
    
    // Fetch all analytics data for charts
    const { data: visits } = await supabase
        .from('analytics_visits')
        .select('*')

    // Process Analytics Data
    const visitsByTypeMap: Record<string, number> = {}
    const visitsByNameMap: Record<string, number> = {}

    visits?.forEach(visit => {
        // By Type
        let type = 'Unknown'
        switch (visit.entity_type) {
            case 'service': type = 'Service'; break;
            case 'product': type = 'Product'; break;
            case 'facility': type = 'Facility'; break;
            case 'lab': type = 'Lab'; break;
            default: type = visit.entity_type;
        }
        visitsByTypeMap[type] = (visitsByTypeMap[type] || 0) + 1

        // By Name
        const name = visit.entity_name || 'Unknown'
        visitsByNameMap[name] = (visitsByNameMap[name] || 0) + 1
    })

    const visitsByType = Object.entries(visitsByTypeMap).map(([name, count]) => ({ name, count }))
    
    const topEntities = Object.entries(visitsByNameMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    // Fallback if null
    const visitCount = visitCountResult || 0

    // Fetch profile data for charts
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')

    // Process data for charts
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{userCount || 0}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{opportunityCount || 0}</div>
                    <p className="text-xs text-muted-foreground">+4 new this week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{visitCount}</div>
                    <p className="text-xs text-muted-foreground">Product & Service Views</p>
                </CardContent>
            </Card>
        </div>

        <AnalyticsCharts 
            visitsByType={visitsByType}
            topEntities={topEntities}
        />

        <UserDemographicsCharts 
            roleData={rolesChartData} 
            locationData={locationChartData} 
            growthData={growthChartData}
            totalUsers={profiles?.length || 0}
        />
    </>
    )
}
