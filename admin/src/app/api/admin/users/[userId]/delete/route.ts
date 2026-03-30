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

    // First, try to delete from auth.users using admin functions
    // This requires service role key which createAdminClient provides
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    // Also delete from profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (authError && profileError) {
      console.error("Error deleting user:", { authError, profileError })
      return NextResponse.json(
        { error: "Failed to delete user", details: { authError: authError.message, profileError: profileError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("Error in delete user API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
