import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { role } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user role:", error)
      return NextResponse.json(
        { error: "Failed to update user role", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: data
    })

  } catch (error) {
    console.error("Error in update user role API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
