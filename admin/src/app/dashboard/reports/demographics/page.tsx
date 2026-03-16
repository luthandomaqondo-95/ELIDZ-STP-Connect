import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserDemographicsCharts } from "./demographics-charts"

export default async function UserDemographicsPage() {
    const supabase = await createClient()
    
    // Fetch profile data
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
             // location column might be JSON or text based on schema history
             if (typeof profile.location === 'string') {
                 location = profile.location
             } else if (typeof profile.location === 'object' && profile.location?.province) {
                 location = profile.location.province
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">User Demographics</h1>
            <UserDemographicsCharts 
                roleData={rolesChartData} 
                locationData={locationChartData} 
                growthData={growthChartData}
                totalUsers={profiles?.length || 0}
            />
        </div>
    );
}
