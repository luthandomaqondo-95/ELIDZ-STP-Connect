import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const supabase = createAdminClient()
    
    let query = supabase.from('profiles').select('*')
    
    if (role && role !== "All") {
      query = query.eq('role', role)
    }
    
    const { data: profiles, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json(
        { error: "Failed to fetch users", details: error.message },
        { status: 500 }
      )
    }

    const users = (profiles || []).map(profile => ({
      id: profile.id,
      name: profile.name || "Unknown",
      email: profile.email || "",
      role: profile.role || "User",
      status: "Active", // Default as we don't have status in profiles table yet
      company: profile.organization || "-",
      lastActive: new Date(profile.updated_at).toLocaleDateString(),
      avatar: profile.avatar || ""
    }))

    return NextResponse.json({ users })

  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
