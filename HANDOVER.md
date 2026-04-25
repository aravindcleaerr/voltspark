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
| PDF Export | jsPDF + jspdf-autotable |
| QR Codes | qrcode.react |
| Hosting | Vercel (project: `voltspark`, domain: `volt-spark.vercel.app`) |
| Email | Resend (RESEND_API_KEY **not yet set on Vercel** — emails disabled in prod) |
| E2E Tests | Playwright |

---

## What Has Been Built (Full Feature Inventory)

### Phase 1 — Core Architecture & Auth

- Multi-tenant: Organisation → Client → User hierarchy with Membership + ClientAccess
- 31 Prisma models, all energy/compliance models carry `clientId` for row-level isolation
- `requireClient()` in every API route enforces tenant isolation
- JWT session carries: `userId`, `orgRole`, `activeClientId`, `activeClientSlug`, `activeClientName`, `clientRole`
- Workspace switcher — consultants switch between clients without re-login via `/api/auth/switch-client`
- `/console` — consultant portfolio dashboard with client summary cards
- `OnboardingGuard` in app shell — redirects to `/assessment` if `baselineYear`/`baselineMonth` not set
- Login, registration, and session management pages

### Phase 2 — Energy Management

- Energy sources (meter registry with cost per unit, tariff rates)
- Consumption entries (manual + IoT-bridged, auto-deviation detection)
- Energy targets (per source, per period, reduction % tracking)
- Energy Cost Dashboard (₹ view, monthly trends, source breakdown)
- Utility bill analyser (BESCOM/CESC fields, PF penalty, demand overshoot, anomaly detection)

### Phase 3 — Compliance, Safety & Training

- Compliance frameworks (ISO 50001, ZED, Electrical Safety templates — generic "Requirement N" display)
- Compliance readiness assessment (per framework, per client)
- Safety inspections (configurable templates, digital checklists)
- Incident register (near-misses, RCA, follow-up)
- Certification tracker with expiry alerts
- Compliance calendar (all due dates across clients)
- Audits + audit findings (severity, corrective action, evidence)
- CAPA (5-Why analysis, comments, verification, effectiveness check)
- Training programs + attendance tracking

### Phase 4 — Financial Tools & Government Schemes

- Savings tracker (before/after baseline, improvement attribution, ROI)
- ROI calculator (7 templates: solar, VFD, PF correction, LED, compressed air, motors, transformer)
- Government scheme eligibility matching (BEE, ZED, MSME)
- Action plans & tasks (linked to compliance gaps, CAPA outcomes)

### Phase 5 — Reports, Sharing & Settings

- PDF export (8-section Impact Report — branded)
- CSV/JSON data export
- Shareable compliance view (public read-only token-based link)
- Document library
- Notifications
- Whitelabel settings: logo upload, custom platform name, brand colour picker
- Sidebar displays custom branding per client
- PWA manifest with SVG icon

### Phase 6 — IoT Metering (Add-on: `IOT_METERING`)

- Vendor-agnostic framework: Gateway → Meter → MeterReading models
- MQTT webhook support for real-time ingest
- IoT-to-Core bridge: POST `/api/iot/aggregate` → creates ConsumptionEntry from daily deltas
- Validated hardware: Schneider ESX Panel Server (gateway), EM6400NG, EM1200 (meters)

### Add-on: Manufacturing Intelligence (`COMPRESSED_AIR`)

- kWh/unit tracking (energy per production output)
- Compressed air efficiency monitoring
- Shift analysis
- Vibration/temp sensor hooks

### Add-on: Commercial Kitchen Intelligence (`KITCHEN`)

- Titan by Tor.ai meter integration
- Real-time demand monitoring
- Load shedding & ToD optimisation
- HACCP temperature logging

### Add-on: Power Quality (`POWER_QUALITY`)

- EN 50160 compliance
- PQEvent / PQSnapshot models
- THD, harmonics, sag/swell detection

---

## Full Route Inventory

### Protected Routes (require client context)

```
/dashboard                          # Main dashboard
/energy-sources                     # Energy source registry
/energy-sources/[id]                # Energy source detail & edit
/energy-sources/new                 # New energy source
/consumption                        # Consumption entries
/consumption/new                    # New consumption entry
/costs                              # Energy Cost Dashboard (₹ view)
/targets                            # Energy targets
/targets/new                        # New target
/utility-bills                      # Utility bill entries
/training                           # Training programs
/training/[id]                      # Training detail
/training/[id]/attendance           # Attendance tracking
/training/new                       # New training program
/audits                             # Audits list
/audits/[id]                        # Audit detail & findings
/audits/new                         # New audit
/capa                               # CAPA register
/capa/[id]                          # CAPA detail & comments
/capa/new                           # New CAPA
/compliance                         # Compliance frameworks
/compliance/[frameworkId]           # Framework detail
/compliance/readiness/[frameworkId] # Readiness assessment
/assessment                         # Baseline assessment (onboarding)
/safety                             # Safety inspections
/safety/templates                   # Inspection templates
/calendar                           # Compliance calendar
/documents                          # Document library
/analytics                          # Cross-client analytics
/reports                            # Report generation & templates
/roi                                # ROI calculator
/savings                            # Savings tracker
/schemes                            # Government schemes
/action-plans                       # Action plans & tasks
/import                             # Bulk data import
/notifications                      # Notification centre
/settings                           # App settings & branding
/share                              # Shareable compliance views
/ca/*                               # Compressed Air / Manufacturing Intelligence
/kitchen/*                          # Kitchen Intelligence
/iot/*                              # IoT Metering
/pq/*                               # Power Quality
/console                            # Consultant portfolio dashboard
/console/clients/new                # Add new client
```

### Auth Routes

```
/login
/register
```

### Public Routes (no auth)

```
/                                   # Landing page (B2B2C + B2C dual-track hero)
/start                              # B2C facility direct signup
/investor                           # Investor pitch — gated (passphrase: akshaya2026)
/partner                            # Partner programme — gated (passphrase: akshaya2026)
/partner/economics                  # Commission breakdown — gated (passphrase: akshaya2026)
/privacy                            # Privacy policy
/terms                              # Terms of service
/share/[token]                      # Public shareable compliance view
```

---

## Database

- **Schema:** `app/prisma/schema.prisma` — 31 models
- **Seed:** `app/prisma/seed.ts` — 20 months of demo data, 5 inspection templates, 5 recurring schedules, two clients (Unnathi CNC + A Plus Fixtures)
- **Local:** `app/dev.db` (better-sqlite3, gitignored)
- **Production:** Turso libSQL — `libsql://unnnathicnc-aravindcleaerr.aws-ap-south-1.turso.io`

### Prisma Model List (31 models)

**Multi-tenancy:** Organisation, Client, Membership, ClientAccess, User

**Energy:** EnergySource, EnergyTarget, ConsumptionEntry

**Compliance & Training:** TrainingProgram, TrainingAttendance, Audit, AuditFinding, CAPA, CAPAComment, ComplianceFramework, FrameworkRequirement, ClientFramework, RequirementStatus, Inspection, InspectionTemplate, Incident, Certification

**Financial & Planning:** UtilityBill, SavingsMeasure, ROICalculation, ActionPlan, ActionItem, Document

**Notifications & Sharing:** Notification, ShareableView, SchemeApplication, RecurringSchedule

**IoT & Hardware:** IoTGateway, IoTMeter, MeterReading, MeterAlert, PQEvent, PQSnapshot, Kitchen, Compressor, CAReading

**System:** AuditLog, AppSetting

### Key Prisma Gotchas

- Never use Prisma `enum` types — SQLite doesn't support them; use String with comments
- CAPA model is `prisma.cAPA` (not `prisma.capa`)
- `TrainingProgram` has no `createdById`
- Recharts Tooltip formatter: `(v) => Number(v)` not `(v: number) =>`
- Set iteration: `Array.from(new Set(...))` not `[...new Set(...)]`
- Next.js 14: export `Viewport` type separately, not inside `metadata`

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
vercel env pull .env.turso --environment production
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma db push --force-reset
npx prisma db seed
set -a && source .env.turso && node push-schema.mjs
set -a && source .env.turso && node copy-to-turso.mjs
rm .env.turso
```

---

## Login Credentials (Seed Data)

| User | Email | Password | Role | Notes |
|---|---|---|---|---|
| Consultant (Aravind) | `aravind@akshayacreatech.com` | `akshaya123` | Org OWNER | Access to both clients + console |
| Unnathi CNC admin | `sureshkumar@unnathicnc.com` | `unnathi123` | CLIENT_ADMIN | |
| A Plus Fixtures admin | `admin@aplusfixtures.com` | `aplus123` | CLIENT_ADMIN | IOT_METERING enabled |
| Demo | `demo@voltspark.in` | `demo123` | — | Generic demo access |

---

## Key Architectural Decisions (Why, Not Just What)

**Multi-tenant via `clientId` on every model — not schema-per-tenant**
Simple for SQLite/Turso. `requireClient()` enforces isolation in every API route. Cross-tenant queries are structurally impossible.

**JWT session carries active client context**
Consultants switch clients without re-login. Session update triggered via `/api/auth/switch-client` — no page refresh required.

**Add-on codes are permanent internal identifiers — never renamed**
`COMPRESSED_AIR`, `KITCHEN`, `IOT_METERING`, `POWER_QUALITY` live in the DB. Display labels can change freely; codes cannot. Renaming would silently break all existing client add-on configurations.

**Framework compliance uses generic labels, not hardcoded regulatory names**
"ZED" appears as "Compliance Requirement N" in the UI — text pulled from DB settings. This future-proofs against regulatory name changes and avoids hardcoded regulatory claims in UI strings.

**`OnboardingGuard` wraps the app shell**
If `baselineYear`/`baselineMonth` is not set on the active client, the guard redirects to `/assessment`. Ensures consultants complete baseline setup before any dashboard is visible.

**Private pages use client-side passphrase gate only (`PrivateGate` component)**
Uses `sessionStorage`. Security-by-obscurity — adequate for pages shared via WhatsApp with known partners/investors. Upgrade to server-side middleware is a documented pending item.

**`enabledAddons` field on Client model stores a JSON array**
`["KITCHEN", "POWER_QUALITY"]` — consultant toggles per client from portfolio page. API routes call `requireAddon(clientId, 'ADDON_CODE')` before serving add-on data. Hardware pushes data via API key auth, not user session.

---

## Summary of April 2026 Session Work

Context for anyone picking this up after April 2026:

1. **Sensor strategy finalised** — Sensors priced at ₹149/sensor/month (below Basic meter tier). Each meter tier includes sensors generically (Basic=1, Standard=2, Advanced=3, Power Quality=5). Industry-specific sensor types (vibration, CO2, temperature) are documented only in intelligence bundle descriptions, not in meter tier public copy.

2. **B2B2C + B2C dual-track positioning** — Landing page now serves both tracks. Facilities hero up top; consultant value prop further down. Commission language removed from all public pages — appears only on private `/partner` routes.

3. **Private page gating** — `/investor`, `/partner`, `/partner/economics` require passphrase `akshaya2026`. Shared via WhatsApp with specific partners/investors.

4. **Competitor analysis completed** — 8 competitors benchmarked (Schneider PME, Zenatix, Facilio, Tor.ai, Siemens SIMATIC, ABB Ability, TCS Clever Energy, Intelex/GoAudits). SWOT analysis and feature matrix completed. Language qualified per LNK Sir's review (FITT framework — no absolute claims). Document lives in GrowthPath, not this repo.

5. **Investor + partner page updates** — Competitive landscape table added to `/investor`. "How VoltSpark compares" section added to `/partner`. Language uses confidence labels and qualified statements throughout.

6. **5-year blueprint produced** — Covers Year 1–5 goals, product priorities, GTM, team scaling, and funding stages. Lives in GrowthPath → Business.

---

## Pending Items (Not Yet Built)

- Registration/invite flow for consultants and client users (manual onboarding currently)
- Native iOS/Android app (PWA shipped; native on Year 1 roadmap)
- RESEND_API_KEY not set on Vercel → emails disabled in production
- Private page gate upgrade from client-side to server-side middleware
- Consultant referral tracking with commission calculation
- Sensor onboarding flow UI
- Auto-incident from sensor threshold breach
- WhatsApp Business API alerts (rule-based alerts live in DB; WA integration future)
- `/w/[slug]/...` URL routing pattern (not yet implemented)

---

## What to Refer to Where (Cross-Reference)

| Topic | Go to |
|---|---|
| App code, schema, API routes, UI components | This repo (`VoltSpark`) |
| Coding conventions, patterns, deployment rules | This repo → `CLAUDE.md` |
| Competitor analysis, SWOT, market positioning | GrowthPath → `Business/COMPETITOR-ANALYSIS.md` |
| 5-year blueprint, revenue projections, funding | GrowthPath → `Business/BLUEPRINT-5YEAR.md` |
| Financial model (unit economics, burn, runway) | GrowthPath → `Business/Financial-Model/` |
| Investor slide deck (13 slides + speaker notes) | GrowthPath → `Business/Investor-Deck/` |
| Investor narrative pitch documents | GrowthPath → `Business/VoltSpark + IoT The Investment Case*.md` |
| GTM execution plan (Year 1 tactical) | GrowthPath → `Business/GTM-Execution-Plan/` |
| Pricing rate card (public-facing one-pager) | GrowthPath → `Business/Rate-Card/` |
| Business strategy, pricing, add-on architecture | GrowthPath → `Business/VoltSpark-Business-Strategy.md` |
| Consultant onboarding (14-day launch plan) | GrowthPath → `Partners/Consultant-Onboarding-Kit/` |
| Consultant sales playbook (discovery, demo, objections) | GrowthPath → `Partners/Consultant-Sales-Kit/` |
| IoT hardware partners (Lotus Controls, Titan) | GrowthPath → `Vendors/` |
| Vendor NDAs, partner agreements | GrowthPath → `Partners/` |
| Customer details (Unnathi CNC, A Plus Fixtures) | GrowthPath → `Customers/` |
| A Plus Fixtures case study template | GrowthPath → `Customers/APlusFixtures/` |
| Events, conferences, networking | GrowthPath → `Events/` |
| Marketing materials, pitch scripts, brochures | GrowthPath → `Business/Marketing/` |
| Public page exports (5 PDFs for WhatsApp share) | GrowthPath → `Business/Marketing/Page-Exports/` |
| Customer value proposition, MSME pain points | GrowthPath → `Business/CUSTOMER-VALUE.md` |

---

## Contacts

| Person | Role | Contact |
|---|---|---|
| Aravind V Bayari | Tech & Product, Co-founder | aravind@akshayacreatech.in · +91 83173 08558 |
| Lakshminarasimhan K | Domain & Operations, Founder | akshayacreatech@gmail.com · +91 79750 55916 |

---

_This handover was prepared April 2026. For the most current application state, always read `CLAUDE.md` in this repo first — it is kept up to date as the primary developer reference._
