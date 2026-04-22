# VoltSpark — Handover Notes
_April 2026 · For Application Development Team_

---

## Project Split — Read This First

This repository (`d:/Project-AI/LNK/VoltSpark`) is **application development only**.

| What | Where |
|---|---|
| Application code, schema, API routes, UI, deployments | **This repo** (`VoltSpark`) |
| Business strategy, competitor analysis, 5-year blueprint, investor docs, partner docs | **GrowthPath** (`D:/Project-AI/LNK/VoltSpark GrowthPath`) |
| IoT hardware partners, vendor NDA, consultant list, events, customer docs | **GrowthPath** (`D:/Project-AI/LNK/VoltSpark GrowthPath`) |

**Rule of thumb:** If it's about how the software works → VoltSpark repo. If it's about how the business grows → GrowthPath.

---

## What VoltSpark Is

Multi-tenant B2B2C + B2C SaaS for industrial energy and compliance management in India.

- **B2B2C track:** Energy consultant signs up → adds industrial clients → manages all from one portfolio dashboard
- **B2C track:** Industrial facility signs up directly, enters bills, tracks compliance
- **First client:** Unnathi CNC Technologies (Peenya, Bengaluru) — managed by Akshaya Createch
- **Pilot client:** A Plus Fixtures Pvt Ltd (Bommanahalli) — 3 CNC machines + solar
- **Live at:** https://volt-spark.vercel.app
- **Built by:** Akshaya Createch (Aravind V Bayari — tech; Lakshminarasimhan K — domain)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS (custom classes: `.btn-primary`, `.btn-secondary`, `.input-field`, `.card`) |
| Auth | NextAuth v4 — credentials provider, JWT sessions |
| Database | Turso (libSQL) in production, better-sqlite3 locally |
| ORM | Prisma 7 with driver adapters |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel (project: `voltspark`, domain: `volt-spark.vercel.app`) |
| Email | Resend (RESEND_API_KEY not yet set on Vercel — emails disabled in prod) |
| E2E Tests | Playwright |

---

## What Has Been Built (Full Feature Inventory)

### Core Architecture
- Multi-tenant: Organisation → Client → User hierarchy with Membership + ClientAccess
- 31 Prisma models, all energy/compliance models carry `clientId` for row-level isolation
- `requireClient()` in every API route enforces tenant isolation
- JWT session carries: userId, orgRole, activeClientId, activeClientSlug, clientRole
- Workspace switcher (consultants switch between clients without re-login)
- `/console` — consultant portfolio dashboard with client summary cards
- `OnboardingGuard` in app layout — redirects to `/assessment` if baseline not complete

### Energy Management
- Energy sources (meter registry with cost per unit, tariff rates)
- Consumption entries (manual + IoT-bridged, deviation detection)
- Energy targets (per source, per period, reduction % tracking)
- Energy Cost Dashboard (₹ view, monthly trends, source breakdown)
- Utility bill analyser (BESCOM/CESC fields, PF penalty, demand overshoot, anomaly detection)

### Compliance & Safety
- Compliance frameworks (ISO 50001, ZED, Electrical Safety templates — generic "Requirement N" display)
- Safety inspections (configurable templates, digital checklists)
- Incident register (near-misses, RCA, follow-up)
- Certification tracker with expiry alerts
- Compliance calendar (all due dates across clients)
- Audits + audit findings (severity, corrective action, evidence)
- CAPA (5-Why analysis, comments, verification, effectiveness check)
- Training programs + attendance tracking

### IoT Metering (Add-on: `IOT_METERING`)
- Vendor-agnostic framework: Gateway → Meter → MeterReading models
- MQTT webhook support for real-time ingest
- IoT-to-Core bridge: POST `/api/iot/aggregate` → creates ConsumptionEntry from daily deltas
- Validated hardware: Schneider ESX Panel Server (gateway), EM6400NG, EM1200 (meters)

### Industry Intelligence Add-ons
- **Manufacturing Intelligence** (`COMPRESSED_AIR`): kWh/unit, compressed air efficiency, shift analysis, vibration/temp sensor hooks
- **Commercial Kitchen Intelligence** (`KITCHEN`): Titan meter integration, demand management, load shedding, HACCP temperature logging
- **Power Quality** (`POWER_QUALITY`): EN 50160 compliance, PQEvent/PQSnapshot, THD, harmonics, sag/swell
- Add-on toggle UI on console page; each add-on is gated per client

### Financial Tools
- Savings tracker (before/after baseline, improvement attribution, ROI)
- ROI calculator (7 templates: solar, VFD, PF correction, LED, compressed air, motors, transformer)
- Government scheme eligibility matching (BEE, ZED, MSME)

### Reports & Export
- PDF export (8-section Impact Report)
- CSV/JSON data export
- 20-month demo seed data per client

### Public Pages (Marketing)
- `/` — Landing page (B2B2C + B2C, two-track hero)
- `/start` — For facilities signing up directly (B2C)
- `/login`, `/register` — Auth pages
- `/investor` — Investor pitch **(private, passphrase: `akshaya2026`)**
- `/partner` — Partner programme **(private, passphrase: `akshaya2026`)**
- `/partner/economics` — Full commission breakdown **(private, passphrase: `akshaya2026`)**

### Whitelabel & Settings
- Logo upload, custom platform name, brand colour picker (Settings page)
- Sidebar displays custom branding per client

### Other
- PWA manifest with SVG icon
- Playwright E2E tests (auth, dashboard nav, IoT ingest API): `npm run test:e2e`
- Recurring schedules model (`RecurringSchedule`) → calendar API generates occurrences, 90-day horizon

---

## Database

- **Schema:** `app/prisma/schema.prisma` — 31 models
- **Seed:** `app/prisma/seed.ts` — 20 months of demo data, 5 inspection templates, 5 recurring schedules, two clients (Unnathi CNC + A Plus Fixtures)
- **Local:** `app/dev.db` (better-sqlite3, gitignored)
- **Production:** Turso libSQL — `libsql://unnnathicnc-aravindcleaerr.aws-ap-south-1.turso.io`

### Key Prisma Gotchas
- Never use Prisma `enum` types — SQLite doesn't support them; use String with comments
- CAPA model is `prisma.cAPA` (not `prisma.capa`)
- TrainingProgram has no `createdById`
- Recharts Tooltip formatter: `(v) => Number(v)` not `(v: number) =>`
- Set iteration: `Array.from(new Set(...))` not `[...new Set(...)]`
- Next.js 14: export `Viewport` type separately, not in `metadata`

---

## Deployment Workflow

```bash
# 1. Build check
cd app && npx next build

# 2. Commit & push
git add ... && git commit -m "..." && git push origin master

# 3. Deploy to Vercel
cd app && npx vercel --prod

# If schema changed — Turso sync:
# vercel env pull .env.turso --environment production
# PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma db push --force-reset
# npx prisma db seed
# set -a && source .env.turso && node push-schema.mjs
# set -a && source .env.turso && node copy-to-turso.mjs
# rm .env.turso
```

---

## Login Credentials (Seed Data)

| User | Email | Password | Role |
|---|---|---|---|
| Consultant (Aravind) | `aravind@akshayacreatech.com` | `akshaya123` | Org OWNER |
| Unnathi CNC admin | `sureshkumar@unnathicnc.com` | `unnathi123` | CLIENT_ADMIN |
| A Plus Fixtures admin | `admin@aplusfixtures.com` | `aplus123` | CLIENT_ADMIN (IOT_METERING enabled) |
| Demo | `demo@voltspark.in` | `demo123` | — |

---

## Key Architectural Decisions (Why, Not Just What)

**Multi-tenant via `clientId` on every model, not schema-per-tenant**
Simple for SQLite/Turso; `requireClient()` enforces isolation in every route. No cross-tenant queries possible by design.

**JWT session carries active client context**
Consultants switch clients without re-login. Session update is triggered via `/api/auth/switch-client` — no page refresh needed.

**Add-ons are internal enum codes, never renamed**
`COMPRESSED_AIR`, `KITCHEN`, `IOT_METERING`, `POWER_QUALITY` — display labels change, codes never do. Renaming would break DB values.

**Framework compliance uses generic labels**
"ZED" was replaced with "Compliance Requirement N" display — dynamic from DB settings. This avoids hardcoding regulatory names that may evolve.

**OnboardingGuard wraps the app shell**
If `baselineYear`/`baselineMonth` not set on the active client, the guard redirects to `/assessment`. This ensures consultants complete baseline setup before accessing dashboards.

**Private pages use client-side passphrase gate only**
`PrivateGate` component uses `sessionStorage`. This is security-by-obscurity — adequate for now (pages shared via WhatsApp with known partners). Upgrade to server-side middleware is documented as a future task.

---

## Recent Work (April 2026 Session)

The following was completed in the most recent working session — context for anyone picking this up:

1. **Sensor strategy** — Sensors priced below Basic meter tier (₹149/sensor/mo additional). Each meter tier includes sensors generically (Basic=1, Standard=2, Advanced=3, Power Quality=5). Industry-specific sensor types documented only in intelligence bundle descriptions, not in meter tier copy.

2. **B2B2C + B2C positioning** — Landing page now serves both tracks. Facilities hero, consultants explained further down. Commission language removed from all public pages (commission details only on private `/partner` pages).

3. **Private pages gated** — `/investor`, `/partner`, `/partner/economics` require passphrase `akshaya2026`. Shared via WhatsApp with specific partners/investors.

4. **Competitor analysis** — Full benchmark study completed (8 competitors: Schneider PME, Zenatix, Facilio, Tor.ai, Siemens SIMATIC, ABB Ability, TCS Clever Energy, Intelex/GoAudits). SWOT analysis, feature matrix, FITT language per LNK Sir's review. Moved to GrowthPath.

5. **Investor + partner page updates** — Competitive landscape table added to `/investor`. "How VoltSpark compares" section added to `/partner`. Language qualified per LNK Sir's internal review (no absolute claims, confidence labels on pricing, "not identified in reviewed materials" instead of "no competitor exists").

6. **5-year blueprint** — Strategic document covering Year 1–5 goals, product priorities, GTM, team, and funding stages. Moved to GrowthPath.

---

## What to Refer to Where

| Topic | Go to |
|---|---|
| App code, schema, API routes, UI components | This repo (`VoltSpark`) |
| CLAUDE.md — coding conventions, patterns, deployment | This repo (`VoltSpark/CLAUDE.md`) |
| Competitor analysis, SWOT, market positioning | GrowthPath → Business |
| 5-year blueprint, revenue projections, funding | GrowthPath → Business |
| Investor pitch documents | GrowthPath → Business |
| IoT hardware partners (Lotus Controls, Titan) | GrowthPath → Partners |
| Vendor NDAs, partner agreements | GrowthPath → Partners |
| Customer data, pilot details (Unnathi CNC, A Plus Fixtures) | GrowthPath → Customers |
| Events, conferences, networking | GrowthPath → Events |
| Marketing materials | GrowthPath → Business → Marketing |

---

## Pending Items (Not Yet Built)

- Registration/invite flow for consultants and client users (manual onboarding currently)
- Native iOS/Android app (PWA shipped; native on Year 1 roadmap)
- RESEND_API_KEY not set on Vercel → emails disabled in production
- Private page gate is client-side only → upgrade to server-side middleware (future)
- Consultant referral tracking
- Sensor onboarding flow UI
- Auto-incident from sensor threshold breach
- WhatsApp Business API alerts (rule-based alerts live; WA integration future)
- `/w/[slug]/...` URL routing pattern (not yet implemented)

---

## Contacts

| Person | Role | Contact |
|---|---|---|
| Aravind V Bayari | Tech & Product | aravind@akshayacreatech.in · +91 83173 08558 |
| Lakshminarasimhan K | Domain & Operations | akshayacreatech@gmail.com · +91 79750 55916 |

---

_This handover was prepared April 2026. For the most current application state, always read `CLAUDE.md` in this repo first — it is kept up to date as the primary developer reference._
