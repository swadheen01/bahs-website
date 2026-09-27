# বানিয়াচং আদর্শ উচ্চ বিদ্যালয় — Official Website

> **Baniachong Adarsha High School (BAHS)** — Premium Official School Website  
> Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **TypeScript**, and a local **JSON/file-based** data system.

---

## 📋 Project Overview

This is the official website for **Baniachong Adarsha High School**, located in Baniachong Upazila, Habiganj, Bangladesh. The goal is to create a **premium, fully functional** school website comparable to the best government/private school websites in Bangladesh.

- **EIIN:** 129344
- **School Code:** 1903
- **Contact:** +8801309-129344 | bahs129344@yahoo.com

---

## 🗂️ Project Structure

```
bahs-website/
│
├── README.md                        ← You are here (Project documentation)
├── bahs_website_data.md             ← Main school data for AI agents & reference
├── bahs_info.md                     ← Additional school info (structured)
│
├── public/                          ← All static assets (images, icons, PDFs)
│   ├── images/
│   │   ├── logo/
│   │   │   └── logo.png             ← School logo (Place your logo here)
│   │   ├── hero/
│   │   │   ├── slide-1.jpg          ← Hero slider image 1 (Place here)
│   │   │   ├── slide-2.jpg          ← Hero slider image 2 (Place here)
│   │   │   └── slide-3.jpg          ← Hero slider image 3 (Place here)
│   │   ├── teachers/
│   │   │   ├── headmaster.jpg       ← Headmaster photo (Place here)
│   │   │   └── [teacher-name].jpg   ← Each teacher's photo (Place here)
│   │   ├── gallery/
│   │   │   └── [event-photos].jpg   ← School event/gallery photos (Place here)
│   │   ├── alumni/
│   │   │   └── [alumni-name].jpg    ← Notable alumni photos (Place here)
│   │   └── president/
│   │       └── president.jpg        ← Managing Committee President photo (Place here)
│   │
│   └── downloads/                   ← Downloadable files (PDFs, etc.)
│       ├── routine/
│       │   └── class-routine.pdf    ← Class routine PDF (Place here)
│       ├── notices/
│       │   └── [notice].pdf         ← Notice PDFs (Place here)
│       └── results/
│           └── [result].pdf         ← Result sheets (Place here)
│
├── src/
│   ├── app/                         ← Next.js 14 App Router pages
│   │   ├── layout.tsx               ← Root layout (Navbar + Footer)
│   │   ├── page.tsx                 ← Homepage
│   │   ├── globals.css              ← Global styles + Bengali font import
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx             ← Institution History page
│   │   ├── administration/
│   │   │   ├── managing-committee/page.tsx
│   │   │   ├── all-teachers/page.tsx
│   │   │   ├── former-headmasters/page.tsx
│   │   │   └── staff/page.tsx
│   │   ├── students/
│   │   │   ├── class-6/page.tsx
│   │   │   ├── class-7/page.tsx
│   │   │   ├── class-8/page.tsx
│   │   │   ├── class-9/page.tsx
│   │   │   └── class-10/page.tsx
│   │   ├── academics/
│   │   │   ├── calendar/page.tsx
│   │   │   ├── routine/page.tsx
│   │   │   ├── results/page.tsx
│   │   │   └── holidays/page.tsx
│   │   ├── notices/
│   │   │   └── page.tsx             ← Notice Board page
│   │   ├── gallery/
│   │   │   ├── photos/page.tsx
│   │   │   └── videos/page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx             ← Contact page with map & form
│   │   │
│   │   └── admin/                   ← 🔒 Admin Dashboard (Password Protected)
│   │       ├── login/page.tsx       ← Admin Login
│   │       ├── dashboard/page.tsx   ← Admin Dashboard home
│   │       ├── notices/page.tsx     ← Add/Edit/Delete Notices
│   │       ├── gallery/page.tsx     ← Upload Photos/Videos
│   │       ├── teachers/page.tsx    ← Manage Teacher Profiles
│   │       └── results/page.tsx     ← Upload Results
│   │
│   ├── components/                  ← Reusable UI Components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           ← Main navigation with dropdowns
│   │   │   ├── Footer.tsx           ← Footer with links & info
│   │   │   └── MobileMenu.tsx       ← Mobile hamburger menu
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSlider.tsx       ← Auto-sliding image carousel
│   │   │   ├── MarqueeNotice.tsx    ← Scrolling notice bar (like BD school sites)
│   │   │   ├── HeadmasterMessage.tsx ← Headmaster's message card
│   │   │   ├── PresidentMessage.tsx ← President's message card
│   │   │   ├── QuickLinks.tsx       ← Quick access buttons (Routine, Notice, etc.)
│   │   │   ├── NoticeBoard.tsx      ← Latest notices list
│   │   │   ├── TeachersGrid.tsx     ← Teachers showcase section
│   │   │   ├── AlumniSection.tsx    ← Notable alumni section
│   │   │   ├── GalleryPreview.tsx   ← Photo gallery preview (4-6 photos)
│   │   │   └── OfficialLinks.tsx    ← Links to govt. portals (BANBEIS, etc.)
│   │   │
│   │   └── ui/
│   │       ├── SectionTitle.tsx     ← Reusable section heading component
│   │       ├── TeacherCard.tsx      ← Individual teacher profile card
│   │       ├── NoticeItem.tsx       ← Individual notice list item
│   │       └── PageBanner.tsx       ← Inner page top banner with title
│   │
│   ├── data/                        ← JSON data files (edit to update content)
│   │   ├── school-info.json         ← General school information
│   │   ├── teachers.json            ← Teachers directory
│   │   ├── notices.json             ← Notice board entries
│   │   ├── gallery.json             ← Gallery image metadata
│   │   ├── alumni.json              ← Notable alumni data
│   │   └── official-links.json      ← External government links
│   │
│   └── lib/
│       └── utils.ts                 ← Utility functions
│
├── next.config.js                   ← Next.js configuration
├── tailwind.config.ts               ← Tailwind CSS configuration (Bengali fonts)
├── tsconfig.json                    ← TypeScript configuration
└── package.json                     ← Dependencies
```

---

## 🎨 Design System

| Element | Value |
|---|---|
| **Primary Color** | `#051939` (Dark Navy Blue) |
| **Accent Color** | `#800505` (Deep Red) |
| **Secondary Color** | `#06874A` (Green — BD flag) |
| **Background** | `#FFFFFF` |
| **Font (Bengali)** | Noto Sans Bengali / Hind Siliguri |
| **Font (English)** | Inter / Montserrat |

---

## 📄 Pages List

| Page | Route | Status |
|---|---|---|
| হোমপেজ (Homepage) | `/` | ✅ Building |
| প্রতিষ্ঠানের ইতিহাস | `/about` | ✅ Building |
| ম্যানেজিং কমিটি | `/administration/managing-committee` | ✅ Building |
| সকল শিক্ষক | `/administration/all-teachers` | ✅ Building |
| শ্রেণী তথ্য (Class 6-10) | `/students/class-[6-10]` | ✅ Building |
| একাডেমিক ক্যালেন্ডার | `/academics/calendar` | ✅ Building |
| ক্লাস রুটিন | `/academics/routine` | ✅ Building |
| ফলাফল | `/academics/results` | ✅ Building |
| নোটিশ বোর্ড | `/notices` | ✅ Building |
| ফটোগ্যালারী | `/gallery/photos` | ✅ Building |
| ভিডিও গ্যালারী | `/gallery/videos` | ✅ Building |
| যোগাযোগ | `/contact` | ✅ Building |
| 🔒 Admin Login | `/admin/login` | ✅ Building |
| 🔒 Admin Dashboard | `/admin/dashboard` | ✅ Building |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Icons** | React Icons / Lucide React |
| **Slider/Carousel** | Embla Carousel |
| **Image Upload (Admin)** | Next.js API Routes + Local File Storage |
| **Data Storage** | JSON files (no database needed) |
| **Deployment** | Vercel (recommended) |

---

## 🖼️ Image Placement Guide

আপনার ছবিগুলো নিচের ফোল্ডারে রাখুন:

```
public/images/logo/          → স্কুলের লোগো রাখুন (logo.png)
public/images/hero/          → স্লাইডারের ছবি রাখুন (slide-1.jpg, slide-2.jpg ...)
public/images/teachers/      → শিক্ষকদের ছবি রাখুন (নাম অনুযায়ী)
public/images/gallery/       → গ্যালারির ছবি রাখুন
public/images/president/     → সভাপতির ছবি রাখুন (president.jpg)
public/downloads/notices/    → নোটিশের PDF রাখুন
public/downloads/routine/    → রুটিনের PDF রাখুন
```

---

## 🔒 Admin Panel Access

- **URL:** `/admin/login`
- **Default Password:** `bahs@admin2025` *(প্রথম লগইনের পর পরিবর্তন করুন)*
- **Features:**
  - নোটিশ যোগ/সম্পাদনা/মুছে ফেলুন
  - ছবি আপলোড করুন
  - শিক্ষকের প্রোফাইল আপডেট করুন
  - ফলাফল আপলোড করুন

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Official Links (Footer এ থাকবে)

- [জাতীয় ওয়েব পোর্টাল](https://bangladesh.gov.bd/)
- [মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর](https://www.dshe.gov.bd/)
- [ব্যানবেইস (BANBEIS)](http://www.banbeis.gov.bd/)
- [শিক্ষক বাতায়ন](https://www.teachers.gov.bd/)
- [এডুকেশন বোর্ড ফলাফল](http://www.educationboardresults.gov.bd/)
- [মুক্তপাঠ](https://www.muktopaath.gov.bd/)
- [পাঠ্যবই (NCTB)](https://nctb.gov.bd/)

---

*সর্বস্বত্ব সংরক্ষিত © বানিয়াচং আদর্শ উচ্চ বিদ্যালয় ২০২৫*