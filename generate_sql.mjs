import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'src', 'data');

const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
  } catch(e) {
    return [];
  }
};

const escapeStr = (str) => {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? 'true' : 'false';
  return `'${String(str).replace(/'/g, "''")}'`;
};

let sql = `-- Data Migration Script
-- Copy this entire file and run it in the Supabase SQL Editor\n\n`;

// 1. Users
const users = readJSON('users.json');
if (users.length > 0) {
  sql += `-- Insert Users\n`;
  users.forEach(u => {
    sql += `INSERT INTO users (id, name, username, password_hash, role, teacher_id, class, active) VALUES (${u.id}, ${escapeStr(u.name)}, ${escapeStr(u.username)}, ${escapeStr(u.passwordHash)}, ${escapeStr(u.role)}, ${u.teacherId || 'NULL'}, ${escapeStr(u.class)}, ${u.active !== false}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  sql += `\n`;
}

// 2. Notices
const notices = readJSON('notices.json');
if (notices.length > 0) {
  sql += `-- Insert Notices\n`;
  notices.forEach(n => {
    sql += `INSERT INTO notices (id, title, date, date_iso, type, file_url, is_new, added_by) VALUES (${n.id}, ${escapeStr(n.title)}, ${escapeStr(n.date)}, ${escapeStr(n.dateISO)}, ${escapeStr(n.type)}, ${escapeStr(n.fileUrl)}, ${n.isNew !== false}, ${escapeStr(n.addedBy || 'System')}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  sql += `\n`;
}

// 3. Teachers
const teachers = readJSON('teachers.json');
if (teachers.length > 0) {
  sql += `-- Insert Teachers\n`;
  teachers.forEach(t => {
    sql += `INSERT INTO teachers (id, name_bengali, name_english, designation, designation_en, subject, category, photo, sort_order) VALUES (${t.id}, ${escapeStr(t.nameBengali)}, ${escapeStr(t.nameEnglish)}, ${escapeStr(t.designation)}, ${escapeStr(t.designationEn)}, ${escapeStr(t.subject)}, ${escapeStr(t.category)}, ${escapeStr(t.photo)}, ${t.order || t.id}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  sql += `\n`;
}

// 4. Alumni
const alumni = readJSON('alumni.json');
if (alumni.length > 0) {
  sql += `-- Insert Alumni\n`;
  alumni.forEach(a => {
    sql += `INSERT INTO alumni (id, name_bengali, name_english, institution, degree, photo, passing_year) VALUES (${a.id}, ${escapeStr(a.nameBengali)}, ${escapeStr(a.nameEnglish)}, ${escapeStr(a.institution)}, ${escapeStr(a.degree)}, ${escapeStr(a.photo)}, ${escapeStr(a.year)}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  sql += `\n`;
}

// 5. Gallery
const gallery = readJSON('gallery.json');
if (gallery.length > 0) {
  sql += `-- Insert Gallery\n`;
  gallery.forEach(g => {
    sql += `INSERT INTO gallery_photos (id, src, caption, category) VALUES (${g.id}, ${escapeStr(g.src)}, ${escapeStr(g.caption)}, ${escapeStr(g.category)}) ON CONFLICT (id) DO NOTHING;\n`;
  });
  sql += `\n`;
}

fs.writeFileSync(path.join(__dirname, 'data_migration.sql'), sql);
console.log('SQL Migration script generated: data_migration.sql');
