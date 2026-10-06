"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/CartProvider";
import { placeOrder } from "@/app/actions/orders";
import { formatMoney } from "@/lib/money";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutView({ email }: { email: string }) {
  const router = useRouter();
  const { items, ready, totalMinor, currency, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);

  if (!ready) return <p className="text-muted-foreground">Loading...</p>;

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Browse products
        </Link>
      </div>
    );
  }

  const onPlaceOrder = async () => {
    setSubmitting(true);
    const result = await placeOrder(items.map((i) => i.id));
    if ("error" in result) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }
    clear();
    router.push(`/orders/${result.orderId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
          <CardDescription>Confirmation will be sent to {email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <p>{item.title}</p>
              <p className="text-muted-foreground">{formatMoney(item.price_minor, item.currency)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3 font-semibold">
            <p>Total</p>
            <p>{formatMoney(totalMinor, currency)}</p>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        This is a demo shop. No payment is taken and no card details are needed.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onPlaceOrder} disabled={submitting}>
          {submitting ? "Placing order..." : "Place order (demo, no payment)"}
        </Button>
        <Link href="/cart" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Back to cart
        </Link>
      </div>
    </div>
  );
}
