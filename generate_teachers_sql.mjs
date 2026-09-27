import fs from 'fs';

const teachers = [
  { name_bengali: 'পারভীন আক্তার খানম', designation: 'প্রধান শিক্ষক', category: 'management', sort_order: 1 },
  { name_bengali: 'শিরিন আক্তার', designation: 'সহকারী প্রধান শিক্ষক', category: 'management', sort_order: 2 },
  { name_bengali: 'দীপক কুমার ঘোষ', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 4 },
  { name_bengali: 'নানু মিয়া', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 5 },
  { name_bengali: 'মোঃ গোলাম রব্বানী', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 6 },
  { name_bengali: 'মোঃ ছাদেকুল ইসলাম', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 7 },
  { name_bengali: 'মোঃ জাহিদুল ইসলাম চৌধুরী', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 8 },
  { name_bengali: 'মোছাঃ ফারহানা খানম', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 9 },
  { name_bengali: 'মোহাম্মদ কাজল মিয়া', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 10 },
  { name_bengali: 'মোহাম্মদ মোফাজ্জল হোসেন', designation: 'সিনিয়র শিক্ষক', category: 'faculty', sort_order: 11 },
  { name_bengali: 'আশীষ দাস', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 12 },
  { name_bengali: 'মোঃ আনোয়ার হোসেন', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 13 },
  { name_bengali: 'মোঃ আনোয়ারুল ইসলাম', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 14 },
  { name_bengali: 'মোঃ আব্দুল হাই', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 15 },
  { name_bengali: 'মোঃ আমিনুল ইসলাম', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 16 },
  { name_bengali: 'মোঃ ইমদাদুল হক', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 17 },
  { name_bengali: 'মোঃ জাকির হোসেন', designation: 'সহকারী শিক্ষক (গণিত)', category: 'faculty', sort_order: 18 },
  { name_bengali: 'মোঃ সাইদুর রহমান চৌধুরী', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 19 },
  { name_bengali: 'শাহ আলম', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 20 },
  { name_bengali: 'সুকেশ চন্দ্র পাল', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 21 },
  { name_bengali: 'সোনিয়া ইকবাল সম্পা', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 22 },
  { name_bengali: 'হুমায়ুন তালুকদার', designation: 'সহকারী শিক্ষক', category: 'faculty', sort_order: 23 },
  { name_bengali: 'তাজু মিয়া', designation: 'নিরাপত্তাকর্মী', category: 'management', sort_order: 24 },
  { name_bengali: 'বিশ্বজিৎ ঘোষ', designation: 'ল্যাব এ্যাসিসটেন্ট', category: 'management', sort_order: 25 },
  { name_bengali: 'মোঃ আক্তার হামিদ মামুন', designation: 'ট্রেড ইন্সট্রাক্টর', category: 'faculty', sort_order: 26 },
  { name_bengali: 'মোঃ আবিদুর রহমান', designation: 'পরিচ্ছন্নতাকর্মী', category: 'management', sort_order: 27 },
  { name_bengali: 'মোঃ আবুল কালাম', designation: 'অফিস সহায়ক', category: 'management', sort_order: 28 },
  { name_bengali: 'মোঃ রাকিবুল হাসান', designation: 'ল্যাব অপারেটর', category: 'management', sort_order: 29 },
  { name_bengali: 'মোছাঃ খাদিজা আক্তার', designation: 'আয়া', category: 'management', sort_order: 30 },
  { name_bengali: 'মোছাঃ পারভীন আক্তার', designation: 'অফিস সহকারী', category: 'management', sort_order: 31 }
];

let sql = `DELETE FROM teachers;\n\nINSERT INTO teachers (name_bengali, designation, category, sort_order) VALUES\n`;
const values = teachers.map(t => `('${t.name_bengali}', '${t.designation}', '${t.category}', ${t.sort_order})`);
sql += values.join(",\n") + ";\n";

fs.writeFileSync('insert_pdf_teachers.sql', sql);
console.log('SQL generated.');
