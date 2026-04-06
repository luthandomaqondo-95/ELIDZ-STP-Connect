import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("🧪 TEST: Test API endpoint was called!")
  
  return NextResponse.json({
    message: "Test API is working",
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url
  })
}

export async function POST(request: NextRequest) {
  console.log("🧪 TEST: POST to test API endpoint was called!")
  
  try {
    const body = await request.json()
    console.log("🧪 TEST: Request body:", body)
    
    return NextResponse.json({
      message: "POST test API is working",
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.log("❌ TEST: Error parsing request body:", error)
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    )
  }
}
