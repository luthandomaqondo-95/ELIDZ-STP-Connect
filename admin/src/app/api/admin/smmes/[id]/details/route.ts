import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing SMME ID" },
        { status: 400 }
      );
    }
    const supabase = createAdminClient();

    // Get SMME verification details
    const [{ data: docs, error: docsError }, { data: items, error: itemsError }] =
      await Promise.all([
        supabase
          .from("smme_verifications")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("smme_services_products")
          .select("*")
          .eq("smme_id", id)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);

    if (docsError) {
      console.error("Error fetching SMME verification docs:", docsError);
      return NextResponse.json(
        { error: "Failed to load SMME documents", details: docsError.message },
        { status: 500 }
      );
    }

    if (itemsError) {
      console.error("Error fetching SMME services/products:", itemsError);
      return NextResponse.json(
        { error: "Failed to load SMME products/services", details: itemsError.message },
        { status: 500 }
      );
    }

    const allItems = items || [];
    return NextResponse.json({
      documents: docs || [],
      products: allItems.filter((i: any) => i.type === "Product"),
      services: allItems.filter((i: any) => i.type === "Service"),
    });
  } catch (error) {
    console.error("Error in SMME details API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
