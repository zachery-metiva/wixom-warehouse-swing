# Warehouse Swing website

Next.js 16 (App Router, Cache Components) + Supabase, built from the "Night Shift" design.

## Run it

```bash
npm install
cp .env.example .env.local   # values already point at the shared Supabase project
npm run dev                  # http://localhost:3000
```

Deploy on Vercel: import the repo, set the three variables from `.env.example`, done.

## What's here

| Area | Path | Notes |
| --- | --- | --- |
| Public site | `src/app/(site)` | Home, Calendar, Move Vault, Move detail, About, Photos, FAQ + Pricing, Contact |
| Link-in-bio | `src/app/links` | No nav/footer; links come from Admin > Settings |
| Admin | `src/app/admin` | Sign in with your door-app staff email + password |
| Data access | `src/lib/data.ts` | Cached reads tagged `site`; admin saves call `updateTag("site")` |
| Database | `supabase/migrations` | Already applied to the project; kept here as the record |

## How it shares the door app's database

Everything the website owns is a `site_*` table or function. Nothing in the door app's
tables, functions or policies was changed.

- **Events:** the public calendar shows every regular Tuesday automatically, then overlays
  real nights from the door app's `events` table (via `site_public_events`, which exposes
  only date, name, times and teachers). Topics, descriptions and Meetup links live in
  `site_event_notes`. Skip a Tuesday with `site_closures`.
- **Prices:** door and student prices are read from the door app's `venue_settings`
  pricing tiers, so the site never disagrees with the door.
- **Who can edit:** `site_is_editor()` calls the door app's own `staff_can('editWebsite')`.
  Owners always can, managers can by default, door staff can't unless an owner grants
  `editWebsite` in the door app's permissions.
- **Images:** public `site-media` storage bucket; only editors can upload.

## Not built yet

- Sending the newsletter (signups are collected; export CSV from Admin > Subscribers)
- Waivers: the door app already handles them; add its signing URL in Admin > Settings
