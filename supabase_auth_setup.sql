-- =========================================================================
-- Baniyachong Adarsha High School (BAHS) - Supabase Auth & Role Setup SQL
-- =========================================================================
-- এই কোডটি Supabase Dashboard-এর "SQL Editor"-এ গিয়ে "Run" করুন।
-- =========================================================================

-- ১. users টেবিলে email কলাম যোগ করুন (যদি আগে থেকে না থাকে)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- ২. ইমেইলের জন্য দ্রুত সার্চ ইনডেক্স তৈরি করুন
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- ৩. ইমেইল যাতে ইউনিক হয় তা নিশ্চিত করার ইনডেক্স (ঐচ্ছিক)
CREATE UNIQUE INDEX IF NOT EXISTS users_unique_email_idx ON users(email) WHERE email IS NOT NULL AND email != '';

-- ৪. (ঐচ্ছিক) কোনো নির্দিষ্ট ব্যবহারকারীকে সরাসরি এডমিন বানাতে চাইলে নিচের কমান্ডটি চালান:
-- UPDATE users SET role = 'admin' WHERE username = 'admin' OR email = 'your-email@gmail.com';

