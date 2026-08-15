# Angus Grill Supabase Admin Setup

This setup lets the client manage products and images only through `admin.html`.
They do not need direct Supabase access after setup.

## 1. Create The Supabase Project

Create a Supabase project and keep the free tier unless the product catalogue or image storage grows beyond the free limits.

## 2. Run The SQL

Open Supabase SQL Editor and run:

`supabase/products-admin-schema.sql`

This creates:

- `products` table
- `orders` table
- `order_items` table
- `admin_users` table
- Row Level Security policies
- public `product-images` Storage bucket
- admin-only write permissions
- admin-only order viewing and order status management
- customer-only access to their own order history

Then run:

`supabase/customer-profiles-migration.sql`

This creates a profile for every existing e-mail account and automatically keeps `customer_profiles` in sync when future customers register or are invited through Supabase Auth.

## 3. Create The Admin User

There are two separate kinds of user in Supabase:

- **Project member**: invited through the Supabase project dashboard. This gives access to Supabase itself, but cannot log into `admin.html`.
- **Store admin**: created in **Authentication > Users**. This can log into `admin.html` only after being added to `admin_users`.

For a store admin, open **Authentication > Users > Invite user**, send the invite to the client email, and let them choose their password. Then run this in the SQL Editor, replacing the email:

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = lower('client-email@example.com')
on conflict (user_id) do update set email = excluded.email;
```

Use this check before the insert. It must return one row. If it returns no rows, the person was invited to the Supabase project rather than the store authentication system:

```sql
select id, email, email_confirmed_at, last_sign_in_at
from auth.users
where lower(email) = lower('client-email@example.com');
```

You and the client can both be store admins: create an Auth user for each email and run the insert for each one. Do not put customer accounts in `admin_users`.

## 4. Add Supabase Public Config

Edit:

`assets/js/supabase-config.js`

Fill in:

```js
window.ANGUS_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLIC_ANON_KEY",
  productBucket: "product-images",
  orderEndpoint: ""
};
```

Use only the public anon key. Never use the service-role key in frontend files.

## 5. Import The Current Catalogue

Open `admin.html`, log in, then click:

`Importar catálogo atual`

After that, products are loaded from Supabase and can be edited from the admin panel.

## 6. What The Client Can Manage

- Product name
- Category
- Price
- Old price
- Unit
- Pricing type
- Badge
- Stock quantity
- Availability
- Featured / best seller status
- Visibility in the store
- Description
- Product image URL
- Product image upload
- Weight/size options as JSON

The public website still falls back to the local catalogue if Supabase is not configured.

## 7. Customer Login

The customer account page is:

`account.html`

It uses Supabase Auth with e-mail and password. Customers do not need Supabase dashboard access.

Each e-mail account also has a matching row in `public.customer_profiles`, created by the customer profile migration. Anonymous checkout sessions are not stored as customer profiles.

Saved orders include:

`customer_user_id = auth user id`

That lets the customer see their own order history while admin users can still manage orders through the admin side.

Customers can finalize as guests. The checkout creates a Supabase anonymous session, then Row Level Security saves the pending WhatsApp order against that anonymous user ID. Logged-in customers use their existing account instead. Admin users can view and manage every order.

## 8. WhatsApp Order Logging

In Supabase Dashboard, enable **Authentication > Sign In / Providers > Anonymous Sign-Ins**. This is required once for guest checkout.

The checkout creates an order reference, saves the order and its line items to Supabase, then opens WhatsApp. If saving fails, WhatsApp does not open, which prevents unlogged orders. Do not expose a service-role key in frontend files.
