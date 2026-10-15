import { NextRequest, NextResponse } from "next/server";
import { getMe } from "@/lib/custom-auth/service";
import { jsonError, requireAccessAuth } from "@/lib/custom-auth/request";

export async function GET(request: NextRequest) {
  const auth = await requireAccessAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const me = await getMe(auth.claims.sub);
    return NextResponse.json({ user: me });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
