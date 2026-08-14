-- Angus Grill admin operations upgrade
-- Run this once in Supabase SQL Editor before using the improved order controls.

alter table public.orders
add column if not exists payment_status text not null default 'pending',
add column if not exists admin_notes text,
add column if not exists confirmed_at timestamptz,
add column if not exists completed_at timestamptz;

-- The app stores one of: pending, paid, cash_on_delivery, not_required, refunded.
-- Existing RLS already allows only administrators to update these fields.
