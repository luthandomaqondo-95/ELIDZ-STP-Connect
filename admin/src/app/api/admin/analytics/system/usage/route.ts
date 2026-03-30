import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

// Helper function to estimate storage usage based on content
function calculateEstimatedStorage(facilities: number, services: number, products: number, users: number): string {
    // Rough estimates based on typical content sizes
    const facilityStorage = facilities * 50 // MB per facility (images, descriptions)
    const serviceStorage = services * 10 // MB per service
    const productStorage = products * 15 // MB per product (images, descriptions)
    const userStorage = users * 5 // MB per user (profile images, documents)
    
    const totalMB = facilityStorage + serviceStorage + productStorage + userStorage
    const totalGB = totalMB / 1024
    
    if (totalGB < 1) {
        return `${Math.round(totalMB)} MB`
    } else {
        return `${totalGB.toFixed(1)} GB`
    }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || new Date().toLocaleString("en-US", { month: "long" })

    const supabase = createAdminClient()

    console.log("Fetching system usage analytics data...")

    // Get real user activity data for the current month
    const currentYear = new Date().getFullYear()
    const monthIndex = MONTHS.indexOf(month as any) + 1
    const startDate = `${currentYear}-${monthIndex.toString().padStart(2, '0')}-01`
    const endDate = `${currentYear}-${monthIndex.toString().padStart(2, '0')}-31`

    // Get user registrations by day
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate)

    console.log("Profiles query result:", { data: profiles, error: profilesError, startDate, endDate })

    // Get total counts for system overview
    const { data: totalProfiles, error: totalProfilesError } = await supabase
      .from("profiles")
      .select("role")

    const { data: totalFacilities, error: facilitiesError } = await supabase
      .from("facilities")
      .select("*")

    const { data: totalServices, error: servicesError } = await supabase
      .from("smme_services_products")
      .select("*")
      .eq("type", "Service")

    const { data: totalProducts, error: productsError } = await supabase
      .from("smme_services_products")
      .select("*")
      .eq("type", "Product")

    // Process user activity by day of week
    let weeklyActivity = [
      { day: "Mon", activity: 0 },
      { day: "Tue", activity: 0 },
      { day: "Wed", activity: 0 },
      { day: "Thu", activity: 0 },
      { day: "Fri", activity: 0 },
      { day: "Sat", activity: 0 },
      { day: "Sun", activity: 0 },
    ]

    // Group user registrations by day of week
    profiles?.forEach(profile => {
      const dayOfWeek = new Date(profile.created_at).toLocaleDateString('en-US', { weekday: 'short' })
      const dayIndex = weeklyActivity.findIndex(d => d.day === dayOfWeek)
      if (dayIndex !== -1) {
        weeklyActivity[dayIndex].activity++
      }
    })

    // Count users by role
    const roleCounts: Record<string, number> = {}
    totalProfiles?.forEach(profile => {
      const role = profile.role || 'Unknown'
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    const userDistribution = Object.entries(roleCounts).map(([name, count]) => ({
      name,
      count
    }))

    // Calculate real system metrics from database
    const totalUsers = totalProfiles?.length || 0
    const newUsersThisMonth = profiles?.length || 0
    const totalFacilitiesCount = totalFacilities?.length || 0
    const totalServicesCount = totalServices?.length || 0
    const totalProductsCount = totalProducts?.length || 0

    // Calculate system content metrics
    const totalContent = totalFacilitiesCount + totalServicesCount + totalProductsCount
    const storageUsage = calculateEstimatedStorage(totalFacilitiesCount, totalServicesCount, totalProductsCount, totalUsers)

    const result = {
      weeklyActivity,
      userDistribution,
      totalUsers,
      newUsersThisMonth,
      totalFacilities: totalFacilitiesCount,
      totalServices: totalServicesCount,
      totalProducts: totalProductsCount,
      systemMetrics: {
        totalContent,
        estimatedStorage: storageUsage,
        contentGrowth: newUsersThisMonth > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100) : 0,
        avgUsersPerFacility: totalFacilitiesCount > 0 ? Math.round(totalUsers / totalFacilitiesCount) : 0
      },
      realData: true
    }

    console.log("Final system usage result:", result)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error in system usage analytics API:", error)
    return NextResponse.json(
      { error: "Failed to fetch system usage data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

const MONTHS = [
    "January",
    "February", 
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const
