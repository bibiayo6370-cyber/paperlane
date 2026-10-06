"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const idsSchema = z
  .array(z.uuid())
  .min(1, "Your cart is empty")
  .max(20, "Too many items in your cart");

export type PlaceOrderResult = { error: string } | { orderId: string };

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = idsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to check out" };

  const { data, error } = await supabase.rpc("create_order", { product_ids: parsed.data });
  if (error || !data) return { error: error?.message ?? "Could not place your order" };
  return { orderId: data as string };
}
