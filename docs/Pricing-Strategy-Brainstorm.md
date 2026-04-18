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

## Resolved Questions

| # | Question | Decision |
|---|---|---|
| 1 | Free tier user limit | **Unlimited users** — upgrade trigger is IoT meters, not users |
| 2 | Free tier data retention | **2 years** — covers two ZED/ISO audit cycles with buffer |
| 3 | IoT starter price point | **₹2,999/month base** — but meter capability tiers need further brainstorm (see below) |
| 4 | What counts as one meter | **One physical smart meter device** — gateway connecting 5 = 5 meters billed |
| 5 | Data entry discipline | **Agreed** — 5 product features to build (stale banner, onboarding checklist, bill reminder, weekly reminder, PWA promotion) |
| 6 | Pricing page consistency | **Fix at end** — update all pages in one pass after pricing finalised |
| 7 | B2C vs B2B2C pricing | **Same price** — avoids consultant bypass conflict |
| 8 | Professional manual tier | **Binary (A)** — free manual / paid IoT only. Add middle tier later if demand proven |
| 9 | Multi-site billing | **Per-site billing** — each factory = separate client workspace, billed separately |
| 10 | Consultant billing | **Monthly auto-debit** — Razorpay/Stripe. Manual invoicing until 10+ paying consultants |

---

## Open Question — Q3 Deep Dive: Meter Capability Tiers

**The problem:** Not all smart meters are equal. A basic sub-meter measures 1–2 parameters (kWh only). An advanced meter measures 15+ parameters (kWh, kVAh, kVARh, kW, kVA, kVAR, V per phase, A per phase, PF, Hz, max demand, TOU, load profile). The analytics and predictive maintenance capabilities available to VoltSpark differ enormously based on what the meter reports.

Flat per-meter pricing does not reflect this — a basic meter and an advanced meter are not the same billing unit.

### Meter capability tiers observed in the field

| Tier | Parameters measured | Examples | Analytics VoltSpark can offer |
|---|---|---|---|
| **Basic** | kWh only, or kWh + kVA + PF | Simple sub-meter, legacy meters | Consumption trend, basic cost tracking |
| **Standard** | + V per phase, A per phase, Hz | Most Schneider EM1200-class | + PF monitoring, phase imbalance alert |
| **Advanced** | + Max demand, TOU, load profile | Schneider EM6400NG+, Conzerv | + Demand overshoot prediction, tariff optimisation, load profiling |
| **Power Quality** | + THD voltage, THD current, harmonics, sag/swell events | Dedicated PQ analysers | + Harmonic filter sizing, equipment damage prediction, EN 50160 compliance |

### Why this matters for pricing

A customer paying ₹2,999/month for 3 basic meters (kWh only) gets consumption trends.
A customer paying ₹2,999/month for 3 advanced meters gets demand prediction, PF alerts, load profiling, and tariff optimisation.
Same price. Very different value. Very different data volume and processing cost.

### Proposed approach: Decouple meter ingestion from analytics

**Layer 1 — Meter data ingestion** (per meter, tiered by capability):

| Meter class | Parameters | Monthly per meter |
|---|---|---|
| Basic | Up to 4 parameters (kWh, kVA, PF, Hz) | ₹200 |
| Standard | 5–10 parameters (+ V/A per phase, frequency) | ₹400 |
| Advanced | 11–15 parameters (+ max demand, TOU, load profile) | ₹700 |
| Power Quality | 15+ parameters (+ THD, harmonics, sag/swell) | ₹1,200 |

**Layer 2 — Analytics modules** (per site, on top of ingestion):

| Module | Requires | Monthly |
|---|---|---|
| Demand & Tariff Optimisation | Advanced meters | ₹1,500 |
| Power Quality Analysis | PQ meters | ₹2,000 |
| Compressed Air Intelligence | Flow meter + energy meter | ₹1,500 |
| Kitchen Intelligence | Standard+ meters on kitchen loads | ₹4,000 |
| Predictive Maintenance Alerts | Advanced or PQ meters | ₹2,000 |

**Example pricing for a 30-machine factory:**
- 1 Advanced incomer meter: ₹700
- 4 Standard feeder meters: 4 × ₹400 = ₹1,600
- 1 Basic DG meter: ₹200
- Demand & Tariff Optimisation module: ₹1,500
- **Total: ₹4,000/month**

**Example pricing for a 2-machine shop:**
- 1 Standard incomer meter: ₹400
- 1 Basic sub-meter: ₹200
- **Total: ₹600/month** (no analytics module needed to start)

### Open sub-questions on meter tiers

- [ ] Do we sell/recommend specific meter classes, or let customers use whatever they have?
- [ ] If a customer has a mix (2 advanced + 3 basic), is billing obvious enough?
- [ ] Should the ₹2,999 minimum floor still apply, or does per-meter pricing stand alone?
- [ ] Predictive maintenance — is this a separate module or included in Advanced meter tier?
- [ ] How does this interact with the existing add-on modules (Power Quality, Compressed Air, Kitchen)?

---

## What Has Not Been Decided Yet

- [ ] Final IoT per-meter pricing tiers (Basic / Standard / Advanced / PQ)
- [ ] Whether a ₹2,999/month minimum floor applies for IoT tier
- [ ] How predictive maintenance alerts are priced
- [ ] How add-on modules (Power Quality, Compressed Air, Kitchen) interact with meter tiers
- [ ] Pricing for API access for large customers
- [ ] Pricing for data export beyond standard CSV

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
