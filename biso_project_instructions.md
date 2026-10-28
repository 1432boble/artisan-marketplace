# Biso — Project Instructions for Claude
*Updated 16 October 2026 — reflects the October restart (Fadco artisans, analytics fixes, contact buttons, link preview, service worker)*

> **CLAUDE.md is the technical source of truth.** If anything here conflicts with CLAUDE.md, CLAUDE.md wins — and this file should be updated.

---

## What is Biso

Biso is a French-language artisan marketplace platform for Côte d'Ivoire. It connects clients looking for trusted local professionals (artisans and companies) with verified service providers across Abidjan and other cities. The name "Biso" means "nous" (us) in Lingala — reflecting the community trust model.

Three equal user groups: Clients, Artisans/Companies, and Admins.

**Business goal:** Reach 500 active artisan profiles within 6-12 months and establish Biso as the market leader in this sector and region. Monetization model is not yet decided — do not suggest features that assume a specific revenue model without discussing it first.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Storage) — project ref `ijhzzcmyviunvadrhyvk`, org "tokoss", project "Artisans"
- **Deployment:** Vercel (auto-deploys from GitHub main branch)
- **Repo:** https://github.com/1432boble/artisan-marketplace (private)
- **Local path (main laptop):** `C:\Users\robotemb\OneDrive\App\GitHub\artisan-marketplace\artisan-marketplace`
- **Live app:** https://artisan-marketplace-phi.vercel.app

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
- **Icons:** Tabler Icons outline only (`@tabler/icons-react` or ti-* classes) — never emoji
- **Cards:** white bg, 1px solid border, border-radius 14px, padding 14px
- **Search card service names:** always `text-brand` (#B03A1A), never conditional on profile type

### Brand assets
- PWA icons: `icon-512.png`, `icon-192.png`, `apple-touch-icon.png` — terracotta background, white Georgia "Biso", ochre underline
- WhatsApp profile icon: `biso-whatsapp-profile.png` (1024×1024, edge-to-edge)
- **Link preview (og:image):** small square Biso logo, shown as a thumbnail on the left in WhatsApp — no tagline text, no large banner. WhatsApp caches previews per URL; test changes with `?v=N`.

---

## Current App Structure

| Route | Description |
|---|---|
| `/` | Landing page |
| `/search` | Search artisans by service and zone (shows all approved by default). Typeable service dropdown with keyword matching; unmatched searches appear in `/admin/analytics` under "Recherches sans résultat" |
| `/profiles/[id]` | Full profile — reviews, portfolio, WhatsApp + Call buttons, QR code, share |
| `/artisan` | Artisan registration page — explains Biso, links to Google Form |
| `/admin/profiles/new` | **Admin:** create a new artisan/company profile |
| `/admin/upload` | **Admin:** upload portfolio photos for existing profiles — **multi-photo batch upload** (select several at once; sequential upload with a progress indicator, thumbnail previews, partial-failure handling) |
| `/admin/reviews` | **Admin:** approve/reject client reviews with photos |
| `/admin/analytics` | **Admin:** visits, searches, profile views, WhatsApp clicks — single-day selector (‹ date ›, up to 30 days back) plus 7j/14j/30j |
| `/admin/testmode` | **Admin:** sets a one-year `biso_admin_notrack` cookie so your own visits aren't counted (confirmed on desktop Chrome; mobile unconfirmed) |

All admin routes are protected server-side with `ADMIN_UPLOAD_KEY`.
Admin pages use a **cookie session**: log in once at `/admin/login` (password = `ADMIN_UPLOAD_KEY`), which sets an HttpOnly `biso_admin` cookie for 30 days — **no key in the URL**. The exception is `/admin/testmode`, which still takes `?key=YOUR_KEY` (`&off=1` to clear).
The key must match in `.env.local` and Vercel Production — they have drifted before. Keep it in a password manager.

---

## Contact Buttons (profile page)

- **Green:** "Écrire sur WhatsApp" + WhatsApp icon. Opens a WhatsApp **chat** (wa.me link), not a call — the client can call from inside the chat.
- **White:** "Appeler le 07 67 61 22 78" + phone icon. Dials the `phone` field, falling back to `whatsapp`; the number is always shown in local 10-digit format.
- **Pre-filled WhatsApp message** (one shared constant, used by search cards and profile page):
  « Bonjour, je vous ai trouvé via la plateforme Biso et je souhaite discuter de vos services. »
- Tracking never blocks navigation (sendBeacon / fetch keepalive). Links open with `rel="noopener noreferrer"`.
- "Appeler" appears on profile pages only — not on search cards.

---

## Supabase Schema

### `profiles` table
`id, profile_type, contact_name, company_name, phone, whatsapp, main_location, work_zones, description, experience_years, is_available, is_verified, status, created_at, other_services, main_service_name`

### `profile_services` table (junction)
`id, profile_id, service_id, is_primary, created_at`
First service = `is_primary: true`. Additional services = `is_primary: false`.

### `services` table
`id, name_fr, name_en, category, is_active, created_at` — drives the search dropdown, admin form and Google Form.

### `reviews` table
Includes a `photos` column (text[]) for client-uploaded review photos.

### `events` table (analytics)
`id, event_type, profile_id, metadata, created_at` — written by `/api/events` with the service-role key; RLS disabled.
⚠️ Supabase (PostgREST) silently caps unbounded queries at 1,000 rows. The admin events query uses a 31-day filter plus `.range()` pagination — keep it that way.

### Storage buckets
- `portfolio-photos` — admin-uploaded artisan portfolio images
- `review-photos` — client-uploaded photos attached to reviews

---

## Artisan Intake Workflows

### A. Google Form (self-registration)
URL: https://forms.gle/HrweW6rg45NZQvtEA — linked from `/artisan`.
Admin reviews the response sheet, cleans the data, then creates the profile (Claude Code via Supabase MCP, or `/admin/profiles/new`).

### B. Partner referrals / paper notes (e.g. Fadco)
Artisans who visit **Fadco** (hardware store) are told there that they will be added to Biso. Their details often arrive as photos of handwritten notes.
1. Upload the photos in this chat → Claude transcribes and flags anything unclear (digits, names, trades).
2. Robert confirms the unclear points.
3. Claude writes **one structured insert block** for Claude Code (pre-checks for duplicates and service IDs, `profiles` + `profile_services`, report back with IDs and URLs).
4. Verify on the live app on a phone (search + profile + WhatsApp button).
5. Send the onboarding WhatsApp message (template below). It doubles as the consent check and the phone-number check.
6. When replies arrive, Claude writes one update block; photos go through `/admin/upload`.

Missing details are not a blocker: experience can stay empty. If the first name is missing, use "M. [Nom]" temporarily.

### Onboarding message for partner referrals (signed "Robert de Biso")
Opens with: « Bonjour [Nom], je suis Robert de Biso. Lors de votre passage chez Fadco, on vous a parlé de Biso, une plateforme gratuite qui aide les clients à trouver des artisans de confiance en Côte d'Ivoire. »
Then: profile link, and asks them in one go to:
- verify their information
- give their years of experience
- list any other services
- confirm their zones (all of Abidjan, specific communes, outside Abidjan?)
- send 3–6 clear daytime photos of finished work

It also invites written or voice-note replies, suggests sharing the link with satisfied past clients for reviews, and ends with an opt-out line.

### Field conventions
- `whatsapp`: `2250XXXXXXXXX` (keep the leading 0) · `phone`: `0XXXXXXXXX`. If an artisan gives separate numbers, the "WP" one goes in `whatsapp` and the other in `phone`.
- `experience_years`: text range — `0-2 ans`, `3-5 ans`, `5-10 ans`, `10+ ans`
- Zones: exact strings, e.g. `Tout Abidjan`, `Abidjan - Cocody`, `Toute la Cote D'ivoire` (full list in the biso-profile skill)
- Defaults: `status: approved`, `is_available: true`, `is_verified: false`

### Services list (30 — must match `services.name_fr` exactly)
Architecte, Architecte d'intérieur, Carrelage, Charpenterie, Coffrage, Démolition, Domotique, Électricité, Energie Renouvelable, Étanchéité, Excavation, Ferraillage, Froid & Climatisation, Graphisme, Jardinage, Maçonnerie, Mécanique, Menuiserie aluminium, Menuiserie bois, Menuiserie métallique, Nettoyage, Paysagisme, Peinture, Photographie, Piscine, Plâtrerie, Plomberie, Plombier-gazier, Sécurité électronique, Tailleur

When services change, update everything in sync: Supabase `services` → `lib/service-keywords.ts` → Google Form → `/admin/profiles/new` → this file → `CLAUDE.md` → biso-profile skill.
A new service still matches on its name in the search dropdown, but a renamed service loses its keywords until `lib/service-keywords.ts` is updated — its keys must match `services.name_fr` exactly.

---

## Profile & Content Rules

- **Profile type:** `artisan` or `company`. A company profile shows the company name as the title and the contact person on the line below.
- **Names:** minimum "Prénom + initiale". "M. [Nom]" is acceptable temporarily while the first name is awaited.
- **Descriptions:** 2–3 sentences, third person, client-focused, active voice, no superlatives, no invented claims. Company profiles mention **only the company name**, not the contact person.
- **Services:** multiple per profile; the primary service is listed first.
- **Search card display:** max 2 lines of services, then "+ X autres"
- **Profile page display:** all services, 3 per line
- **Search filtering:** matches any service the profile offers
- **Status:** `approved` = public; `pending` = hidden from search and the public API, but still opens by direct URL (the profile page has no status filter).
- **Test profile:** "Test SARL" (id `ac13c994-c2b4-4500-87e8-452739ab83bb`, admin's own WhatsApp number) is kept as `pending` until needed for testing. It is not a real profile and doesn't count toward the 50.

---

## Review System

- Reviews require admin approval before appearing publicly
- Clients can attach up to 3 photos per review (camera or gallery)
- Photos go to the `review-photos` bucket (compressed client-side)
- Admin sees photos in `/admin/reviews` before approving
- Approved review photos appear as thumbnails under the comment — tap to enlarge (lightbox)
- Review photos do NOT appear in the portfolio section (kept separate for trust)

---

## Portfolio Gallery

- One large featured photo at top (`is_featured = true`, or first photo)
- Up to 5 thumbnails in a scrollable row below
- Clicking a thumbnail swaps it into the large view
- Section hidden if no photos uploaded

---

## Service Worker

`public/sw.js` is currently a **self-clearing, pass-through** worker: skipWaiting + clients.claim, deletes all caches, never serves cached pages. It keeps the app installable without any risk of stale pages. Real offline caching is still a planned priority and must be designed deliberately: which pages, for how long, and how updates reach users.

---

## How We Work Together

- **This chat:** planning, reviewing, deciding, transcribing intake, writing content and Claude Code instruction blocks
- **Claude Code:** all code changes, database writes (Supabase MCP), commits, deploys
- Every session starts with a clear goal before any code is written
- Claude Code investigates and shows diffs before major changes; use **manual mode** (not "accept edits") for anything touching core flows like search
- Always commit and push after every session so Vercel auto-deploys
- Test on mobile (ideally over mobile data) after every visible change — the target user is on a phone

### Starting a Claude Code session (Windows)
1. Check the Supabase project isn't paused (free tier pauses after ~1 week of inactivity).
2. In PowerShell (non-admin): `cd` to the repo, then `git pull`.
3. Run `claude`. If the login has expired, run `/login` and choose the Claude subscription.
4. Run `/mcp` and confirm Supabase is connected. If it fails, generate a new token (see Known Decisions), paste it into `.mcp.json`, and fully restart Claude Code.
5. Run a read-only sanity check (profile count + active services) before any writes.

Claude Code install, if missing: `irm https://claude.ai/install.ps1 | iex`. The Supabase MCP runs via `npx`, which needs Node.js. Update with `winget upgrade Anthropic.ClaudeCode`.

---

## Current Priorities

1. **Content:** reach 50 real profiles for public launch (47 as of 16 Oct 2026). Collect pending details and photos from the Fadco artisans.
2. **Server-render `/search`:** fix taps that get lost on slow phones. Separate session, manual mode, test every filter and the "no results" state.
3. **SEO:** Open Graph basics are done (metadataBase, og:image, locale fr_FR). Next is per-page titles and descriptions.
4. **Offline PWA:** design real caching on top of the self-clearing worker.
5. **Monetization:** to be decided when the profile count reaches 50+.

## Planned (not yet built)
- Remove "Zone principale" field from `/admin/profiles/new` (keep only "Zones d'intervention")
- Search card service display: 2 per line, max 2 lines, then "+ X autres"
- Email notification to admin on new review submission
- Lightbox arrow/swipe navigation between review photos
- Photo lightbox on the main portfolio image (tap to enlarge)
- Gallery arrow visibility improvement on mobile
- Per-profile link-preview image (artisan name + trade)
- Short custom domain (e.g. biso.ci) for sharing and printed flyers
- Move the local repo out of OneDrive (commits are slow there)
- Auto-import from Google Sheet (only when submissions reach ~5+/day)

---

## Known Decisions

- Admin auth: server-side `ADMIN_UPLOAD_KEY` — never expose with `NEXT_PUBLIC_` prefix
- WhatsApp is the primary contact method — no in-app messaging
- No `/register` page — "Je suis artisan / entreprise" routes to `/artisan` then Google Form
- "Appeler" button on profile pages only — not on search cards
- `SUPABASE_SERVICE_ROLE_KEY` must be used in all admin API routes (not anon key)
- `service_role` has INSERT/UPDATE/DELETE on `profiles` and `profile_services`
- **Supabase MCP token:** scoped, not full access. Resource access = Project (tokoss → Artisans); permissions = Project + Database only, everything else None. It can't list projects, so the MCP uses the project ref. A reconnect in `/mcp` does not fix an expired token — edit `.mcp.json` directly.
- `.mcp.json` must stay gitignored (check with `git check-ignore .mcp.json`)
- Strings used in more than one place (e.g. the WhatsApp pre-fill) live in one shared module — never hard-code duplicates

## Admin contact
- WhatsApp: 0758539476
- Google Form: https://forms.gle/HrweW6rg45NZQvtEA

---

## What to Avoid

- Do not suggest features that significantly increase complexity before reaching 500 artisans
- Do not expose any environment variables with `NEXT_PUBLIC_` prefix unless truly public
- Do not commit `.env.local`, `.claude/`, or `.mcp.json` to GitHub
- Do not add buttons or UI elements that duplicate existing functionality
- Do not make design changes without considering mobile view first
- Do not use native `<select>` elements — custom styled dropdowns only
- Do not use emoji as icons in the UI — Tabler outline icons only
- Do not mix fonts — Fraunces only
- Do not run unbounded Supabase queries on growing tables — always filter and paginate
- Do not use full-access Supabase tokens for the MCP
