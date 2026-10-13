// This approve user functionality has been removed
// The route is kept to prevent 404 errors but no longer processes requests
import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Approve user functionality has been removed" },
    { status: 410 } // 410 Gone indicates the resource is no longer available
  )
}
