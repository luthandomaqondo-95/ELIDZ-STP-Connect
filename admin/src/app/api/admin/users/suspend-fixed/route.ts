import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🔧 FIXED: Suspend fixed endpoint called!")
  
  try {
    const body = await request.json()
    console.log("🔧 FIXED: Request body:", body)
    
    return NextResponse.json({
      success: true,
      message: "Fixed suspend API working",
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.log("❌ FIXED: Error in suspend fixed endpoint:", error)
    return NextResponse.json(
      { error: "Fixed test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
