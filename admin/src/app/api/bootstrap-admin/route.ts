import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type BootstrapRole = "Admin" | "Super Admin";

export async function POST(request: Request) {
  const secret = request.headers.get("x-bootstrap-secret") ?? "";
  const expected = process.env.BOOTSTRAP_ADMIN_SECRET ?? "";

  if (!expected.trim() || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        email?: string;
        password?: string;
        fullName?: string;
        role?: BootstrapRole;
      }
    | null;

  const email = (body?.email ?? "").trim().toLowerCase();
  const password = body?.password ?? "";
  const fullName = (body?.fullName ?? "").trim();
  const role: BootstrapRole = body?.role === "Admin" ? "Admin" : "Super Admin";

  if (!email || !password || password.length < 6 || !fullName) {
    return NextResponse.json(
      { error: "Invalid payload: require email, fullName, password (>=6)" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  // 1) Create auth user (or continue if already exists)
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: fullName },
  });

  if (created.error && !String(created.error.message || "").toLowerCase().includes("already registered")) {
    return NextResponse.json(
      { error: created.error.message ?? "Failed to create user" },
      { status: 500 }
    );
  }

  const userId = created.data.user?.id ?? null;

  // 2) Ensure profile role is Admin/Super Admin
  if (userId) {
    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email,
          name: fullName,
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message ?? "Failed to upsert profile" },
        { status: 500 }
      );
    }
  } else {
    // Fallback: update by email if profile already exists
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("email", email);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message ?? "Failed to update profile role" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, email, role });
}

