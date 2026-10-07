import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  total_minor: number;
  currency: string;
  created_at: string;
  order_items: { count: number }[];
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("orders")
    .select("id, total_minor, currency, created_at, order_items(count)")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as unknown as Row[];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
      {orders.length === 0 ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">You have not placed any orders yet.</p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Order {o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-US")} · {o.order_items[0]?.count ?? 0} item(s)
                    </p>
                  </div>
                  <p className="font-semibold">{formatMoney(o.total_minor, o.currency)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
