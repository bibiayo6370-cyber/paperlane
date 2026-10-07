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
create or replace function public.create_order(product_ids uuid[])
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := auth.jwt() ->> 'email';
  v_count integer;
  v_distinct integer;
  v_currencies integer;
  v_total integer;
  v_currency text;
  v_order_id uuid;
begin
  if v_uid is null then
    raise exception 'Please log in to check out';
  end if;
  if product_ids is null or coalesce(array_length(product_ids, 1), 0) = 0 then
    raise exception 'Your cart is empty';
  end if;

  select count(*), count(distinct currency), coalesce(sum(price_minor), 0), min(currency)
    into v_count, v_currencies, v_total, v_currency
  from public.products
  where id = any(product_ids);

  select count(distinct x) into v_distinct from unnest(product_ids) as x;

  if v_count <> v_distinct then
    raise exception 'Some products in your cart no longer exist';
  end if;
  if v_currencies > 1 then
    raise exception 'Mixed currencies are not supported';
  end if;

  insert into public.orders (user_id, email, total_minor, currency)
  values (v_uid, coalesce(v_email, ''), v_total, v_currency)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, title, price_minor)
  select v_order_id, p.id, p.title, p.price_minor
  from public.products p
  where p.id = any(product_ids);

  return v_order_id;
end;
$$;

revoke all on function public.create_order(uuid[]) from public, anon;
grant execute on function public.create_order(uuid[]) to authenticated;

-- Lets a user record the email result for their own order only
create or replace function public.set_email_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('sent', 'failed') then
    raise exception 'Invalid status';
  end if;
  update public.orders
     set email_status = p_status
   where id = p_order_id and user_id = auth.uid();
end;
$$;

revoke all on function public.set_email_status(uuid, text) from public, anon;
grant execute on function public.set_email_status(uuid, text) to authenticated;
