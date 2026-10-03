-- Tables
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  price_minor integer not null check (price_minor >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  category text not null check (category in ('Templates', 'Books', 'Wallpapers')),
  cover_path text not null,
  file_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  total_minor integer not null check (total_minor >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  title text not null,
  price_minor integer not null check (price_minor >= 0)
);

create index orders_user_id_idx on public.orders (user_id);
create index order_items_order_id_idx on public.order_items (order_id);

-- Row Level Security
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Anyone can read products"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "Users read their own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users create their own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users read their own order items"
  on public.order_items for select
  to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "Users create items on their own orders"
  on public.order_items for insert
  to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
