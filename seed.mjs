import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://pyrccwywxhgislpweqkp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cmNjd3l3eGhnaXNscHdlcWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjMyNTEsImV4cCI6MjEwNjA5OTI1MX0.4lX5sBYCiwEslqAXEfJPNYgNnpY1FsPiTTrfu7hBjH0';
const supabase = createClient(supabaseUrl, supabaseKey);

const dataDir = path.join(__dirname, 'src', 'data');

const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
  } catch(e) {
    return [];
  }
};

async function seed() {
  console.log('Seeding Data to Supabase...');

  // 1. Users
  const users = readJSON('users.json');
  if (users.length > 0) {
    const { error } = await supabase.from('users').upsert(
      users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        password_hash: u.passwordHash,
        role: u.role,
        teacher_id: u.teacherId || null,
        class: u.class || null,
        active: u.active !== false
      }))
    );
    console.log('Users seeded:', error ? error.message : 'Success');
  }

  // 2. Notices
  const notices = readJSON('notices.json');
  if (notices.length > 0) {
    const { error } = await supabase.from('notices').upsert(
      notices.map(n => ({
        id: n.id,
        title: n.title,
        date: n.date,
        date_iso: n.dateISO,
        type: n.type,
        file_url: n.fileUrl,
        is_new: n.isNew,
        added_by: n.addedBy || 'System'
      }))
    );
    console.log('Notices seeded:', error ? error.message : 'Success');
  }

  // 3. Teachers
  const teachers = readJSON('teachers.json');
  if (teachers.length > 0) {
    const { error } = await supabase.from('teachers').upsert(
      teachers.map(t => ({
        id: t.id,
        name_bengali: t.nameBengali,
        name_english: t.nameEnglish || '',
        designation: t.designation,
        designation_en: t.designationEn || '',
        subject: t.subject || '',
        category: t.category,
        photo: t.photo || '',
        sort_order: t.order || t.id
      }))
    );
    console.log('Teachers seeded:', error ? error.message : 'Success');
  }

  // 4. Alumni
  const alumni = readJSON('alumni.json');
  if (alumni.length > 0) {
    const { error } = await supabase.from('alumni').upsert(
      alumni.map(a => ({
        id: a.id,
        name_bengali: a.nameBengali,
        name_english: a.nameEnglish || '',
        institution: a.institution,
        degree: a.degree,
        photo: a.photo || '',
        passing_year: a.year || null
      }))
    );
    console.log('Alumni seeded:', error ? error.message : 'Success');
  }

  // 5. Gallery
  const gallery = readJSON('gallery.json');
  if (gallery.length > 0) {
    const { error } = await supabase.from('gallery_photos').upsert(
      gallery.map(g => ({
        id: g.id,
        src: g.src,
        caption: g.caption,
        category: g.category
      }))
    );
    console.log('Gallery seeded:', error ? error.message : 'Success');
  }
}

seed();
