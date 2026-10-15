import { createAdminClient } from "@/lib/supabase/admin";

/** Public catalogue: active services/products only. */
export async function listActiveServicesProducts(smmeId?: string, limit = 100) {
  const supabase = createAdminClient();
  let query = supabase
    .from("smme_services_products")
    .select(
      "id, smme_id, type, name, description, category, price, image_url, contact_email, contact_phone, website_url, status, created_at"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (smmeId) {
    query = query.eq("smme_id", smmeId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createOwnServiceProduct(
  userId: string,
  body: {
    type: string;
    name: string;
    description: string;
    category: string;
    price?: string;
    image_url?: string;
    contact_email?: string;
    contact_phone?: string;
    website_url?: string;
  }
) {
  if (body.type !== "Service" && body.type !== "Product") {
    throw new Error("type must be Service or Product");
  }
  const name = body.name?.trim();
  const description = body.description?.trim();
  const category = body.category?.trim();
  if (!name || !description || !category) {
    throw new Error("name, description, and category are required");
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (!profile || !["SMME", "SME"].includes(profile.role)) {
    throw new Error("Only SMME accounts can create services or products.");
  }

  const { data, error } = await supabase
    .from("smme_services_products")
    .insert({
      smme_id: userId,
      type: body.type,
      name,
      description,
      category,
      price: body.price ?? null,
      image_url: body.image_url ?? null,
      contact_email: body.contact_email ?? null,
      contact_phone: body.contact_phone ?? null,
      website_url: body.website_url ?? null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOwnServiceProduct(
  userId: string,
  itemId: string,
  patch: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("smme_services_products")
    .select("id, smme_id")
    .eq("id", itemId)
    .maybeSingle();

  if (!existing || existing.smme_id !== userId) {
    throw new Error("Not found");
  }

  const allowed: Record<string, unknown> = {};
  for (const key of [
    "name",
    "description",
    "category",
    "price",
    "image_url",
    "contact_email",
    "contact_phone",
    "website_url",
    "status",
  ]) {
    if (patch[key] !== undefined) allowed[key] = patch[key];
  }
  if (allowed.status && !["active", "inactive", "pending"].includes(String(allowed.status))) {
    throw new Error("Invalid status");
  }
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("smme_services_products")
    .update(allowed)
    .eq("id", itemId)
    .eq("smme_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOwnServiceProduct(userId: string, itemId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("smme_services_products")
    .delete()
    .eq("id", itemId)
    .eq("smme_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Not found");
}
