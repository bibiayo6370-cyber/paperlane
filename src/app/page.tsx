import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = CATEGORIES.find((c) => c === category) ?? "All";

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, slug, title, description, price_minor, currency, category, cover_path")
    .order("title");
  if (active !== "All") query = query.eq("category", active);
  const { data, error } = await query;
  const products = (data ?? []) as Product[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Digital downloads</h1>
        <p className="mt-2 text-muted-foreground">Templates, books and wallpapers. Instant download after checkout.</p>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/" : `/?category=${c}`}
            className={buttonVariants({ variant: c === active ? "default" : "outline", size: "sm" })}
          >
            {c}
          </Link>
        ))}
      </div>

      {error ? (
        <p className="text-destructive">Could not load products: {error.message}</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
