import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_ROLES = ["Entrepreneur", "SMME", "Student", "Tenant"] as const;

export async function getOwnProfile(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, name, email, role, address, organization, bio, avatar, verification_status, created_at, updated_at, id_number"
    )
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOwnProfile(
  userId: string,
  updates: Record<string, unknown>
) {
  const supabase = createAdminClient();

  const patch: Record<string, unknown> = {};
  if (typeof updates.name === "string") patch.name = updates.name.trim();
  if (typeof updates.address === "string") patch.address = updates.address.trim();
  if (typeof updates.organization === "string") patch.organization = updates.organization.trim();
  if (typeof updates.bio === "string") patch.bio = updates.bio.trim();
  if (typeof updates.avatar === "string") patch.avatar = updates.avatar;
  // Email changes are sensitive — allow only normalized string; uniqueness enforced by DB
  if (typeof updates.email === "string") {
    patch.email = updates.email.trim().toLowerCase();
  }
  if (
    typeof updates.role === "string" &&
    (ALLOWED_ROLES as readonly string[]).includes(updates.role)
  ) {
    patch.role = updates.role;
  }
  // Users may only set pending/unverified on themselves
  if (updates.verification_status === "pending" || updates.verification_status === "unverified") {
    patch.verification_status = updates.verification_status;
  }

  if (Object.keys(patch).length === 0) {
    return getOwnProfile(userId);
  }

  patch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select(
      "id, name, email, role, address, organization, bio, avatar, verification_status, created_at, updated_at, id_number"
    )
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Public-safe subset for viewing another user (no id_number). */
export async function getPublicProfile(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, organization, bio, avatar, verification_status, created_at")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
