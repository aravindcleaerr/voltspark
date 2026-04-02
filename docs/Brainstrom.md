Brainstorm: VoltSpark as an Akshaya Createch Product
The Opportunity
Akshaya Createch already has the domain expertise and client relationships in:

Energy saving advisory for industrial clients
Electrical safety training
Start-up advisory (compliance/infrastructure)
40+ years of hands-on industrial experience
VoltSpark bridges the gap from consulting services → productized SaaS — turning Akshaya Createch's advisory work into a repeatable, scalable digital platform.

Where VoltSpark Fits in the Akshaya Createch Service Stack

Akshaya Createch (Consultancy)
├── Electrical Troubleshooting     → one-time engagements
├── Start-Up Advisory              → project-based
├── Solar EPC                      → project-based
├── Energy Saving Advisory         → ⭐ THIS becomes VoltSpark
└── Electrical Safety Training     → ⭐ Training module in VoltSpark
VoltSpark converts two service lines from billable-hours consulting into a recurring SaaS revenue model while keeping the consulting relationship as the sales channel.

Product Positioning Options
I see three possible scopes — from narrow to ambitious:

Scope	What VoltSpark Is	Target Market	Revenue Model
A. Compliance Tool	ZED/ISO energy compliance evidence tracker for Akshaya's own clients	SME manufacturers in Karnataka	Per-client license bundled with consulting
B. Energy Management Platform	Full energy monitoring + compliance + training platform	Indian MSMEs pursuing ZED/ISO 50001	SaaS subscription (monthly/annual)
C. Multi-Framework Compliance Suite	Configurable for ZED, ISO 50001, BEE, GreenCo, etc.	Any industrial facility needing energy compliance	Tiered SaaS + marketplace for consultants
What Already Exists vs What's Needed
Already built:

User management with roles (Admin/Manager/Employee)
Energy source registry with meter tracking
Consumption logging with deviation alerts
Target setting and tracking
Training program management with attendance
Internal/external audit tracking
CAPA lifecycle (5-Why, RCA, verification)
Compliance score dashboard
Report generation (6 report types)
Dynamic per-customer settings from DB
Cloud deployment (Turso + Vercel)
Gaps for a real product (depending on scope):

Gap	Scope A	Scope B	Scope C
Multi-tenancy (multiple companies, one instance)	Not needed	Needed	Critical
Self-service onboarding / registration	No	Yes	Yes
Billing / subscription management	Manual	Stripe integration	Stripe + tiers
File uploads (meter photos, certificates, audit docs)	Nice to have	Needed	Needed
Dashboard analytics (charts, trends over time)	Basic (exists)	Enhanced	Enhanced
Email notifications (deviation alerts, audit reminders)	Nice to have	Needed	Needed
Role-based data access (customer sees only their data)	Not needed	Needed	Critical
Configurable compliance frameworks	Not needed	ZED-specific OK	Must support multiple
API for IoT meter integration	No	Future	Differentiator
Mobile-responsive / PWA	Basic responsive	Required	Required
Branding customization per customer	Logo + name from DB	White-label	Full theme
What's your thinking on scope? And a few questions to sharpen the direction:

AskUserQuestion
OUT
User has answered your questions: "Which product scope feels right for VoltSpark's first version?"="C: Multi-Framework Suite", "Who is the primary user you want to serve first?"="Other consultants + their clients", "Should VoltSpark be visibly an Akshaya Createch product, or a separate brand?"="Separate brand entirely". You can now continue with the user's answers in mind.
Ambitious and clear. You're building VoltSpark as a standalone platform where consultants (like Akshaya Createch) onboard their own clients and manage compliance across multiple frameworks. Essentially a B2B2C marketplace for compliance management.

VoltSpark Product Vision

VoltSpark (Platform)
├── Consultants sign up → manage their portfolio of clients
│   ├── Akshaya Createch → Unnathi CNC, Client B, Client C...
│   ├── Consultant X → Their clients...
│   └── Consultant Y → Their clients...
├── Each client gets their own workspace (multi-tenant)
├── Frameworks are configurable (ZED, ISO 50001, BEE, GreenCo...)
└── Revenue: SaaS subscription per consultant seat or per client
Architecture Shift Required
The current app is single-tenant (one company, one database). For Scope C, the core architecture needs to evolve:


Current:                          Target:
┌─────────────────┐               ┌──────────────────────────────┐
│  Single Company  │               │         VoltSpark Platform    │
│  Single DB       │               │  ┌─────────┐ ┌─────────┐    │
│  Fixed Framework │               │  │ Org A   │ │ Org B   │    │
│  3 User Roles    │               │  │(Consult)│ │(Consult)│    │
└─────────────────┘               │  │ ┌─┐┌─┐  │ │ ┌─┐┌─┐  │    │
                                   │  │ │C││C│  │ │ │C││C│  │    │
                                   │  │ └─┘└─┘  │ │ └─┘└─┘  │    │
                                   │  └─────────┘ └─────────┘    │
                                   │  Configurable Frameworks     │
                                   │  Platform Admin Layer        │
                                   └──────────────────────────────┘
Phased Roadmap Suggestion
Given the ambition, I'd recommend shipping in phases rather than rebuilding everything at once:

Phase 1 — Foundation (what to build next)

Multi-tenancy: Organization model, tenant isolation
Role hierarchy: Platform Admin → Consultant → Client Admin → Employee
Self-service registration for consultants
"Powered by VoltSpark" landing page / marketing site
Phase 2 — Framework Engine

Configurable compliance frameworks (not hardcoded requirements)
Framework templates (ZED, ISO 50001, BEE Star Rating)
Custom requirement definitions per framework
Phase 3 — Marketplace & Growth

Consultant profiles and discovery
Billing (Stripe/Razorpay)
Client self-onboarding via consultant invite links
File uploads (certificates, audit documents, meter photos)
Email/notification system
Phase 4 — Intelligence

Cross-client benchmarking for consultants
Automated compliance gap analysis
IoT meter integration APIs
AI-powered recommendations
This is a significant product vision. Want me to start scoping Phase 1 (multi-tenancy + role hierarchy) in detail — the database schema changes, new models, and migration plan from the current single-tenant architecture? Or would you prefer to first create a product requirements document / roadmap that captures all of this?

prefer to first create a product requirements document / roadmap that captures all of this. Also I want to brainstrom further more
Let's brainstorm deeper before writing the PRD. A few areas I want to explore with you:

1. The Compliance Landscape in India
From what I understand, the frameworks your target consultants would work with include:

Framework	Issuing Body	Target	What It Covers
ZED	QCI/Ministry of MSME	MSMEs	Quality, environment, energy, safety (5 levels: Bronze→Diamond)
ISO 50001	ISO/BIS	Any org	Energy management systems
ISO 14001	ISO/BIS	Any org	Environmental management
BEE Star Rating	Bureau of Energy Efficiency	Commercial buildings, appliances	Energy performance benchmarking
GreenCo	CII	Manufacturing	Green company rating
PAT Scheme	BEE	Designated consumers	Energy efficiency targets
AskUserQuestion
OUT
User has answered your questions: "Which compliance frameworks should VoltSpark support first (besides ZED)? Pick all that your consultant users would commonly work with."="ISO 50001 (Energy Mgmt), Also Electrical Safety", "What's the typical consultant's portfolio size — how many clients does one consultant/firm manage simultaneously?"="2-5 clients", "How do consultants currently manage client compliance work (without a tool like VoltSpark)?"="Excel sheets + email, They have their own custom tool/apps as well", "What's your monetization preference?"="Figure out later". You can now continue with the user's answers in mind.
Great insights. So the initial frameworks are ZED + ISO 50001 + Electrical Safety. And the key pain point is consultants juggling Excel/email across 2-5 clients — VoltSpark replaces that chaos with a unified platform.

Let me dig deeper on a few more strategic dimensions:

AskUserQuestion
OUT
User has answered your questions: "For Electrical Safety as a framework — what does compliance tracking look like? What should VoltSpark track?"="All of the above", "You mentioned some consultants have their own custom tools. What would make them switch to VoltSpark?"="All above", "Should clients (e.g., Unnathi CNC employees) have direct access to VoltSpark, or only through their consultant?"="Configurable per client", "What's the launch timeline you're thinking?"="3-4 months (solid v1)". You can now continue with the user's answers in mind.
Excellent. The picture is very clear now. Let me synthesize everything into a comprehensive PRD.

AskUserQuestion
OUT
User has answered your questions: "One more key question: Should VoltSpark have a public marketing website (landing page, pricing, sign-up) as part of v1, or is consultant onboarding done manually/by invitation?"="Invitation-only initially". You can now continue with the user's answers in mind.
Now I have everything I need. Let me write the PRD.

Update Todos

Write comprehensive VoltSpark PRD with product vision, architecture, and phased roadmap
Write PRD.md
552 lines
# VoltSpark - Product Requirements Document

**Version:** 1.0
**Date:** 22 February 2026
**Author:** Akshaya Createch / Aravind

---

## 1. Product Vision

**VoltSpark** is a multi-tenant compliance management platform that enables independent consultants and consulting firms to manage energy, safety, and environmental compliance for their industrial clients — all from one place.

**One-liner:** _The platform that turns compliance consultants into compliance teams._

### 1.1 Problem Statement

Independent compliance consultants (ZED, ISO 50001, Electrical Safety) currently manage their client portfolios using a mix of Excel sheets, email, paper-based checklists, and occasionally custom-built tools. This creates:

- **Fragmented data** across spreadsheets, emails, and physical registers
- **No client visibility** — clients depend on consultants for status updates
- **Manual report generation** — hours spent creating audit evidence documents
- **No cross-framework view** — separate tracking for ZED, ISO, Safety
- **Unprofessional delivery** — Excel-based deliverables vs. a branded platform

### 1.2 Solution

VoltSpark provides consultants with a branded, multi-framework compliance platform where they can:

1. Onboard their clients into dedicated workspaces
2. Track compliance requirements across ZED, ISO 50001, and Electrical Safety
3. Give clients configurable access (self-service or consultant-managed)
4. Generate audit-ready evidence reports automatically
5. Present a professional, platform-backed service to prospects

### 1.3 Key Differentiators

| vs. Excel/Email | vs. Generic PM Tools | vs. Custom Apps |
|-----------------|---------------------|-----------------|
| Structured compliance data | Compliance-specific workflows | Multi-framework in one platform |
| Auto-generated reports | Audit-ready evidence documents | Client-facing dashboards |
| Client access portals | Domain-specific scoring | Professional credibility |
| Historical trend tracking | Built-in CAPA lifecycle | No development/maintenance cost |

---

## 2. Target Users

### 2.1 User Personas

**Persona 1: The Consultant (Primary)**
- Independent consultants or small firms (2-5 person teams)
- Manage 2-5 industrial clients simultaneously
- Expertise in ZED, ISO 50001, energy audits, or electrical safety
- Currently using Excel + email; some have custom tools
- Portfolio: SME manufacturers, factories, industrial facilities
- Example: Akshaya Createch (Lakshminarasimhan K)

**Persona 2: The Client Admin**
- Operations Manager or Energy Manager at an industrial facility
- Appointed by the consultant as the primary contact
- Needs to see compliance status, enter data, and track progress
- Example: Sandeep G. Parvatikar at Unnathi CNC

**Persona 3: The Client Employee**
- Shop floor workers, operators, maintenance staff
- Enters consumption readings, attends training, participates in audits
- Needs simple, mobile-friendly interfaces
- Example: Machine operators at Unnathi CNC

**Persona 4: The Platform Admin (Internal)**
- VoltSpark team (initially just the founding team)
- Manages consultant onboarding, platform configuration, support
- Monitors platform health, usage analytics

### 2.2 User Hierarchy

```
Platform Admin (VoltSpark team)
└── Consultant (signs up / is invited)
    └── Organization (consultant's firm)
        ├── Consultant Team Members
        └── Client Workspaces
            ├── Client Admin (operations manager)
            └── Client Employees (data entry, training)
```

---

## 3. Compliance Frameworks (v1)

### 3.1 ZED Certification (Zero Defect Zero Effect)
- **Issuing Body:** QCI / Ministry of MSME
- **Target:** Indian MSMEs
- **Levels:** Bronze, Silver, Gold, Diamond
- **Requirements covered by VoltSpark:**
  - Energy source identification and monitoring
  - Energy targets and consumption tracking
  - Energy awareness training programs
  - Internal/external energy audits
  - Corrective/Preventive Actions (CAPA)

### 3.2 ISO 50001 (Energy Management System)
- **Issuing Body:** ISO / BIS
- **Target:** Any organization
- **Key clauses to track:**
  - Energy policy and objectives
  - Energy review and baseline
  - Energy performance indicators (EnPIs)
  - Monitoring, measurement, and analysis
  - Internal audit and management review
  - Continual improvement

### 3.3 Electrical Safety
- **Governing rules:** Indian Electricity Rules, IS/IEC standards, CEA Safety Regulations
- **Modules in VoltSpark:**
  - **Inspection Checklists** — Periodic electrical safety inspections with pass/fail items, corrective actions, photo evidence
  - **Training & Certification Tracking** — Employee safety training, CEI/wireman license tracking, renewal date alerts
  - **Incident/Accident Logging** — Electrical incident reports, near-misses, root cause analysis, follow-up actions
  - **Compliance Documentation** — Safety audit reports, test certificates, earthing/insulation records

### 3.4 Framework Engine (Architecture)

Frameworks are **not hardcoded**. VoltSpark uses a configurable framework engine:

```
Framework (e.g., "ZED Bronze")
├── Requirement Category (e.g., "Energy Management")
│   ├── Requirement (e.g., "Identify all energy sources")
│   │   ├── Evidence Type (e.g., "Energy Source Register")
│   │   ├── Scoring Weight (e.g., 15%)
│   │   └── Compliance Criteria (e.g., ">=3 sources documented")
│   ├── Requirement (e.g., "Set energy targets")
│   └── ...
└── Scoring Rules (weights, thresholds, pass/fail criteria)
```

This allows:
- Adding new frameworks without code changes
- Customizing requirements per client engagement
- Mapping one client to multiple frameworks simultaneously
- Framework versioning (when standards get updated)

---

## 4. Feature Requirements

### 4.1 Multi-Tenancy & Organization Management

**Models:**
- `Organization` — A consulting firm (e.g., Akshaya Createch)
- `Client` — An industrial facility managed by an organization (e.g., Unnathi CNC)
- `Membership` — Links users to organizations with roles

**Tenant Isolation:**
- All data is scoped to a Client workspace
- Consultants see all their clients' data
- Client users see only their own workspace
- Platform admins see everything

**Key Features:**
- Consultant registration (invitation-only in v1)
- Client workspace creation with company details
- Invite client users via email
- Configurable client access levels (full access / read-only / data-entry only)
- Switch between client workspaces (for consultants managing multiple clients)

### 4.2 Compliance Tracking (Core Modules)

These modules already exist in the current app and will be enhanced for multi-tenancy:

| Module | Current State | v1 Enhancements |
|--------|--------------|-----------------|
| **Energy Sources** | CRUD with meter tracking | Scoped per client workspace |
| **Consumption Log** | Daily/monthly entries with deviations | Bulk import from Excel/CSV |
| **Energy Targets** | Quarterly targets per source | Linked to framework requirements |
| **Training** | Programs + attendance tracking | Certificate uploads, renewal alerts |
| **Audits** | Internal/external with findings | Checklist templates per framework |
| **CAPA** | Full lifecycle (5-Why, RCA, verification) | Linked to audit findings & framework gaps |
| **Compliance Dashboard** | Overall score with sub-scores | Per-framework scoring, trend charts |
| **Reports** | 6 report types | PDF export, framework-specific templates |

**New Modules for v1:**

| Module | Description |
|--------|------------|
| **Inspection Checklists** | Configurable safety inspection forms with pass/fail items, photo capture, corrective action triggers |
| **Incident Register** | Electrical/safety incident logging with severity, RCA, near-miss tracking |
| **Certification Tracker** | Employee and equipment certifications with expiry dates and renewal alerts |
| **Document Library** | File uploads for certificates, test reports, policy documents, audit evidence |
| **Activity Timeline** | Chronological feed of all compliance actions per client (audit log on steroids) |

### 4.3 Framework Management

- **Framework Templates** — Pre-built templates for ZED, ISO 50001, Electrical Safety
- **Custom Frameworks** — Consultants can create custom requirement sets
- **Client-Framework Mapping** — Assign one or more frameworks to each client
- **Requirement Tracking** — Each requirement has: status (Not Started / In Progress / Compliant / Non-Compliant), evidence links, notes, last reviewed date
- **Gap Analysis** — Visual view of which requirements are met vs. gaps
- **Compliance Score** — Calculated per framework based on requirement weights

### 4.4 Consultant Dashboard

The consultant's home view showing:
- Portfolio overview (all clients, their compliance scores)
- Upcoming deadlines (audit dates, training renewals, certification expiries)
- Recent activity across all clients
- Alerts (deviations, overdue CAPAs, expiring certifications)
- Quick actions (switch to client, generate report, schedule audit)

### 4.5 Client Access (Configurable)

Three access modes per client workspace:

| Mode | Who enters data | Client can see |
|------|----------------|---------------|
| **Consultant-managed** | Consultant only | Read-only dashboard + reports |
| **Collaborative** | Both consultant and client employees | Full dashboard, can enter consumption/training data |
| **Self-service** | Client employees primarily | Full access; consultant monitors and advises |

### 4.6 Reports & Evidence

- **Framework-specific report templates** — ZED compliance report, ISO 50001 management review, Safety audit report
- **Auto-populated evidence** — Reports pull data from modules (consumption logs, training records, audit findings)
- **PDF export** — Print-ready documents with company branding
- **Report history** — All generated reports saved for audit trail
- **Custom report builder** (future) — Drag-and-drop report sections

### 4.7 Notifications (v1 scope)

- Email alerts for: upcoming audit dates, overdue CAPAs, certification expiry (30/15/7 days), deviation thresholds exceeded
- In-app notification bell with unread count
- Configurable per client (consultant chooses what to enable)

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | Already in use; SSR + API routes in one framework |
| **Styling** | Tailwind CSS | Already in use; rapid UI development |
| **Auth** | NextAuth v4 → migrate to Auth.js v5 | Multi-tenant session handling, OAuth support |
| **Database** | Turso (libSQL) | Already deployed; edge-ready, SQLite-compatible |
| **ORM** | Prisma 7 (driver adapters) | Already in use; type-safe, migration support |
| **File Storage** | Vercel Blob or S3-compatible | For document uploads, photos, certificates |
| **Email** | Resend or Postmark | Transactional emails (invites, alerts) |
| **Hosting** | Vercel | Already deployed; serverless, edge functions |
| **Payments** | Razorpay (India) / Stripe (global) | Future — when monetization is added |

### 5.2 Database Schema (Conceptual)

**New Core Models:**

```
Organization {
  id, name, slug, logo, website
  plan (FREE/PRO/ENTERPRISE)
  createdAt, updatedAt
}

Client {
  id, organizationId → Organization
  name, slug, address, industry, employeeCount
  accessMode (CONSULTANT_MANAGED / COLLABORATIVE / SELF_SERVICE)
  isActive, createdAt, updatedAt
}

Membership {
  id, userId → User, organizationId → Organization
  role (OWNER / ADMIN / MEMBER)
}

ClientAccess {
  id, userId → User, clientId → Client
  role (CLIENT_ADMIN / EMPLOYEE / VIEWER)
}

ComplianceFramework {
  id, name, version, description, isSystem (built-in vs custom)
  organizationId → Organization (null for system frameworks)
}

FrameworkRequirement {
  id, frameworkId → ComplianceFramework
  categoryName, requirementCode, title, description
  evidenceType, scoringWeight, order
}

ClientFramework {
  id, clientId → Client, frameworkId → ComplianceFramework
  startDate, targetDate, status
}

RequirementStatus {
  id, clientFrameworkId → ClientFramework
  requirementId → FrameworkRequirement
  status (NOT_STARTED / IN_PROGRESS / COMPLIANT / NON_COMPLIANT)
  notes, lastReviewedAt, reviewedById → User
}

// Existing models enhanced with clientId:
EnergySource      { ...existing, clientId → Client }
EnergyTarget      { ...existing, clientId → Client }
ConsumptionEntry  { ...existing, clientId → Client }
TrainingProgram   { ...existing, clientId → Client }
Audit             { ...existing, clientId → Client }
CAPA              { ...existing, clientId → Client }

// New models:
InspectionTemplate {
  id, frameworkId, title, description
  items: InspectionItem[]
}

InspectionItem {
  id, templateId, category, question, type (PASS_FAIL / TEXT / PHOTO)
  order
}

Inspection {
  id, clientId, templateId, inspectorId → User
  scheduledDate, completedDate, status, overallResult
  responses: InspectionResponse[]
}

InspectionResponse {
  id, inspectionId, itemId, result, notes, photoUrl
}

Incident {
  id, clientId, reportedById → User
  type (ELECTRICAL / FIRE / MECHANICAL / OTHER)
  severity (NEAR_MISS / MINOR / MAJOR / FATAL)
  date, location, description, rootCause
  correctiveAction, status, closedAt
}

Certification {
  id, clientId, userId → User (nullable — can be equipment)
  type (CEI_LICENSE / WIREMAN / SAFETY_OFFICER / EQUIPMENT_TEST / OTHER)
  name, issuingAuthority, certificateNumber
  issueDate, expiryDate, documentUrl
  status (VALID / EXPIRING_SOON / EXPIRED)
}

Document {
  id, clientId, uploadedById → User
  category (POLICY / CERTIFICATE / AUDIT_REPORT / TEST_REPORT / PHOTO / OTHER)
  name, fileUrl, fileSize, mimeType
  linkedToType, linkedToId (polymorphic link to any entity)
  uploadedAt
}

Notification {
  id, userId → User, clientId → Client
  type, title, message, actionUrl
  isRead, createdAt
}

AppSetting { ...existing, clientId → Client (nullable for platform-level) }
AuditLog   { ...existing, clientId → Client }
```

### 5.3 Multi-Tenancy Strategy

**Approach: Shared database with row-level tenant isolation**

- All tables include a `clientId` foreign key
- Prisma middleware or query extensions enforce tenant scoping
- Consultants access multiple clients; employees access only theirs
- Session includes `activeClientId` for the current workspace context

**Data Access Matrix:**

| Role | Own Client Data | Other Clients in Org | Platform Data |
|------|----------------|---------------------|---------------|
| Platform Admin | All | All | All |
| Consultant (Org Owner) | Full CRUD | Full CRUD | None |
| Consultant (Org Member) | Full CRUD | Assigned only | None |
| Client Admin | Full CRUD | None | None |
| Client Employee | Limited (own entries) | None | None |
| Client Viewer | Read-only | None | None |

### 5.4 URL Structure

```
volt-spark.vercel.app/
├── /login                                    # Login page
├── /register                                 # Consultant registration (invite-only)
├── /console                                  # Consultant dashboard (portfolio view)
│   ├── /console/clients                      # Client list
│   ├── /console/clients/new                  # Create new client
│   └── /console/settings                     # Organization settings
├── /w/[client-slug]                          # Client workspace
│   ├── /w/unnathi-cnc/dashboard              # Client dashboard
│   ├── /w/unnathi-cnc/energy-sources         # Energy sources
│   ├── /w/unnathi-cnc/consumption            # Consumption log
│   ├── /w/unnathi-cnc/targets                # Energy targets
│   ├── /w/unnathi-cnc/training               # Training management
│   ├── /w/unnathi-cnc/audits                 # Audits
│   ├── /w/unnathi-cnc/capa                   # CAPA
│   ├── /w/unnathi-cnc/inspections            # Safety inspections
│   ├── /w/unnathi-cnc/incidents              # Incident register
│   ├── /w/unnathi-cnc/certifications         # Certification tracker
│   ├── /w/unnathi-cnc/documents              # Document library
│   ├── /w/unnathi-cnc/compliance             # Framework compliance view
│   ├── /w/unnathi-cnc/reports                # Reports
│   └── /w/unnathi-cnc/settings               # Client settings
└── /admin                                    # Platform admin (VoltSpark team)
```

---

## 6. Phased Roadmap

### Phase 1: Multi-Tenant Foundation (Weeks 1-4)

**Goal:** Transform from single-tenant to multi-tenant. Consultant can manage multiple clients.

**Deliverables:**
- [ ] Organization, Client, Membership, ClientAccess models
- [ ] Registration flow (invitation-only) for consultants
- [ ] Client workspace creation with company details
- [ ] Workspace switcher in the UI (consultant switches between clients)
- [ ] Migrate all existing modules to be client-scoped (add clientId)
- [ ] Role-based access control (consultant vs client admin vs employee)
- [ ] Updated sidebar with workspace context
- [ ] Console dashboard (portfolio view for consultants)
- [ ] Invite client users via email
- [ ] Migrate Unnathi CNC data into the new multi-tenant structure

**Architecture Work:**
- Prisma schema overhaul with new models
- Auth system update for multi-tenant sessions
- Middleware for tenant isolation
- URL routing update (/w/[slug]/...)

### Phase 2: Framework Engine + Electrical Safety (Weeks 5-8)

**Goal:** Configurable compliance frameworks. Add Electrical Safety as second framework.

**Deliverables:**
- [ ] ComplianceFramework, FrameworkRequirement, ClientFramework, RequirementStatus models
- [ ] Built-in ZED template (derived from current hardcoded requirements)
- [ ] Built-in ISO 50001 template
- [ ] Built-in Electrical Safety template
- [ ] Framework assignment to clients (one client, multiple frameworks)
- [ ] Requirement tracking UI (status, evidence links, notes)
- [ ] Gap analysis view (visual compliance matrix)
- [ ] Per-framework compliance scoring
- [ ] Inspection checklists module (configurable templates)
- [ ] Incident register module
- [ ] Certification tracker module with expiry alerts

### Phase 3: Documents, Notifications & Reports (Weeks 9-12)

**Goal:** Production-ready features for day-to-day consultant workflow.

**Deliverables:**
- [ ] Document library with file uploads (Vercel Blob)
- [ ] Link documents to any entity (audit, training, inspection, etc.)
- [ ] Email notification system (Resend)
- [ ] Notification preferences per client
- [ ] In-app notification center
- [ ] Enhanced reports — PDF export with company branding
- [ ] Framework-specific report templates
- [ ] Bulk data import (CSV/Excel for consumption, training attendance)
- [ ] Activity timeline per client
- [ ] Configurable client access modes

### Phase 4: Polish, Analytics & Launch Prep (Weeks 13-16)

**Goal:** Production hardening, analytics, and launch readiness.

**Deliverables:**
- [ ] Consultant analytics dashboard (cross-client insights)
- [ ] Trend charts and historical analysis (Recharts enhancements)
- [ ] Mobile-responsive optimization / PWA
- [ ] Onboarding flow for new consultants (guided setup)
- [ ] Help documentation / knowledge base
- [ ] Performance optimization (caching, query optimization)
- [ ] Security audit (OWASP top 10, data privacy)
- [ ] Landing page at volt-spark.vercel.app (marketing site)
- [ ] Seed data for demo environment
- [ ] Beta launch with 3-5 consultants

---

## 7. Success Metrics

### Launch Targets (Month 1-3 post-launch)
- 5-10 consultants onboarded
- 15-30 client workspaces created
- At least 2 frameworks actively used per consultant
- Weekly active usage by >60% of onboarded consultants

### Product-Market Fit Indicators
- Consultants inviting their clients without prompting
- Clients logging in independently (not just consultant-driven)
- Report generation frequency >2x per client per month
- Consultant referrals (organic growth)

### Quality Metrics
- Page load time <2s (all routes)
- Zero data leakage between tenants
- 99.9% uptime (Vercel + Turso SLA)
- <24h response time for support

---

## 8. Open Questions & Decisions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Database strategy for scale | Single Turso DB (row-level isolation) vs. DB-per-tenant | TBD — start with single DB |
| 2 | Auth migration | Stay on NextAuth v4 vs. migrate to Auth.js v5 | TBD — evaluate during Phase 1 |
| 3 | Custom domain support | Consultants can use their own domain for client portals | Future — not in v1 |
| 4 | Offline/PWA support | For factory floor data entry where connectivity is limited | Evaluate in Phase 4 |
| 5 | Mobile app | Native app vs. PWA vs. responsive web only | Start with responsive web + PWA |
| 6 | Data export | Clients should be able to export all their data | Required for trust — add in Phase 3 |
| 7 | Pricing model | Per-client vs. per-seat vs. freemium | Decide after beta feedback |
| 8 | Localization | Hindi / regional language support | Future — English only for v1 |

---

## 9. Competitive Landscape

| Competitor | What They Do | VoltSpark Differentiator |
|-----------|-------------|------------------------|
| isoTracker | ISO document management | VoltSpark is multi-framework + consultant-focused |
| Qualityze | Enterprise QMS | Too complex/expensive for SME consultants |
| SafetyCulture (iAuditor) | Inspection/audit platform | No energy compliance; VoltSpark covers energy + safety |
| Custom Excel/tools | Consultant-built spreadsheets | VoltSpark is productized, branded, multi-client |
| ZED Portal (QCI) | ZED application tracking | Application portal only, not compliance management |

**VoltSpark's wedge:** No platform exists specifically for independent compliance consultants managing SME industrial clients across energy + safety frameworks in India.

---

## 10. Non-Goals (Explicitly Out of Scope for v1)

- Real-time IoT meter integration
- AI-powered compliance recommendations
- Marketplace/directory of consultants
- Billing/subscription management
- White-label/custom branding per consultant
- API for third-party integrations
- Multi-language support
- Native mobile apps
Update Todos

Write comprehensive VoltSpark PRD with product vision, architecture, and phased roadmap
The PRD is written at PRD.md. Here's a quick summary of the key decisions captured:

Product Structure
Consultants sign up (invitation-only), create client workspaces, optionally invite client employees
3 frameworks at launch: ZED, ISO 50001, Electrical Safety
Configurable framework engine — no hardcoded requirements; frameworks are data, not code
Client access is configurable per workspace (consultant-managed / collaborative / self-service)
4-Phase Roadmap (~16 weeks)
Phase	Weeks	Focus
1	1-4	Multi-tenancy, org/client models, role hierarchy, workspace routing
2	5-8	Framework engine, Electrical Safety modules (inspections, incidents, certs)
3	9-12	File uploads, email notifications, enhanced reports, CSV import
4	13-16	Analytics, mobile optimization, landing page, beta launch
New Modules (beyond what exists)
Inspection Checklists (configurable safety inspection forms)
Incident Register (near-miss + accident tracking with RCA)
Certification Tracker (employee/equipment certs with expiry alerts)
Document Library (file uploads linked to any entity)
Consultant Console (portfolio dashboard across all clients)
Want to discuss any part of the PRD further, or shall we start scoping Phase 1 (multi-tenancy) for implementation?

Do you see anything, any gaps, features, functions which you feel its good, worth the build
Good question. I've been looking at the PRD critically — here are gaps and features I think are genuinely worth building:

High-Impact Gaps Missing from the PRD
1. Baseline Assessment / Initial Survey

This is the entry point of every engagement — before tracking compliance, a consultant assesses where the client stands today. Currently there's no way to capture this.


Consultant takes on new client
  → Conducts initial site survey
  → Documents current state per requirement
  → Identifies gaps
  → Creates improvement plan
  → THEN starts tracking
Without this, the platform assumes the client is already mid-journey. A structured onboarding assessment that feeds directly into the gap analysis would be the natural starting point.

2. Improvement Action Plans (proactive, not just reactive CAPA)

CAPA is reactive — something went wrong, fix it. But compliance work is mostly proactive — the consultant creates an improvement roadmap to get from current state to certification.


Action Plan for Unnathi CNC → ZED Bronze
├── Install sub-meters on all CNC machines    [Owner: Sandeep]  [Due: March 15]
├── Establish energy baseline (3 months data) [Owner: Consultant] [Due: April 30]
├── Conduct first energy awareness training   [Owner: Akshaya]   [Due: March 20]
├── Draft energy policy document              [Owner: Consultant] [Due: March 10]
└── Schedule internal energy audit            [Owner: Sandeep]    [Due: May 15]
This is the core deliverable a consultant gives their client. It should be a first-class feature, not shoehorned into CAPA.

3. Recurring Schedules

Many compliance activities repeat on fixed cycles:

Monthly meter readings
Quarterly target reviews
Bi-annual safety inspections
Annual management reviews
Training refreshers every 6/12 months
There's no recurrence engine. Without it, consultants are manually creating the same items every month — exactly the Excel drudgery VoltSpark should eliminate.

4. Energy Analytics (not just logging)

The current consumption module logs readings. But consultants actually need to analyze:

Metric	Why It Matters
Specific Energy Consumption (kWh/unit produced)	Core KPI for manufacturing efficiency
Cost analysis (cost/kWh, monthly energy bill trends)	Justifies investments to client management
Peak demand analysis	Identifies demand-side management opportunities
Power factor tracking	Penalty avoidance from the utility
Source-wise energy mix (% grid vs solar vs DG)	Required for ZED and ISO 50001
Year-over-year comparison	Proves improvement for auditors
This is where Akshaya Createch's "Energy Saving Advisory" expertise translates directly into product value. No other compliance tool does energy analytics well for Indian MSMEs.

5. Pre-Audit Readiness Check

Before the actual certification audit, consultants do a mock audit / readiness assessment. A feature that:

Walks through every requirement in the selected framework
Checks if sufficient evidence exists
Flags gaps and missing documentation
Generates a "readiness score" with a punch list of items to fix
This would save consultants hours of manual preparation and give clients confidence before the real audit.

6. Template Library

Consultants develop reusable assets over time:

Audit checklist templates
Training presentation materials
Policy document templates (energy policy, safety policy)
SOP templates for common procedures
Inspection form templates
A template library that consultants build once and reuse across clients is a retention driver — the more templates they create, the harder it is to leave VoltSpark.

7. Client Health Score (for the consultant)

Beyond compliance score (which is client-facing), consultants need an internal health indicator per client:

Signal	Healthy	At Risk
Data entry frequency	On schedule	Overdue readings
CAPA closure rate	>80% within deadline	Overdue CAPAs piling up
Client responsiveness	Logging in weekly	No activity in 30 days
Upcoming deadlines	Planned and assigned	Audit in 2 weeks, nothing prepared
This helps consultants with 5 clients prioritize where to spend their time.

8. WhatsApp Notifications

In Indian B2B, WhatsApp is the primary communication channel — not email. Supporting WhatsApp alerts (via the WhatsApp Business API) for:

"Monthly meter reading due tomorrow"
"Safety inspection overdue by 3 days"
"Training scheduled for March 20 — 5 attendees confirmed"
This would be a significant differentiator in the Indian market.

Features Worth Considering (Not Critical for v1, but strategic)
9. Government Scheme Eligibility

Indian MSMEs have access to subsidies they often don't know about:

ZED certification subsidy (up to 80% for micro enterprises)
BEE financing programs
State-level solar subsidies
MSME technology upgrade schemes
A feature that maps client profile → eligible schemes would add tremendous consulting value.

10. Auto-Generated Policy Documents

Most frameworks require policy documents (energy policy, safety policy, environmental policy). A template system that auto-fills client-specific data:


"[Company Name] is committed to continual improvement of energy
performance at our facility located at [Company Address].
Our energy baseline year is [Baseline Year] with a target
reduction of [Target %] by [Target Year]..."
Consultants currently write these from scratch for each client.

11. Evidence Traceability Chain

Auditors want to trace: Requirement → Evidence → Source Data. An explicit linking system:


ZED Requirement 1: "Identify all energy sources"
├── Evidence: Energy Source Register (auto-linked from module)
├── Evidence: Meter calibration certificates (uploaded document)
└── Evidence: Site survey photos (uploaded document)
This makes audit preparation one-click instead of manually gathering evidence.

Updated Module Priority (my recommendation)
Priority	Feature	Why
Must have	Baseline Assessment	Entry point for every engagement
Must have	Action Plans	Core consultant deliverable
Must have	Recurring Schedules	Eliminates manual repetition
Must have	Pre-Audit Readiness	Saves hours, builds confidence
Should have	Energy Analytics	Akshaya's core expertise as product value
Should have	Template Library	Retention driver, reuse across clients
Should have	Client Health Score	Consultant productivity tool
Should have	Evidence Traceability	Audit preparation efficiency
Nice to have	WhatsApp Notifications	Indian market differentiator
Nice to have	Policy Doc Generator	Time saver, consistency
Nice to have	Govt Scheme Eligibility	Added consulting value
Want me to update the PRD with these additions and adjust the phased roadmap, or do you want to discuss any of these further first?

What else will benefit customer. Customer should win. If customer wins/make profit, we also make
Great mindset. Let's flip the entire perspective — start from the MSME factory owner's daily reality and work backwards to features.

The MSME Owner's Real Problems
The factory owner (your consultant's client) doesn't care about "compliance." They care about:

What keeps them up at night	In their words
Energy costs eating margins	"I pay ₹5L/month on electricity and I don't know where it's going"
Losing customers	"My OEM buyer wants ISO certification or they'll drop me as a vendor"
Safety risk	"We had an electrical incident — what if someone gets seriously hurt?"
Government penalties	"BESCOM charged me ₹40K penalty for low power factor last quarter"
Missing subsidies	"I heard there's a ZED subsidy but I don't know how to get it"
Wasted money on fixes	"I spent ₹3L on a VFD — was it worth it? I have no idea"
Compliance is the medicine. But the customer buys the cure — which is profit, safety, and growth.

If VoltSpark only tracks compliance, it's a cost center ("one more thing I pay for"). If VoltSpark shows money saved, risks avoided, and customers won — it becomes indispensable.

Features That Make the Customer Win
1. Energy Cost Dashboard (Show the Money)
The current app tracks kWh. The customer thinks in rupees.


┌─────────────────────────────────────────────┐
│  This Month's Energy Cost        ₹4,82,000  │
│  vs Last Month                      ↑ 12%   │
│  vs Same Month Last Year            ↓ 8%    │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Grid     │ │ Solar    │ │ DG Set   │    │
│  │ ₹3.9L   │ │ ₹0      │ │ ₹58K    │    │
│  │ 81%     │ │ 12%     │ │ 7%      │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
│  Power Factor: 0.87 ⚠️ Penalty Risk: ₹15K  │
│  Peak Demand: 142 kVA (Contract: 150 kVA)   │
└─────────────────────────────────────────────┘
Why it wins: The owner opens VoltSpark and immediately sees financial impact. Not compliance jargon — money.

2. Savings Tracker (Prove the Consultant's Value)

┌─────────────────────────────────────────────┐
│  💰 Cumulative Savings Since Onboarding     │
│                                              │
│  Total Saved:  ₹3,24,000                    │
│  Period:       8 months                      │
│                                              │
│  Breakdown:                                  │
│  ├─ VFD on CNC machines        ₹1,44,000   │
│  ├─ Power factor correction     ₹96,000    │
│  ├─ LED lighting retrofit       ₹48,000    │
│  └─ Compressed air leak fix     ₹36,000    │
│                                              │
│  Consultant fee paid:  ₹1,80,000            │
│  Net ROI:              ₹1,44,000 (80%)      │
└─────────────────────────────────────────────┘
Why it wins: This single screen justifies the consultant's fees. The client sees they're making money, not spending it. The consultant can screenshot this in every client meeting.

This is the feature that makes consultants sell VoltSpark to their clients instead of the other way around.

3. ROI Calculator for Improvements
Before spending money on energy-saving measures, the owner asks: "Is it worth it?"


┌─────────────────────────────────────────────┐
│  Proposed: Install 30kW Solar Rooftop       │
│                                              │
│  Investment:         ₹15,00,000             │
│  Monthly Generation: ~3,600 kWh              │
│  Monthly Savings:    ₹28,800                │
│  Govt Subsidy:       ₹2,25,000 (15%)        │
│  Net Investment:     ₹12,75,000             │
│  Payback Period:     44 months               │
│  25-Year Savings:    ₹62,00,000             │
│                                              │
│  [Add to Action Plan]  [Share with Client]   │
└─────────────────────────────────────────────┘
Why it wins: Consultants like Akshaya Createch (who also do Solar EPC) can use this to pitch projects backed by data, not guesswork.

4. Utility Bill Analyzer
The client uploads their monthly BESCOM/utility bill (photo or PDF). VoltSpark extracts:

Units consumed vs. metered readings (catch discrepancies)
Power factor and penalty amounts
Demand charges vs. contract demand
Time-of-Day tariff analysis (are you running heavy loads during peak hours?)
Bill trend over 12 months
Why it wins: Most MSME owners don't read their utility bills in detail. Consultants find ₹10K-50K/month in avoidable charges regularly. This feature pays for VoltSpark immediately.

5. Vendor Qualification / Certification Proof
When the client's OEM buyer asks "Are you ZED/ISO certified?", the client can share:

A live compliance dashboard link (read-only, branded)
Auto-generated compliance certificate/letter
Evidence documents packaged for vendor audits

┌─────────────────────────────────────────────┐
│  🏭 Unnathi CNC Technologies Pvt Ltd       │
│                                              │
│  ZED Bronze          ✅ Compliant (87%)     │
│  ISO 50001           🔄 In Progress (64%)   │
│  Electrical Safety   ✅ Compliant (91%)     │
│                                              │
│  [Download Certificate]  [Share Live Link]   │
│                                              │
│  Last Audit: 15 Feb 2026 | Next: 15 Aug 2026│
└─────────────────────────────────────────────┘
Why it wins: Compliance isn't just a checkbox — it becomes a sales tool for the client. ZED certification gives preference in government procurement. ISO certification qualifies them as vendors for large OEMs (HAL, BHEL, Toyoda Gosei). This directly drives revenue for the client.

6. Industry Benchmarking
Anonymous, aggregated comparison:


Your Specific Energy Consumption:  2.3 kWh/kg
Industry Average (CNC shops):      1.8 kWh/kg
Top Performers:                    1.4 kWh/kg

You are in the bottom 30%. Here are the top 3 areas to improve:
1. Compressed air system efficiency (your: 62%, benchmark: 85%)
2. Machine idle time energy waste (your: 18%, benchmark: 8%)
3. Power factor (your: 0.87, benchmark: 0.95)
Why it wins: The owner now has a clear target. The consultant has a data-backed pitch for improvement projects. Both win.

7. Subsidy & Scheme Tracker

┌─────────────────────────────────────────────┐
│  🏛️ Government Schemes You Qualify For      │
│                                              │
│  ✅ ZED Certification Subsidy               │
│     Up to ₹1,00,000 (Micro enterprise)      │
│     Status: Application ready                │
│     [Start Application]                      │
│                                              │
│  ✅ PM-KUSUM Solar Subsidy                  │
│     30% capital subsidy on rooftop solar     │
│     Status: Eligible                         │
│     [View Details]                           │
│                                              │
│  ✅ MSME Technology Upgradation Scheme      │
│     15% capital subsidy on VFDs, PLCs        │
│     Status: Eligible                         │
│     [View Details]                           │
└─────────────────────────────────────────────┘
Why it wins: Most MSMEs don't know what they're eligible for. The consultant who brings ₹2-5L in subsidies becomes invaluable. VoltSpark becomes the tool that literally puts money in the client's pocket.

8. Safety Risk Score (Not Just Compliance)
Instead of just tracking "did we do the inspection?", show actual risk:


⚠️ Electrical Safety Risk Score: 72/100 (Moderate)

High Risk Areas:
├── Panel room: Earthing resistance 8Ω (should be <2Ω) — CRITICAL
├── CNC area: 3 machines without ELCB protection — HIGH
├── Compressed air: Expired BIS certification on pressure vessel — HIGH
└── DG room: Last maintenance 8 months ago (due every 3 months) — MEDIUM

Estimated liability exposure: ₹15-25L
(Based on recent CEIG enforcement actions in Karnataka)
Why it wins: Framing safety as financial risk (liability, insurance, shutdown) makes the owner act. "Your unprotected panel could cost you ₹25L in fines and shutdown" is more motivating than "you're non-compliant with IS 3043."

9. Client Success Stories / Impact Report
Annual report the consultant generates for each client:


📊 2025-26 Impact Report for Unnathi CNC

Energy Performance:
├── Total energy cost: ₹52.4L (↓14% vs FY25)
├── Savings achieved: ₹8.6L
├── Solar generation: 28,400 kWh (new this year)
└── Carbon reduction: 23 tonnes CO₂

Compliance:
├── ZED Bronze: Achieved ✅
├── ISO 50001: 78% ready (target: March 2027)
└── Safety incidents: 0 (vs 2 last year)

Financial Impact:
├── Subsidy received: ₹1,00,000 (ZED)
├── Vendor qualification: Approved by 2 new OEMs
├── Estimated new revenue from OEM contracts: ₹35L
└── Insurance premium reduction: ₹45,000/year
Why it wins: This is the ultimate proof of value. The client sees the full picture: money saved, risks reduced, revenue gained. The consultant uses this to retain the client and as a case study to win new ones.

The Value Chain

VoltSpark helps → Consultant deliver → Client outcomes

Platform Features     Consultant Value        Client Wins
─────────────────    ──────────────────      ─────────────────
Energy Cost Dashboard → Data-backed advisory → ₹ saved on energy
Savings Tracker      → Prove ROI to client   → Justify consultant fee
ROI Calculator       → Pitch improvements    → Smart investments
Utility Bill Analyzer→ Find hidden costs     → Avoid penalties
Benchmarking         → Set targets           → Competitive edge
Subsidy Tracker      → Unlock free money     → ₹ from government
Vendor Qualification → Compliance proof      → Win new customers
Safety Risk Score    → Quantify liability    → Avoid accidents
Impact Report        → Retain & upsell       → See the big picture
The flywheel: Client saves money → Consultant's value is proven → Consultant gets more clients → More clients on VoltSpark → Better benchmarking data → More value for everyone.

What This Means for the PRD
I'd restructure the product positioning. Instead of:

"Compliance management platform for consultants" (feature-oriented)

Position it as:

"VoltSpark helps industrial facilities save energy costs, stay safe, and win more customers — managed by their trusted compliance consultant." (outcome-oriented)

The compliance tracking becomes the engine, but the customer-facing value is money, safety, and growth.

Want me to update the PRD with these customer-value features integrated into the roadmap?