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

alter table public.admin_users enable row level security;
alter table public.products enable row level security;

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
