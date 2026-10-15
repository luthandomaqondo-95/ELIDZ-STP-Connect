import { createAdminClient } from "@/lib/supabase/admin";

export async function listOwnApplications(userId: string, limit: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, opportunity_id, applicant_id, cover_letter, status, submitted_at, updated_at")
    .eq("applicant_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function applyToOpportunity(
  userId: string,
  opportunityId: string,
  coverLetter?: string
) {
  const supabase = createAdminClient();

  const { data: opp, error: oppError } = await supabase
    .from("opportunities")
    .select("id, status")
    .eq("id", opportunityId)
    .maybeSingle();

  if (oppError) throw new Error(oppError.message);
  if (!opp || opp.status !== "active") {
    throw new Error("Opportunity not found or not open for applications.");
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      opportunity_id: opportunityId,
      applicant_id: userId,
      cover_letter: coverLetter?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already applied for this opportunity.");
    }
    throw new Error(error.message);
  }

  return data;
}
