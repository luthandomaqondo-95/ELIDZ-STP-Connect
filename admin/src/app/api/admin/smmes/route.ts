import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const supabase = createAdminClient();

    let query = supabase
      .from("profiles")
      .select("*")
      .in("role", ["SME", "SMME"]) // Only SMME roles
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (status && status !== "all") {
      if (status === "verified") {
        query = query.eq("verification_status", "verified");
      } else if (status === "pending") {
        query = query.neq("verification_status", "verified");
      }
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,organization.ilike.%${search}%`
      );
    }

    const { data: smmes, error } = await query;

    if (error) {
      console.error("Error fetching SMMEs:", error);
      return NextResponse.json(
        { error: "Failed to fetch SMMEs", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ smmes: smmes || [] });
  } catch (error) {
    console.error("Error in SMMEs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, organization, role } = await request.json();

    if (!email || !name || !organization || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, organization, role" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Invite User
    const { data: userData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      console.error("Invite error:", inviteError);
      return NextResponse.json(
        { error: "Failed to invite user", details: inviteError.message },
        { status: 500 }
      );
    }

    if (!userData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // 2. Create Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userData.user.id,
        name,
        email,
        role,
        organization,
        verification_status: "verified",
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Cleanup user if profile creation fails
      await supabase.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json(
        { error: "Failed to create profile", details: profileError.message },
        { status: 500 }
      );
    }

    // 3. Create notification for the new SMME
    const notificationData = {
      id: crypto.randomUUID(),
      user_id: userData.user.id,
      title: "Welcome to ELIDZ STP!",
      message: `Your account has been verified and you're now part of the ELIDZ Science and Technology Park community.`,
      type: "announcement",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notificationData);

    if (notificationError) {
      console.error("Error creating welcome notification:", notificationError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: "SMME added successfully",
      smme: {
        id: userData.user.id,
        name,
        email,
        role,
        organization,
        verification_status: "verified",
      },
    });
  } catch (error) {
    console.error("Error in SMMEs API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
