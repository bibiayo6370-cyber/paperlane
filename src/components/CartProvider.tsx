"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";

export type CartItem = Pick<Product, "id" | "slug" | "title" | "price_minor" | "currency" | "cover_path">;

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  totalMinor: number;
  currency: string;
  has: (id: string) => boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const KEY = "paperlane-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
    } catch {
      // storage unavailable or corrupted; start with an empty cart
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items, ready]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev
        : [
            ...prev,
            {
              id: item.id,
              slug: item.slug,
              title: item.title,
              price_minor: item.price_minor,
              currency: item.currency,
              cover_path: item.cover_path,
            },
          ]
    );
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.length,
      totalMinor: items.reduce((sum, i) => sum + i.price_minor, 0),
      currency: items[0]?.currency ?? "USD",
      has,
      add,
      remove,
      clear,
    }),
    [items, ready, has, add, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
