# VoltSpark — Development Agent Script

## Project Identity

**VoltSpark** is a multi-tenant compliance management platform for industrial energy, safety, and environmental compliance. Built as a B2B2C SaaS — consultants sign up and manage their industrial clients.

- **Vision:** "Save energy. Stay safe. Win customers."
- **Core insight:** Compliance is the medicine. The customer buys the cure — which is profit, safety, and growth.
- **Product:** Standalone brand (not tied to any consulting firm)
- **First customer:** Unnathi CNC Technologies (managed by Akshaya Createch)
- **Live at:** https://volt-spark.vercel.app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Auth | NextAuth v4 (credentials provider, JWT sessions) |
| Database | Turso (libSQL) in production, better-sqlite3 locally |
| ORM | Prisma 7 with driver adapters |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel |

## Project Structure

```
d:/Project-AI/LNK/VoltSpark/
├── app/                          # Next.js application (ALL code lives here)
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (SQLite provider, driver adapters)
│   │   └── seed.ts               # Seed data (Org + Client + Users + sample data)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/            # Protected routes (all main app pages)
│   │   │   │   ├── dashboard/    # Main dashboard
│   │   │   │   ├── energy-sources/ # Energy source management
│   │   │   │   ├── consumption/  # Consumption entries
│   │   │   │   ├── costs/        # Energy Cost Dashboard (₹ view)
│   │   │   │   ├── targets/      # Energy targets
│   │   │   │   ├── training/     # Training programs
│   │   │   │   ├── audits/       # Audits & findings
│   │   │   │   ├── capa/         # CAPA management
│   │   │   │   ├── reports/      # Report generation
│   │   │   │   ├── settings/     # App settings
│   │   │   │   └── console/      # Consultant portfolio dashboard
│   │   │   │       └── clients/new/ # Add new client form
│   │   │   ├── (auth)/login/     # Login page
│   │   │   └── api/              # API routes
│   │   │       ├── auth/         # NextAuth + switch-client
│   │   │       ├── clients/      # Client CRUD
│   │   │       ├── console/      # Portfolio summary
│   │   │       ├── costs/        # Energy cost data
│   │   │       ├── dashboard/    # Dashboard aggregation
│   │   │       ├── energy-sources/ # CRUD + [id]
│   │   │       ├── consumption/  # CRUD + [id]
│   │   │       ├── targets/      # CRUD + [id]
│   │   │       ├── training/     # programs/ + attendance/
│   │   │       ├── audits/       # CRUD + findings/
│   │   │       ├── capa/         # CRUD + [id]/comments
│   │   │       ├── reports/      # Report generation
│   │   │       ├── settings/     # App settings
│   │   │       └── users/        # User management
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, PageHeader
│   │   │   └── ui/               # StatusBadge, EmptyState, etc.
│   │   ├── generated/prisma/     # Prisma generated client (gitignored)
│   │   └── lib/
│   │       ├── auth.ts           # NextAuth config (multi-tenant JWT session)
│   │       ├── session.ts        # Session helpers: getSession(), requireClient()
│   │       ├── prisma.ts         # Prisma client (auto-detects Turso vs SQLite)
│   │       ├── constants.ts      # Enum-style constants
│   │       ├── utils.ts          # Formatting helpers
│   │       ├── validations.ts    # Zod schemas
│   │       ├── deviation.ts      # Deviation calculation
│   │       └── hooks/
│   │           └── useSettings.ts # AppSettings hook
│   ├── prisma.config.ts
│   ├── push-schema.mjs           # Push SQL to Turso
│   ├── copy-to-turso.mjs         # Copy local SQLite data to Turso
│   ├── turso-migration.sql       # Generated migration SQL
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── dev.db                    # Local SQLite (gitignored)
├── PRD.md                        # Product Requirements Document (v2.0)
├── CUSTOMER-VALUE.md             # Customer pain points & feature value analysis
├── Brainstorm.md                 # Brainstorm notes
└── CLAUDE.md                     # This file
```

## Development Rules

### Autonomous Execution
- **DO NOT ask for permission or approval** — execute all tasks end-to-end
- **DO NOT ask "should I proceed?"** — just proceed
- **DO NOT present options** — make the best decision and implement it
- **DO commit and push** after completing each phase or logical unit of work
- **DO deploy to Vercel** after pushing (run `vercel --prod` from `app/` directory)
- **DO run build** to verify changes compile (`npx next build` from `app/` directory)
- **DO update Turso** after schema changes (drop tables → push-schema.mjs → copy-to-turso.mjs)

### Code Patterns (Follow Existing Conventions)

**API Routes (multi-tenant pattern):**
```typescript
// app/src/app/api/[module]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const data = await prisma.someModel.findMany({
    where: { clientId: result.clientId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const entry = await prisma.someModel.create({
    data: { ...body, clientId: result.clientId },
  });
  return NextResponse.json(entry, { status: 201 });
}
```

**API Routes (consultant-only, e.g. /api/console):**
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.organizationId) return NextResponse.json({ error: 'Consultants only' }, { status: 403 });
  // ... org-level queries
}
```

**Page Components:**
```typescript
// app/src/app/(app)/[module]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';

export default function ModulePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/module').then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">...</div>;
  // ... render
}
```

**Styling:**
- Use existing Tailwind classes: `card`, `btn-primary`, `btn-secondary`, `input-field`, `label-text`
- Brand color: `brand-*` (defined in tailwind config)
- Follow compact, single-line JSX style used throughout the codebase
- No unnecessary whitespace or verbose formatting

**Components:**
- `PageHeader` — title, subtitle, optional action (ReactNode)
- `StatusBadge` — colored label for statuses
- `EmptyState` — icon + title + description + action for empty lists

### Database
- Schema file: `app/prisma/schema.prisma`
- SQLite provider with driver adapters (no `url` in datasource block)
- Run `npx prisma generate` after schema changes (from `app/` directory)
- For local dev: `npx prisma db push --force-reset` then `npx prisma db seed` (from `app/` directory)
- Set `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes"` for db push in automated context
- Never use Prisma `enum` types (SQLite doesn't support them — use String with comments)
- Use `@default(cuid())` for IDs
- Use `@updatedAt` for updatedAt fields
- **All data models MUST have `clientId`** for tenant isolation

### Git
- Commit after completing each logical unit of work
- Use descriptive commit messages
- Push to origin/master
- Add `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` to commits

### Deployment
- Vercel project: `voltspark`
- Domain: `volt-spark.vercel.app`
- Deploy from `app/` directory: `cd d:/Project-AI/LNK/VoltSpark/app && vercel --prod`
- Environment variables configured on Vercel: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, NEXTAUTH_SECRET, NEXTAUTH_URL

### Turso Database Sync (after schema changes)
```bash
cd d:/Project-AI/LNK/VoltSpark/app

# 1. Generate migration SQL from current schema
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > turso-migration.sql

# 2. Reset local dev.db and re-seed
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma db push --force-reset
npx prisma db seed

# 3. Pull Turso credentials
vercel env pull .env.turso --environment production

# 4. Drop all Turso tables (run node script)
# 5. Push schema: set -a && source .env.turso && node push-schema.mjs
# 6. Copy data: set -a && source .env.turso && node copy-to-turso.mjs
# 7. Clean up: rm .env.turso

# 8. Update copy-to-turso.mjs table list if new models were added
```

### Testing
- After making changes, run `npx next build` from `app/` to verify compilation
- Check for TypeScript errors (the build will catch them)

## Current State (as of Feb 2026)

### What's Done (Phase 1 — ~80% complete)

**Multi-tenant architecture is live:**
- Organization → Client → User hierarchy with Membership + ClientAccess
- All 16 data models have `clientId` for row-level tenant isolation
- JWT session carries: userId, orgRole, activeClientId, activeClientSlug, activeClientName, clientRole
- `requireClient()` helper enforces tenant isolation in all API routes
- Workspace switcher in sidebar (consultants can switch between clients)
- Console dashboard at `/console` (portfolio view with client summary cards)
- Energy Cost Dashboard at `/costs` (₹ view with monthly trends, source breakdown)
- New client creation at `/console/clients/new`
- Cost fields: `costPerUnit` on EnergySource, `cost` on ConsumptionEntry

**Auth & session:**
- `session.ts` exports `getSession()` and `requireClient()`
- `SessionUser` type: id, name, email, role, organizationId, orgRole, activeClientId, activeClientSlug, activeClientName, clientRole
- Auth supports session update trigger for workspace switching (no re-login needed)
- `/api/auth/switch-client` — verifies access and returns session update data

**Remaining Phase 1:**
- [ ] Registration/invite flow for consultants and client users
- [ ] URL routing update with `/w/[slug]/...` pattern

### Login Credentials (seed data)
- **Consultant:** `aravind@akshayacreatech.com` / `akshaya123` (Org: Akshaya Createch, role: OWNER)
- **Client user:** `sureshkumar@unnathicnc.com` / `unnathi123` (Client: Unnathi CNC, role: CLIENT_ADMIN)

### Prisma Models (current schema)

**Multi-tenant models:**
- Organization (id, name, slug, logo, website, plan)
- Client (id, organizationId, name, slug, address, industry, employeeCount, accessMode, gridTariffRate, solarTariffRate, dgTariffRate, contractDemand, powerFactorTarget, baselineYear, baselineMonth, isActive)
- Membership (id, userId, organizationId, role) — @@unique([userId, organizationId])
- ClientAccess (id, userId, clientId, role) — @@unique([userId, clientId])

**Core user model:**
- User (id, employeeId?, name, email, passwordHash, role, department, isActive, organizationId?)

**Energy & compliance models (all have clientId):**
- EnergySource (id, clientId, name, type, unit, costPerUnit, description, location, meterNumber, isActive)
- EnergyTarget (id, energySourceId, period, year, quarter, targetValue, baselineValue, reductionTarget, costTarget, isActive)
- ConsumptionEntry (id, clientId, energySourceId, date, value, unit, cost, readingType, meterReading, hasDeviation, deviationPercent, deviationSeverity, deviationNote, recordedById)
- TrainingProgram (id, clientId, title, description, type, trainer, scheduledDate, completedDate, duration, location, maxParticipants, status, notes)
- TrainingAttendance (id, programId, userId, attended, score, certificateIssued, notes)
- Audit (id, clientId, title, type, auditDate, completedDate, scope, status, leadAuditorId, findings, recommendations, summary)
- AuditFinding (id, auditId, category, description, severity, status, correctiveAction, targetDate, closedDate, evidence)
- CAPA (id, clientId, capaNumber, title, type, priority, status, source, description, rootCause, fiveWhyAnalysis, correctiveAction, preventiveAction, raisedById, assignedToId, targetDate, closedDate, verifiedById, verificationDate, verificationNotes, effectivenessCheck)
- CAPAComment (id, capaId, userId, content, createdAt)
- AuditLog (id, clientId, action, entityType, entityId, userId, details, createdAt)
- AppSetting (id, clientId, key, value, updatedAt) — @@unique([clientId, key])

### Turso Database Info
- URL: libsql://unnnathicnc-aravindcleaerr.aws-ap-south-1.turso.io
- Auth token: stored in Vercel env vars
- Migration: use app/push-schema.mjs and app/copy-to-turso.mjs for Turso schema/data sync

## Roadmap — What to Build Next

See PRD.md for full details. Each phase is organized into sub-sections.

### Phase 2: Framework Engine + Safety + Utility Bills (Weeks 5-8)

**Goal:** Configurable compliance frameworks. Safety risk quantification. Utility bill analysis for immediate ₹ impact.

**2A — Framework Engine (Core)**
- ComplianceFramework, FrameworkRequirement, ClientFramework, RequirementStatus models
- Built-in ZED, ISO 50001, Electrical Safety templates
- Framework assignment to clients (multiple per client)
- Requirement tracking UI (status, evidence links, notes)
- Evidence traceability (link existing module data → requirements)
- Gap analysis view (compliance matrix)
- Per-framework scoring
- Baseline assessment flow
- Pre-audit readiness check

**2B — Safety Modules**
- Inspection checklists (configurable templates)
- Inspection template builder
- Incident register (reports, near-misses, RCA, follow-up)
- Certification tracker with expiry alerts
- Compliance calendar (all due dates across clients)
- Safety Risk Score (weighted: earthing 20%, protection devices 15%, panel condition 15%, certifications 15%, maintenance 10%, training 10%, incidents 10%, emergency 5%)
- Liability estimation in ₹

**2C — Utility Bill Analyzer** _(highest quick-win for ₹ impact)_
- UtilityBill model
- Monthly bill entry form (BESCOM/CESC fields)
- Auto-analysis: PF penalty, demand overshoot, anomaly detection, tariff mismatch
- 12-month trend with red flag detection
- Linked to Energy Cost Dashboard

**2D — Enhanced Energy Cost Dashboard**
- Power factor tracking + penalty risk (₹)
- Peak demand gauge (vs contracted kVA)
- Time-of-Day patterns
- Predicted next month cost
- Cost per unit of production

### Phase 3: Action Plans, Savings & Documents (Weeks 9-12)

**Goal:** Prove financial value. The savings tracker is the killer feature.

**3A — Savings Tracker** _(justifies consultant fees)_
- Improvement model, baseline → measurement → attribution
- Per-improvement savings, cumulative total, consultant fee vs savings ROI

**3B — ROI Calculator**
- 7 pre-built templates (solar, VFD, PF, LED, compressed air, motors, transformer)
- Payback, NPV, IRR, sensitivity analysis

**3C — Action Plans & Documents**
- Action plan module, templates, recurring schedules
- Document library (Vercel Blob), template library
- Bulk data import (CSV/Excel)

**3D — Reports & Export**
- PDF export, 8-section Impact Report
- Data export (CSV/JSON)

### Phase 4: Notifications, Analytics & Launch (Weeks 13-16)

**Goal:** Production-ready. Beta launch with 3-5 consultants.

**4A — Notifications** (Resend email, WhatsApp, in-app)
**4B — Analytics & Benchmarking** (cross-client insights, industry benchmarks)
**4C — Government Schemes** (auto-eligibility matching, application tracking)
**4D — Vendor Qualification** (shareable compliance view, QR code, PDF)
**4E — Launch Readiness** (PWA, onboarding wizard, landing page, security audit)

## Implementation Guidelines

### When implementing a phase:
1. Read PRD.md for detailed requirements
2. Design the Prisma schema changes
3. Update schema.prisma
4. Run `npx prisma generate` to verify
5. Push schema locally: `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma db push --force-reset`
6. Update seed.ts with sample data for new models
7. Run seed: `npx prisma db seed`
8. Create API routes following existing patterns (use `requireClient()`)
9. Build UI pages following existing patterns
10. Build to verify: `npx next build`
11. Commit with descriptive message
12. Push to origin/master
13. Sync Turso: generate migration SQL → pull env → drop tables → push schema → copy data
14. Deploy: `vercel --prod`

### When creating new modules:
1. Add model to schema.prisma (include `clientId` field + relation to Client)
2. Create API route: `app/src/app/api/[module]/route.ts` (use `requireClient()`)
3. Create detail API route: `app/src/app/api/[module]/[id]/route.ts` (if needed)
4. Create list page: `app/src/app/(app)/[module]/page.tsx`
5. Create detail page: `app/src/app/(app)/[module]/[id]/page.tsx` (if needed)
6. Create new/edit forms: `app/src/app/(app)/[module]/new/page.tsx` (if needed)
7. Add to Sidebar navigation: `app/src/components/layout/Sidebar.tsx`
8. Add Zod validation schema to `validations.ts` (if POST/PUT needed)
9. Update `copy-to-turso.mjs` table list with new models
10. Use existing component patterns (PageHeader, StatusBadge, EmptyState, cards, tables)

### Role-based access:
- `result.user.orgRole` — organization role: OWNER, ADMIN, MEMBER (consultants only)
- `result.user.clientRole` — client role: CLIENT_ADMIN, EMPLOYEE, VIEWER
- Consultants have orgRole set; client employees don't
- `isConsultant = !!result.user.orgRole`
- Write operations: block VIEWER role
- Delete operations: require CLIENT_ADMIN or org OWNER/ADMIN
- Console/portfolio: require organizationId (consultants only)
