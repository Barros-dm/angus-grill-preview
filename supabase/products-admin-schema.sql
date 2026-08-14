-- Angus Grill product admin setup
-- Run this once in Supabase SQL Editor.
-- After running it, create one Supabase Auth user for the client and insert that user id into public.admin_users.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_angus_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'Mercearia',
  description text,
  price numeric(10,2) not null default 0,
  old_price numeric(10,2),
  pricing_type text,
  order_unit text,
  estimated_weight text,
  unit text,
  pricing_note text,
  weight_options jsonb not null default '[]'::jsonb,
  image_url text,
  badge text,
  supplier text,
  supplier_price numeric(10,2),
  source_url text,
  featured boolean not null default false,
  best_seller boolean not null default false,
  in_stock boolean not null default true,
  stock integer not null default 0,
  price_per_kg numeric(10,2),
  preparation_note text,
  translations jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  order_reference text unique not null,
  customer_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending_whatsapp_confirmation',
  customer_name text,
  contact text,
  fulfilment_type text not null default 'delivery',
  address text,
  address_line2 text,
  city text,
  postcode text,
  delivery_zone text,
  delivery_miles numeric(8,2),
  delivery_fee numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  total_estimate numeric(10,2),
  total_label text,
  has_variable_weight boolean not null default false,
  payment_status text not null default 'pending',
  admin_notes text,
  confirmed_at timestamptz,
  completed_at timestamptz,
  preferred_date date,
  preferred_time text,
  notes text,
  language text not null default 'pt',
  source text not null default 'whatsapp_checkout',
  whatsapp_message text,
  items_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigserial primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  category text,
  quantity numeric(10,3) not null default 1,
  unit text,
  selected_option_label text,
  unit_price numeric(10,2),
  price_per_kg numeric(10,2),
  line_total numeric(10,2) not null default 0,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.orders
add column if not exists customer_user_id uuid references auth.users(id) on delete set null;

alter table public.orders
add column if not exists payment_status text not null default 'pending',
add column if not exists admin_notes text,
add column if not exists confirmed_at timestamptz,
add column if not exists completed_at timestamptz;

create index if not exists orders_customer_user_id_idx
on public.orders (customer_user_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row
execute function public.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row
execute function public.touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins can view admin users" on public.admin_users;
create policy "Admins can view admin users"
on public.admin_users
for select
to authenticated
using (public.is_angus_admin());

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products
for select
to anon, authenticated
using (is_active = true or public.is_angus_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (public.is_angus_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products
for update
to authenticated
using (public.is_angus_admin())
with check (public.is_angus_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (public.is_angus_admin());

drop policy if exists "Admins can view orders" on public.orders;
create policy "Admins can view orders"
on public.orders
for select
to authenticated
using (public.is_angus_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (public.is_angus_admin())
with check (public.is_angus_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
on public.orders
for delete
to authenticated
using (public.is_angus_admin());

drop policy if exists "Customers can view own orders" on public.orders;
create policy "Customers can view own orders"
on public.orders
for select
to authenticated
using (customer_user_id = auth.uid());

drop policy if exists "Customers can insert own orders" on public.orders;
create policy "Customers can insert own orders"
on public.orders
for insert
to authenticated
with check (
  customer_user_id = auth.uid()
  and source = 'whatsapp_checkout'
  and status = 'pending_whatsapp_confirmation'
);

drop policy if exists "Admins can view order items" on public.order_items;
create policy "Admins can view order items"
on public.order_items
for select
to authenticated
using (public.is_angus_admin());

drop policy if exists "Customers can view own order items" on public.order_items;
create policy "Customers can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items"
on public.order_items
for all
to authenticated
using (public.is_angus_admin())
with check (public.is_angus_admin());

drop policy if exists "Customers can insert own order items" on public.order_items;
create policy "Customers can insert own order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_user_id = auth.uid()
      and orders.source = 'whatsapp_checkout'
      and orders.status = 'pending_whatsapp_confirmation'
  )
);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_angus_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_angus_admin())
with check (bucket_id = 'product-images' and public.is_angus_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_angus_admin());
