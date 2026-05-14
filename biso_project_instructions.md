# Biso — Project Instructions for Claude
*Updated May 14, 2026 — reflects all fixes applied today*

---

## What is Biso

Biso is a French-language artisan marketplace platform for Côte d'Ivoire. It connects clients looking for trusted local professionals (artisans and companies) with verified service providers across Abidjan and other cities. The name "Biso" means "nous" (us) in Lingala — reflecting the community trust model.

Three equal user groups: Clients, Artisans/Companies, and Admins.

**Business goal:** Reach 500 active artisan profiles within 6-12 months and establish Biso as the market leader in this sector and region. Monetization model is not yet decided — do not suggest features that assume a specific revenue model without discussing it first.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Storage)
- **Deployment:** Vercel (auto-deploys from GitHub main branch)
- **Repo:** https://github.com/1432boble/artisan-marketplace
- **Local path:** `C:\Users\robotemb\OneDrive\App\GitHub\artisan-marketplace\artisan-marketplace`
- **Live app:** artisan-marketplace-phi.vercel.app

---

## Design System

### Typography
One font family throughout: **Fraunces** (Google Fonts). No other font.

| Weight | Usage |
|---|---|
| 300 | Body text, descriptions, muted copy, form labels |
| 400 | Buttons, badges, placeholders, general UI |
| 500 | Names, headings, section titles, stat numbers, trade labels |
| Italic 300–400 | Manifesto emphasis only |

### Color Palette

| Name | Hex | Usage |
|---|---|---|
| --brand (terracotta) | #B03A1A | Logo, primary buttons, borders, icons, badges, titles |
| --brand-light | #F9EDE8 | Icon backgrounds, artisan badge fill |
| --accent (ochre) | #C8860A | Star ratings, entreprise badge |
| --accent-light | #FDF3DC | Entreprise badge background |
| --ink | #111111 | Primary text |
| --muted | #888888 | Secondary text, descriptions, meta |
| --border | rgba(0,0,0,0.09) | Dividers and card borders |
| --bg | #F7F7F7 | Page and card backgrounds |
| WhatsApp green | #25D366 | WhatsApp buttons only |
| Verified green | #1A7A3C | Vérifié badge |

### Component Rules
- **Buttons:** border-radius 12px, Fraunces 400, full width
- **Form fields:** white bg, 1.5px solid #B03A1A border, border-radius 10–12px — never native `<select>` tags
- **Icons:** Tabler Icons outline only (ti-* classes) — never emoji
- **Cards:** white bg, 1px solid border, border-radius 14px, padding 14px

---

## Current App Structure

| Route | Description |
|---|---|
| `/` | Landing page |
| `/search` | Search artisans by service and zone (shows all by default) |
| `/profiles/[id]` | Full artisan profile — reviews, portfolio, WhatsApp + Call buttons, QR code, share |
| `/artisan` | Artisan registration page — explains Biso, links to Google Form |
| `/admin/profiles/new` | **Admin only:** Create new artisan/company profile |
| `/admin/upload` | **Admin only:** Upload portfolio photos for existing profiles |
| `/admin/reviews` | **Admin only:** Approve/reject client reviews with photos |

All admin routes are protected server-side with `ADMIN_UPLOAD_KEY`.
Access pattern: `https://artisan-marketplace-phi.vercel.app/admin/[route]?key=YOUR_KEY`

### Components
- `components/StarRating.tsx` — star rating display
- `components/TrackPageView.tsx` — page view tracking
- No gallery component — portfolio gallery is inline in `app/profiles/[id]/page.tsx`

---

## Supabase Schema

### `profiles` table
`id, profile_type, contact_name, company_name, phone, whatsapp, main_location, work_zones, description, experience_years, is_available, is_verified, status, created_at, other_services, main_service_name`

### `profile_services` table (junction)
`id, profile_id, service_id, is_primary, created_at`
Links profiles to the `services` table. First service = is_primary true.

### `services` table
`id, name_fr, name_en, category, is_active, created_at`

⚠️ **The `services` table is the single source of truth for all service names.**
- Never hardcode service names in frontend code
- The search dropdown fetches live from Supabase — adding a row here is all that's needed
- Always use the exact `name_fr` value — case-sensitive

### `reviews` table
Includes a `photos` column (text[]) for client-uploaded review photos.

### Storage buckets
- `portfolio-photos` — admin-uploaded artisan portfolio images
- `review-photos` — client-uploaded photos attached to reviews

---

## Services List (29 services — must match `services` table `name_fr` exactly)

```
Architecte
Architecte d'intérieur
Carrelage
Charpenterie
Coffrage
Démolition
Domotique
Électricité
Energie Renouvelable
Étanchéité
Excavation
Ferraillage
Froid & Climatisation
Graphisme
Jardinage
Maçonnerie
Mécanique
Menuiserie aluminium
Menuiserie bois
Menuiserie métallique
Nettoyage
Paysagisme
Peinture
Photographie
Plâtrerie
Plomberie
Sécurité électronique
Tailleur
```

**Adding a new service:** Insert a row in Supabase `services` table with the correct `name_fr` and `is_active = true`. The search dropdown updates automatically — no code change needed.

---

## Artisan Intake Workflow

### How new profiles are added

1. **Artisan/entreprise submits Google Form**
   URL: https://forms.gle/aVgXmnXDY54ny4ca9
   Linked from landing page "Je suis artisan / entreprise" button → `/artisan` page → form

2. **Admin reviews Google Sheet response**
   Check WhatsApp number format, description quality, service category

3. **Admin creates profile at `/admin/profiles/new`**
   Form writes directly to Supabase — no CSV export needed.
   Field mapping:
   - Vous êtes → profile_type (artisan/company)
   - Nom de l'entreprise → company_name
   - Nom du contact → contact_name
   - Numéro WhatsApp → whatsapp + phone (same value)
   - Zones → work_zones (checkboxes)
   - Services → profile_services (first checked = is_primary)
   - Expérience → experience_years
   - Description → description (rewrite if needed — max 3 sentences, active voice, client-focused)

4. **Upload portfolio photos** via `/admin/upload`

5. **Verify on live app**
   Check `/search` and `/profiles/[id]` on mobile — confirm WhatsApp button works

6. **Share profile link with artisan** via WhatsApp

### Google Form fields (current)
Vous êtes, Nom de l'entreprise, Nom du contact, Numéro WhatsApp, Zones d'intervention (checkboxes), Service principal (checkboxes — multiple allowed), Autres services, Expérience, Description, Consentement

---

## Profile & Content Rules

- **Profile type:** `artisan` or `company`
- **Names:** minimum "Prénom + initiale" — never first name only
- **Descriptions:** max 3 sentences, client-focused, active voice
- **Services:** multi-select — multiple services per profile supported
- **Search card display:** max 2 lines of services (4 services), then "+ X autres"
- **Profile page display:** all services, 3 per line
- **Search filtering:** exact match on `name_fr` — uses `.some()` not `.includes()`
- **Status:** new profiles default to `approved`, `is_available: true`, `is_verified: false`

---

## Review System

- Reviews require admin approval before appearing publicly
- Clients can attach up to 3 photos per review (camera or gallery)
- Photos are uploaded to `review-photos` Supabase bucket (compressed client-side before upload)
- Admin sees photos in `/admin/reviews` before approving
- Approved review photos appear as thumbnails under the review comment — tap to enlarge (lightbox)
- Review photos do NOT appear in the portfolio section (kept separate for trust)
- Review form has client-side validation — shows inline red error if name, comment, or confirmation checkbox is missing

---

## Portfolio Gallery

- Photos displayed in a grid (2 columns) in the Réalisations section
- Gallery is inline in `app/profiles/[id]/page.tsx` — no separate component
- Section hidden if no photos uploaded

---

## Error Handling

- **Invalid profile UUID:** Shows "Profil introuvable" screen with "Retour aux artisans" button — does not spin indefinitely
- **Unknown route (404):** Custom `app/not-found.tsx` shows styled "Page introuvable" screen with "Retour à l'accueil" button — not the bare black Next.js default

---

## How We Work Together

- **This chat** — planning, reviewing, deciding, writing content, drafting descriptions
- **Claude Code** — all code changes, commits, deploys
- Every session starts with a clear goal before any code is written
- Always commit and push after every session so Vercel auto-deploys
- Test on mobile after every visible change — target user is on a phone
- Never add features not needed for MVP without discussing first
- Use Claude in Chrome extension to validate live app after deploys

---

## Current Priorities

1. **Content** — reach 20–30 clean artisan profiles before public launch (currently 13)
2. **SEO meta tags** — improve Google discoverability
3. **Service worker** — offline PWA support for low-connectivity users
4. **Monetization** — to be decided when profile count reaches 50+

## Planned (not yet built)
- Remove "Zone principale" field from `/admin/profiles/new` (keep only "Zones d'intervention")
- Search card service display: 2 per line, max 2 lines then "+ X autres"
- Auto-import from Google Sheet (requires Google Workspace integration)
- Photo lightbox on main portfolio image (tap to enlarge)
- Gallery arrow visibility improvement on mobile

---

## Known Decisions

- Admin auth: server-side `ADMIN_UPLOAD_KEY` — never expose with `NEXT_PUBLIC_` prefix
- WhatsApp is the primary contact method — no in-app messaging
- No `/register` page — "Je suis artisan / entreprise" routes to `/artisan` then Google Form
- "Appeler" button on profile pages only — not on search cards
- `SUPABASE_SERVICE_ROLE_KEY` must be used in all admin API routes (not anon key)
- `service_role` has been granted INSERT/UPDATE/DELETE on `profiles` and `profile_services`
- Services dropdown fetches live from Supabase — never hardcode service names in frontend
- Search filter uses exact match (`.some()`) on `name_fr` — not fuzzy `.includes()`

## Admin contact
- WhatsApp: 0758539476
- Google Form: https://forms.gle/aVgXmnXDY54ny4ca9

---

## What to Avoid

- Do not suggest features that significantly increase complexity before reaching 500 artisans
- Do not expose any environment variables with `NEXT_PUBLIC_` prefix unless truly public
- Do not commit `.env.local`, `.claude/`, or `.mcp.json` to GitHub
- Do not add buttons or UI elements that duplicate existing functionality
- Do not make design changes without considering mobile view first
- Do not use native `<select>` elements — custom styled dropdowns only
- Do not use emoji as icons — Tabler outline icons only
- Do not mix fonts — Fraunces only
- Do not hardcode service names, zone names, or any data that lives in Supabase
