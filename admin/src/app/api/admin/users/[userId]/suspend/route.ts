import { suspendProfileById } from "@/lib/admin/profile-suspend"
import { getAuthedProfile } from "@/lib/authz"
import { notifySuperAdminsOfAdminAction } from "@/lib/admin/super-admin-alerts"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await suspendProfileById(userId)

    if (!result.ok) {
      const body: Record<string, string> = { error: result.error }
      if (result.details) body.details = result.details
      return NextResponse.json(body, { status: result.status })
    }

    const { user, profile } = await getAuthedProfile()
    await notifySuperAdminsOfAdminAction({
      action: "Suspended user",
      actorId: user?.id ?? null,
      actorName: (profile?.name as string | undefined) ?? null,
      actorRole: (profile?.role as string | undefined) ?? null,
      details: `Suspended user ID ${userId}.`,
      relatedEntityType: "profile",
      relatedEntityId: userId,
    })

    return NextResponse.json({
      success: true,
      message: "User suspended successfully",
      user: result.user,
    })
  } catch (error) {
    console.error("Unexpected error in suspend API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
