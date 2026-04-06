import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error("Error fetching user:", fetchError)
      return NextResponse.json(
        { error: "User not found", details: fetchError.message },
        { status: 404 }
      )
    }

    // Determine which status column to use
    const hasVerificationStatus = 'verification_status' in existingUser
    const hasStatus = 'status' in existingUser
    
    let updateData: Record<string, string> = {
      updated_at: new Date().toISOString()
    }

    if (hasVerificationStatus) {
      updateData.verification_status = 'approved'
    } else if (hasStatus) {
      updateData.status = 'Active'
    } else {
      return NextResponse.json(
        { error: "No status column found in database" },
        { status: 500 }
      )
    }

    // Update user with the appropriate status column
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error("Error unsuspending user:", error)
      return NextResponse.json(
        { error: "Failed to unsuspend user", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User unsuspended successfully",
      user: data
    })

  } catch (error) {
    console.error("Unexpected error in unsuspend API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
