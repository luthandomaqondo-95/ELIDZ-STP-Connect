import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

type EnquiryStatus = "new" | "in_progress" | "resolved" | "closed";

async function createAuthedSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

async function requireAdmin() {
  const supabase = await createAuthedSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401 as const, userId: null };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || (profile.role !== "Admin" && profile.role !== "Super Admin")) {
    return { ok: false as const, status: 403 as const, userId: user.id };
  }

  return { ok: true as const, status: 200 as const, userId: user.id };
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const supabaseAdmin = createAdminClient();

  let query = supabaseAdmin
    .from("enquiries")
    .select(
      `
      id,
      user_id,
      enquiry_type,
      subject,
      message,
      related_facility_id,
      status,
      response,
      responded_by,
      responded_at,
      created_at,
      updated_at,
      user:profiles!enquiries_user_id_fkey(id,name,email,avatar,role),
      responder:profiles!enquiries_responded_by_fkey(id,name,email)
    `
    )
    .or("enquiry_type.eq.Facility,related_facility_id.not.is.null")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    // basic search against subject/message (ANDed via filter chaining)
    query = query.or(`subject.ilike.%${q}%,message.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enquiries: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: string; response?: string; status?: EnquiryStatus }
    | null;

  const id = (body?.id ?? "").trim();
  const response = (body?.response ?? "").trim();
  const status: EnquiryStatus =
    body?.status === "new" || body?.status === "in_progress" || body?.status === "resolved" || body?.status === "closed"
      ? body.status
      : "resolved";

  if (!id) {
    return NextResponse.json({ error: "Missing enquiry id" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("enquiries")
    .update({
      response: response || null,
      status,
      responded_by: auth.userId,
      responded_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .select(
      `
      id,
      user_id,
      enquiry_type,
      subject,
      message,
      related_facility_id,
      status,
      response,
      responded_by,
      responded_at,
      created_at,
      updated_at,
      user:profiles!enquiries_user_id_fkey(id,name,email,avatar,role),
      responder:profiles!enquiries_responded_by_fkey(id,name,email)
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enquiry: data });
}

