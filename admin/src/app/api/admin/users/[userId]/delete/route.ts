import { createAdminClient } from "@/lib/supabase/admin"
import { getAuthedProfile } from "@/lib/authz"
import { notifySuperAdminsOfAdminAction } from "@/lib/admin/super-admin-alerts"
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
    const { user, profile } = await getAuthedProfile()

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

    await notifySuperAdminsOfAdminAction({
      action: "Deleted user account",
      actorId: user?.id ?? null,
      actorName: (profile?.name as string | undefined) ?? null,
      actorRole: (profile?.role as string | undefined) ?? null,
      details: `Deleted user ID ${userId}.`,
      relatedEntityType: "profile",
      relatedEntityId: userId,
    })

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
