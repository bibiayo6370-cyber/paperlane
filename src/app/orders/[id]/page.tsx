import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  email: string;
  total_minor: number;
  currency: string;
  email_status: string;
  created_at: string;
  order_items: { id: string; title: string; price_minor: number }[];
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("orders")
    .select("id, email, total_minor, currency, email_status, created_at, order_items(id, title, price_minor)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const order = data as unknown as OrderRow;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your order</h1>
        <p className="mt-1 text-muted-foreground">Order {order.id.slice(0, 8).toUpperCase()}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Items and downloads</CardTitle>
          <CardDescription>Placed {new Date(order.created_at).toLocaleString("en-US")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{formatMoney(item.price_minor, order.currency)}</p>
              </div>
              <a href={`/api/download/${item.id}`} className={buttonVariants({ size: "sm" })}>
                Download
              </a>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3 font-semibold">
            <p>Total</p>
            <p>{formatMoney(order.total_minor, order.currency)}</p>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">Confirmation email to {order.email}: {order.email_status}</p>
      <div className="flex gap-3">
        <Link href="/orders" className={buttonVariants({ variant: "outline" })}>
          All orders
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
