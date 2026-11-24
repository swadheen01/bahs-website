# বানিয়াচং আদর্শ উচ্চ বিদ্যালয় — Official Website (BAHS)

> **Baniachong Adarsha High School (BAHS)** — Official School Web Application  
> Built with **Next.js 16.4.2 (App Router + Turbopack)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, **Supabase**, **iron-session**, and **Cloudflare Workers (`@opennextjs/cloudflare`)**.

---

## 1. School Profile & Institutional Data

| Field | Details |
|---|---|
| **Name (Bengali)** | বানিয়াচং আদর্শ উচ্চ বিদ্যালয় |
| **Name (English)** | Baniachong Adarsha High School (`BAHS`) |
| **Established** | ২৪শে জানুয়ারী, ১৯৮৫ (January 24, 1985) |
| **EIIN** | `129344` |
| **School Code** | `1903` |
| **Total Campus Area** | ২ একর ৫২ শতক (2.52 Acres) |
| **Address** | ১নং উত্তর পূর্ব ইউনিয়ন, উপজেলাঃ বানিয়াচং, জেলাঃ হবিগঞ্জ (Baniachong, Habiganj, Bangladesh) |
| **Location Coordinates** | `24.5315531, 91.3593032` (`Plus Code: G9J5+JJ4, Baniachong`) |
| **Phone** | `+8801309-129344` |
| **Email** | `bah129344s@gmail.com` |
| **Classes** | Class 6 to Class 10 (including Vocational stream) |
| **Education Board** | Board of Intermediate and Secondary Education, Sylhet |

Other supplementary reference markdown files in the repo:
- `AGENTS.md` — Next.js 16 agent rules (auto-maintained by `next dev`; do not delete).
- `CLAUDE.md` — Points to `@AGENTS.md`.
- `bahs_website_data.md`, `bahs_info.md`, `bahs_extracted_info.md` — Historical school text/data extracts.

---

## 2. Tech Stack & Deployment Architecture

| Layer | Technology |
|---|---|
| **Framework** | Next.js `16.4.2` (App Router, Turbopack, `force-dynamic` APIs/SSR) |
| **UI & Language** | React `19.2.8`, TypeScript `5`, Tailwind CSS `v4` (`@tailwindcss/postcss`) |
| **Database** | Supabase (`@supabase/supabase-js`) with local JSON fallback snapshots (`src/data/*.json`) |
| **Authentication** | `iron-session` (`bahs_session` HTTP-only encrypted cookie) + `bcryptjs` password hashing |
| **Media & Exports** | `html-to-image` (`toJpeg` for Testimonial & Class Routine JPG export), `xlsx` (Excel result import) |
| **Icons & Fonts** | `react-icons`, `Kalpurush`, `Hind Siliguri`, `Noto Sans Bengali`, `Inter`, `Cinzel`, `Caveat`, `Tinos` |
| **Hosting / Edge** | Cloudflare Workers via `@opennextjs/cloudflare` (`open-next.config.ts`, `wrangler.jsonc`) |

### Next.js & Cloudflare Configuration
- `next.config.ts`: Enables `image/avif` & `image/webp`, `optimizePackageImports: ["react-icons"]`, and remote image pattern `https://www.bahs.edu.bd`.
- `wrangler.jsonc`: Worker name `bahs-website`, entry `.open-next/worker.js`, `nodejs_compat` enabled, static assets in `.open-next/assets`.
- `open-next.config.ts`: Uses `defineCloudflareConfig()` with `buildCommand: "npm run build:next"`.

---

## 3. Database Schema & Data Flow (`Supabase` + `src/data/*.json`)

Primary database client is in `src/lib/supabase.ts` and core data access helpers live in `src/lib/db.ts`.

### Supabase Tables (`supabase_schema.sql` + migrations)
1. **`users`**: `id`, `name`, `username` (unique), `password_hash`, `role` (`admin` | `teacher` | `student`), `teacher_id`, `class`, `active`, `created_at`.
2. **`teachers`**: `id`, `name_bengali`, `name_english`, `designation`, `designation_en`, `subject`, `category` (`management` | `faculty`), `photo` (`TEXT`), `sort_order`, plus profile/approval columns (`phone`, `email`, `joining_date`, `education`, `bio`, `has_pending_edit`, `pending_edit_data`, etc. via `add_teacher_columns.sql` & `add_teacher_profile_columns.sql`).
3. **`alumni`**: `id`, `name_bengali`, `name_english`, `institution`, `degree`, `photo` (`TEXT`), `passing_year`, `created_at`.
4. **`gallery_photos`**: `id`, `src` (`TEXT`), `caption`, `category`, `created_at`.
5. **`notices`** *(Multiplexed Table)*:
   Columns: `id` (`SERIAL`/32-bit int), `title` (`TEXT`), `date` (`VARCHAR(50)`), `date_iso` (`DATE`), `type` (`VARCHAR(50)`), `file_url` (`TEXT`), `is_new` (`BOOLEAN`), `added_by` (`VARCHAR(255)`).

### `notices.type` Multiplexing Reference
To store structured site modules persistently without extra schema migrations, several modules share the `notices` table distinguished by `type`:

| `type` value | Purpose | Storage Convention |
|---|---|---|
| `urgent` / `general` / `admission` / `exam` / etc. | Public Notice Board items | Standard columns (`title`, `date`, `date_iso`, `file_url`, `is_new`, `added_by`) |
| `slider` | Hero Carousel slides | Slide metadata & image URL/Data URL |
| `gallery` | Gallery photo/video entries | Used alongside `gallery_photos` |
| `staff` | Current school staff | JSON payload in `title` (`TEXT`), `"staff"` in `added_by` (backward-compatible with legacy `added_by` JSON) |
| `former_staff` | Former teachers & staff | JSON payload in `title` (`TEXT`) |
| `committee` | Managing Committee members | JSON payload in `title` (`TEXT`), short category in `added_by` (`<= 250` chars) |
| `holiday` | Annual holiday entries (`2026`) | JSON payload in `title` (`TEXT`), `"holiday"` in `added_by` |
| `calendar` | Official Academic Calendar PDF/JPG link | `file_url` holds `/downloads/calendar-2026.jpg` or uploaded file |
| `routine` | Uploaded Routine files (PDF/JPG) | `file_url` holds file, `added_by` holds `class:<c>\|year:<y>` |
| `routine_weekly` | Interactive Class 6–10 weekly schedule | `file_url` holds JSON map (`weeklyRoutines`) |
| `result` | Internal exam results | Full result JSON (including `marks`) in `title` (`TEXT`), short summary in `added_by` |
| `school_info` | School stats, messages, class sections | JSON in `file_url` / `title` |
| `testimonial_counter` | Auto-incrementing testimonial serial | Serial count |

> **Important Schema Constraint:** `notices.added_by` is `VARCHAR(255)` and `notices.date` is `VARCHAR(50)`. Always store large JSON objects in `notices.title` (`TEXT`) or `notices.file_url` (`TEXT`), and truncate `added_by` to `<= 250` characters.

### Caching & Real-Time Updates
- **All public pages are static** (`force-static` / `generateStaticParams`), prerendered at build time and served on Cloudflare from the OpenNext static-assets cache (`open-next.config.ts`, `enableCacheInterception`), so a page view does not run React on the Worker (free-tier 10ms CPU limit).
- Client components show the prerendered data, then refresh once via `useFreshData()` (`src/lib/useFreshData.ts`). The homepage uses a single bundled endpoint `/api/home`.
- Public APIs return `Cache-Control: public, max-age=60, stale-while-revalidate=300`; results, testimonial counter and auth/admin APIs return `no-store`. Admin dashboards fetch with `{ cache: "no-store" }` and always see fresh data.
- Server data access goes through `src/lib/supabaseServer.ts` (service-role key) and `src/lib/publicData.ts`; the browser-side `src/lib/supabase.ts` (anon key) is used only for Supabase Auth.
- Images are served unoptimized as static assets (`images.unoptimized`), no `/_next/image` Worker calls.
- `src/data/*.json` files provide baseline seed snapshots and automatic read fallbacks if Supabase is unreachable.
- See **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)** for required secrets and the Supabase security migration.

---

## 4. Authentication & Role System

Session management (`src/lib/auth.ts` & `src/lib/AuthContext.tsx`) uses `iron-session` (`bahs_session`):
- **Cookie Security:** `secure: process.env.NODE_ENV === "production"`. When running a local production build (`npm run start`), access the site via `http://localhost:3000` (not `127.0.0.1`) so browsers treat the origin as trustworthy for `Secure` cookies.
- **Roles:**
  - `admin`: Full access to `/dashboard/admin/*` (notices, sliders, gallery, teachers + approval queue, staff, former staff, committee, alumni, classes & stats, routines, holidays, results, users, messages).
  - `teacher`: Access to `/dashboard/teacher` to view/edit their own profile (changes are queued in `teachers.has_pending_edit` / `pending_edit_data` for admin approval via `/api/teachers/[id]/approve` or `/reject`).
  - `student`: Access to `/dashboard/student` (class info, routine, notices, results).
- **Auth Flows:** Standard username/password login (`/api/auth/login`), registration (`/api/auth/register`), Google OAuth verification (`/auth/callback`, `/api/auth/google/*`), and password reset (`/forgot-password`, `/reset-password`, `/api/auth/reset-password`).

---

## 5. Complete Routes Directory

### Public Pages (`src/app/`)
| Route | Description |
|---|---|
| `/` | Homepage: `SplashScreen`, `HeroSlider`, `MarqueeNotice`, `MessageCards`, `QuickLinks`, `NoticeBoard`, `StatsSection`, `TeachersSection`, `AlumniSection` |
| `/about` | Institution history, campus info, messages |
| `/notices` | Full searchable/filterable Notice Board (`NoticeTable`) |
| `/contact` | Contact details, interactive Google Maps coordinates, inquiry form |
| `/developer` | Developer info page |
| `/alumni` | Notable Alumni (`Kriti Shikkharthi`) directory |
| `/administration/all-teachers` | All faculty directory with search/filter |
| `/administration/all-teachers/[id]` | Individual teacher detailed profile |
| `/administration/other-teachers` | Other teachers view |
| `/administration/managing-committee` | Managing Committee members |
| `/administration/former-teachers` | Former Headmasters & teachers |
| `/administration/former-staff` | Former staff directory |
| `/administration/staff` | Current office & support staff |
| `/students/class-6` .. `/students/class-10` | Class detail views (section switcher, class teacher, daily routine, subjects, NCTB links, conduct rules via `ClassDetailView`) |
| `/academics/calendar` | Interactive Academic Calendar with Fri–Sat weekly holidays & 2026 Govt/School holidays (`CalendarClient`) |
| `/academics/holidays` | Searchable/filterable Annual Holiday Schedule 2026 + downloadable `calendar-2026.jpg` |
| `/academics/routine` | Interactive Class 6–10 Weekly Routine + Official Routine Downloads + **JPG Download** (`toJpeg`) |
| `/academics/results` | Internal exam result search (with inline validation) & Board results lookup |
| `/academics/testimonial` | Official Board (SSC/JSC) & General Testimonial Generator with live preview, JPG download & print |
| `/gallery`, `/gallery/photos`, `/gallery/videos` | Photo & Video Gallery pages |

### Auth & Dashboard Pages
| Route | Description |
|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/callback` | Authentication & account recovery |
| `/dashboard/admin` | Admin Dashboard home & pending teacher edit badge |
| `/dashboard/admin/notices` | Manage notices |
| `/dashboard/admin/sliders` | Manage homepage hero slides |
| `/dashboard/admin/gallery` | Manage gallery photos/videos |
| `/dashboard/admin/teachers` | Manage teachers & approve/reject pending teacher profile edits |
| `/dashboard/admin/staff` | Manage current staff |
| `/dashboard/admin/former-staff` | Manage former staff |
| `/dashboard/admin/committee` | Manage committee members |
| `/dashboard/admin/alumni` | Manage notable alumni |
| `/dashboard/admin/classes-stats` | Manage school stats, messages, and class section metadata |
| `/dashboard/admin/routine` | Upload routine files & edit Class 6–10 weekly routine tables |
| `/dashboard/admin/holidays` | Upload academic calendar file & add/edit/delete holidays |
| `/dashboard/admin/results` | Upload/manage internal results (supports CSV/XLSX import) |
| `/dashboard/admin/users` | Manage system user accounts |
| `/dashboard/admin/messages` | View contact/admin messages |
| `/dashboard/teacher` | Teacher self-service dashboard |
| `/dashboard/student` | Student dashboard |
| `/admin/login`, `/admin/dashboard` | Legacy admin redirect/entry routes |

### API Routes (`src/app/api/`)
- **Auth:** `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/register`, `/api/auth/reset-password`, `/api/auth/google/register`, `/api/auth/google/verify`
- **Academics & School Content:** `/api/notices`, `/api/notices/[id]`, `/api/routines`, `/api/holidays`, `/api/results`, `/api/board-results`, `/api/school-info`, `/api/testimonial-counter`
- **People & Governance:** `/api/teachers`, `/api/teachers/[id]`, `/api/teachers/[id]/pending-edit`, `/api/teachers/[id]/approve`, `/api/teachers/[id]/reject`, `/api/teachers/pending-count`, `/api/staff`, `/api/staff/[id]`, `/api/former-staff`, `/api/committee`, `/api/alumni`, `/api/alumni/[id]`, `/api/users`, `/api/users/[id]`
- **Media & Maintenance:** `/api/sliders`, `/api/sliders/[id]`, `/api/gallery`, `/api/gallery/[id]`, `/api/upload`, `/api/cron/clean-notices`

---

## 6. Key Implemented Features & Mechanics

1. **Splash Screen (`src/components/home/SplashScreen.tsx`)**
   - Uses a `requestAnimationFrame` progress loop (`1400ms` fill `0% → 100%`, `250ms` hold at `100%`, `350ms` compositor fade-out) with a `4000ms` failsafe and `prefers-reduced-motion` support.
   - Styled with `.bahs-splash-progress` in `src/app/globals.css`.
   - Stores `bahs_splash_v2` in `sessionStorage` (`src/app/layout.tsx` checks it in `<head>` to apply `html.splash-hidden` on repeat page loads in the same tab).
   - Supports `Escape` key and `#bahs-splash-skip-btn` button to dismiss immediately.

2. **Class Routine JPG Export (`src/app/academics/routine/page.tsx`)**
   - **"ক্লাস রুটিন ডাউনলোড"** (`Download Class Routine`) replaces full-page `window.print()`.
   - Captures a dedicated off-screen `1080px`-wide export sheet (`exportRef`) via `html-to-image` (`toJpeg`, `pixelRatio: 2.5`, automatic `skipFonts: true` fallback) and downloads `BAHS_Class_<class>_Routine_<year>.jpg` via `safeDownloadFile()` (`src/lib/downloadFile.ts`).
   - Fixed `1080px` export width ensures all 8 table columns remain crisp and unclipped even when downloaded from mobile devices.

3. **Academic Calendar & 2026 Holiday Sync (`src/app/academics/calendar/CalendarClient.tsx`, `src/data/holidays.json`)**
   - Marks **both Friday (`শুক্র`) and Saturday (`শনি`)** as Weekly Holidays (`সাপ্তাহিক ছুটি`) in headers, grid cells, and legend.
   - Synced with **34 official 2026 Government (MoPA) & Ministry of Education Secondary School holidays** matching `public/downloads/calendar-2026.jpg`.
   - Prioritizes single-day/shorter national & religious holidays on top of multi-day vacations when dates overlap, includes a monthly holiday summary list, and converts Gregorian dates to Bengali calendar dates via `src/lib/bengaliCalendar.ts`.

4. **Client Image Compression & Upload Pipeline (`src/lib/clientUpload.ts`, `src/app/api/upload/route.ts`)**
   - Client-side canvas compression converts large images (`> 250KB`, up to `25MB` source) to JPEG (`maxDim`, quality scaling) before uploading; non-images capped at `5MB` client-side / `6MB` server-side.
   - In production/Cloudflare (`NODE_ENV === "production"` or `VERCEL`), `/api/upload` converts uploaded files to Base64 `data:` URLs for persistent database storage; in local development, files are saved to `public/uploads/`.

5. **Bilingual UI (`src/lib/LanguageContext.tsx`)**
   - Toggleable Bengali (`bn`) / English (`en`) UI helper `t(bnText, enText)` across public pages, with a hidden Google Translate mount fallback in `layout.tsx`.

---

## 7. Project Structure

```text
bahs-website/
├── public/
│   ├── downloads/
│   │   ├── calendar-2026.jpg         # Official 2026 school holiday & exam schedule
│   │   ├── routine/                  # Routine downloads (e.g. routine-batch-62.jpg)
│   │   ├── notices/
│   │   └── results/                  # Sample CSV/XLSX result templates
│   ├── images/
│   │   ├── logo/logo.png
│   │   ├── hero/
│   │   ├── teachers/
│   │   ├── president/
│   │   ├── alumni/
│   │   ├── former-staff/
│   │   └── gallery/
│   └── uploads/                      # Local dev uploads
├── src/
│   ├── app/                          # Next.js App Router pages & API routes
│   ├── components/                   # home/, layout/, admin/, notices/, students/
│   ├── data/                         # 15 JSON baseline & fallback data snapshots
│   └── lib/                          # auth, AuthContext, LanguageContext, db, supabase,
│                                     # bengaliCalendar, clientUpload, downloadFile, utils
├── supabase_schema.sql               # Core Supabase schema
├── add_teacher_columns.sql           # Teacher extra metadata migration
├── add_teacher_profile_columns.sql   # Teacher profile/pending edit migration
├── next.config.ts
├── open-next.config.ts
├── wrangler.jsonc
└── package.json
```

---

## 8. Environment Variables & Commands

### Required Environment Variables (`.env.local` / Cloudflare Secrets)
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SESSION_SECRET=<32+-character-random-secret>          # required in production
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>  # server-only secret (runtime + build)
CRON_SECRET=<random-secret>                            # protects /api/cron/clean-notices
```

### NPM Scripts (`package.json`)
```bash
# Install dependencies
npm install

# Run local development server (hot reload)
npm run dev

# Build standard Next.js production bundle
npm run build:next

# Run already-built Next.js production server locally (fast preview)
npm run start

# Run ESLint
npm run lint

# Build & preview/deploy for Cloudflare Workers (OpenNext)
npm run build
npm run preview
npm run deploy
```

Open [http://localhost:3000](http://localhost:3000) in your browser after starting locally.

---

*সর্বস্বত্ব সংরক্ষিত © বানিয়াচং আদর্শ উচ্চ বিদ্যালয়*
