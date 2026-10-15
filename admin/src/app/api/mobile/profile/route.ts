import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireMobileAuth } from "@/lib/mobile-bff/auth";
import { jsonError } from "@/lib/custom-auth/request";
import { getOwnProfile, getPublicProfile, updateOwnProfile } from "@/lib/mobile-bff/profiles";

export async function GET(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  const id = request.nextUrl.searchParams.get("id");
  try {
    if (!id || id === auth.auth.userId) {
      const profile = await getOwnProfile(auth.auth.userId);
      return NextResponse.json({ profile });
    }
    if (!isUuid(id)) return jsonError("Invalid id", 400);
    const profile = await getPublicProfile(id);
    if (!profile) return jsonError("Not found", 404);
    return NextResponse.json({ profile });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to load profile", 400);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireMobileAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    // Ignore any client-supplied id — always update the authenticated user
    const profile = await updateOwnProfile(auth.auth.userId, body ?? {});
    return NextResponse.json({ profile });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to update profile", 400);
  }
}
