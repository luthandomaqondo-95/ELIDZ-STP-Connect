import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🔧 WORKAROUND: Non-dynamic suspend endpoint called!")
  
  try {
    const { userId } = await request.json()
    console.log("🔧 WORKAROUND: User ID from request body:", userId)

    if (!userId) {
      console.log("❌ ERROR: User ID is required")
      return NextResponse.json(
        { error: "User ID is required", test: "non-dynamic route working" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    console.log("🔧 WORKAROUND: Created Supabase admin client")

    // First, let's check what columns exist by trying to get the user
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.log("❌ ERROR: Error fetching user:", fetchError)
      return NextResponse.json(
        { error: "User not found", details: fetchError.message, test: "non-dynamic route working" },
        { status: 404 }
      )
    }

    console.log("🔧 WORKAROUND: Successfully fetched user:", existingUser)
    console.log("🔧 WORKAROUND: Available columns:", Object.keys(existingUser || {}))

    // Determine which status column to use
    const hasVerificationStatus = 'verification_status' in existingUser
    const hasStatus = 'status' in existingUser
    
    console.log("🔧 WORKAROUND: Column analysis:", {
      hasVerificationStatus,
      hasStatus,
      verificationStatusValue: existingUser?.verification_status,
      statusValue: existingUser?.status
    })
    
    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (hasVerificationStatus) {
      updateData.verification_status = 'suspended'
      console.log("✅ INFO: Using verification_status column")
    } else if (hasStatus) {
      updateData.status = 'Suspended'
      console.log("✅ INFO: Using status column")
    } else {
      console.log("❌ ERROR: No status column found in database")
      return NextResponse.json(
        { error: "No status column found in database", details: { 
          availableColumns: Object.keys(existingUser || {}),
          hasVerificationStatus,
          hasStatus,
          test: "non-dynamic route working"
        }},
        { status: 500 }
      )
    }

    console.log("🔧 WORKAROUND: Update data prepared:", updateData)

    // Update user with the appropriate status column
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.log("❌ ERROR: Error updating user:", error)
      return NextResponse.json(
        { error: "Failed to suspend user", details: error.message, test: "non-dynamic route working" },
        { status: 500 }
      )
    }

    console.log("✅ SUCCESS: User suspended successfully:", data)
    return NextResponse.json({
      success: true,
      message: "User suspended successfully",
      user: data,
      test: "non-dynamic route working perfectly"
    })

  } catch (error) {
    console.log("❌ FATAL: Unexpected error in suspend API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error", test: "non-dynamic route working" },
      { status: 500 }
    )
  }
}
