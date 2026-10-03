import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug, title, price_minor, currency")
    .order("title");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Connection test</h1>
      {error ? (
        <p className="mt-4 text-red-600">Error: {error.message}</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {data?.map((p) => (
            <li key={p.slug}>
              {p.title}: {p.price_minor} {p.currency}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
