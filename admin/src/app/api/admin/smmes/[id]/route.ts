import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;

    console.log("SMME Status Update - ID:", id, "Status:", status);

    if (!status || (status !== "verified" && status !== "pending")) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'verified' or 'pending'" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Missing SMME ID" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1) Update profile verification status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({ verification_status: status })
      .eq("id", id)
      .select()
      .single();

    console.log("Profile update result:", { profile, profileError });

    if (profileError) {
      console.error("Error updating SMME profile status:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile status", details: profileError.message },
        { status: 500 }
      );
    }

    // 2) Update verification documents status
    const docStatus = status === "verified" ? "verified" : "pending";
    const { error: docsError } = await supabase
      .from("smme_verifications")
      .update({ status: docStatus, rejection_reason: null })
      .eq("user_id", id);

    if (docsError) {
      console.error("Error updating SMME document statuses:", docsError);
      // Don't fail the request, but log the error
    }

    // 3) Create notification for status change
    const notificationData = {
      id: crypto.randomUUID(),
      user_id: id,
      title: status === "verified" 
        ? "Your SMME Verification is Approved!" 
        : "Your SMME Verification Status Updated",
      message: status === "verified"
        ? "Congratulations! Your SMME has been verified. You now have access to all ELIDZ STP features."
        : "Your SMME verification status has been updated. Please check your account for more details.",
      type: "announcement",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notificationData);

    if (notificationError) {
      console.error("Error creating status notification:", notificationError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: `SMME status updated to ${status}`,
      profile,
    });
  } catch (error) {
    console.error("Error in SMME status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
