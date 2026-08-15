-- Keep public customer profiles in sync with Supabase Auth users.
-- Safe to run after public.customer_profiles has already been created.

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

drop policy if exists "Admins can view customer profiles" on public.customer_profiles;
create policy "Admins can view customer profiles"
on public.customer_profiles
for select
to authenticated
using (public.is_angus_admin());

create or replace function public.sync_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Anonymous checkout sessions have no email and are not customer profiles.
  if new.email is null then
    return new;
  end if;

  insert into public.customer_profiles (id, email, name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(excluded.name, public.customer_profiles.name);

  return new;
end;
$$;

drop trigger if exists customer_profiles_from_auth_user on auth.users;
create trigger customer_profiles_from_auth_user
after insert or update of email, raw_user_meta_data on auth.users
for each row
execute function public.sync_customer_profile();

-- Populate profiles for Auth users that already exist.
insert into public.customer_profiles (id, email, name)
select
  id,
  email,
  nullif(trim(coalesce(raw_user_meta_data ->> 'name', '')), '')
from auth.users
where email is not null
on conflict (id) do update
set
  email = excluded.email,
  name = coalesce(excluded.name, public.customer_profiles.name);
