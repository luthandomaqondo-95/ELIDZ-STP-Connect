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

    const users = (profiles || []).map(profile => {
      // Handle both possible status column names
      // verification_status values: 'pending', 'approved', 'rejected', 'suspended', 'blue'
      let status = profile.verification_status || profile.status || "Active";
      
      // Normalize status for display
      if (status === 'suspended') {
        status = 'Suspended';
      } else if (status === 'approved') {
        status = 'Active';
      } else if (status === 'pending') {
        status = 'Pending';
      } else if (status === 'rejected') {
        status = 'Rejected';
      } else if (status === 'blue') {
        status = 'Blue';
      }
      
      return {
        id: profile.id,
        name: profile.name || "Unknown",
        email: profile.email || "",
        role: profile.role || "User",
        status: status,
        company: profile.organization || "-",
        lastActive: profile.updated_at ? new Date(profile.updated_at).toISOString().split('T')[0] : "-",
        avatar: profile.avatar && profile.avatar.startsWith('http') ? profile.avatar : null
      }
    })

    return NextResponse.json(
      { users },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )

  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
