-- =========================================================================
-- BAHS — Keep-alive function for the GitHub "Supabase Keep-Alive" workflow
-- =========================================================================
-- After supabase_security_02_lockdown.sql, the public anon key can no longer read any
-- table, so the workflow cannot ping the "notices" table anymore. This function runs a
-- real (tiny) database query that keeps the free project from being paused, and returns
-- only the current time: no table data is exposed.
-- Run once in Supabase → SQL Editor.
-- =========================================================================

create or replace function public.keep_alive()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$ select now() $$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon, authenticated, service_role;

-- Check: should return the current date and time.
select public.keep_alive();
