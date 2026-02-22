# VoltSpark — Development Agent Script

## Project Identity

**VoltSpark** is a multi-tenant compliance management platform for industrial energy, safety, and environmental compliance. Built as a B2B2C SaaS — consultants sign up and manage their industrial clients.

- **Vision:** "Save energy. Stay safe. Win customers."
- **Product:** Standalone brand (not tied to any consulting firm)
- **First customer:** Unnathi CNC Technologies (managed by Akshaya Createch)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Auth | NextAuth v4 (credentials provider) |
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
│   │   └── seed.ts               # Seed data (Unnathi CNC — keep as-is)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/            # Protected routes (all main app pages)
│   │   │   ├── (auth)/login/     # Login page
│   │   │   └── api/              # API routes
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, PageHeader
│   │   │   └── ui/               # StatusBadge, EmptyState, etc.
│   │   ├── generated/prisma/     # Prisma generated client (gitignored)
│   │   └── lib/
│   │       ├── auth.ts           # NextAuth config
│   │       ├── prisma.ts         # Prisma client (auto-detects Turso vs SQLite)
│   │       ├── constants.ts      # Enum-style constants
│   │       ├── utils.ts          # Formatting helpers
│   │       ├── validations.ts    # Zod schemas
│   │       ├── deviation.ts      # Deviation calculation
│   │       └── hooks/
│   │           └── useSettings.ts # AppSettings hook
│   ├── prisma.config.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── dev.db                    # Local SQLite (gitignored)
├── PRD.md                        # Product Requirements Document (v2.0)
├── Brainstorm.md                 # Brainstorm notes
└── CLAUDE.md                     # This file
```

## Development Rules

### Autonomous Execution
- **DO NOT ask for permission or approval** — execute all tasks end-to-end
- **DO NOT ask "should I proceed?"** — just proceed
- **DO NOT present options** — make the best decision and implement it
- **DO commit and push** after completing each phase or logical unit of work
- **DO deploy to Vercel** after pushing (run `vercel --prod --yes` from `app/` directory)
- **DO run the dev server** to verify changes compile (`npm run dev`)

### Code Patterns (Follow Existing Conventions)

**API Routes:**
```typescript
// app/src/app/api/[module]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ... query and return data
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
- `PageHeader` — title, subtitle, optional action button
- `StatusBadge` — colored label for statuses
- `EmptyState` — icon + title + description + action for empty lists

### Database
- Schema file: `app/prisma/schema.prisma`
- SQLite provider with driver adapters (no `url` in datasource block)
- Run `npx prisma generate` after schema changes (from `app/` directory)
- For local dev: database is at `app/dev.db`
- Never use Prisma `enum` types (SQLite doesn't support them — use String with comments)
- Use `@default(cuid())` for IDs
- Use `@updatedAt` for updatedAt fields

### Git
- Commit after completing each logical unit of work
- Use descriptive commit messages
- Push to origin/master
- Add `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` to commits

### Deployment
- Vercel project: `volt-spark`
- Deploy from `app/` directory: `cd app && vercel --prod --yes`
- After deploy, set alias: `vercel alias set <deployment-url> volt-spark.vercel.app`
- Environment variables are already configured on Vercel (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, NEXTAUTH_SECRET, NEXTAUTH_URL)

### Testing
- After making changes, run `npm run dev` from `app/` to verify compilation
- Check that the dev server starts without errors
- Kill the dev server after verification (`pkill -f "next dev"`)

## Key Context

### Current State (as of Feb 2026)
- Single-tenant app with 10 Prisma models
- Rebranded from "Unnathi CNC" to "VoltSpark"
- ZED references replaced with generic "Compliance Requirement N"
- Company info reads from AppSetting database table (dynamic)
- Deployed at https://volt-spark.vercel.app
- Turso cloud database connected and working

### What Needs to Be Built (PRD.md has full details)

**Phase 1 (Weeks 1-4): Multi-Tenant Foundation + Energy Costs**
- Organization, Client, Membership, ClientAccess models
- Prisma schema overhaul + migration
- Consultant registration (invitation-only)
- Client workspace creation
- Workspace switcher in sidebar
- Migrate all existing modules to client-scoped (add clientId)
- Role-based access control
- Console dashboard (portfolio view)
- Invite client users via email
- Energy Cost Dashboard (₹ view)
- URL routing (/w/[slug]/...)
- Auth system update for multi-tenant sessions
- Tenant isolation middleware

**Phase 2 (Weeks 5-8): Framework Engine + Safety**
- ComplianceFramework, FrameworkRequirement, ClientFramework, RequirementStatus models
- Built-in ZED, ISO 50001, Electrical Safety templates
- Framework assignment, requirement tracking, gap analysis
- Baseline assessment flow
- Inspection checklists, incident register, certification tracker
- Pre-audit readiness check

**Phase 3 (Weeks 9-12): Action Plans, Savings & Documents**
- Action plans with milestones
- Recurring schedules engine
- Savings tracker, ROI calculator, utility bill analyzer
- Document library (file uploads)
- Template library
- Enhanced reports with PDF export
- Impact report generation

**Phase 4 (Weeks 13-16): Notifications, Analytics & Launch**
- Email notifications (Resend)
- WhatsApp notifications
- Consultant analytics, client health score
- Benchmarking, safety risk score
- Government scheme tracker
- Vendor qualification / shareable compliance view
- Landing page, demo environment, beta launch

### Existing Prisma Models (current schema)
- User (id, employeeId, name, email, passwordHash, role, department, isActive)
- EnergySource (id, name, type, unit, description, location, meterNumber, isActive)
- EnergyTarget (id, energySourceId, period, year, quarter, targetValue, baselineValue, reductionTarget, isActive)
- ConsumptionEntry (id, energySourceId, date, value, unit, readingType, meterReading, hasDeviation, deviationPercentage, deviationNote, recordedById)
- TrainingProgram (id, title, description, type, trainer, scheduledDate, completedDate, duration, location, maxParticipants, status, notes)
- TrainingAttendance (id, programId, userId, attended, score, certificateIssued, notes)
- Audit (id, title, type, auditDate, completedDate, scope, status, leadAuditorId, findings, recommendations, summary)
- AuditFinding (id, auditId, category, description, severity, status, correctiveAction, targetDate, closedDate, evidence)
- CAPA (id, capaNumber, title, type, priority, status, source, description, rootCause, fiveWhyAnalysis, correctiveAction, preventiveAction, raisedById, assignedToId, targetDate, closedDate, verifiedById, verificationDate, verificationNotes, effectivenessCheck)
- CAPAComment (id, capaId, userId, content, createdAt)
- AuditLog (id, action, entityType, entityId, userId, details, createdAt)
- AppSetting (id, key, value, updatedAt)

### Turso Database Info
- URL: libsql://unnnathicnc-aravindcleaerr.aws-ap-south-1.turso.io
- Auth token: stored in Vercel env vars
- Migration: use app/push-schema.mjs and app/copy-to-turso.mjs for Turso schema/data sync

## Implementation Guidelines

### When implementing a phase:
1. Read PRD.md for detailed requirements
2. Design the Prisma schema changes
3. Update schema.prisma
4. Run `npx prisma generate` to verify
5. Create API routes following existing patterns
6. Build UI pages following existing patterns
7. Test locally with `npm run dev`
8. Commit with descriptive message
9. Push to origin/master
10. Deploy to Vercel

### When creating new modules:
1. Create API route: `app/src/app/api/[module]/route.ts`
2. Create detail API route: `app/src/app/api/[module]/[id]/route.ts` (if needed)
3. Create list page: `app/src/app/(app)/[module]/page.tsx`
4. Create detail page: `app/src/app/(app)/[module]/[id]/page.tsx` (if needed)
5. Create new/edit forms: `app/src/app/(app)/[module]/new/page.tsx` (if needed)
6. Add to Sidebar navigation: `app/src/components/layout/Sidebar.tsx`
7. Use existing component patterns (PageHeader, StatusBadge, EmptyState, cards, tables)

### Multi-tenancy implementation:
- Add `clientId` to all data models
- Create Prisma middleware/extension that auto-filters by active client
- Session must include: userId, organizationId, activeClientId, role
- API routes must enforce tenant isolation
- Sidebar must show workspace context and switcher
