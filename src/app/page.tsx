import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("products")
    .select("slug, title, price_minor, currency")
    .order("title");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Connection test</h1>
      <div className="mt-4 flex items-center gap-3">
        {user ? (
          <>
            <p>Signed in as {user.email}</p>
            <form action={signOut}>
              <Button type="submit" variant="outline">Sign out</Button>
            </form>
          </>
        ) : (
          <>
            <p>Not signed in</p>
            <Link href="/login" className="underline">Log in</Link>
            <Link href="/signup" className="underline">Sign up</Link>
          </>
        )}
      </div>
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
