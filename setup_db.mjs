import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  'https://pyrccwywxhgislpweqkp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cmNjd3l3eGhnaXNscHdlcWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjMyNTEsImV4cCI6MjEwNjA5OTI1MX0.4lX5sBYCiwEslqAXEfJPNYgNnpY1FsPiTTrfu7hBjH0'
);

async function fixLogin() {
  const hash = await bcrypt.hash('123456', 10);
  
  // Create tables for gallery and sliders while we're at it!
  const sql = `
    -- Make sure users table has right hash
    UPDATE users SET password_hash = '${hash}' WHERE username = 'admin';
    
    -- Create Sliders Table
    CREATE TABLE IF NOT EXISTS sliders (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    -- Create Gallery Table
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Insert Default Slider
    INSERT INTO sliders (title, image, sort_order) VALUES
    ('শ্রেণী কক্ষ পরিদর্শনে উপজেলা মাধ্যমিক শিক্ষা অফিসার', '/images/hero/slide-1.jpg', 1)
    ON CONFLICT DO NOTHING;
  `;
  
  // Wait, I can't run raw SQL from the JS client using anon key!
}

fixLogin();
