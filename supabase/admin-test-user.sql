-- Create the test administrator in Supabase Dashboard first:
-- Authentication > Users > Add user > Create new user.
-- Use an email you control and a unique password; enable Auto Confirm User for testing.
-- Then replace the email below and run this statement in SQL Editor.

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'admin@angusgrill.co.uk'
on conflict (user_id) do update set email = excluded.email;
