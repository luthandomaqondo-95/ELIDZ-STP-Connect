import { createAdminClient } from "@/lib/supabase/admin";

const ENQUIRY_TYPES = [
  "Product Line",
  "Facility",
  "Tenant",
  "General",
  "Opportunity",
  "Other",
] as const;

export async function listOwnEnquiries(userId: string, limit: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getOwnEnquiry(userId: string, enquiryId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", enquiryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createOwnEnquiry(
  userId: string,
  body: {
    enquiry_type: string;
    subject: string;
    message: string;
    related_facility_id?: string;
    related_tenant_id?: string;
    related_opportunity_id?: string;
  }
) {
  if (!(ENQUIRY_TYPES as readonly string[]).includes(body.enquiry_type)) {
    throw new Error("Invalid enquiry type");
  }
  const subject = body.subject?.trim();
  const message = body.message?.trim();
  if (!subject || subject.length > 200) throw new Error("Subject is required (max 200 characters).");
  if (!message || message.length > 5000) throw new Error("Message is required (max 5000 characters).");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      user_id: userId,
      enquiry_type: body.enquiry_type,
      subject,
      message,
      related_facility_id: body.related_facility_id || null,
      related_tenant_id: body.related_tenant_id || null,
      related_opportunity_id: body.related_opportunity_id || null,
      status: "new",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
