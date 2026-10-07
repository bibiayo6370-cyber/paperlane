import "server-only";
import nodemailer from "nodemailer";
import { formatMoney } from "@/lib/money";

type OrderEmail = {
  to: string;
  orderId: string;
  items: { title: string; price_minor: number }[];
  totalMinor: number;
  currency: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendOrderEmail(order: OrderEmail) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orderUrl = `${siteUrl}/orders/${order.orderId}`;
  const shortId = order.orderId.slice(0, 8).toUpperCase();

  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escapeHtml(i.title)}</td><td style="padding:6px 0;text-align:right">${formatMoney(i.price_minor, order.currency)}</td></tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
    <h2 style="margin-bottom:4px">Thanks for your order</h2>
    <p style="color:#555;margin-top:0">Order ${shortId}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}
      <tr><td style="padding:10px 0;font-weight:bold">Total</td><td style="padding:10px 0;text-align:right;font-weight:bold">${formatMoney(order.totalMinor, order.currency)}</td></tr>
    </table>
    <p>Your downloads are available on your order page:</p>
    <p><a href="${orderUrl}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">View your order</a></p>
    <p style="color:#888;font-size:12px">This is a demo shop. No payment was taken.</p>
  </div>`;

  const text = [
    `Thanks for your order (${shortId})`,
    ...order.items.map((i) => `- ${i.title}: ${formatMoney(i.price_minor, order.currency)}`),
    `Total: ${formatMoney(order.totalMinor, order.currency)}`,
    `View your order: ${orderUrl}`,
  ].join("\n");

  await transporter.sendMail({
    from: `"Paperlane" <${process.env.GMAIL_USER}>`,
    to: order.to,
    subject: `Your Paperlane order ${shortId}`,
    text,
    html,
  });
}
