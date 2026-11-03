import { createAdminClient } from "@/lib/supabase/admin";
import { signPrivateStorageUrl, signPrivateStorageUrls } from "@/lib/storage-signing";

const DOC_TYPES = [
  "Business Registration",
  "ID Document",
  "Business Profile",
  "Tax Clearance",
  "Other",
] as const;

export async function listOwnVerifications(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("smme_verifications")
    .select("id, user_id, document_url, document_type, status, rejection_reason, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return signPrivateStorageUrls(data || [], "document_url");
}

export async function submitOwnVerification(
  userId: string,
  documentUrl: string,
  documentType: string
) {
  if (!(DOC_TYPES as readonly string[]).includes(documentType)) {
    throw new Error("Invalid document type");
  }
  if (!documentUrl?.trim() || documentUrl.length > 2000) {
    throw new Error("document_url is required");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("smme_verifications")
    .upsert(
      {
        user_id: userId,
        document_url: documentUrl.trim(),
        document_type: documentType,
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,document_type" }
    )
    .select("id, user_id, document_url, document_type, status, rejection_reason, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return signPrivateStorageUrl(data, "document_url");
}
