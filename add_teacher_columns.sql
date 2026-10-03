-- ============================================================
-- Run this SQL in Supabase SQL Editor
-- https://supabase.com/dashboard > SQL Editor
-- ============================================================

-- Add main_subject column (e.g., "ICT", "Mathematics")
ALTER TABLE teachers 
  ADD COLUMN IF NOT EXISTS main_subject TEXT;

-- Add courses column (teacher's special training/courses, one per line)
ALTER TABLE teachers 
  ADD COLUMN IF NOT EXISTS courses TEXT;

-- Add pending edit columns for teacher-submitted edit approval workflow
ALTER TABLE teachers 
  ADD COLUMN IF NOT EXISTS has_pending_edit BOOLEAN DEFAULT FALSE;

ALTER TABLE teachers 
  ADD COLUMN IF NOT EXISTS pending_edit_data JSONB;

ALTER TABLE teachers 
  ADD COLUMN IF NOT EXISTS pending_edit_submitted_by TEXT;

ALTER TABLE teachers 
  ADD COLUMN IF NOT EXISTS pending_edit_submitted_at TIMESTAMPTZ;

-- ============================================================
-- Done! Now refresh your Supabase schema cache.
-- ============================================================
