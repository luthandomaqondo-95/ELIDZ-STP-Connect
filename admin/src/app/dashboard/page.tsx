import * as React from "react"
import { Activity, Briefcase, Users, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardCharts } from "./dashboard-charts"

export default async function Page() {
    const supabase = await createClient()
    
    // Fetch real counts from Supabase
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: opportunityCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active')
    
    // Placeholder for visits - assuming 0 for now or mock
    const visitCount = 573 

    return (
    <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <CardTitle className="text-sm font-medium">Product Line Visits</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{visitCount}</div>
                    <p className="text-xs text-muted-foreground">+19% since last hour</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">99.9%</div>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
            </Card>
        </div>

        <DashboardCharts />
    </>
    )
}
