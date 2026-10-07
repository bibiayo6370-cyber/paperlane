import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type ItemRow = { products: { file_path: string; file_name: string } | { file_path: string; file_name: string }[] | null };

export async function GET(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  if (!z.uuid().safeParse(itemId).success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  // Row Level Security only returns items that belong to this user.
  const { data } = await supabase
    .from("order_items")
    .select("products(file_path, file_name)")
    .eq("id", itemId)
    .maybeSingle();

  const row = data as unknown as ItemRow | null;
  const product = Array.isArray(row?.products) ? row?.products[0] : row?.products;
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: signed, error } = await supabase.storage
    .from("downloads")
    .createSignedUrl(product.file_path, 60, { download: product.file_name });
  if (error || !signed) return NextResponse.json({ error: "File unavailable" }, { status: 404 });

  return NextResponse.redirect(signed.signedUrl);
}
