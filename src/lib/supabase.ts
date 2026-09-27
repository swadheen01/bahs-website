import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pyrccwywxhgislpweqkp.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cmNjd3l3eGhnaXNscHdlcWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjMyNTEsImV4cCI6MjEwNjA5OTI1MX0.4lX5sBYCiwEslqAXEfJPNYgNnpY1FsPiTTrfu7hBjH0";

export const supabase = createClient(supabaseUrl, supabaseKey);
