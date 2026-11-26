-- =========================================================================
-- BAHS — Managing committee (বিদ্যালয় পরিচালনা কমিটি) — replaces the whole list
-- =========================================================================
-- Source: the committee notice board at the school (4 members).
-- Run once in Supabase → SQL Editor. It removes the old (sample) committee members
-- and inserts the 4 current members in board order.
-- Later changes can be made from Admin → ম্যানেজিং কমিটি ব্যবস্থাপনা.
-- =========================================================================

begin;

delete from public.notices where type = 'committee';

insert into public.notices (id, title, date, date_iso, file_url, type, added_by, is_new) values
  (1820000001, '{"name":"মোঃ শফিকুল ইসলাম","nameEn":"Md. Shafiqul Islam","designation":"উপজেলা পল্লী উন্নয়ন কর্মকর্তা ও সভাপতি","designationEn":"Upazila Rural Development Officer & President","category":"সভাপতি","phone":"","term":"২০২৪ - ২০২৬","bio":"উপজেলা পল্লী উন্নয়ন কর্মকর্তা, বানিয়াচং, হবিগঞ্জ এবং সভাপতি, বিদ্যালয় পরিচালনা কমিটি, বানিয়াচং আদর্শ উচ্চ বিদ্যালয়।","sortOrder":1}', 'উপজেলা পল্লী উন্নয়ন কর্মকর্তা ও সভাপতি', current_date, '/images/president/shofiqul_islam.jpg', 'committee', 'সভাপতি', false),
  (1820000002, '{"name":"আমিনুল ইসলাম","nameEn":"Aminul Islam","designation":"সহকারী শিক্ষক ও শিক্ষক প্রতিনিধি","designationEn":"Assistant Teacher & Teacher Representative","category":"শিক্ষক প্রতিনিধি","phone":"","term":"২০২৪ - ২০২৬","bio":"সহকারী শিক্ষক, বানিয়াচং আদর্শ উচ্চ বিদ্যালয় এবং বিদ্যালয় পরিচালনা কমিটির শিক্ষক প্রতিনিধি।","sortOrder":2}', 'সহকারী শিক্ষক ও শিক্ষক প্রতিনিধি', current_date, '/images/teachers/aminul.jpg', 'committee', 'শিক্ষক প্রতিনিধি', false),
  (1820000003, '{"name":"শংকর গোপ","nameEn":"Shankar Gope","designation":"অভিভাবক প্রতিনিধি","designationEn":"Guardian Representative","category":"অভিভাবক প্রতিনিধি","phone":"","term":"২০২৪ - ২০২৬","bio":"বিদ্যালয় পরিচালনা কমিটির অভিভাবক প্রতিনিধি।","sortOrder":3}', 'অভিভাবক প্রতিনিধি', current_date, '/images/teachers/default-avatar.png', 'committee', 'অভিভাবক প্রতিনিধি', false),
  (1820000004, '{"name":"পারভীন আক্তার খানম","nameEn":"Parvin Akter Khanam","designation":"প্রধান শিক্ষক ও সদস্য সচিব","designationEn":"Headmaster & Member Secretary","category":"সদস্য সচিব","phone":"","term":"পদাধিকারবলে","bio":"বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের প্রধান শিক্ষক ও বিদ্যালয় পরিচালনা কমিটির সদস্য সচিব।","sortOrder":4}', 'প্রধান শিক্ষক ও সদস্য সচিব', current_date, '/images/teachers/headmaster.jpg', 'committee', 'সদস্য সচিব', false);

commit;

-- Check: should list the 4 members in order.
select id, title::json->>'name' as name, title::json->>'category' as category, file_url as photo
from public.notices where type = 'committee' order by id;

-- -------------------------------------------------------------------------
-- President's photo in "সভাপতির বাণী" (homepage + About page).
-- Only replaces the placeholder; a photo already chosen in the admin panel is kept.
-- -------------------------------------------------------------------------
update public.notices
set file_url = jsonb_set(file_url::jsonb, '{presidentMessage,photo}', '"/images/president/shofiqul_islam.jpg"')::text
where type = 'school_info'
  and file_url like '{%'
  and coalesce(file_url::jsonb #>> '{presidentMessage,photo}', '') in ('', '/images/president/president.jpg')
  and (file_url::jsonb ? 'presidentMessage');
