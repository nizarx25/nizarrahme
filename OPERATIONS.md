# OPERATIONS — `nizarrahme.com`

> Operations runbook for the nizarrahme.com domain marketplace.
> Last updated: 2026-09-03

This document explains how to develop, build, deploy, and operate the
application. For the full architectural audit, see [PROJECT_AUDIT.md](./PROJECT_AUDIT.md).

---

## 1. Stack Overview

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1 (App Router, RSC) |
| Language | TypeScript 5 (`strict`, `noImplicitAny`) |
| UI | React 19 + shadcn/ui (new-york) + Tailwind CSS 4 |
| Data fetching | TanStack Query 5 (client) |
| State | Zustand 5 (section/modals) |
| Forms / validation | Zod 4 |
| ORM | Prisma 6 (SQLite local, with bundled-JSON fallback for Vercel) |
| Auth | Custom bcrypt + HttpOnly cookie session |
| Email | Resend |
| Hosting | Vercel (configured via `vercel.json`) |
| Reverse proxy (optional) | Caddyfile on `:81` |

The marketplace is a single-page application (SPA) with six navigable
sections: Home, Domains, About, Services, Transactions, Contact. All state
lives in a single Zustand store; the server is queried for static data
(domains, stats, settings) via TanStack Query.

---

## 2. Prerequisites

- **Node.js** ≥ 22 (project tested on v22.20)
- **npm** ≥ 10 (or `pnpm` / `bun` — package manager is not pinned)
- **git** (optional, for source control)
- A **Resend** account if you want inquiry emails (free tier is enough)

---

## 3. First-time Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and fill in RESEND_API_KEY, CONTACT_EMAIL, etc.
# See section 7 for the full list of env vars.

# 3. Initialize the database
npm run db:deploy          # Apply Prisma migrations
npm run db:seed            # Seed 156 domains (incl. 18 wholesale)

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

The seed inserts 156 unique domains (38 from Atom + 118 portfolio), and then
marks 18 names as wholesale ($99 BIN). See `prisma/seed.ts` for the full
whitelist.

---

## 4. Daily Development

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server on port 3000 (logs to `dev.log`) |
| `npm run typecheck` | Run `tsc --noEmit` over the project |
| `npm run lint` | Run ESLint over `src/` |
| `npm run build` | `prisma generate && prisma migrate deploy && next build` |
| `npm run start` | Run the production build (after `npm run build`) |

### Prisma workflow

| Command | When to use |
|---|---|
| `npm run db:generate` | After changing `schema.prisma` (regenerate client) |
| `npm run db:deploy` | Apply pending migrations (safe, idempotent) |
| `npm run db:migrate` | Create a new migration from a schema change (dev only) |
| `npm run db:push` | ⚠️ Schema sync without migration history — **avoid in production** |
| `npm run db:reset` | Drop & recreate the local SQLite DB (dev only) |
| `npm run db:seed` | Re-run the seed script |

### Resetting the local database

```bash
rm prisma/dev.db
npm run db:deploy
npm run db:seed
```

### Adding a new domain

There are three places to keep in sync if you want the domain visible both
in local dev (DB) and on Vercel (bundled JSON fallback):

1. **Database** — insert via `prisma` Studio or a one-off script.
2. **Bundled JSON** — append the same row to `src/data/domains.json`.
3. **Wholesale pricing** — if it's a $99 BIN name, also add it to
   `WHOLESALE_NAMES` in `prisma/seed.ts` so future seeds re-tag it.

A convenience script regenerates `domains.json` from the DB:

```bash
npx tsx scripts/export-domains.ts
```

### Regenerating migrations

```bash
# After changing schema.prisma:
npm run db:migrate -- --name describe_the_change
# Review the generated SQL in prisma/migrations/<timestamp>_<name>/migration.sql
# Commit it alongside your code change.
```

> ⚠️ Never use `db:push --accept-data-loss` against a production database.
> Always commit a migration and run `db:deploy`.

---

## 5. Environment Variables

All variables are documented in `.env.example`. The required set is:

| Variable | Required? | Description |
|---|---|---|
| `DATABASE_URL` | local only | e.g. `file:./prisma/dev.db`. On Vercel this is ignored. |
| `RESEND_API_KEY` | for emails | Resend API key. Without it, inquiries save to DB but no email is sent. |
| `CONTACT_EMAIL` | recommended | Where inquiry emails are sent. Defaults to `info@nizarrahme.com`. |
| `FROM_EMAIL` | optional | Verified sender. Defaults to `onboarding@resend.dev`. |
| `ALLOW_ADMIN_BOOTSTRAP` | one-time | Set to `true` to allow the first admin to be created from env. **Turn off after first login.** |
| `ADMIN_BOOTSTRAP_EMAIL` | when bootstrapping | Email of the first admin. |
| `ADMIN_BOOTSTRAP_PASSWORD` | when bootstrapping | Password (min 12 chars). |
| `ADMIN_BOOTSTRAP_NAME` | optional | Display name. |
| `NEXT_PUBLIC_SITE_URL` | optional | Public site URL for canonical/OG. Defaults to `https://nizarrahme.com`. |

> Variables prefixed with `NEXT_PUBLIC_` are inlined into the client bundle
> at build time. Keep secrets out of them.

---

## 6. Admin Authentication

The admin panel uses a custom auth subsystem with the following guarantees:

- ✅ Passwords are hashed with **bcrypt** (12 rounds)
- ✅ Existing legacy SHA-256 rows are auto-upgraded on next successful login
- ✅ Sessions are stored in an **HttpOnly cookie** (`admin_session`) with
  `Secure` in production and `SameSite=Lax`
- ✅ Login is rate-limited to **5 attempts per IP per minute**
- ✅ Inquiry submissions are rate-limited to **5 per IP per hour**
- ✅ Tokens expire after 24 hours
- ✅ Logout invalidates the server-side token and clears the cookie

### Creating the first admin

1. Set the bootstrap env vars in your deployment environment:
   ```
   ALLOW_ADMIN_BOOTSTRAP=true
   ADMIN_BOOTSTRAP_EMAIL=you@example.com
   ADMIN_BOOTSTRAP_PASSWORD=<12+ character strong password>
   ```
2. Redeploy (or restart the dev server). The variables are read at boot.
3. `POST /api/admin/login` with the credentials. The user is created
   automatically and you receive a session cookie + JSON token.
4. **Immediately remove `ALLOW_ADMIN_BOOTSTRAP` from your env.** The
   login route will not create new users afterwards.

### Admin API endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/admin/login` | POST | public | Login (sets cookie, returns token) |
| `/api/admin/logout` | POST | session | Logout (clears cookie, invalidates token) |
| `/api/admin/domains` | GET | session | List all domains (incl. internal fields) |
| `/api/admin/domains/[id]` | PUT | session | Update a domain |
| `/api/admin/inquiries` | GET | session | List inquiries |
| `/api/admin/inquiries/[id]` | PUT | session | Update inquiry status/notes |

Authenticate by sending the session cookie (preferred) **or** an
`Authorization: Bearer <token>` header. Sessions expire in 24 h.

### E2E auth smoke test

A scripted smoke test lives at `scripts/run-auth-smoke.ps1`. It boots a
dev server, logs in, hits a protected endpoint, logs out, and verifies
the session is invalidated. Use it after any change to `lib/auth.ts` or
the admin routes.

```bash
powershell -ExecutionPolicy Bypass -File scripts\run-auth-smoke.ps1
```

---

## 7. API Surface (Public)

All public responses are JSON. CORS is not configured (the same origin
is the only consumer).

| Endpoint | Method | Query params | Response |
|---|---|---|---|
| `/api/domains` | GET | `search`, `category`, `extension`, `status`, `featured`, `hasPrice`, `sort`, `page`, `limit` | `{ domains, total, page, limit, categories, extensions }` |
| `/api/domains/featured` | GET | — | `{ domains: PublicDomain[] }` (max 20) |
| `/api/domains/[slug]` | GET | — | `{ domain, relatedDomains }` (404 if missing) |
| `/api/domains/stats` | GET | — | `{ totalDomains, featuredCount, atomListed, wholesaleCount, categories, extensions }` |
| `/api/inquiries` | POST | — | `{ success, message }` (rate-limited) |
| `/api/settings` | GET | — | `{ contactEmail, socialLinks }` |
| `/api/transactions` | GET | — | `{ transactions }` (hardcoded list) |

`PublicDomain` (the shape returned everywhere a domain appears):

```ts
{
  id: string
  name: string           // "sitewebai.com"
  slug: string           // "sitewebai-com"
  extension: string      // ".com"
  category: string       // "AI"
  tags: string[]
  shortDescription: string
  useCases: string[]
  status: string         // "Available" | "Negotiating" | "Sold"
  featured: boolean
  price: number | null
  showPrice: boolean
  saleType: string       // "BIN" | "Make an Offer"
  publicNotes: string
  createdAt: string      // ISO
  updatedAt: string      // ISO
}
```

Internal fields (`internalNotes`, `registrar`, `domainScore`,
`expirationDate`, `sourceUrl`) are **only** returned by `/api/admin/domains`.

---

## 8. SEO

- **Metadata**: defined in `src/app/layout.tsx` (title, description, OG,
  Twitter, JSON-LD `Person` / `Organization` / `FAQPage` / `WebSite`).
- **OG image**: [`public/og.svg`](./public/og.svg) (1200×630). Replace it
  with a PNG/JPG if you need broader crawler support.
- **Sitemap**: `src/app/sitemap.ts` regenerates every hour (`revalidate=3600`).
  Each domain is exposed as `/d/<slug>`.
- **Robots**: `src/app/robots.ts` disallows `/api/`.
- **Per-domain pages**: `src/app/d/[slug]/page.tsx` has its own
  `generateMetadata`, so every domain has a unique title, description,
  and OG card.

### Adding a new structured-data block

`jsonLd` lives in `src/app/layout.tsx`. To add a `BreadcrumbList` or
`Product` schema, extend the `jsonLd` const.

---

## 9. Codebase Tour

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, metadata, JSON-LD, providers
│   ├── page.tsx                  # 62-line SPA composition root
│   ├── globals.css               # Tailwind + design tokens
│   ├── robots.ts, sitemap.ts     # SEO routes
│   ├── not-found.tsx             # Custom 404 page
│   ├── d/[slug]/                 # Per-domain permalink
│   │   ├── page.tsx              # Server component + generateMetadata
│   │   └── domain-permalink-view.tsx
│   └── api/                      # Route handlers
│       ├── admin/                # login, logout, domains, inquiries
│       ├── domains/              # list, [slug], featured, stats
│       ├── inquiries, settings, transactions
├── components/
│   ├── layout/                   # header, footer, partner-logos, navigation
│   ├── home/                     # featured-carousel, claimed-ticker
│   ├── domain/                   # domain-card
│   ├── sections/                 # 7 section components (home, domains, ...)
│   ├── dialogs/                  # 3 dialog components
│   └── ui/                       # 48 shadcn primitives (untouched)
├── hooks/
│   ├── use-domain-data.ts        # All TanStack Query hooks + types
│   ├── use-toast.ts, use-mobile.ts
├── lib/
│   ├── auth.ts                   # bcrypt + session store + rate limiters
│   ├── db.ts                     # Prisma client proxy (Vercel-aware)
│   ├── domain.ts                 # PublicDomain type + toPublicDomain()
│   ├── fallback-data.ts          # Bundled-JSON queries (used on Vercel)
│   ├── utils.ts                  # cn() helper
│   └── wholesale.ts              # WHOLESALE_DOMAINS constant
└── store/
    └── navigation.ts             # Zustand store (section, modals, selected domain)

prisma/
├── schema.prisma                 # Domain, Inquiry, AdminUser, SiteSettings
├── seed.ts                       # 156 domains + 18 wholesale updateMany
└── migrations/20260101000000_init_baseline/
    └── migration.sql             # Tables + unique + 9 performance indexes

scripts/
├── export-domains.ts             # Export dev DB → src/data/domains.json
├── smoke-auth.mjs                # Auth E2E test (Node)
└── run-auth-smoke.ps1            # Auth E2E test runner (boots dev server)
```

### Adding a new section

1. Create `src/components/sections/my-section.tsx` with a default-exported
   React component.
2. Add the section to the `Section` union type in `src/store/navigation.ts`.
3. Add the label to `NAV_ITEMS` in `src/components/layout/navigation.ts`.
4. Mount it in `src/app/page.tsx` next to the other `nav.section === '…' &&` checks.

### Adding a new API route

1. Create `src/app/api/<route>/route.ts` exporting `GET` / `POST` / etc.
2. If authenticated, call `requireAuth(request)` from `@/lib/auth`.
3. Return `NextResponse.json(...)`. Errors should return `{ error: '…' }`
   with a meaningful HTTP status.
4. Use the shared `toPublicDomain()` from `@/lib/domain` to serialize
   domain data — never hand-roll the mapping.

---

## 10. Performance Notes

- **Bundle size**: `page.tsx` is small (62 lines) but `'use client'`; consider
  extracting the home page into a server component with a thin client
  wrapper for interactive parts.
- **DB indexes**: 9 indexes added in the baseline migration
  (`status`, `featured`, `category`, `extension`, `sourceMarketplace`,
  `createdAt`, `normalizedName`, plus 2 on `Inquiry`).
- **Caching**:
  - `staleTime: 2 * 60 * 1000` on TanStack Query.
  - `revalidate: 3600` on sitemap and per-domain permalinks.
- **Image optimization**: the project does not currently use `next/image`.
  Add it when serving real photographs (e.g. social media images).
- **Server-side rate limiting**: works locally; on Vercel you must move
  to Upstash Redis / Vercel KV for distributed counters (see audit S-5).

---

## 11. Security Notes

- **CSP** is configured in `next.config.ts` (X-Frame-Options, X-Content-Type-Options,
  HSTS, Referrer-Policy, Permissions-Policy). The current `script-src`
  still allows `'unsafe-eval' 'unsafe-inline'` for dev; tighten this
  with nonces before going to production.
- **Secrets** must only live in `.env` (gitignored) or in your hosting
  provider's secret manager. Never commit `.env` or `dev.db`.
- **Auto-admin creation** is disabled by default. `ALLOW_ADMIN_BOOTSTRAP`
  must be `true` to create the first admin; turn it off after the first
  successful login.
- **Password hashing**: bcrypt with 12 rounds. Legacy SHA-256+salt rows are
  auto-upgraded on next successful login.
- **Rate limits**: admin login (5/min/IP), inquiries (5/hour/IP). Both
  are in-memory; replace with Upstash for multi-instance deployments.

---

## 12. Deployment

### Vercel (recommended)

```bash
# One-time
vercel link
vercel env add DATABASE_URL production       # leave empty, Vercel branch uses fallback
vercel env add RESEND_API_KEY production
vercel env add CONTACT_EMAIL production
# Do NOT set ALLOW_ADMIN_BOOTSTRAP until you need the first admin

# Deploy
git push origin main
# or
vercel --prod
```

Vercel runs `npm run build`, which executes:
1. `prisma generate` — generates the typed client
2. `prisma migrate deploy` — applies pending migrations
3. `next build` — produces the optimized output

On Vercel, the Prisma client proxy detects `process.env.VERCEL === '1'`
and returns the bundled JSON instead of trying to use SQLite.

### Self-hosted (Caddy)

The included `Caddyfile` reverse-proxies port 81 → 3000 (Next.js). To
deploy on a VPS:

```bash
# Build
npm ci
npm run build

# Run with a process manager (systemd / pm2 / docker)
PORT=3000 npm start
```

For SQLite on a VPS, mount a persistent volume at the path of `dev.db`
and set `DATABASE_URL=file:/data/dev.db`.

---

## 13. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `prisma:warn: Prisma client did not fetch yet` | `node_modules/@prisma/client` is stale | `npm run db:generate` |
| `P1001: Can't reach database server` | `DATABASE_URL` wrong, or SQLite file missing | Re-run `npm run db:deploy && npm run db:seed` |
| `Invalid or expired session` on admin routes | Token expired (24h) or cookie was cleared | Login again |
| `429 Too many login attempts` | 5 failed logins in 1 minute from the same IP | Wait, or clear the in-memory `tokenStore` (restart the server) |
| Wholesale cards show 404 | Seed step that tags the 18 wholesale names didn't run | Re-run `npm run db:seed` |
| Home page shows no featured domains | DB has zero `featured: true` rows | Re-seed, or mark some domains as featured in admin |
| Static `sitemap.xml` shows old data | `revalidate: 3600` not expired | Wait an hour, or hit the route with `?ts=<now>` |

---

## 14. CI / Lint / Test

Currently the project has **no automated tests**. Recommended minimum
before scaling further:

1. **Vitest** for unit tests on `lib/auth.ts` (especially the bcrypt
   + legacy upgrade path and the rate limiter) and `lib/fallback-data.ts`
   (filter / sort / pagination).
2. **Playwright** for at least one inquiry submission smoke test.
3. **CI** workflow that runs `npm run typecheck && npm run lint &&
   npm run build` on every PR.

---

## 15. Maintenance Checklist

- [ ] Re-export domains to JSON after any DB change: `npx tsx scripts/export-domains.ts`
- [ ] Commit a Prisma migration for every schema change; never `db:push` in production
- [ ] Disable `ALLOW_ADMIN_BOOTSTRAP` after the first admin logs in
- [ ] Rotate `RESEND_API_KEY` if you suspect a leak
- [ ] Review `dev.log` for repeated 401/429 patterns (possible abuse)
- [ ] Verify `/sitemap.xml` is reachable and contains the expected domain count
- [ ] Spot-check the `/d/<slug>` permalink of a recently added domain
- [ ] Check Vercel build logs after dependency upgrades

---

## 16. File Reference

- Full audit & rationale: [PROJECT_AUDIT.md](./PROJECT_AUDIT.md)
- Project conventions & changelog: [worklog.md](./worklog.md)
- Schema: [prisma/schema.prisma](./prisma/schema.prisma)
- Routes overview: see [PROJECT_AUDIT.md §11](./PROJECT_AUDIT.md)
- Auth implementation: [src/lib/auth.ts](./src/lib/auth.ts)
- Design tokens: [src/app/globals.css](./src/app/globals.css)
- Layout: [src/app/layout.tsx](./src/app/layout.tsx)
- Reverse proxy config: [Caddyfile](./Caddyfile)