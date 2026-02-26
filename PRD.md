# VoltSpark - Product Requirements Document

**Version:** 2.0
**Date:** 22 February 2026
**Author:** Akshaya Createch / Aravind

---

## 1. Product Vision

**VoltSpark** helps industrial facilities save energy costs, stay safe, and win more customers — managed by their trusted compliance consultant through a single platform.

**One-liner:** _Save energy. Stay safe. Win customers._

### 1.1 The Value Chain

```
VoltSpark enables → Consultants to deliver → Client outcomes

Platform Features       Consultant Value          Client Wins
─────────────────      ──────────────────        ─────────────────
Energy Cost Dashboard → Data-backed advisory    → ₹ saved on energy
Savings Tracker       → Prove ROI to client     → Justify consultant fee
ROI Calculator        → Pitch improvements      → Smart investments
Utility Bill Analyzer → Find hidden charges     → Avoid penalties
Benchmarking          → Set targets             → Competitive edge
Subsidy Tracker       → Unlock free money       → ₹ from government
Vendor Qualification  → Compliance proof        → Win new customers
Safety Risk Score     → Quantify liability      → Avoid accidents
Impact Report         → Retain & upsell         → See the big picture
```

**The flywheel:** Client saves money → Consultant's value is proven → Consultant gets more clients → More clients on VoltSpark → Better benchmarking data → More value for everyone.

### 1.2 Problem Statement

**For the consultant:**
Independent compliance consultants (ZED, ISO 50001, Electrical Safety) manage client portfolios using Excel, email, paper checklists, and occasionally custom tools. This creates fragmented data, manual report generation, no cross-framework view, and unprofessional delivery.

**For the client (MSME factory owner):**
They don't care about "compliance" — they care about:
- "I pay ₹5L/month on electricity and I don't know where it's going"
- "My OEM buyer wants ISO certification or they'll drop me as a vendor"
- "We had an electrical incident — what if someone gets seriously hurt?"
- "BESCOM charged me ₹40K penalty for low power factor"
- "I heard there's a ZED subsidy but I don't know how to get it"
- "I spent ₹3L on a VFD — was it worth it? I have no idea"

**Compliance is the medicine. The customer buys the cure — which is profit, safety, and growth.**

### 1.3 Solution

VoltSpark is a multi-tenant platform where consultants onboard their industrial clients and deliver measurable outcomes:

1. **Save money** — Energy cost tracking, savings measurement, ROI analysis, utility bill optimization
2. **Stay compliant** — Multi-framework compliance tracking (ZED, ISO 50001, Electrical Safety)
3. **Stay safe** — Inspection checklists, incident tracking, certification management, risk scoring
4. **Win business** — Vendor qualification proof, compliance certificates, shareable dashboards
5. **Capture incentives** — Government scheme eligibility, subsidy tracking

### 1.4 Key Differentiators

| vs. Excel/Email | vs. Generic PM Tools | vs. Custom Apps | vs. Enterprise QMS |
|-----------------|---------------------|-----------------|-------------------|
| Structured compliance data | Compliance-specific workflows | Multi-framework in one platform | Affordable for SME consultants |
| Auto-generated reports | Audit-ready evidence documents | Client-facing dashboards | Indian market-specific |
| Energy cost analytics | Domain-specific scoring | No development cost | Consultant-centric, not corporate |
| Savings measurement | Built-in CAPA lifecycle | Professional credibility | Outcome-focused, not checkbox |

---

## 2. Target Users

### 2.1 User Personas

**Persona 1: The Consultant (Primary buyer)**
- Independent consultants or small firms (2-5 person teams)
- Manage 2-5 industrial clients simultaneously
- Expertise in ZED, ISO 50001, energy audits, or electrical safety
- Currently using Excel + email; some have custom tools
- Needs to prove ROI to clients, retain them, and win new ones
- Example: Akshaya Createch (Lakshminarasimhan K)

**Persona 2: The Client Admin (Key user)**
- Operations Manager or Energy Manager at an industrial facility
- Cares about: energy costs, safety, certification status, vendor approvals
- Needs dashboards that show money saved, risks flagged, and compliance progress
- Example: Sandeep G. Parvatikar at Unnathi CNC

**Persona 3: The Client Employee (Data contributor)**
- Shop floor workers, operators, maintenance staff
- Enters consumption readings, attends training, participates in audits
- Needs simple, mobile-friendly interfaces
- Example: Machine operators at Unnathi CNC

**Persona 4: The Platform Admin (Internal)**
- VoltSpark team (initially just the founding team)
- Manages consultant onboarding, platform configuration, support

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
- **Requirements covered:**
  - Energy source identification and monitoring
  - Energy targets and consumption tracking
  - Energy awareness training programs
  - Internal/external energy audits
  - Corrective/Preventive Actions (CAPA)

### 3.2 ISO 50001 (Energy Management System)
- **Issuing Body:** ISO / BIS
- **Target:** Any organization
- **Key clauses:**
  - Energy policy and objectives
  - Energy review and baseline
  - Energy performance indicators (EnPIs)
  - Monitoring, measurement, and analysis
  - Internal audit and management review
  - Continual improvement

### 3.3 Electrical Safety
- **Governing rules:** Indian Electricity Rules, IS/IEC standards, CEA Safety Regulations
- **Modules:**
  - Inspection Checklists — Periodic safety inspections with pass/fail, corrective actions, photo evidence
  - Training & Certification Tracking — CEI/wireman license tracking, renewal alerts
  - Incident/Accident Logging — Incident reports, near-misses, RCA, follow-up actions
  - Compliance Documentation — Safety audit reports, test certificates, earthing/insulation records

### 3.4 Framework Engine (Architecture)

Frameworks are **not hardcoded**. VoltSpark uses a configurable framework engine:

```
Framework (e.g., "ZED Bronze")
├── Requirement Category (e.g., "Energy Management")
│   ├── Requirement (e.g., "Identify all energy sources")
│   │   ├── Evidence Type (e.g., "Energy Source Register")
│   │   ├── Scoring Weight (e.g., 15%)
│   │   └── Compliance Criteria (e.g., ">=3 sources documented")
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
- `ClientAccess` — Links users to client workspaces with roles

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

### 4.2 Compliance Tracking (Existing Modules — Enhanced)

| Module | Current State | v1 Enhancements |
|--------|--------------|-----------------|
| **Energy Sources** | CRUD with meter tracking | Scoped per client; cost per unit field |
| **Consumption Log** | Daily/monthly entries with deviations | Bulk CSV import; cost calculation; trend charts |
| **Energy Targets** | Quarterly targets per source | Linked to framework requirements; cost targets |
| **Training** | Programs + attendance tracking | Certificate uploads, renewal alerts |
| **Audits** | Internal/external with findings | Checklist templates per framework |
| **CAPA** | Full lifecycle (5-Why, RCA, verification) | Linked to audit findings & framework gaps |
| **Compliance Dashboard** | Overall score with sub-scores | Per-framework scoring; energy cost overlay |
| **Reports** | 6 report types | PDF export; framework-specific templates |

### 4.3 New Compliance Modules

| Module | Description |
|--------|------------|
| **Inspection Checklists** | Configurable safety inspection forms with pass/fail items, photo capture, corrective action triggers |
| **Incident Register** | Electrical/safety incident logging with severity, RCA, near-miss tracking |
| **Certification Tracker** | Employee and equipment certifications with expiry dates and renewal alerts |
| **Document Library** | File uploads for certificates, test reports, policy documents, audit evidence |
| **Activity Timeline** | Chronological feed of all compliance actions per client |

### 4.4 Baseline Assessment & Onboarding

The entry point for every new client engagement:

- **Initial Site Survey** — Structured assessment form capturing current state per compliance requirement
- **Gap Identification** — Auto-generated gap list based on survey results vs. framework requirements
- **Baseline Metrics** — Capture starting energy consumption, cost baseline, safety status
- **Auto-generated Action Plan** — From gaps to a prioritized improvement roadmap

```
New Client Onboarding Flow:
1. Create client workspace (company details, industry, employee count)
2. Assign compliance frameworks (ZED Bronze + Electrical Safety)
3. Conduct baseline assessment (guided survey per framework)
4. Review auto-generated gap analysis
5. Create improvement action plan with milestones
6. Begin tracking
```

### 4.5 Improvement Action Plans

Proactive improvement roadmaps (distinct from reactive CAPA):

```
Action Plan: Unnathi CNC → ZED Bronze Certification
├── Install sub-meters on all CNC machines    [Sandeep]   [Due: Mar 15]  ✅ Done
├── Establish energy baseline (3 months)      [Consultant] [Due: Apr 30]  🔄 In Progress
├── Conduct energy awareness training         [Akshaya]    [Due: Mar 20]  📅 Scheduled
├── Draft energy policy document              [Consultant] [Due: Mar 10]  ✅ Done
├── Fix compressed air leaks                  [Maintenance][Due: Mar 25]  ⏳ Pending
└── Schedule internal energy audit            [Sandeep]    [Due: May 15]  ⏳ Pending

Progress: 33% (2/6 complete)  |  Target: ZED Bronze by June 2026
```

**Features:**
- Create action items linked to framework requirements
- Assign owners (consultant or client staff), set due dates
- Track status (Pending / In Progress / Done / Blocked)
- Link evidence (documents, module data) to completed items
- Timeline/Gantt view of the improvement journey
- Template action plans per framework (reuse across clients)

### 4.6 Recurring Schedules

Many compliance activities repeat on fixed cycles:

| Activity | Typical Frequency |
|----------|-------------------|
| Meter readings / consumption entry | Monthly |
| Energy target review | Quarterly |
| Safety inspections | Monthly / Quarterly |
| Internal audits | Semi-annual |
| Management reviews | Annual |
| Training refreshers | Annual |
| Certification renewals | As per expiry |

**Features:**
- Define recurring tasks per client (daily / weekly / monthly / quarterly / annual / custom)
- Auto-generate task instances on schedule
- Dashboard widget showing upcoming and overdue recurring tasks
- Notification/reminder when a recurring task is due
- Skip/reschedule individual instances without affecting the series

### 4.7 Energy Cost Dashboard (Customer Value Feature)

Transform consumption data into financial insights:

**Monthly Energy Cost Overview:**
- Total energy cost (₹) with month-over-month and year-over-year comparison
- Cost breakdown by source (grid, solar, DG, compressed air)
- Energy mix visualization (% from each source)
- Power factor tracking with penalty risk indicator
- Peak demand vs. contract demand
- Cost per unit of production (specific energy consumption)

**Configuration:**
- Tariff rates per energy source (₹/kWh, demand charges, ToD rates)
- Production volume tracking (units produced per month)
- Currency and unit preferences

### 4.8 Savings Tracker (Customer Value Feature)

Measure and prove the financial impact of energy improvements:

**Savings Entry:**
- Improvement measure name (e.g., "VFD on CNC Machine #3")
- Investment cost (₹)
- Date implemented
- Estimated monthly savings (₹)
- Actual monthly savings (calculated from consumption data or manually entered)
- Payback period (auto-calculated)

**Savings Dashboard:**
- Cumulative savings since engagement start
- Savings breakdown by improvement measure
- Savings vs. consultant fee comparison (ROI proof)
- Savings trend chart over time
- Projected annual savings at current rate

### 4.9 ROI Calculator (Customer Value Feature)

Pre-investment analysis tool for proposed improvements:

**Inputs:**
- Improvement type (Solar, VFD, LED, Power Factor, Compressed Air, etc.)
- Investment cost
- Expected energy savings (kWh/month or %)
- Current tariff rates
- Applicable government subsidies

**Outputs:**
- Net investment after subsidies
- Monthly savings (₹)
- Payback period (months)
- 5-year / 10-year / lifetime savings
- Internal Rate of Return (IRR)

**Pre-built calculators:**
- Solar rooftop ROI (with MNRE subsidy)
- VFD installation ROI
- LED lighting retrofit ROI
- Power factor correction ROI
- Compressed air system optimization ROI

### 4.10 Utility Bill Analyzer (Customer Value Feature)

Upload and analyze monthly utility bills:

**Features:**
- Manual entry or photo/PDF upload of utility bills
- Extract: units consumed, demand, power factor, penalties, total amount
- Flag anomalies: unexpected spikes, power factor penalties, demand charges
- Time-of-Day tariff analysis (peak vs. off-peak consumption patterns)
- 12-month bill trend analysis
- Discrepancy check: metered readings vs. billed units
- Recommendation engine: "Shift 20% of load to off-peak hours to save ₹12K/month"

### 4.11 Pre-Audit Readiness Check

Mock audit simulation before the actual certification audit:

**Features:**
- Walk through every requirement in the selected framework
- Check evidence availability per requirement (auto-detected from platform data)
- Flag missing documentation and incomplete items
- Generate readiness score with detailed punch list
- Consultant can add manual overrides / notes
- PDF export: "Pre-Audit Readiness Report" for client management

```
Pre-Audit Readiness: ZED Bronze — Unnathi CNC

Overall Readiness: 78% (14/18 requirements met)

✅ Energy sources identified and documented          [Auto: 5 sources in register]
✅ Energy targets set for all sources                [Auto: 5 active targets]
✅ Monthly consumption data available (6+ months)    [Auto: 8 months of data]
⚠️ Energy awareness training (need 80% attendance)   [Auto: 72% — need 2 more]
❌ Energy policy document not uploaded                [Missing document]
❌ Internal audit not conducted in last 6 months      [Last: 9 months ago]
✅ CAPA system in place with >70% closure rate       [Auto: 85% closure]
...

Action Items to Achieve Readiness:
1. Conduct makeup training for 4 employees (Target: Mar 20)
2. Upload signed energy policy document (Target: Mar 10)
3. Schedule and complete internal energy audit (Target: Apr 15)
```

### 4.12 Evidence Traceability Chain

Explicit linking from framework requirements to evidence to source data:

```
ZED Requirement 1: "Identify all energy sources"
├── Evidence: Energy Source Register (auto-linked from Energy Sources module)
├── Evidence: Meter calibration certificates (uploaded in Document Library)
└── Evidence: Site survey photos (uploaded in Document Library)

ZED Requirement 3: "Energy awareness training"
├── Evidence: Training program records (auto-linked from Training module)
├── Evidence: Attendance sheets (auto-linked from Training Attendance)
└── Evidence: Training certificates (uploaded per attendee)
```

**Features:**
- Auto-link module data to relevant requirements
- Manual evidence linking (upload documents, link to any entity)
- Evidence completeness indicator per requirement
- One-click evidence package download for auditors

### 4.13 Vendor Qualification & Certification Proof

When a client's OEM buyer asks "Are you certified?":

- **Shareable compliance dashboard** — Read-only public link showing compliance status
- **Auto-generated compliance letter** — Formal letter with framework status, scores, and validity
- **Evidence package download** — All certificates, reports, and evidence documents in one ZIP
- **QR code verification** — QR on printed certificates linking to live compliance status

### 4.14 Industry Benchmarking

Anonymous, aggregated cross-client comparison:

- Specific Energy Consumption (kWh/unit) vs. industry average
- Energy cost per unit of production vs. peers
- Compliance score percentile ranking
- Top improvement areas identified from benchmarking gaps
- Available only when sufficient anonymized data exists (10+ clients in same industry)

### 4.15 Government Scheme & Subsidy Tracker

- Curated database of applicable government schemes (ZED subsidy, PM-KUSUM, MSME tech upgradation, state-level schemes)
- Auto-match client profile to eligible schemes
- Track application status per scheme
- Estimate subsidy value
- Alert when new schemes are announced or deadlines approach

### 4.16 Safety Risk Score

Beyond compliance checkboxes — quantify actual safety risk:

**Risk Score (0-100):**
- Weighted calculation based on: inspection results, open findings severity, incident history, certification validity, overdue maintenance
- Risk breakdown by area (panel room, machine shop, DG room, etc.)
- Estimated liability exposure (₹) based on enforcement history
- Trend over time (is risk increasing or decreasing?)

### 4.17 Client Health Score (Consultant-facing)

Internal metric helping consultants prioritize their portfolio:

| Signal | Healthy | At Risk |
|--------|---------|---------|
| Data entry frequency | On schedule | Overdue readings |
| CAPA closure rate | >80% within deadline | Overdue CAPAs |
| Client responsiveness | Logging in weekly | No activity 30 days |
| Upcoming deadlines | Planned and assigned | Audit in 2 weeks, nothing prepared |
| Engagement duration | Active and engaged | Stagnant or declining |

### 4.18 Impact Report (Annual/Quarterly)

Auto-generated executive summary for client management:

```
📊 FY 2025-26 Impact Report for Unnathi CNC Technologies

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

Net Impact: ₹11.2L value delivered vs ₹1.8L consulting investment
ROI: 522%
```

### 4.19 Template Library

Reusable assets consultants build once, reuse across clients:

| Template Type | Examples |
|--------------|---------|
| Inspection checklists | Electrical safety inspection, fire safety, panel room check |
| Audit checklists | ZED internal audit, ISO 50001 management review |
| Action plan templates | ZED Bronze roadmap, ISO 50001 implementation plan |
| Policy document templates | Energy policy, safety policy, environmental policy |
| Training materials | Energy awareness slides, safety training outline |
| Report templates | Monthly energy report, quarterly compliance review |

**Features:**
- Create from scratch or clone from existing
- Organization-level templates (shared within consultant's firm)
- System templates (VoltSpark-provided, available to all)
- Version tracking

### 4.20 Consultant Dashboard (Portfolio View)

The consultant's home — all clients at a glance:

```
┌─────────────────────────────────────────────────────────────┐
│  📊 My Portfolio                          3 Active Clients  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Unnathi CNC          ██████████░░ 87%    ₹3.2L saved      │
│  ZED Bronze ✅  ISO 50001 🔄  Safety ✅   Health: 🟢       │
│                                                             │
│  Toyoda Gosei          ████████░░░░ 64%    ₹1.8L saved      │
│  ZED Silver 🔄  Safety 🔄                 Health: 🟡       │
│                                                             │
│  Kanoria Plastics      ████░░░░░░░░ 32%    Just started     │
│  ZED Bronze 🔄                             Health: 🟢       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ Alerts                                                  │
│  • Toyoda Gosei: Safety inspection overdue (3 days)         │
│  • Unnathi CNC: 2 certifications expiring in 15 days        │
│  • Kanoria Plastics: No consumption data entered this month │
│                                                             │
│  📅 Upcoming This Week                                      │
│  • Mon: Internal audit at Unnathi CNC                       │
│  • Wed: Safety training at Toyoda Gosei                     │
│  • Fri: Baseline assessment at Kanoria Plastics             │
└─────────────────────────────────────────────────────────────┘
```

### 4.21 Client Access (Configurable)

Three access modes per client workspace:

| Mode | Who enters data | Client sees |
|------|----------------|------------|
| **Consultant-managed** | Consultant only | Read-only dashboard, reports, cost savings |
| **Collaborative** | Both consultant and client employees | Full dashboard, can enter consumption/training data |
| **Self-service** | Client employees primarily | Full access; consultant monitors and advises |

### 4.22 Notifications

**v1 Channels:**
- Email (Resend)
- In-app notification center
- WhatsApp Business API (high-impact — Indian market differentiator)

**Notification Types:**
- Upcoming audit/inspection dates
- Overdue CAPAs and action items
- Certification expiry (30/15/7 days before)
- Deviation threshold exceeded
- Recurring task reminders
- Monthly energy cost summary
- New government scheme alerts

**Configuration:**
- Per-client notification preferences
- Consultant controls which notifications are active
- Client employees can mute non-essential alerts

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | Already in use; SSR + API routes |
| **Styling** | Tailwind CSS | Already in use; rapid UI development |
| **Auth** | NextAuth v4 → evaluate Auth.js v5 | Multi-tenant sessions, OAuth support |
| **Database** | Turso (libSQL) | Already deployed; edge-ready, SQLite-compatible |
| **ORM** | Prisma 7 (driver adapters) | Already in use; type-safe, migrations |
| **File Storage** | Vercel Blob or S3-compatible | Document uploads, photos, certificates |
| **Email** | Resend | Transactional emails (invites, alerts, reports) |
| **WhatsApp** | WhatsApp Business API (via provider) | Notifications for Indian market |
| **Charts** | Recharts (existing) + enhanced | Energy analytics, trend charts |
| **PDF** | React-PDF or Puppeteer | Report generation |
| **Hosting** | Vercel | Already deployed; serverless, edge |
| **Payments** | Razorpay (future) | When monetization is added |

### 5.2 Database Schema (Conceptual)

**Core Multi-Tenancy Models:**

```
Organization {
  id, name, slug, logo, website
  plan (FREE / PRO / ENTERPRISE)
  createdAt, updatedAt
}

Client {
  id, organizationId → Organization
  name, slug, address, industry, employeeCount
  accessMode (CONSULTANT_MANAGED / COLLABORATIVE / SELF_SERVICE)
  gridTariffRate, solarTariffRate, dgTariffRate    // ₹/kWh for cost calc
  contractDemand, powerFactorTarget                 // utility contract params
  baselineYear, baselineMonth                       // energy baseline period
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
```

**Framework Models:**

```
ComplianceFramework {
  id, name, version, description, isSystem
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

RequirementEvidence {
  id, requirementStatusId → RequirementStatus
  documentId → Document (nullable)
  linkedEntityType, linkedEntityId   // polymorphic link to module data
  description, addedById → User, addedAt
}
```

**Customer Value Models:**

```
SavingsMeasure {
  id, clientId → Client
  name, description, category
  investmentCost, implementationDate
  estimatedMonthlySavings, actualMonthlySavings
  paybackMonths (auto-calculated)
  status (PLANNED / IMPLEMENTED / VERIFIED)
  createdById → User
}

UtilityBill {
  id, clientId → Client
  month, year
  unitsConsumed, demandKVA, powerFactor
  demandCharges, energyCharges, penalties, totalAmount
  documentId → Document (nullable — uploaded bill)
  enteredById → User
}

GovernmentScheme {
  id, name, issuingBody, description
  eligibilityCriteria, subsidyAmount, applicationDeadline
  documentationRequired, applicationUrl
  isActive
}

ClientScheme {
  id, clientId → Client, schemeId → GovernmentScheme
  status (ELIGIBLE / APPLIED / APPROVED / RECEIVED / NOT_ELIGIBLE)
  applicationDate, approvalDate, amountReceived
  notes
}
```

**Safety & Inspection Models:**

```
InspectionTemplate {
  id, frameworkId, organizationId (nullable), title, description
  items: InspectionItem[]
}

InspectionItem {
  id, templateId, category, question
  type (PASS_FAIL / TEXT / NUMERIC / PHOTO)
  order, isCritical
}

Inspection {
  id, clientId, templateId, inspectorId → User
  scheduledDate, completedDate, status, overallResult
  riskScore (auto-calculated)
  responses: InspectionResponse[]
}

InspectionResponse {
  id, inspectionId, itemId, result, notes, photoUrl
  correctiveActionRequired, correctiveActionNotes
}

Incident {
  id, clientId, reportedById → User
  type (ELECTRICAL / FIRE / MECHANICAL / OTHER)
  severity (NEAR_MISS / MINOR / MAJOR / FATAL)
  date, location, description, immediateAction
  rootCause, correctiveAction
  status (OPEN / INVESTIGATING / CORRECTIVE_ACTION / CLOSED)
  closedAt, closedById → User
}

Certification {
  id, clientId
  holderId → User (nullable), equipmentName (nullable)
  type (CEI_LICENSE / WIREMAN / SAFETY_OFFICER / EQUIPMENT_TEST / OTHER)
  name, issuingAuthority, certificateNumber
  issueDate, expiryDate
  documentId → Document (nullable)
  status (VALID / EXPIRING_SOON / EXPIRED)
}
```

**Action Plan & Recurring Models:**

```
ActionPlan {
  id, clientId, clientFrameworkId → ClientFramework (nullable)
  title, description, targetDate
  status (ACTIVE / COMPLETED / ON_HOLD)
  createdById → User
}

ActionItem {
  id, actionPlanId → ActionPlan
  title, description
  assigneeId → User, dueDate
  status (PENDING / IN_PROGRESS / DONE / BLOCKED)
  requirementId → FrameworkRequirement (nullable)
  evidenceDocumentId → Document (nullable)
  completedAt, order
}

RecurringSchedule {
  id, clientId
  title, description
  frequency (DAILY / WEEKLY / MONTHLY / QUARTERLY / SEMI_ANNUAL / ANNUAL / CUSTOM)
  customIntervalDays (nullable)
  linkedModule (CONSUMPTION / INSPECTION / AUDIT / TRAINING / REVIEW)
  assigneeId → User (nullable)
  startDate, endDate (nullable)
  isActive
}

RecurringInstance {
  id, scheduleId → RecurringSchedule
  dueDate, completedDate
  status (PENDING / COMPLETED / SKIPPED / OVERDUE)
  completedById → User (nullable)
  linkedEntityId (nullable)   // link to the created entity (e.g., consumption entry)
}
```

**Existing Models Enhanced:**

```
// All existing models get clientId:
EnergySource      { ...existing, clientId → Client, costPerUnit }
EnergyTarget      { ...existing, clientId → Client, costTarget }
ConsumptionEntry  { ...existing, clientId → Client, cost (auto-calculated) }
TrainingProgram   { ...existing, clientId → Client }
Audit             { ...existing, clientId → Client }
CAPA              { ...existing, clientId → Client }

Document {
  id, clientId, uploadedById → User
  category (POLICY / CERTIFICATE / AUDIT_REPORT / TEST_REPORT / PHOTO / BILL / OTHER)
  name, fileUrl, fileSize, mimeType
  linkedToType, linkedToId
  uploadedAt
}

Notification {
  id, userId → User, clientId → Client
  type, title, message, actionUrl
  channel (IN_APP / EMAIL / WHATSAPP)
  isRead, sentAt, createdAt
}

AppSetting  { ...existing, clientId → Client (nullable for platform-level) }
AuditLog    { ...existing, clientId → Client }
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
│   ├── /console/templates                    # Template library
│   └── /console/settings                     # Organization settings
├── /w/[client-slug]                          # Client workspace
│   ├── /w/[slug]/dashboard                   # Client dashboard (energy cost + compliance)
│   ├── /w/[slug]/energy-sources              # Energy sources
│   ├── /w/[slug]/consumption                 # Consumption log
│   ├── /w/[slug]/targets                     # Energy targets
│   ├── /w/[slug]/costs                       # Energy cost dashboard
│   ├── /w/[slug]/savings                     # Savings tracker
│   ├── /w/[slug]/bills                       # Utility bill analyzer
│   ├── /w/[slug]/training                    # Training management
│   ├── /w/[slug]/audits                      # Audits
│   ├── /w/[slug]/capa                        # CAPA
│   ├── /w/[slug]/inspections                 # Safety inspections
│   ├── /w/[slug]/incidents                   # Incident register
│   ├── /w/[slug]/certifications              # Certification tracker
│   ├── /w/[slug]/compliance                  # Framework compliance & gap analysis
│   ├── /w/[slug]/action-plans                # Improvement action plans
│   ├── /w/[slug]/documents                   # Document library
│   ├── /w/[slug]/reports                     # Reports & evidence
│   ├── /w/[slug]/schemes                     # Government schemes
│   └── /w/[slug]/settings                    # Client settings
├── /share/[token]                            # Public shareable compliance view
└── /admin                                    # Platform admin (VoltSpark team)
```

---

## 6. Phased Roadmap

### Phase 1: Multi-Tenant Foundation + Energy Costs (Weeks 1-4)

**Goal:** Multi-tenant architecture. Consultant manages multiple clients. Energy data becomes financial data.

**Status:** ~80% complete

**Deliverables:**
- [x] Organization, Client, Membership, ClientAccess models
- [x] Prisma schema overhaul + migration
- [ ] Registration flow (invitation-only) for consultants
- [x] Client workspace creation with company details + tariff config
- [x] Workspace switcher in sidebar
- [x] Migrate all existing modules to be client-scoped (add clientId)
- [x] Role-based access control (consultant vs client admin vs employee)
- [x] Console dashboard (portfolio view for consultants)
- [ ] Invite client users via email
- [x] Energy Cost Dashboard (₹ view of consumption data)
- [x] Cost fields on energy sources and consumption entries
- [x] Migrate Unnathi CNC data into new multi-tenant structure
- [ ] URL routing update (/w/[slug]/...)
- [x] Auth system update for multi-tenant sessions
- [x] Middleware for tenant isolation

**Remaining Phase 1 items:**
- Registration/invite flow for consultants and client users
- URL routing update with `/w/[slug]/...` pattern

### Phase 2: Framework Engine + Safety + Utility Bills (Weeks 5-8)

**Goal:** Configurable compliance frameworks. Electrical Safety as second framework. Utility bill analysis for immediate ₹ impact. Safety risk quantification.

**Deliverables:**

**2A — Framework Engine (Core)**
- [x] ComplianceFramework, FrameworkRequirement, ClientFramework, RequirementStatus models
- [x] Built-in ZED template (5 energy requirements mapped to existing modules)
- [x] Built-in ISO 50001 template (Plan-Do-Check-Act clauses)
- [x] Built-in Electrical Safety template (IE Rules, IS standards)
- [x] Framework assignment to clients (multiple frameworks per client)
- [x] Requirement tracking UI (status, evidence links, notes per requirement)
- [x] Evidence traceability chain (link module data → requirements automatically)
- [x] Gap analysis view (visual compliance matrix — what's done, what's missing)
- [x] Per-framework compliance scoring (weighted by requirement criticality)
- [ ] Baseline assessment / initial survey flow (onboarding questionnaire per framework)
- [x] Pre-audit readiness check (are all requirements met before the auditor arrives?)

**2B — Safety Modules**
- [x] Inspection checklists module (configurable templates — electrical, fire, general safety)
- [ ] Inspection template builder (consultants create custom checklists)
- [x] Incident register module (incident reports, near-misses, RCA, follow-up actions)
- [x] Certification tracker with expiry alerts (CEIG, BIS, Fire NOC, pressure vessels)
- [x] Compliance calendar view (all certifications/tests with due dates across clients)
- [x] Safety Risk Score — weighted scoring model:
  - Earthing system integrity (20%)
  - Protection devices — ELCB/MCB/RCBO (15%)
  - Panel condition — thermography, labeling (15%)
  - Statutory certifications current (15%)
  - Maintenance schedule adherence (10%)
  - Safety training completion (10%)
  - Incident history (10%)
  - Emergency preparedness (5%)
- [ ] Liability estimation in ₹ (based on CEIG enforcement data — fines, compensation, shutdown cost)
- [x] Risk level classification (Critical/High/Moderate/Low/Excellent)

**2C — Utility Bill Analyzer** _(new — from CUSTOMER-VALUE.md)_
- [x] UtilityBill model (month, provider, units consumed, demand kVA, power factor, penalty breakdown, total amount, tariff category)
- [x] Monthly bill entry form (structured data entry for BESCOM/CESC/MESCOM bills)
- [x] Auto-analysis dashboard:
  - Power factor trend + penalty amount detection (₹/kVAh surcharge for PF < 0.90)
  - Demand charges vs. contracted demand (kVA overshoot detection)
  - Bill anomaly detection (>20% spike from previous month)
  - Tariff category mismatch flag (commercial vs. industrial tariff)
  - [ ] Estimated vs. actual billing flag (BESCOM didn't read meter)
  - Fuel surcharge and tax component breakdown
- [x] 12-month bill trend with month-over-month comparison
- [x] Red flag auto-detection with ₹ impact quantification
- [x] Bill-level cost breakdown linked to Energy Cost Dashboard

**2D — Enhanced Energy Cost Dashboard** _(enriching Phase 1 work)_
- [x] Power factor tracking with penalty risk estimate (₹ exposure per quarter)
- [x] Peak demand utilization gauge (current vs. contracted kVA)
- [ ] Time-of-Day consumption pattern (peak/off-peak/shoulder hours)
- [ ] Predicted next month cost (linear trend projection)
- [ ] Cost per unit of production (₹/kg, ₹/piece — requires production volume input field on Client)

### Phase 3: Action Plans, Savings & Documents (Weeks 9-12)

**Goal:** Consultant workflow tools. Prove financial value to clients. The savings tracker is the killer feature that makes consultants sell VoltSpark.

**Deliverables:**

**3A — Savings Tracker** _(the feature that justifies consultant fees)_
- [x] Improvement model (name, type, investment cost, installation date, linked energy source)
- [ ] Baseline period establishment (3-month average consumption before improvement)
- [x] Post-implementation measurement (actual consumption after improvement)
- [ ] Normalization engine (adjust for production volume, weather, operating hours)
- [x] Per-improvement savings attribution (isolate savings from each specific change)
- [x] Cumulative savings running total with month-by-month breakdown
- [ ] Savings categories: energy cost reduction, penalty avoidance, maintenance reduction, subsidy income, insurance reduction
- [ ] Consultant fee vs. savings comparison (ROI proof screen)
- [x] Savings dashboard — the screen consultants screenshot in every client meeting

**3B — ROI Calculator**
- [x] Pre-built ROI templates with industry-standard parameters:
  - Solar rooftop (system size, irradiance, tariff, subsidy, degradation rate)
  - VFD installation (motor HP, load profile, tariff)
  - Power factor correction (current PF, target PF, kVAR, penalty rate)
  - LED retrofit (fixtures, wattage old vs new, operating hours)
  - Compressed air optimization (compressor kW, leak %, target reduction)
  - IE3 motor replacement (motor HP, hours, efficiency old vs new)
  - Transformer replacement (no-load + load losses, utilization)
- [x] Key calculations: simple payback, NPV, IRR, monthly cash flow projection
- [ ] Sensitivity analysis (what if tariff increases 5%/year?)
- [x] Subsidy impact on payback period
- [x] Carbon reduction estimate (tonnes CO2/year)
- [ ] "Add to Action Plan" and "Share with Client" actions

**3C — Action Plans & Documents**
- [x] Action plan module (improvement roadmaps with milestones, owners, deadlines)
- [ ] Action plan templates per framework (ZED improvement plan, ISO 50001 implementation plan)
- [ ] Recurring schedules engine (monthly inspections, quarterly audits, annual certifications)
- [x] Document library with file uploads (Vercel Blob)
- [x] Link documents to any entity (audit, training, inspection, CAPA, improvement)
- [ ] Template library (inspection, audit, action plan, policy document templates)
- [ ] Bulk data import (CSV/Excel for consumption readings, training records)

**3D — Reports & Export**
- [ ] Enhanced reports with PDF export
- [ ] Impact report generation (quarterly/annual) — 8-section structure:
  1. Executive Summary (one-page highlights with key ₹ numbers)
  2. Energy Performance (consumption trend, cost trend, savings, source mix)
  3. Compliance Status (framework-wise progress, certifications achieved)
  4. Safety Performance (risk score trend, incidents, inspections completed)
  5. Financial Impact (total savings, subsidies claimed, penalties avoided, vendor qualifications)
  6. Improvement Roadmap (completed this period, planned for next period)
  7. Consultant Recommendations (top 3 priorities with estimated ROI)
  8. Benchmarking (how client compares to industry peers)
- [ ] Report distribution: PDF download, email to stakeholders, presentation mode
- [ ] Configurable client access modes (consultant-managed, collaborative, self-service)
- [ ] Data export (client can export all their data as CSV/JSON)

### Phase 4: Notifications, Analytics & Launch (Weeks 13-16)

**Goal:** Production-ready. Notifications. Analytics. Government schemes. Beta launch.

**Deliverables:**

**4A — Notifications**
- [ ] Email notification system (Resend)
- [ ] WhatsApp notifications (Business API)
- [ ] In-app notification center
- [ ] Notification preferences per client
- [ ] Trigger types: certification expiry (30/15/7 days), audit due, CAPA overdue, bill anomaly, safety risk change

**4B — Analytics & Benchmarking**
- [ ] Consultant analytics dashboard (cross-client insights, portfolio health)
- [ ] Client health score (composite of compliance, safety, cost trend, engagement)
- [ ] Industry benchmarking (anonymous, aggregated — requires min 5 facilities per category):
  - Specific energy consumption (kWh/unit of output)
  - Energy cost per unit (₹/kg, ₹/piece)
  - Power factor comparison
  - Renewable energy share (%)
  - Safety incident rate
  - Compliance score
  - Maintenance downtime
- [ ] Trend charts and historical analysis (12-month, YoY)

**4C — Government Schemes & Subsidies**
- [ ] Government scheme database (ZED subsidy, PM-KUSUM, CLCSS, BEE awards, state incentives)
- [ ] Auto-eligibility matching based on client profile (Udyam number, industry, size, location, certifications)
- [ ] Application checklist (documents needed, forms to fill)
- [ ] Deadline tracking with reminders
- [ ] Application status tracking
- [ ] Historical record of subsidies claimed (total ₹ unlocked per client)

**4D — Vendor Qualification & Shareable Views**
- [ ] Vendor qualification / shareable compliance view (/share/[token])
- [ ] Public URL with branded template (company logo, VoltSpark watermark)
- [ ] QR code for physical display in factory reception
- [ ] Downloadable PDF compliance summary
- [ ] Real-time status (not a stale certificate)
- [ ] Evidence trail (auditor can drill down into specific requirements)
- [ ] Expiry date visibility (buyer knows when re-certification is due)

**4E — Launch Readiness**
- [ ] Mobile-responsive optimization / PWA
- [ ] Onboarding flow for new consultants (guided setup wizard)
- [ ] Landing page at volt-spark.vercel.app
- [ ] Demo environment with seed data (multiple industries)
- [ ] Security audit (OWASP top 10, tenant isolation verification)
- [ ] Performance optimization (page load <2s all routes)
- [ ] Beta launch with 3-5 consultants

---

## 7. Success Metrics

### Launch Targets (Month 1-3 post-launch)
- 5-10 consultants onboarded
- 15-30 client workspaces created
- At least 2 frameworks actively used per consultant
- Weekly active usage by >60% of onboarded consultants

### Customer Value Metrics (the ones that matter)
- Total energy cost savings tracked across platform (₹)
- Average savings per client per month (target: ₹50K+ for CNC shops)
- Penalties avoided per client per quarter (PF, demand, regulatory)
- Number of certifications achieved via VoltSpark
- Government subsidies captured (₹) — target: ₹1-5L per eligible client
- Safety incidents (trending down per client)
- Safety risk score improvement (quarter-over-quarter)
- Utility bill anomalies detected and ₹ recovered

### Product-Market Fit Indicators
- Consultants inviting their clients without prompting
- Clients logging in independently (not just consultant-driven)
- Report generation frequency >2x per client per month
- Consultant referrals (organic growth)
- Savings tracker being updated regularly (proof of value delivery)
- Utility bills entered monthly by >80% of active clients
- Consultant uses Impact Report in client meetings

### Quality Metrics
- Page load time <2s (all routes)
- Zero data leakage between tenants
- 99.9% uptime
- <24h response time for support

---

## 8. Open Questions & Decisions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Database for scale | Single Turso DB (row isolation) vs. DB-per-tenant | Start with single DB |
| 2 | Auth migration | NextAuth v4 vs. Auth.js v5 | Evaluate in Phase 1 |
| 3 | Custom domains | Consultants use own domain for client portals | Future — not in v1 |
| 4 | Offline/PWA | Factory floor data entry with limited connectivity | Evaluate in Phase 4 |
| 5 | Mobile app | Native vs. PWA vs. responsive only | Responsive + PWA |
| 6 | Data export | Client exports all their data | Phase 3 |
| 7 | Pricing model | Per-client vs. per-seat vs. freemium | Decide after beta |
| 8 | Localization | Hindi / regional language support | Future — English only v1 |
| 9 | Auto-fill policy docs | Template policy documents with client data | Phase 3 with templates |
| 10 | Carbon footprint | CO₂ tracking for ESG / export requirements | Future enhancement |

---

## 9. Competitive Landscape

| Competitor | What They Do | VoltSpark Differentiator |
|-----------|-------------|------------------------|
| isoTracker | ISO document management | Multi-framework + energy cost analytics |
| Qualityze | Enterprise QMS | Affordable for SME consultants; outcome-focused |
| SafetyCulture (iAuditor) | Inspection/audit platform | Energy compliance + cost savings tracking |
| Custom Excel/tools | Consultant-built spreadsheets | Productized, multi-client, savings measurement |
| ZED Portal (QCI) | ZED application tracking | Full compliance management, not just application |

**VoltSpark's wedge:** No platform exists that combines energy cost analytics + multi-framework compliance + safety management for independent consultants serving Indian MSMEs. And none of them measure and prove the financial value delivered to clients.

---

## 10. Non-Goals (Out of Scope for v1)

- Real-time IoT meter integration
- AI-powered compliance recommendations
- Marketplace/directory of consultants
- Billing/subscription management
- White-label/custom branding per consultant
- API for third-party integrations
- Multi-language support
- Native mobile apps
- Carbon credit trading
- Insurance integration
