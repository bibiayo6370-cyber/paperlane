<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Agents.md

You are building the Paperlane digital shop described in `PRD.md`. Read it first. Follow this file strictly.

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- React Hook Form + Zod for all forms
- Supabase: Postgres, Auth (email and password), Storage (private bucket `downloads`)
- Email: Nodemailer with Gmail SMTP
- Package manager: **pnpm only**
- Deploy: Vercel

## Project Structure
```
src/
  app/                  # routes (see PRD)
    api/download/       # signed URL route
  components/ui/        # shadcn (generated, don't hand-edit)
  components/           # ProductCard, CartProvider, Header, etc.
  lib/
    supabase/           # client.ts (browser), server.ts (server)
    email.ts            # Nodemailer send function
    schemas.ts          # Zod schemas
public/covers/          # product cover images
supabase/               # schema.sql, seed.sql
PRD.md
Agents.md
```

## Rules
1. **Keep it simple.** No features or libraries beyond the PRD.
2. **UI**: shadcn/ui components only. Add with `pnpm dlx shadcn@latest add <component>`.
3. **Forms**: React Hook Form + Zod (`zodResolver`). Schemas in `src/lib/schemas.ts`.
4. **Security**: RLS enabled on every table. The service role key is used only in server code and never in a file with `"use client"`. Never expose it with a `NEXT_PUBLIC_` prefix.
5. **Downloads**: files stay in a private bucket. Only return signed URLs (60 seconds) after verifying the order belongs to the signed-in user.
6. **Email failure must not fail the order.** Save the order first, then send the email, then record `email_status`.
7. **Images**: local files in `public/covers`. No remote image URLs.
8. **Env vars** (never hardcode, never commit `.env.local`, always maintain `.env.example`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NEXT_PUBLIC_SITE_URL`
9. TypeScript strict, no `any`. Small components with one job.
10. Show loading, empty, and error states.

## Environment Rules
- This project runs in WSL Ubuntu. Before any command, run `which pnpm`; the path must start with `/home`. If it points to `/mnt/c`, stop and tell the user.
- Never use `--prefix`. `cd` into the project folder first.
- Never read, print or edit any `.env*` file.
- If a command fails, fix it or report the exact error. Never say a step is complete unless every command succeeded and you verified the result.

## Workflow (one step at a time; stop after each and wait for the user)
1. Scaffold Next.js with pnpm, Tailwind; initialize shadcn.
2. Database: `schema.sql` (tables, RLS, policies), `seed.sql`, storage bucket notes.
3. Supabase clients and auth (signup, login, logout, header state).
4. Catalog page and product detail page.
5. Cart (context + localStorage) and cart page.
6. Checkout: create order and items, redirect to confirmation.
7. Email: Gmail SMTP send, record `email_status`.
8. Orders pages and protected download route.
9. Polish states, responsive check, README.
10. Deploy to Vercel, set env vars, test in incognito.

## Commits
Small commits: `feat:`, `fix:`, `chore:`, `docs:`.

## Definition of Done
Every PRD success criterion passes on the live URL.

## Money
- Store all money as integers in minor units (`price_minor`, `total_minor`): cents for USD, kobo for NGN. Never use floats.
- Base currency is USD. Every product and order has a `currency` column (default `USD`).
- Format with `Intl.NumberFormat` through one helper in `src/lib/money.ts`. Never format prices by hand.
- Orders copy `currency` and item prices from the product at purchase time. Compute totals on the server from the `products` table.
- Later: approximate naira display via an exchange rate, then local naira pricing. Do not build either now.
