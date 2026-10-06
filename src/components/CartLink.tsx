"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { buttonVariants } from "@/components/ui/button";

export default function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className={buttonVariants({ variant: "ghost", size: "sm" })}>
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
