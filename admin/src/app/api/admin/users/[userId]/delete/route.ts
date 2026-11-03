import { requireManageableTargetApi } from "@/lib/authz"
import { deleteUserAccount } from "@/lib/admin/user-delete"
import { notifySuperAdminsOfAdminAction } from "@/lib/admin/super-admin-alerts"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _request: NextRequest,
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

    const auth = await requireManageableTargetApi(userId)
    if (!auth.ok) return auth.response

    const result = await deleteUserAccount(userId)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await notifySuperAdminsOfAdminAction({
      action: "Deleted user account",
      actorId: auth.userId,
      actorName: (auth.profile?.name as string | undefined) ?? null,
      actorRole: auth.role,
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
