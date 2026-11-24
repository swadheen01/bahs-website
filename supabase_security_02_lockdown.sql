-- =========================================================================
-- BAHS — Security migration, PART 2: lock the database
-- =========================================================================
-- ⚠️  RUN THIS ONLY AFTER the website is deployed with the SUPABASE_SERVICE_ROLE_KEY
--     secret configured on Cloudflare (see SECURITY_SETUP.md). Otherwise the website
--     will not be able to read its own data.
--
-- Why: the public "anon" key is visible to every visitor (it is in the browser code).
-- Today that key can read every table — including users.password_hash — and write to them.
-- After this script, the anon key can no longer read or change ANY table. The website's
-- server uses the secret service_role key, which bypasses RLS.
-- Supabase Auth (Google login / password reset) keeps working; it does not use these tables.
-- =========================================================================

-- 1. Turn on Row Level Security everywhere.
alter table public.users          enable row level security;
alter table public.notices        enable row level security;
alter table public.teachers       enable row level security;
alter table public.alumni         enable row level security;
alter table public.gallery_photos enable row level security;

-- 2. Remove every existing policy on these tables (old "viewable by everyone" policies and any
--    permissive policies that were added later to make writes work with the anon key).
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('users', 'notices', 'teachers', 'alumni', 'gallery_photos')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 3. Defense in depth: remove direct table privileges from the public roles.
revoke all on table public.users, public.notices, public.teachers, public.alumni, public.gallery_photos
  from anon, authenticated;

-- 4. Check: this should list NO policies for these tables, and rls_enabled = true for all.
select c.relname as table_name, c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('users', 'notices', 'teachers', 'alumni', 'gallery_photos');
