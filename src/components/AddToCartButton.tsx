"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useCart, type CartItem } from "@/components/CartProvider";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AddToCartButton({ product }: { product: CartItem }) {
  const { add, has, ready } = useCart();
  const inCart = ready && has(product.id);

  if (inCart) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled variant="secondary">
          Added to cart
        </Button>
        <Link href="/cart" className={buttonVariants({ variant: "outline" })}>
          View cart
        </Link>
      </div>
    );
  }

  return (
    <Button
      onClick={() => {
        add(product);
        toast.success("Added to cart");
      }}
    >
      Add to cart
    </Button>
  );
}
