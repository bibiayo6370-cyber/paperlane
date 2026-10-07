"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendOrderEmail } from "@/lib/email";

const idsSchema = z
  .array(z.uuid())
  .min(1, "Your cart is empty")
  .max(20, "Too many items in your cart");

export type PlaceOrderResult = { error: string } | { orderId: string };

type OrderForEmail = {
  id: string;
  email: string;
  total_minor: number;
  currency: string;
  order_items: { title: string; price_minor: number }[];
};

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
  const orderId = data as string;

  // The order is saved. From here on, nothing may fail the checkout.
  let status: "sent" | "failed" = "failed";
  try {
    const { data: row } = await supabase
      .from("orders")
      .select("id, email, total_minor, currency, order_items(title, price_minor)")
      .eq("id", orderId)
      .single();
    const order = row as unknown as OrderForEmail | null;
    if (order) {
      await sendOrderEmail({
        to: order.email,
        orderId: order.id,
        items: order.order_items,
        totalMinor: order.total_minor,
        currency: order.currency,
      });
      status = "sent";
    }
  } catch (e) {
    console.error("Order email failed:", e instanceof Error ? e.message : e);
  }

  const { error: statusError } = await supabase.rpc("set_email_status", {
    p_order_id: orderId,
    p_status: status,
  });
  if (statusError) console.error("Could not record email status:", statusError.message);

  return { orderId };
}
