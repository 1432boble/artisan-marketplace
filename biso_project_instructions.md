# Biso — Project Instructions for Claude (chat / planning side)
*Updated June 3, 2026*

> **Two-file setup — read this first.**
> - **`CLAUDE.md`** is the **technical source of truth** (used by Claude Code): routes,
>   components, Supabase schema, design tokens, admin auth, code rules, quality gate.
> - **This file** is the **planning / chat side**: business context, roadmap, the artisan
>   intake workflow, the Google Form, the services list, and how we work together.
>
> To avoid the two drifting apart, technical details live in **CLAUDE.md only** — this
> file points there instead of repeating them. Update whichever file owns the thing you
> changed; update **both** only when you change the **services list** (see the sync
> checklist below).

---

## What is Biso

Biso is a French-language artisan marketplace platform for Côte d'Ivoire. It connects clients looking for trusted local professionals (artisans and companies) with verified service providers across Abidjan and other cities. The name "Biso" means "nous" (us) in Lingala — reflecting the community trust model.

Three equal user groups: Clients, Artisans/Companies, and Admins.

**Business goal:** Reach 500 active artisan profiles within 6-12 months and establish Biso as the market leader in this sector and region. Monetization model is not yet decided — do not suggest features that assume a specific revenue model without discussing it first.

**Tech stack at a glance:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Supabase (Postgres + Storage), deployed on Vercel (auto-deploys from GitHub `main`).
- Repo: https://github.com/1432boble/artisan-marketplace
- Live: artisan-marketplace-phi.vercel.app
- Local: `C:\Users\robotemb\OneDrive\App\GitHub\artisan-marketplace\artisan-marketplace`

> Routes, components, PWA, Supabase schema, design system (fonts/colors/component
> rules), error handling, and admin auth are all documented in **CLAUDE.md** — refer
> there rather than duplicating them here.

---

## Services — Sync Checklist

The `services` table in Supabase is the single source of truth.
Every time a service is added, renamed, or deactivated, ALL of the
following must be updated in the same session before closing:

1. **Supabase** `services` table — add/edit/deactivate the service
2. **Google Form** — add/remove the checkbox in "Service principal"
3. **`/admin/profiles/new`** — no code change needed; the form fetches services
   live from Supabase (`is_active = true`), so the checkbox appears automatically
4. **This file** — update the services list below
5. **CLAUDE.md** — update the service count line under "Critical Rules → Services"

> **Adding a new service:** insert a row in Supabase `services` with the correct
> `name_fr` and `is_active = true`. The search dropdown and the admin form both update
> automatically — no frontend code change needed.

### Services List (30 services — must match Supabase `name_fr` exactly, alphabetical)

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
Piscine
Plâtrerie
Plomberie
Plombier-gazier
Sécurité électronique
Tailleur
```

---

## Artisan Intake Workflow

### How new profiles are added

1. **Artisan/entreprise submits Google Form**
   URL: https://forms.gle/HrweW6rg45NZQvtEA
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

## Content Rules (for writing/editing profiles)

- **Profile type:** `artisan` or `company`
- **Names:** minimum "Prénom + initiale" — never first name only
- **Descriptions:** max 3 sentences, client-focused, active voice
- **Services:** multi-select — multiple services per profile supported
- **Search card display:** max 2 lines of services (4 services), then "+ X autres"
- **Profile page display:** all services, 3 per line
- **`other_services`:** free text, optional; shown on the profile page as muted
  `"Autres services · value"`, not on search cards

> Field-level schema and the exact search-filter implementation live in **CLAUDE.md**.

---

## Review System (product behavior)

- Reviews require admin approval before appearing publicly
- Clients can attach up to 3 photos per review (camera or gallery)
- Photos upload to the `review-photos` Supabase bucket (compressed client-side)
- Admin sees photos in `/admin/reviews` before approving
- Approved review photos appear as thumbnails under the comment — tap to enlarge (lightbox)
- Review photos do NOT appear in the portfolio section (kept separate for trust)
- Review form has client-side validation (name, comment, confirmation checkbox)

---

## How We Work Together

- **This chat** — planning, reviewing, deciding, writing content, drafting descriptions
- **Claude Code** — all code changes, commits, deploys
- Every session starts with a clear goal before any code is written
- Always commit and push after every session so Vercel auto-deploys
- Test on mobile after every visible change — target user is on a phone
- Never add features not needed for MVP without discussing first

---

## Current Priorities

1. **Content** — reach 20–30 clean profiles before public launch (currently 28: 13 artisans + 15 companies, all approved — target essentially met)
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

## Product Decisions (non-technical)

- WhatsApp is the primary contact method — no in-app messaging
- No `/register` page — "Je suis artisan / entreprise" routes to `/artisan` then Google Form
- "Appeler" button on profile pages only — not on search cards
- New profiles default to `approved`, `is_available: true`, `is_verified: false`

> Technical decisions (admin cookie auth, service-role usage, env-var rules, search
> exact-match, "never hardcode service names", etc.) are documented in **CLAUDE.md →
> Known Decisions / Critical Rules**.

## Admin contact
- WhatsApp: 0758539476
- Google Form: https://forms.gle/HrweW6rg45NZQvtEA
