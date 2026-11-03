import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/authz";

type EnquiryStatus = "new" | "in_progress" | "resolved" | "closed";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

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
      user:profiles!user_id(id,name,email,avatar,role),
      responder:profiles!responded_by(id,name,email)
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
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { id?: string; response?: string; status?: EnquiryStatus }
    | null;

  const id = (body?.id ?? "").trim();
  const response = (body?.response ?? "").trim();
  const VALID_STATUSES: EnquiryStatus[] = ["new", "in_progress", "resolved", "closed"];
  const status: EnquiryStatus = VALID_STATUSES.includes(body?.status as EnquiryStatus)
    ? (body!.status as EnquiryStatus)
    : "in_progress";

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
      user:profiles!user_id(id,name,email,avatar,role),
      responder:profiles!responded_by(id,name,email)
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enquiry: data });
}

