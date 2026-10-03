# PRD: Paperlane (Digital Downloads Shop)

## Goal
A small online shop selling digital products (templates, PDF books, wallpapers). Visitors browse, add to cart, sign up, check out, receive a confirmation email, and download their purchases.

## Scope Notes
- Demo shop: **no real payment**. The checkout button says "Place order (demo, no payment)".
- Digital items only: quantity is always 1, no shipping, no stock.
- Browsing is public. Login is required only at checkout and for the orders page.

## Pages
| Route | Purpose | Auth |
|---|---|---|
| `/` | Product grid with category filter (All, Templates, Books, Wallpapers) | No |
| `/products/[slug]` | Product detail, add to cart | No |
| `/cart` | Review items, remove items, go to checkout | No |
| `/checkout` | Order summary and place order | Yes |
| `/orders` | List of the user's orders | Yes |
| `/orders/[id]` | Order confirmation and download buttons | Yes |
| `/login`, `/signup` | Email and password | No |

## Features
1. **Catalog**: 8 seeded products with cover image, title, description, price, category.
2. **Cart**: stored in the browser (localStorage), count shown in the header, survives refresh.
3. **Auth**: Supabase email and password. "Confirm email" is turned off so reviewers can sign up instantly.
4. **Checkout**: creates an order and order items in the database, clears the cart, redirects to `/orders/[id]`.
5. **Confirmation email**: sent via Gmail SMTP with order number, items, total, and a link to `/orders/[id]`. If sending fails, the order still succeeds and the page shows "Email could not be sent".
6. **Downloads**: files live in a private Supabase Storage bucket. The download button calls a server route that checks the order belongs to the user and returns a short-lived signed URL.

## Data Model (Postgres on Supabase)
- **products**: `id`, `slug` (unique), `title`, `description`, `price_cents`, `category`, `cover_path`, `file_path`, `file_name`
- **orders**: `id`, `user_id` (auth user), `email`, `total_cents`, `email_status` (`sent` | `failed`), `created_at`
- **order_items**: `id`, `order_id`, `product_id`, `title`, `price_cents`

Row Level Security on all tables:
- `products`: anyone can read.
- `orders`, `order_items`: a user can read and insert only their own rows.

## Seed Products
| Title | Category | Price |
|---|---|---|
| Minimalist Resume Template | Templates | $9 |
| Monthly Budget Planner | Templates | $7 |
| Habit Tracker Printable | Templates | $5 |
| Study Planner Bundle | Templates | $8 |
| 30-Minute Meals Cookbook | Books | $12 |
| Abstract Gradient Wallpapers | Wallpapers | $6 |
| Minimal Nature Wallpapers | Wallpapers | $6 |
| Social Media Post Kit | Templates | $10 |

## UI Rules
- Next.js App Router, Tailwind, shadcn/ui components only.
- Covers are local SVG or image files in `/public/covers`, never remote URLs.
- Responsive, mobile first. Toasts for success and errors.

## Out of Scope
Real payments, refunds, admin panel, reviews, search, discount codes.

## Success Criteria
- A new visitor can sign up, buy two products, see the confirmation page, receive the email, and download both files.
- A second user cannot see or download the first user's orders.
- The live URL works in an incognito window with no Vercel login.
