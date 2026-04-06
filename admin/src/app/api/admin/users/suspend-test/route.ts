import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🧪 TEST: Suspend test endpoint called!")
  
  try {
    const body = await request.json()
    console.log("🧪 TEST: Request body:", body)
    
    return NextResponse.json({
      success: true,
      message: "Suspend test API working",
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.log("❌ TEST: Error in suspend test:", error)
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
