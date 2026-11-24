-- =========================================================================
-- BAHS — Security migration, PART 1 (safe to run at any time)
-- Run in Supabase Dashboard → SQL Editor → New query → Run.
-- =========================================================================
-- 1. Password hashing inside Postgres (pgcrypto).
--    bcrypt in JavaScript costs ~80-100ms of CPU per login, far above the Cloudflare
--    free-tier limit of 10ms. With these functions the Worker sends the password to the
--    database and gets back true/false, so login costs the Worker almost no CPU.
--    Existing "$2b$" hashes created by bcryptjs keep working (same algorithm as "$2a$").
-- 2. A public Storage bucket for uploads, so files are no longer saved as base64 inside
--    database rows.
-- =========================================================================

create extension if not exists pgcrypto with schema extensions;

-- Returns true when the password matches the bcrypt hash.
create or replace function public.app_check_password(p_password text, p_hash text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select case
    when p_password is null or p_hash is null or length(p_hash) < 60 then false
    else extensions.crypt(
           p_password,
           case when left(p_hash, 4) in ('$2b$', '$2y$') then '$2a$' || substr(p_hash, 5) else p_hash end
         )
         = case when left(p_hash, 4) in ('$2b$', '$2y$') then '$2a$' || substr(p_hash, 5) else p_hash end
  end;
$$;

-- Returns a new bcrypt hash (cost 10) for the password.
create or replace function public.app_hash_password(p_password text)
returns text
language sql
volatile
security definer
set search_path = public, extensions
as $$
  select extensions.crypt(p_password, extensions.gen_salt('bf', 10));
$$;

-- Only the server (service_role key) may call these.
revoke all on function public.app_check_password(text, text) from public, anon, authenticated;
revoke all on function public.app_hash_password(text) from public, anon, authenticated;
grant execute on function public.app_check_password(text, text) to service_role;
grant execute on function public.app_hash_password(text) to service_role;

-- Public bucket for uploaded notice files / photos (max 6 MB each).
insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', true, 6291456)
on conflict (id) do update set public = true, file_size_limit = 6291456;

-- Quick self-test (should return: true | false)
select
  public.app_check_password('test-pass', public.app_hash_password('test-pass')) as correct_password,
  public.app_check_password('wrong-pass', public.app_hash_password('test-pass')) as wrong_password;
