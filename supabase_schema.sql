-- ==========================================
-- Supabase Schema for BAHS Website
-- ==========================================

-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  teacher_id INTEGER,
  class VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- No default admin is inserted here (a published default password is a backdoor).
-- Create the first admin by registering normally, then run in the SQL editor:
--   UPDATE users SET role = 'admin' WHERE username = '<your-username>';

-- 2. Notices Table
CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date VARCHAR(50) NOT NULL,
  date_iso DATE NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  file_url TEXT,
  is_new BOOLEAN DEFAULT true,
  added_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Teachers Table
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name_bengali VARCHAR(255) NOT NULL,
  name_english VARCHAR(255),
  designation VARCHAR(255) NOT NULL,
  designation_en VARCHAR(255),
  subject VARCHAR(255),
  category VARCHAR(50) CHECK (category IN ('management', 'faculty')),
  photo TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 4. Alumni (Kriti Shikkharthi) Table
CREATE TABLE alumni (
  id SERIAL PRIMARY KEY,
  name_bengali VARCHAR(255) NOT NULL,
  name_english VARCHAR(255),
  institution VARCHAR(255),
  degree VARCHAR(255),
  photo TEXT,
  passing_year VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Gallery Table
CREATE TABLE gallery_photos (
  id SERIAL PRIMARY KEY,
  src TEXT NOT NULL,
  caption VARCHAR(255),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Optional: Enable Row Level Security (RLS) for extra safety
-- If you plan to call Supabase directly from the frontend using anon key, enable these.
-- Since we are using Next.js API routes with a server-side DB approach, RLS is optional but good practice.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to necessary tables
CREATE POLICY "Public notices are viewable by everyone" ON notices FOR SELECT USING (true);
CREATE POLICY "Public teachers are viewable by everyone" ON teachers FOR SELECT USING (true);
CREATE POLICY "Public alumni are viewable by everyone" ON alumni FOR SELECT USING (true);
CREATE POLICY "Public gallery is viewable by everyone" ON gallery_photos FOR SELECT USING (true);

-- Allow all operations to the service role (Next.js API backend)
-- (No specific policies needed for service_role key as it bypasses RLS)
