import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  'https://pyrccwywxhgislpweqkp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cmNjd3l3eGhnaXNscHdlcWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjMyNTEsImV4cCI6MjEwNjA5OTI1MX0.4lX5sBYCiwEslqAXEfJPNYgNnpY1FsPiTTrfu7hBjH0'
);

async function testLogin() {
  const username = 'admin';
  const password = '123456';

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.log("Supabase Error:", error.message);
    return;
  }

  if (!user) {
    console.log("User not found in DB.");
    return;
  }

  console.log("User found:", user);

  const isMatch = await bcrypt.compare(password, user.password_hash);
  console.log("Password match?", isMatch);
}

testLogin();
