# Biso — Claude Code Instructions
*Last updated: May 18, 2026*

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
| `/search` | Search page — fetches services live from Supabase |
| `/profiles/[id]` | Full artisan profile |
| `/artisan` | Artisan registration — two CTA buttons both linking to https://forms.gle/HrweW6rg45NZQvtEA: (1) hero section — white bg, terracotta text #B03A1A, font-weight 500, border-radius 12px, box-shadow; (2) bottom of page — full-width, terracotta bg, white text |
| `/admin/profiles/new` | Admin only: Create new artisan/company profile. Includes other_services text input field. |
| `/admin/upload` | Admin: upload portfolio photos |
| `/admin/reviews` | Admin: approve/reject reviews |
| `/admin/analytics` | Admin: event analytics dashboard (1j/7j/14j/30j filters, Chart.js) |
| `app/not-found.tsx` | Custom 404 page |

### Components
- `components/StarRating.tsx`
- `components/TrackPageView.tsx` — fires `track(event)` on mount, renders nothing
- No gallery component — portfolio gallery is inline in `app/profiles/[id]/page.tsx`

### Analytics
- `app/admin/analytics/page.tsx` — server component, auth guard via `ADMIN_UPLOAD_KEY`
- `app/admin/analytics/_content.tsx` — client component, fetches from `/api/admin/events`
- Events tracked: `landing_view`, `search_view`, `profile_view`, `whatsapp_click`
- Day range filter: **1j** (today from midnight), 7j, 14j, 30j
- `lib/track.ts` — fire-and-forget POST to `/api/events` (errors silently swallowed)
- `app/api/events/route.ts` — inserts into Supabase `events` table using service role key

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
- Service worker is registered in `layout.tsx` via inline script (`/sw.js`).

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
- **Current count: 29 services.** Added Graphisme, Jardinage, Paysagisme, Photographie; replaced Panneaux solaires with Energie Renouvelable. Full list in `biso_project_instructions.md`.

### Profile & Content Rules
- **`other_services`** — free text, optional. Displayed on `/profiles/[id]` below main services as inline muted text: `"Autres services · [value]"`. Not shown on search cards. Populated via admin form or directly in Supabase.

### Admin auth
- Admin routes protected by `ADMIN_UPLOAD_KEY` environment variable — server-side only.
- Never expose with `NEXT_PUBLIC_` prefix.
- Access pattern: `/admin/[route]?key=YOUR_KEY`

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
- Do not make design changes without considering mobile first

---

## After Every Session

1. Commit and push so Vercel auto-deploys
2. Update this file if any new decisions, rules, or structural changes were made
