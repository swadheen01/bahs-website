import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase client.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (a Cloudflare secret, never shipped to the browser) so that
 * the database can be fully locked down with Row Level Security for the public anon key.
 *
 * If the service key is not configured yet, it falls back to the public anon key so the site
 * keeps working during migration (see SECURITY_SETUP.md).
 *
 * The client is created lazily on first use because on Cloudflare Workers `process.env`
 * is populated per request, after modules have been evaluated.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pyrccwywxhgislpweqkp.supabase.co";
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cmNjd3l3eGhnaXNscHdlcWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjMyNTEsImV4cCI6MjEwNjA5OTI1MX0.4lX5sBYCiwEslqAXEfJPNYgNnpY1FsPiTTrfu7hBjH0";

let cachedClient: SupabaseClient | null = null;
let cachedKey = "";
let warned = false;

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ANON_KEY;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !warned && process.env.NODE_ENV === "production") {
    warned = true;
    console.warn("[supabase] SUPABASE_SERVICE_ROLE_KEY is not set; falling back to the public anon key.");
  }
  if (!cachedClient || cachedKey !== key) {
    cachedClient = createClient(SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    cachedKey = key;
  }
  return cachedClient;
}

/** Drop-in replacement for the old `supabase` import in server code (lazy proxy). */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin() as any;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
