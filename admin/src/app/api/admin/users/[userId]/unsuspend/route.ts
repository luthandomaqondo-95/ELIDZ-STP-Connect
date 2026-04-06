import { unsuspendProfileById } from "@/lib/admin/profile-suspend"
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

    const result = await unsuspendProfileById(userId)

    if (!result.ok) {
      const body: Record<string, string> = { error: result.error }
      if (result.details) body.details = result.details
      return NextResponse.json(body, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      message: "User unsuspended successfully",
      user: result.user,
    })
  } catch (error) {
    console.error("Unexpected error in unsuspend API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
