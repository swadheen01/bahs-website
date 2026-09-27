-- Data Migration Script
-- Copy this entire file and run it in the Supabase SQL Editor

-- Insert Users
INSERT INTO users (id, name, username, password_hash, role, teacher_id, class, active) VALUES (1, 'Admin', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', NULL, NULL, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, name, username, password_hash, role, teacher_id, class, active) VALUES (2, 'পারভীন আক্তার খানম', 'headmaster', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'teacher', 1, NULL, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, name, username, password_hash, role, teacher_id, class, active) VALUES (3, 'Student Demo', 'student', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', NULL, '10', true) ON CONFLICT (id) DO NOTHING;

-- Insert Notices
INSERT INTO notices (id, title, date, date_iso, type, file_url, is_new, added_by) VALUES (1, 'বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের ওয়েবসাইটে আপনাকে স্বাগতম', '২৯ আগস্ট ২০২৩', '2023-08-29', 'general', NULL, false, 'System') ON CONFLICT (id) DO NOTHING;
INSERT INTO notices (id, title, date, date_iso, type, file_url, is_new, added_by) VALUES (2, 'ওয়েবসাইট আপডেটের কাজ চলছে, অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত', '২৯ আগস্ট ২০২৩', '2023-08-29', 'general', NULL, false, 'System') ON CONFLICT (id) DO NOTHING;
INSERT INTO notices (id, title, date, date_iso, type, file_url, is_new, added_by) VALUES (3, 'বার্ষিক পরীক্ষার সময়সূচি প্রকাশিত হয়েছে', '২০ সেপ্টেম্বর ২০২৫', '2025-09-20', 'exam', '/downloads/notices/annual-exam-schedule.pdf', true, 'System') ON CONFLICT (id) DO NOTHING;
INSERT INTO notices (id, title, date, date_iso, type, file_url, is_new, added_by) VALUES (4, 'নতুন শিক্ষাবর্ষে ভর্তি বিজ্ঞপ্তি — ২০২৬', '১৫ সেপ্টেম্বর ২০২৫', '2025-09-15', 'admission', NULL, true, 'System') ON CONFLICT (id) DO NOTHING;
INSERT INTO notices (id, title, date, date_iso, type, file_url, is_new, added_by) VALUES (5, 'অভিভাবক সভা আগামী শুক্রবার বিকাল ৩টায় অনুষ্ঠিত হবে', '১০ সেপ্টেম্বর ২০২৫', '2025-09-10', 'general', NULL, false, 'System') ON CONFLICT (id) DO NOTHING;

-- Insert Teachers
INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (1, 'পারভীন আক্তার খানম', 'Parveen Akter Khanam', 'প্রধান শিক্ষক', 'Headmaster', '', 'management', '/images/teachers/headmaster.jpg', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (2, 'শিরিন আক্তার', 'Shirin Akter', 'সহকারী প্রধান শিক্ষক', 'Assistant Headmaster', '', 'management', '/images/teachers/shirin-akter.jpg', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (3, 'মোহাম্মদ মোফাজ্জল হোসেন', 'Mohammad Mofazzal Hossain', 'সিনিয়র শিক্ষক', 'Senior Teacher', 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', 'faculty', '/images/teachers/mofazzal-hossain.jpg', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (4, 'মোঃ নানু মিয়া', 'Md. Nanu Miah', 'সিনিয়র শিক্ষক', 'Senior Teacher', 'ব্যবসায় শিক্ষা (Business Studies)', 'faculty', '/images/teachers/nanu-miah.jpg', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (5, 'দীপক কুমার ঘোষ', 'Dipak Kumar Ghosh', 'সিনিয়র শিক্ষক', 'Senior Teacher', 'হিন্দু ধর্ম (Hindu Religion)', 'faculty', '/images/teachers/dipak-ghosh.jpg', 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (6, 'মোহাম্মদ কাজল মিয়া', 'Mohammad Kajol Miah', 'সিনিয়র শিক্ষক', 'Senior Teacher', 'জীব বিজ্ঞান (Biology)', 'faculty', '/images/teachers/kajol-miah.jpg', 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (7, 'মোঃ গোলাম রব্বানী', 'Md. Golam Rabbani', 'সিনিয়র শিক্ষক', 'Senior Teacher', 'বাংলা (Bengali)', 'faculty', '/images/teachers/golam-rabbani.jpg', 7) ON CONFLICT (id) DO NOTHING;

-- Insert Gallery
INSERT INTO gallery_photos (id, src, caption, category) VALUES (1, '/images/gallery/photo-1.jpg', 'শ্রেণী কক্ষ পরিদর্শনে উপজেলা মাধ্যমিক শিক্ষা অফিসার', 'event') ON CONFLICT (id) DO NOTHING;
INSERT INTO gallery_photos (id, src, caption, category) VALUES (2, '/images/gallery/photo-2.jpg', 'অভিভাবক প্রতিনিধির সাথে শিক্ষকদের একাংশ', 'event') ON CONFLICT (id) DO NOTHING;
INSERT INTO gallery_photos (id, src, caption, category) VALUES (3, '/images/gallery/photo-3.jpg', 'শিক্ষার্থীদের একাংশ', 'students') ON CONFLICT (id) DO NOTHING;
INSERT INTO gallery_photos (id, src, caption, category) VALUES (4, '/images/gallery/photo-4.jpg', 'আমাদের বিদ্যালয় ভবন', 'campus') ON CONFLICT (id) DO NOTHING;
INSERT INTO gallery_photos (id, src, caption, category) VALUES (5, '/images/gallery/photo-5.jpg', 'আমাদের বিদ্যালয়', 'campus') ON CONFLICT (id) DO NOTHING;

