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
- `admin_users` table
- Row Level Security policies
- public `product-images` Storage bucket
- admin-only write permissions

## 3. Create The Admin User

In Supabase Authentication, create the client login user.

Then add that user to `admin_users`:

```sql
insert into public.admin_users (user_id, email)
values ('PASTE_AUTH_USER_ID_HERE', 'client-email@example.com');
```

## 4. Add Supabase Public Config

Edit:

`assets/js/supabase-config.js`

Fill in:

```js
window.ANGUS_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLIC_ANON_KEY",
  productBucket: "product-images"
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
