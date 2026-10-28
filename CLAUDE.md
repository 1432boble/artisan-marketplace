# Biso — Claude Code Instructions
*Last updated: October 16, 2026*

## This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

## What is Biso
French-language artisan marketplace for Côte d'Ivoire. Connects clients with trusted local professionals. Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, Supabase, Vercel.

- **Live app:** artisan-marketplace-phi.vercel.app
- **Repo:** github.com/1432boble/artisan-marketplace
- **Vercel:** auto-deploys from `main` branch on every push

---

## App Structure

| Route | Description |
|---|---|
| `/` | Landing page |
| `/search` | Search page — fetches services live from Supabase. Default order = photos → approved reviews → newest (`lib/search-order.ts`, applied after filters) |
| `/profiles/[id]` | Full artisan profile |
| `/artisan` | Artisan registration — two CTA buttons both linking to https://forms.gle/HrweW6rg45NZQvtEA: (1) hero section — white bg, terracotta text #B03A1A, font-weight 500, border-radius 12px, box-shadow; (2) bottom of page — full-width, terracotta bg, white text |
| `/admin/profiles/new` | Admin only: Create new artisan/company profile. Includes other_services text input field. |
| `/admin/upload` | Admin: upload portfolio photos — **multi-photo batch upload** (see "Photo upload" below) |
| `/admin/reviews` | Admin: approve/reject reviews |
| `/admin/testmode` | Admin: toggle analytics test mode via `?key=YOUR_KEY` (`&off=1` to clear) — see "Analytics test mode" below |
| `/admin/analytics` | Admin: event analytics dashboard (single-day ‹ date › selector + 7j/14j/30j filters, Chart.js) |
| `app/not-found.tsx` | Custom 404 page |

### Components
- `components/StarRating.tsx`
- `components/TrackPageView.tsx` — fires `track(event)` on mount, renders nothing
- `components/ServiceCombobox.tsx` — typeable service dropdown on `/search` (see "Service keywords" below). Zone dropdown is still the local `CustomSelect`.
- No gallery component — portfolio gallery is inline in `app/profiles/[id]/page.tsx`

### Analytics
- `app/admin/analytics/page.tsx` — server component, auth guard via `ADMIN_UPLOAD_KEY`
- `app/admin/analytics/_content.tsx` — client component, fetches from `/api/admin/events`
- Events tracked: `landing_view`, `search_view`, `profile_view`, `whatsapp_click`, `search_unmatched`
- `search_unmatched` — a typed service query (3+ chars) that matched no service, sent after a 1.5 s typing pause, once per query per session. `metadata.query` = normalized text, max 60 chars; queries with 6+ digits (phone numbers) are never logged — enforced by `toLoggableQuery()` in the browser **and** in `/api/events`. Shown on `/admin/analytics` as "Recherches sans résultat" (top 10 terms for the selected period).
- Date filter: a **single-day selector** replaces the old **1j** tab — `‹ Aujourd'hui ›` steps one day at a time (up to **30 days** back; `›` disabled on today; labels "Aujourd'hui" / "Hier" / short weekday + date like "Jeu. 15/10"). It sits next to the **unchanged 7j / 14j / 30j** range tabs. The selected single day filters on **local-midnight → next-local-midnight** bounds.
- `lib/track.ts` — fire-and-forget and **non-blocking**: `navigator.sendBeacon` (events survive same-tab navigations like `tel:`), falling back to `fetch(..., { keepalive: true })`. Never awaited, never blocks navigation; errors silently swallowed.
- `app/api/events/route.ts` — inserts into Supabase `events` table using service role key. **Skips the insert entirely** when the request carries the `biso_admin_notrack` cookie (see "Analytics test mode").
- `app/api/admin/events/route.ts` (admin read) — returns events from the **last 31 days** and **paginates** with `.range()` in pages of 1000. PostgREST caps a single response at 1000 rows, so an unbounded query silently dropped recent events once `events` passed 1000 rows (fixed `af568e5`).

### Analytics test mode (`/admin/testmode`)
*Shipped July 27, 2026.* Lets an admin browse/test without polluting the analytics dashboard.
- `app/admin/testmode/route.ts` — GET route handler. `?key=YOUR_KEY` (validated against `ADMIN_UPLOAD_KEY` via `checkPassword`) sets a long-lived (**~1 year**) `biso_admin_notrack=true` cookie — HttpOnly, SameSite=Lax, `Secure` in prod. `&off=1` clears it. Shows a plain French confirmation page either way; a bad key sets no cookie.
- **Enforcement is server-side, at the single chokepoint.** All events flow through `track()` → `/api/events`, which calls `isNotrack()` (`lib/admin-auth.ts`) and returns early before inserting when the cookie is present. Visitors without the cookie are tracked exactly as before.
- The cookie is per-browser — clearing cookies or using `&off=1` re-enables tracking.

### Service keywords (`lib/service-keywords.ts`)
- `SERVICE_KEYWORDS` maps each `services.name_fr` (exact key) to client-facing words ("clim", "fuite", "bonbonne"…). A service with no entry still matches on its name, so adding a service in Supabase needs no code change.
- `normalize()` — lowercase, accents stripped, `’` → `'`, hyphens → spaces, spaces collapsed.
- `matchServices(query, services)` — from 2 chars. Rank: query **is** the name or a keyword (whole phrase) > name starts with query > name contains query > keyword match (query inside a keyword, or a keyword as **whole words** inside the query; a typed word may add a plural `s`/`x`). Whole-word matching stops "gazon" → Plombier-gazier, "entreprise" → Électricité.
- Selecting a service applies the **unchanged** exact-match filter. `''` = no service chosen (initial state, also what the clear button sets); `ALL_SERVICES` = "Tous les services" / "Voir tous les artisans".
- To grow the list: check "Recherches sans résultat" on `/admin/analytics` and add terms here.

### Photo upload (`/admin/upload`)
*Multi-photo batch upload shipped July 27, 2026.*
- `app/admin/upload/_content.tsx` — file input uses `multiple`; the admin selects several photos at once and sees a **thumbnail preview grid** before uploading. State holds an array of files (object-URL previews are revoked on change/unmount to avoid leaks).
- **Sequential upload:** each file POSTs to `/api/upload` one at a time, with a live progress indicator on the button (`"Envoi X sur N…"`) — deliberate, since Côte d'Ivoire connections are slow.
- **Partial-failure handling:** a file that fails is reported by name in a result panel; the batch continues rather than aborting. A final summary shows the total uploaded.
- **`is_featured`:** optional, opt-in via checkbox, applied only to the **first** photo. `app/api/upload/route.ts` now reads the `is_featured` form field and persists it to the `portfolio_photos` row (**previously hardcoded `false`** — this fix makes the flag actually take effect).

---

## PWA

- **manifest.json** (`public/manifest.json`): name "Biso — Artisans de confiance", short_name "Biso", theme_color + background_color `#B03A1A`, display standalone. Includes 192×192, 512×512, and maskable 512×512 icon entries.
- **Icons** — three PNG files in `public/`:
  - `icon-512.png` — 512×512
  - `icon-192.png` — 192×192
  - `apple-touch-icon.png` — 180×180
  - Design: terracotta `#B03A1A` bg with rounded corners, white bold Georgia "Biso" centered, ochre `#C8860A` rounded underline bar below text baseline.
  - Generated with a Node.js script using the `sharp` package. Script is deleted after each run — recreate from scratch if icons need to be regenerated.
- **layout.tsx `<head>`** includes: `<link rel="manifest">`, `<link rel="apple-touch-icon">`, `<meta name="theme-color" content="#B03A1A">`.
- Service worker (`public/sw.js`) is registered in `layout.tsx` via inline script. It is **self-clearing**: `skipWaiting` + `clients.claim` + deletes all Cache Storage, with a pass-through `fetch` handler — installable but caches nothing. (Real offline caching is not implemented yet.)

---

## Link previews & metadata (`app/layout.tsx`)

- `metadataBase` = `https://artisan-marketplace-phi.vercel.app` so Open Graph / Twitter image URLs resolve absolutely (WhatsApp requires absolute URLs).
- `openGraph` (title "Biso", site description, `type: website`, `locale: fr_FR`) + `twitter` (`card: summary`). `openGraph.images` → `public/og-thumb.png` (200×200 edge-to-edge terracotta "Biso") so WhatsApp shows a **small thumbnail**, not a wide banner.
- `icons` → `/favicon.ico` (generated from `icon-512.png`) + `/apple-touch-icon.png`.
- Per-page SEO (unique title/description per route) is **not implemented yet** — site-wide metadata only.

---

## Design System — Follow Exactly

**Font:** Fraunces only (Google Fonts). Never use any other font.

| Weight | Usage |
|---|---|
| 300 | Body text, descriptions, muted copy, form labels |
| 400 | Buttons, badges, placeholders, general UI |
| 500 | Names, headings, section titles |

**Colors:**
```
--brand:        #B03A1A  (terracotta — primary buttons, borders, titles)
--brand-light:  #F9EDE8  (icon backgrounds)
--accent:       #C8860A  (ochre — star ratings, entreprise badge)
--accent-light: #FDF3DC  (entreprise badge background)
--ink:          #111111  (primary text)
--muted:        #888888  (secondary text)
--bg:           #F7F7F7  (page background)
WhatsApp:       #25D366  (WhatsApp buttons only)
Verified:       #1A7A3C  (Vérifié badge)
```

**Component rules:**
- Buttons: border-radius 12px, Fraunces 400, full width
- Form fields: white bg, 1.5px solid #B03A1A border, border-radius 10–12px
- Cards: white bg, 1px solid border, border-radius 14px, padding 14px
- Search card service name: always `text-brand` (#B03A1A) — never conditional on profile type
- Icons: Tabler Icons outline only (ti-* classes) — never emoji
- Never use native `<select>` — custom styled dropdowns only

---

## Supabase

```ts
// lib/supabase.ts — anon key, client-side only
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**For admin API routes:** always use `SUPABASE_SERVICE_ROLE_KEY` (not anon key, not NEXT_PUBLIC_).

**Growing tables — filter + paginate.** PostgREST caps a single response at **1000 rows**. For any query over a table that grows unbounded (e.g. `events`), add a time/scope filter **and** paginate with `.range()` in pages of 1000 until a short page — never a single unbounded `select`, or recent rows silently vanish. (This bit the analytics dashboard — see Session Log `af568e5`.)

### Schema

**`profiles`:** `id, profile_type, contact_name, company_name, phone, whatsapp, main_location, work_zones, description, experience_years, is_available, is_verified, status, created_at, other_services, main_service_name`

**`profile_services`:** `id, profile_id, service_id, is_primary, created_at`

**`services`:** `id, name_fr, name_en, category, is_active, created_at`

**`reviews`:** includes `quality_rating, cleanliness_rating, timeliness_rating, communication_rating, professionalism_rating, rating, comment, client_name, status, photos (text[])`

**Storage buckets:** `portfolio-photos`, `review-photos`

---

## Critical Rules — Never Break These

### Services
- **Supabase `services` table is the single source of truth.** Never hardcode service names in frontend code.
- The search dropdown fetches live from Supabase with `is_active = true`. Adding a service = insert a row in Supabase. No code change needed.
- Service names are case-sensitive. Always use exact `name_fr` values.
- Search filter uses exact match: `.some(ps => ps.services?.name_fr === serviceFilter)` — never `.includes()`.
- **Current count: 30 services.** Added Graphisme, Jardinage, Paysagisme, Photographie, Piscine, Plombier-gazier; replaced Panneaux solaires with Energie Renouvelable. Full list in `biso_project_instructions.md`.
- **When services change, update everything in sync:** Supabase `services` → `lib/service-keywords.ts` → Google Form → `/admin/profiles/new` → `biso_project_instructions.md` → this file → biso-profile skill. A new service still matches on its name in the search dropdown, but a renamed service loses its keywords until `lib/service-keywords.ts` is updated — its keys must match `services.name_fr` exactly.

### Profile & Content Rules
- **`other_services`** — free text, optional. Displayed on `/profiles/[id]` below main services as inline muted text: `"Autres services · [value]"`. Not shown on search cards. Populated via admin form or directly in Supabase.
- **Company profiles (`profile_type = 'company'`)** show the **company name as the title**; the contact name appears on the person-icon line. Descriptions should name **only the company**, not the contact. The profile title and the search card both key off `profile_type` — never swap `company_name`/`contact_name` in the data to fake it.
- **Primary service first:** `profile_services` is ordered `is_primary DESC` in the profile and search queries — `.order('is_primary', { referencedTable: 'profile_services', ascending: false })`.
- **`status = 'pending'` hides a profile from `/search` and `/api/get-profiles`** (both filter `status = 'approved'`), but it **stays reachable by direct `/profiles/[id]` URL** (that page fetches by id with no status filter). Use `pending` to park admin/test profiles.
- **Contact buttons (`/profiles/[id]`):** "Écrire sur WhatsApp" uses the shared `WHATSAPP_PREFILL` (`lib/whatsapp.ts`), URL-encoded. "Appeler le …" dials `phone || whatsapp` (phone preferred) and shows the dialled number as local pairs (e.g. `07 67 61 22 78`). The profile **share** link is separate — it carries the profile URL, not the message.

### Admin auth — cookie session (no key in URL)
- The admin password is the `ADMIN_UPLOAD_KEY` env var — server-side only, never `NEXT_PUBLIC_`. Use a long, random value (rotate it if it ever leaks).
- **Login flow:** `/admin/login` → password posted to `POST /api/admin/login` → on success sets an **HttpOnly, SameSite=Lax** cookie `biso_admin` (value = SHA-256 of the secret, never the secret itself; `Secure` in production). `POST /api/admin/logout` clears it. Session lasts 30 days.
- **`lib/admin-auth.ts`** is the single source of truth:
  - `isAuthed()` — async; reads the cookie. Used by server components.
  - `requireAdmin()` — async; returns a 401 `NextResponse` or `null`. Call at the top of every protected route handler: `const denied = await requireAdmin(); if (denied) return denied;`
  - `checkPassword()` / `sessionToken()` — used by the login route only.
- **Admin pages** (`/admin`, `/admin/analytics`, `/admin/reviews`, `/admin/upload`, `/admin/profiles/new`) are server components that call `isAuthed()` and `redirect('/admin/login?next=…')` when not authed. `/admin` is the hub linking to all tools + logout.
- **Client `_content` components** send no credential — the cookie rides along automatically on same-origin fetches. Never reintroduce a key prop or `x-admin-key` header.
- **Protected API routes:** all `/api/admin/*` (events, reviews, create-profile, login*, logout*) plus `/api/upload`. (*login/logout don't call `requireAdmin` — they establish/clear the session.)
- **Public (ungated) API routes:** `/api/events` (tracking) and `/api/get-profiles` (approved profiles only).
- `ADMIN_UPLOAD_KEY` must be set in **both** `.env.local` (local) and Vercel env vars (production) — they should match.

### Environment variables
- Never commit `.env.local`, `.claude/`, or `.mcp.json`
- Never use `NEXT_PUBLIC_` for anything sensitive

### Phone numbers (Côte d'Ivoire)
- WhatsApp field stored as `2250XXXXXXXXX` (225 + local number with leading 0)
- Phone field stored as `0XXXXXXXXX`
- WhatsApp links: `https://wa.me/2250XXXXXXXXX`

---

## Error Handling (already implemented)

- **Invalid profile UUID:** `app/profiles/[id]/page.tsx` uses `loading` + `notFound` state — shows "Profil introuvable" screen with back button, never infinite spinner
- **Unknown routes:** `app/not-found.tsx` shows styled 404 with "Retour à l'accueil" button
- **Review form:** client-side validation before API call — shows inline red error message, never silent failure

---

## Known Decisions

- WhatsApp is the primary contact method — no in-app messaging
- "Appeler" button on profile pages only — not on search cards
- Reviews require admin approval before appearing publicly
- New profiles default to: `status: approved`, `is_available: true`, `is_verified: false`
- No `/register` page — registration goes through Google Form → `/artisan`
- `service_role` granted INSERT/UPDATE/DELETE on `profiles` and `profile_services`

---

## What to Avoid

- Do not hardcode service names, zone names, or any data that lives in Supabase
- Do not use native `<select>` elements
- Do not use emoji as icons — Tabler outline icons only
- Do not mix fonts — Fraunces only
- Do not expose sensitive env vars with `NEXT_PUBLIC_`
- Do not commit `.env.local`, `.claude/`, or `.mcp.json`
- Do not add features not discussed first — MVP focus until 500 profiles
- Do not duplicate user-facing strings used in several places — put them in a shared module (e.g. `WHATSAPP_PREFILL` in `lib/whatsapp.ts`)
- Do not make design changes without considering mobile first

---

## Code Quality Gate

- **Pre-commit hook** (`.husky/pre-commit`, via Husky) runs on every commit and **blocks** on:
  1. newly-added `console.log` / `console.debug` in staged TS/TSX,
  2. TypeScript errors (`npm run typecheck`),
  3. ESLint errors (`npm run lint` → `eslint .`). ESLint **warnings do not block**.
- Bypass only when truly necessary and intentional: `git commit --no-verify`.
- **ESLint config** (`eslint.config.mjs`) intentionally relaxes three rules — see comments there:
  - `react/no-unescaped-entities`: off (French copy is full of apostrophes; render-safe).
  - `@typescript-eslint/no-explicit-any`: warn (Supabase payloads are dynamic).
  - `react-hooks/set-state-in-effect`: warn (search page derives state in an effect).
- **Known follow-ups** (currently warnings): generate Supabase types (`supabase gen types typescript`) to replace the `any`s; refactor the `/search` filter effect to `useMemo`; swap `<img>` for `next/image` where appropriate.

## Session Log

### 14–16 October 2026
- **Data:** Added 4 Fadco-referred profiles — Eric Kobina Koffi (Électricité); Adouna Kossi (Plomberie — whatsapp `01 41 61 99 88` / phone `07 67 61 22 78`); Louguet Abdoul Aziz (Plomberie, 10+ ans); Cuisine Budget / Arnaud Tanon (Menuiserie bois + Plombier-gazier). Set **Test SARL** (admin test profile, `ac13c994-…`) to `pending`. Live totals: **47 real approved profiles** (31 artisans + 16 companies); **30 active services**.
- **Commits:** `af568e5` analytics 1,000-row cap (31-day filter + `.range()` pagination); `8af4ae1` contact-button labels; `ce1b000` WhatsApp pre-fill copy; `60fbb7e` call button prefers phone + non-blocking `track()` + `rel="noopener"`; `6bec7a6` self-clearing service worker + shared WhatsApp constant (`lib/whatsapp.ts`); `feb3674` single-day selector on `/admin/analytics`; plus Open Graph / link-preview thumbnail + favicon.
- **Conventions reaffirmed:** company profiles show the company name as title and descriptions mention only the company; strings reused in several places live in shared modules; Supabase queries on growing tables must filter + paginate; `pending` profiles are hidden from search but open by direct URL.
- **Setup:** Supabase MCP uses a **scoped token (Project + Database only)** stored in gitignored `.mcp.json`; Claude Code installed natively.
- **Next:** server-render `/search` (fixes lost taps on slow phones); per-page SEO; real offline caching; remove "Zone principale" from `/admin/profiles/new`; search-card service display (2/line, max 2 lines then "+ X autres").

---

## After Every Session

1. Commit and push so Vercel auto-deploys
2. Update this file if any new decisions, rules, or structural changes were made
