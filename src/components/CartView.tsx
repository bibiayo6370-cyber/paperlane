"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatMoney } from "@/lib/money";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CartView() {
  const { items, ready, totalMinor, currency, remove } = useCart();

  if (!ready) return <p className="text-muted-foreground">Loading your cart...</p>;

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.cover_path} alt={item.title} className="h-16 w-20 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground">{formatMoney(item.price_minor, item.currency)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(item.id)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-lg font-medium">Total</p>
        <p className="text-lg font-semibold">{formatMoney(totalMinor, currency)}</p>
      </div>
      <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
        Proceed to checkout
      </Link>
    </div>
  );
}
