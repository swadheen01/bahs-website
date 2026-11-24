# Cloudflare + Supabase setup (free-tier friendly, secure)

Do these steps **in order**. Steps 1–3 are required for the security fixes to take full effect.

---

## 1. Cloudflare Worker secrets (runtime)

Cloudflare Dashboard → **Workers & Pages → bahs-website → Settings → Variables and Secrets** → add as **Secret**:

| Name | Value | Notes |
|---|---|---|
| `SESSION_SECRET` | random string, 32+ characters | **Required.** Without it, login returns an error (the old public fallback secret was removed because anyone could forge an admin cookie with it). Generate one with `node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key | Server-only key. **Never** put it in a `NEXT_PUBLIC_*` variable or in code. |
| `CRON_SECRET` | random string | Protects `/api/cron/clean-notices`. |

## 2. Build variables (Workers Builds / wherever you run the build)

Pages are prerendered **at build time** with the latest data, so the build also needs database access.
Cloudflare Dashboard → bahs-website → **Settings → Build → Variables and secrets**:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (needed after step 4 locks the database)

**Build command:** `npm run build` (this now also copies the prerendered pages into the static-asset cache).
**Deploy command:** `npx wrangler deploy` (or run `npm run deploy` locally, which does both).

Then **redeploy** and check the site works (homepage, notices, login).

## 3. Supabase — Part 1 (any time)

Supabase Dashboard → **SQL Editor** → paste and run [`supabase_security_01_functions_storage.sql`](supabase_security_01_functions_storage.sql).

- Moves password hashing into Postgres (logins no longer burn ~100ms of Worker CPU).
- Creates the public `uploads` Storage bucket (new uploads are stored as files, not base64 in the database).
- The last line prints `true | false` if it worked.

## 4. Supabase — Part 2: lock the database (**only after step 1–2 are deployed**)

Run [`supabase_security_02_lockdown.sql`](supabase_security_02_lockdown.sql).

After this, the public anon key (which every visitor can see) can no longer read `users.password_hash` or change any table.

Check: open `https://<project>.supabase.co/rest/v1/users?select=*` with the anon key → must return `[]`.

## 5. Change passwords ⚠️

Until now, every password hash in the `users` table was readable by anyone with the public anon key,
and `admin` / `123456` logged in as admin. After step 4:

- Change the **admin** password and ask all teacher/student accounts to change theirs.
- Review the `users` table for accounts you don't recognise (especially `role = 'admin'`).

## 6. GitHub secrets for the monthly cleanup job

GitHub repo → Settings → Secrets and variables → **Actions**:

- `SITE_URL` — e.g. `https://www.bahs.edu.bd` (no trailing slash)
- `CRON_SECRET` — same value as in step 1

(The old `vercel.json` cron never ran on Cloudflare; `.github/workflows/monthly-cleanup.yml` replaces it.)

---

## How the site now stays under the free-tier 10ms CPU limit

| Before | After |
|---|---|
| OpenNext used a "dummy" cache → **every page view ran React server rendering** | Pages are prerendered at build and served from the static-asset cache (`x-opennext-cache: HIT`) |
| Every image went through the Worker (`/_next/image`) | Images are plain static files (free, Worker never runs); originals were compressed 8.7MB → 3.3MB |
| Homepage made **8 API calls** per visit | 1 call (`/api/home`), cached by the browser for 60s |
| Login hashed passwords with bcrypt in JS (~100ms CPU) | Hashing runs in Postgres (after step 3) |
| A notice with a base64 attachment added ~210KB to every notice list | Lists return a small link (`/api/notices/<id>/file`); new uploads go to Storage |

**Content updates:** pages show the data from the last deploy instantly, then refresh from the API in the
browser, so admin changes appear without redeploying. Visitors may see a change up to ~60 seconds late
(browser cache); admin dashboards always load fresh data. Redeploy occasionally (e.g. after adding a
teacher) so the prerendered HTML (used by search engines) is up to date. A teacher profile added after the
last deploy still works; it is rendered on demand until the next deploy.
