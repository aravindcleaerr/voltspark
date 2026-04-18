# VoltSpark — Pricing Strategy Brainstorm

**Started:** April 2026
**Status:** Work in progress — open questions remain
**Context:** Triggered by building partner + investor + customer pitch pages and realising the current flat ₹2,999/month model doesn't hold up under scrutiny.

---

## The Problem with the Original Pricing

The original assumption was a flat ₹2,999/month per client site regardless of size. This breaks down immediately:

- A 2-CNC-machine shop and a 30-CNC-machine plant are the "same client" on the platform but completely different in value delivered, data generated, and ability to pay.
- There is no distinction between manual entry (very low infrastructure cost) and IoT metering (very high infrastructure cost).
- The flat fee is simultaneously too expensive for small facilities and too cheap for large ones.

---

## Key Terminology (Agreed)

| Term | What it means | Examples |
|---|---|---|
| **Energy source** | Supply-side input — where energy comes from | BESCOM grid, DG set, solar rooftop, gas line |
| **Energy consumption point** | Demand-side — what consumes the energy | CNC machine, compressor, HVAC, lighting feeder, furnace |
| **Meter** (manual) | Standard utility meter customer reads manually | BESCOM incomer meter, DG hourmeter |
| **Smart meter** (IoT) | Connected meter that pushes data automatically | Schneider EM6400, Titan meter |

**Why this matters for pricing:** A 30-machine factory may have 3 energy sources but 30+ consumption points. Pricing must account for both dimensions — not just one.

---

## The Two Customer Modes

### Manual Entry Mode (Current baseline)
- Customer has a standard meter (BESCOM or sub-meter)
- They physically read the meter and type the value into VoltSpark
- Typical entry frequency: once a day (if disciplined), or once a week
- Data volume: ~30–200 rows/month depending on number of sources and points tracked
- Infrastructure cost to VoltSpark: **very low**
- Value to customer: trends, bill analysis, compliance tracking, CAPA

**Critical risk:** If the customer does not enter data regularly, VoltSpark becomes useless. The platform must prompt and remind them. This is a product responsibility, not just a sales one.

Instruction to give every new customer:
> "For VoltSpark to show you meaningful trends and flag anomalies, enter your meter readings at least once a week. Enter your utility bill every month within 3 days of receiving it. The more consistent you are, the more VoltSpark can show you."

### IoT Metering Mode (Upgrade path)
- Customer installs smart meters on their energy sources and/or machines
- Hardware is supplied and installed by a third-party electrical contractor (not VoltSpark)
- Smart meter pushes data automatically to VoltSpark via gateway
- Data volume: up to 1,440 readings/meter/day at 1-minute intervals
- Infrastructure cost to VoltSpark: **significantly higher** — database writes, storage, processing, backups
- Value to customer: real-time visibility, automatic anomaly detection, no manual work

**The IoT upgrade path is natural:** Customer starts free on manual, builds habits and data history, then when they have budget, upgrades to IoT within VoltSpark. No migration, no switching cost.

---

## What Drives Infrastructure Cost

| Cost driver | Manual entry | IoT (per meter) |
|---|---|---|
| Database rows/month | 30–200 | 43,200–1,44,000 |
| Storage growth | Negligible | Significant |
| Backup & recovery | Simple | Complex |
| Query load (dashboards) | Low | High |
| Data security exposure | Low | High — real operational data of a factory |
| Retention requirement | 2–3 years (ZED/ISO audit cycle) | 2–3 years minimum |

**Audit cycle context:** ZED and ISO 50001 audits happen every 6–12 months. A customer needs at least 2 years of history to cover two audit cycles with buffer. Data retention of 2–3 years should be the standard, not an upsell.

**Security at scale:** A large factory's IoT data is sensitive IP. Production patterns, machine utilisation, downtime events — this is operational intelligence that must be protected. As data grows, security obligations grow with it.

---

## The Core Insight: Freemium Model

**Free:** Core platform with manual entry — always free
**Paid:** IoT data ingestion — priced per smart meter connected

**Why this works:**

1. **Removes all adoption friction.** A prospect met in a sales visit can sign up before the meeting ends. No invoice approval needed.

2. **Data becomes the lock-in.** After 6–12 months of consistent manual entry — bills, consumption patterns, CAPA records, compliance evidence — the customer has a compliance history they will not rebuild elsewhere.

3. **Infrastructure cost aligns with revenue.** Manual entry is nearly free to host. IoT is expensive. Charging for IoT means the revenue covers the cost it creates.

4. **B2B2C adoption accelerates.** Consultants will onboard all their clients on the free tier quickly. Each free client is a future IoT upsell.

5. **Natural upgrade path.** "You've been using VoltSpark manually for 6 months. When you're ready to go real-time, smart meters connect to the same platform — no migration."

---

## Proposed Pricing Framework (Draft — Not Final)

### Free Tier — Core Platform (Manual Entry)

**Included:**
- Unlimited energy sources and consumption points (manual entry)
- Utility bill analysis and anomaly detection
- Energy cost dashboard (₹ view)
- Full compliance tracking: ZED, ISO 50001, Electrical Safety
- Audit management + findings
- CAPA workflow
- Training programs + attendance
- Certifications with expiry alerts
- Safety inspections and incidents
- Savings tracker + ROI calculator (7 templates)
- Government scheme eligibility checker
- Shareable compliance report (vendor qualification)
- PDF reports + data export
- 2 years data retention
- Up to 3 users

**Why free:** Manual entry has negligible infrastructure cost. Giving this away builds the user base that funds the IoT tier.

---

### IoT Tier — Smart Meter Data Ingestion (Paid)

Priced **per smart meter connected** — because each meter is a continuous data stream that drives real infrastructure cost.

| Meters connected | Monthly fee | Per additional meter |
|---|---|---|
| 1–3 meters | ₹3,000 flat | — |
| 4–8 meters | ₹3,000 + ₹600/meter | above 3 |
| 9–20 meters | ₹6,600 + ₹500/meter | above 8 |
| 21+ meters | Custom pricing | — |

**Example calculations:**
- 2-machine shop (3 smart meters): ₹3,000/month
- Mid-size factory (8 meters): ₹3,000 + (5 × ₹600) = ₹6,000/month
- 30-machine plant (13 meters): ₹6,600 + (5 × ₹500) = ₹9,100/month
- Large plant (20 meters): ₹6,600 + (12 × ₹500) = ₹12,600/month

**What IoT tier includes (on top of free):**
- Automatic data ingestion from all connected smart meters
- Real-time dashboard (live kW, PF, voltage per meter)
- Automatic ConsumptionEntry creation (no manual logging needed)
- Anomaly alerts (threshold breaches, deviations, PF drops)
- Higher data retention: 3 years
- Up to 10 users (more operational staff need access)

---

### Intelligence Add-On Modules (Optional, on top of IoT tier)

These modules add domain-specific analysis on top of the raw IoT data stream.

| Module | What it adds | Monthly |
|---|---|---|
| Power Quality | Voltage sags/swells, THD, harmonics, PF trend, EN 50160 score | ₹2,000 |
| Compressed Air Intelligence | Specific energy (kWh/m³), leak detection, load factor, compressor benchmarking | ₹1,500 |
| Kitchen Intelligence | Live demand vs contracted kVA, load shedding alerts, ToD analytics, HACCP temperature | ₹4,000 |

**Note:** These modules require IoT meters to be installed and the IoT tier to be active. They cannot run on manual entry alone.

---

### B2B2C Model (Consultant-Mediated)

When a consultant brings a client to VoltSpark:

- Free tier: Consultant manages the client at no cost. Client stays free on manual entry.
- IoT tier: Consultant earns 30% recurring commission on the IoT tier fee.
- Add-on modules: Consultant earns 30% recurring commission on each module.

**The consultant's business model:**
- Uses free tier to demonstrate value and build compliance history
- When client is ready for IoT, consultant arranges hardware (through Lotus Controls / Titan / other partner)
- Client pays VoltSpark for IoT tier; consultant receives commission
- Consultant's fee for consulting services is separate (charged directly to client)

---

## Open Questions (To Resolve)

### 1. Free tier user limit
Currently proposed: 3 users on free.
Question: Is 3 enough? A 30-machine factory has shift supervisors, safety officer, manager, accounts all wanting access. But unlimited users on free may reduce upgrade pressure.
**Options:** 3 users free / 10 users free / unlimited free with premium roles (admin vs viewer)

### 2. Free tier data retention
Currently proposed: 2 years on free.
Question: Is 2 years enough for ZED/ISO audits (which happen every 6–12 months)?
**Likely answer:** Yes — 2 audit cycles with buffer. No need to upsell retention.

### 3. Should Starter IoT (1–3 meters) be cheaper?
₹3,000/month for 3 meters = ₹1,000/meter. Is that the right price point for a small shop?
Consider: Their electricity bill is ₹1–3L/month. ₹3,000 is 1–3% of bill. Generally acceptable if value is demonstrated.

### 4. What counts as one "meter" for billing?
One physical smart meter device = one meter for billing.
If one gateway connects 5 meters, that is 5 meters on the billing count.
Manual meters (standard BESCOM meters) do not count — they are free.

### 5. Data entry discipline — product features needed
The free manual tier only works if customers enter data. Required product features:
- [ ] Weekly reminder email: "Your data is 7 days old. Enter your readings."
- [ ] Monthly bill reminder: "Add your BESCOM bill for this month."
- [ ] Dashboard warning banner when data is stale (>7 days)
- [ ] Onboarding checklist: enter first 3 bills, set up energy sources, set first target
- [ ] Mobile-friendly entry (PWA already exists — needs to be promoted)

### 6. Pricing page consistency
Current state: `/start` page shows ₹2,999/month flat. Main landing page has different numbers. Both need to be updated once pricing is finalised.

### 7. B2C vs B2B2C pricing — should they differ?
Current proposal: Same pricing for both.
B2C: Customer pays VoltSpark directly.
B2B2C: Customer pays VoltSpark; consultant gets 30% commission.
**Question:** Should B2C be slightly cheaper (no commission to pay out) or the same (simpler to communicate)?

---

## What Has Not Been Decided Yet

- [ ] Final price points for IoT tier
- [ ] Free tier user limit
- [ ] Whether to have a paid "Professional" manual tier (e.g. more users, more retention, white-label reports) or keep it strictly binary: free manual / paid IoT
- [ ] How to handle multi-site customers (same company, multiple factories)
- [ ] Pricing for data export beyond standard CSV (e.g. API access for large customers)
- [ ] How consultants are billed (monthly invoice or self-serve card)

---

## What Has Been Decided

| Decision | Choice |
|---|---|
| Core platform | **Free** — manual entry always |
| Revenue driver | **IoT data ingestion** — paid per smart meter |
| Pricing unit | **Per smart meter connected** (not per client, not per energy source) |
| Infrastructure cost driver | IoT data volume, not manual entries |
| Upgrade path | Manual free → IoT paid, same platform, no migration |
| B2B2C commission | 30% of IoT tier + add-on fees, recurring |
| Data retention (free) | 2 years minimum |
| Audit cycle context | ZED/ISO every 6–12 months → 2 years sufficient |
| Hardware supply | Third-party contractors for B2C; partner (Lotus Controls / Titan) for B2B2C |
| Add-on modules | Intelligence layer on top of IoT, priced separately |
