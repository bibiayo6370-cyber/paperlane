import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, title, description, price_minor, currency, category, cover_path")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();
  const product = data as Product;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        Back to shop
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.cover_path} alt={product.title} className="w-full rounded-xl border object-cover" />
        <div className="space-y-4">
          <Badge variant="secondary">{product.category}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          <p className="text-2xl">{formatMoney(product.price_minor, product.currency)}</p>
          <p className="text-muted-foreground">{product.description}</p>
          <p className="text-sm text-muted-foreground">Digital download. Available in your orders right after checkout.</p>
        </div>
      </div>
    </div>
  );
}
