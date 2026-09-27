<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from this file's directory) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# What this agent does

This is the **ScamShield** development agent. It maintains a Next.js 16.3.2 / React 19 / TypeScript / Tailwind v4 / Prisma 6 / MongoDB Atlas application that lets users query, submit, review, and upvote Indian job & internship scam listings, and lets admins moderate submissions. When working in this repo the agent:

- Adds new data models via `prisma/schema.prisma`, then runs `npx prisma db push` (Mongo has no migration history).
- Implements mutations as **Server Actions** (`actions/*.ts`) consumed by client components via `useActionState` / direct form actions.
- Adds pages under `app/` (App Router) and composes UI from `components/` (shadcn-style `ui/*` + feature components).
- Keeps auth in `lib/auth.ts` (bcryptjs + jose JWT) and data access in `lib/dal.ts` (cached, `server-only`); mutations respect the current session's `role`.
- Guards bot abuse with `lib/rateLimit.ts` (IP-based) on upvotes/reviews.
- Lints with `npx eslint app actions components lib prisma --max-warnings 0` and type-checks with `npx tsc --noEmit`.

# Project layout

```
prisma/schema.prisma          # MongoDB data model (User/Account/Session, ScamListing, Category, Review, Vote, enums)
prisma/seed.ts               # Seed: 6 categories + admin + MockScraper + JSON API scraper
lib/
  prisma.ts                  # Prisma client singleton
  auth.ts                    # bcryptjs hashing + jose JWT session create/verify
  dal.ts                     # getCurrentUser / verifySession / requireAdmin (cached per request, server-only DTOs)
  rateLimit.ts               # IP-based in-memory limiter
  config.ts                  # SCAM_TYPES, INDIAN_STATES, Theme, COOKIE_NAME, env flags
  ingestion/index.ts         # Pluggable scrapers (MockScraper + JsonApiScraper)
actions/
  auth.ts                    # login, signup, logout
  listings.ts                # submitListing, approveListing, rejectListing, deleteListing, setVerified
  reviews.ts                 # addReview, deleteReview, voteOnReview
  admin.ts                   # upsertCategory, deleteCategory
  theme.ts                   # setTheme (cookie action)
app/
  (auth)/login, signup       # Auth pages
  /                          # Home: search form + listing grid + pagination
  /listings/[slug]           # Detail page
  /report                    # Submit a listing
  /profile                   # My reviews / profile
  /admin                     # Dashboard: submissions, categories
  /api/health, ingest, listings
components/
  ui/*                       # Button, Input, Textarea, Label, Badge, Card
  avatar.tsx, navbar.tsx, footer.tsx, theme-toggle.tsx
  listing-card, listing-grid, pagination, search-form
  review-form, review-list, review-item, vote-button
```

# Scripts

> **Note:** This build of Next.js does **not** ship `next lint` or `next exec`, so the `lint`/`seed` scripts shell out to `eslint`/`tsx` directly.

| Script        | Command                          | Purpose                              |
|---------------|----------------------------------|--------------------------------------|
| `dev`         | `next dev`                       | Start Turbopack dev server (`:3000`) |
| `build`       | `next build`                     | Production build                     |
| `start`       | `next start`                     | Run production server                |
| `lint`        | `eslint app actions components lib prisma --max-warnings 0` | Lint source |
| `typecheck`   | `tsc --noEmit`                   | Type-check                           |
| `seed`        | `tsx prisma/seed.ts`             | Seed DB (categories + admin + listings) |

Typical flow: `npm run typecheck && npm run lint && npm run seed` before pushing.

# Environment (.env — git-ignored)

```
DATABASE_URL="mongodb://localhost:27017/scamshield"   # local; Atlas URI in prod
AUTH_SECRET="<openssl rand -base64 32>"             # jose JWT signing
ADMIN_EMAILS="you@example.com"                      # comma-separated admin emails
NEXT_PUBLIC_APP_NAME="ScamShield"
SCRAPE_JSON_URL=""                                  # optional external listings JSON API
```
Copy `.env.example` → `.env` and fill in. Generate a secret with `openssl rand -base64 32`.

# Local dev runbook (MongoDB)

Prisma transactions (used by `prisma.category.upsert` in the seed) require a Mongo **replica set**, even locally:

```bash
# 1. (re)start mongod as a single-node replica set
pkill -f 'mongod.*tmp/mongodata' || true
rm -rf /tmp/mongodata && mkdir -p /tmp/mongodata
nohup mongod --dbpath /tmp/mongodata --replSet rs0 --bind_ip 127.0.0.1 \
  --port 27017 --logpath /tmp/mongod.log --fork > /tmp/mongod_start.log 2>&1
sleep 8
mongosh --quiet --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'

# 2. push schema + seed + dev
npx prisma db push
npm run seed
npm run dev
```

Seeded demo credentials: `admin@scamshield.local` / `Admin@1234`.

# Conventions

- Server Actions: `'use server'` at top of each file; return `{ ok, data? }` or `{ ok:false, error }` DTOs.
- Client components: `'use client'`; mutate via `useActionState` for form state feedback.
- `use client` ↔ server boundary: keep `server-only` imports out of client files.
- Mongo `_id` is exposed as `id` in DTOs; never send secrets (password hash) to the client.
- Tailwind v4: imports in `app/globals.css`; theme via CSS variables + `dark` class on `<html>`.

# Known limitations

- Prisma 7 removed MongoDB direct connection; this project pins **Prisma 6.19.3** (classic Mongo support). Do **not** upgrade `@prisma/client`/`prisma` without revalidating Mongo support.
- No stable free India-specific scam-API exists; ingestion is driven by a mock scraper + an optional `SCRAPE_JSON_URL` JSON endpoint.
- The "this is NOT the Next.js you know" block above is re-emitted by `next dev` (`generate-agent-files.js`); keep it to stay tree-clean.
