import { NextRequest, NextResponse } from "next/server";
import { refresh } from "@/lib/custom-auth/service";
import { enforceRateLimit, jsonError, requestMeta } from "@/lib/custom-auth/request";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "auth-refresh", 60, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const refreshToken =
      typeof body.refreshToken === "string"
        ? body.refreshToken
        : typeof body.refresh_token === "string"
          ? body.refresh_token
          : "";
    if (!refreshToken) return jsonError("Unauthorized", 401);

    const session = await refresh(refreshToken, requestMeta(request));
    return NextResponse.json(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
