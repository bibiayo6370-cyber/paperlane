# Paperlane

A digital downloads shop (templates, books, wallpapers) built with AI-driven development for the HNG program.

**Live:** https://paperlane-three.vercel.app

## Features
- Browse products with category filters
- Cart, checkout and order history
- Email and password sign-up (Supabase Auth)
- Orders and items saved in Postgres (Supabase) with Row Level Security
- Confirmation email on every order (Gmail SMTP via Nodemailer)
- Protected downloads: private storage bucket and short-lived signed links, available only to the buyer
- Demo only: no payment is taken

## Stack
Next.js, TypeScript, Tailwind CSS, shadcn/ui (Base UI), React Hook Form, Zod, Supabase, Nodemailer, Vercel

## Run locally
```bash
pnpm install
cp .env.example .env.local   # fill in the values
pnpm dev
```
Run `supabase/schema.sql` and `supabase/seed.sql` in the Supabase SQL editor, create a private `downloads` bucket, and upload the product files.

## Project docs
See `PRD.md` and `AGENTS.md`.
