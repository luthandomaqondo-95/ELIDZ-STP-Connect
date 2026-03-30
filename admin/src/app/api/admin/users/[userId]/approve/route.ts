import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // For now, we'll just update the updated_at timestamp to mark as "approved"
    // In a real implementation, you might have a status column
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString()
        // If you add a status column: status: 'approved'
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error("Error approving user:", error)
      return NextResponse.json(
        { error: "Failed to approve user", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
      user: data
    })

  } catch (error) {
    console.error("Error in approve user API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
