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

### Industry Research Findings (April 2026)

**Indian competitors:** Zenatix (Schneider), Facilio, Acrel India, TrackSo — none publish per-meter pricing. All are custom/quote-based. This is a VoltSpark differentiator opportunity — transparent, published pricing.

**Global benchmarks found:**
- UK energy platforms: £2.19–£7.26/device/month = ₹230–760/meter/month
- Global IoT analytics SaaS: $3–18/device/month = ₹250–1,500/meter/month
- AWS IoT Core infrastructure cost: ~$0.042/meter/year (negligible — margin is in analytics, not ingestion)

**Indian market context:**
- MSMEs are price-sensitive; ROI typically expected in 12–24 months
- No standard published benchmark exists — VoltSpark can set the standard
- Smart meter hardware in India: ₹1,500–₹6,000 per meter (hardware cost, not SaaS)

### Resolved: Meter Capability Tiers with Pricing

**Decision (April 2026):**
- Pure per-meter pricing — no floor, no minimum
- Predictive maintenance **included in Advanced tier** (not a separate module)
- Analytics appropriate to meter class are **bundled into the tier**
- Domain-specific modules (Compressed Air, Kitchen) remain separate — they need site-level configuration beyond meter data

**Per-meter per-month pricing:**

| Tier | Parameters | Monthly | Analytics included |
|---|---|---|---|
| Basic | kWh, kVA, PF, Hz (up to 4) | ₹299 | Consumption trends, basic cost tracking |
| Standard | + V/A per phase, reactive power (5–10) | ₹599 | + PF monitoring, phase imbalance, demand tracking |
| Advanced | + Max demand, TOU, load profile (11–15) | ₹999 | + Demand prediction, tariff optimisation, predictive maintenance alerts |
| Power Quality | + THD, harmonics, sag/swell, EN 50160 (15+) | ₹1,499 | + Full PQ analysis, harmonic filter sizing, equipment damage prediction |

**Pricing is grounded in:**
- Lower half of global IoT SaaS range ($3–18 → targeting $3.60–$18 = ₹300–1,500)
- UK energy platform benchmark: £2.19–£7.26 (₹230–760) covers Basic and Standard tiers
- Indian affordability: Basic and Standard within reach of MSMEs with ₹1–5L/month bills

**What happened to the old "IoT Metering" and "Compressed Air" modules?**
Both replaced. "IoT Metering" is now the meter tier pricing itself (Basic → PQ). "Compressed Air Intelligence" is now absorbed into the Manufacturing Intelligence bundle below. There is no longer a flat add-on for either.

**Example bills (meters only — intelligence bundles add on top):**

| Scenario | Meters | Monthly |
|---|---|---|
| 2 meters: 1 Standard incomer + 1 Basic DG sub-meter | 2 meters | ₹599 + ₹299 = ₹898 |
| 5 meters: 1 Advanced incomer + 3 Standard feeders + 1 Basic DG | 5 meters | ₹999 + ₹1,797 + ₹299 = ₹3,095 |
| 13 meters: 1 Advanced incomer + 8 Standard sub-feeders + 4 Basic utility meters | 13 meters | ₹999 + ₹4,792 + ₹1,196 = ₹6,987 |

---

## Industry Intelligence Bundles (April 2026 Decision)

### The distinction between meter tiers and intelligence bundles

**Meter tier** = charges for the *volume and richness of data* a physical device generates and VoltSpark ingests. Priced per meter device.

**Intelligence bundle** = charges for the *domain-specific analytics* applied to that data — interpreting readings through the lens of what a particular industry's machines actually do. Priced per site.

A site can subscribe to **multiple bundles simultaneously** (e.g., a hospital may need Healthcare + Kitchen + HVAC all active at once).

### Intelligence bundle pricing (per site per month)

| Bundle | Industry served | Key capabilities | Monthly |
|---|---|---|---|
| **Manufacturing Intelligence** | CNC, metal processing, auto, plastics | Production energy intensity (kWh/unit), compressed air specific energy (kWh/m³), machine load profiles, shift-wise consumption, idle vs. productive hours, VFD efficiency | ₹2,500 |
| **Commercial Kitchen Intelligence** | Restaurants, hotels, canteens, cloud kitchens | Live demand vs contracted kVA, load shedding alerts, meal-time spike analysis, ToD patterns, HACCP temperature logging | ₹4,000 |
| **HVAC & Building Intelligence** | Offices, malls, commercial buildings, hotels | HVAC COP/EER tracking, floor/zone-wise consumption, occupancy vs. load correlation, chiller performance, elevator energy profiling | ₹3,000 |
| **Healthcare Intelligence** | Hospitals, diagnostic labs, pharma | Critical load uptime (OT, ICU), DG/UPS performance, clean room energy intensity, medical equipment profiling, NABH-compatible evidence | ₹4,000 |
| **Custom Intelligence** | Any industry with specific needs | Bespoke dashboards, custom metrics, custom alerts tailored to the client's specific operations and machines | From ₹5,000 |

**Coming soon (roadmap):**
- Textile Manufacturing Intelligence — looms, humidifiers, compressors
- Food Processing Intelligence — boilers, cold storage, processing lines
- Cold Chain & Logistics Intelligence — refrigerated warehouses, transport hub loads

### Pricing rationale for bundles

| Bundle | Why this price |
|---|---|
| Manufacturing ₹2,500 | Broad market, compressed air + production intensity analytics, medium complexity |
| Kitchen ₹4,000 | Real-time demand alerts prevent large penalties; HACCP = legal requirement; high consequence |
| HVAC & Building ₹3,000 | COP tracking and chiller curves — moderate-high complexity; large building bills justify |
| Healthcare ₹4,000 | Mission-critical (patient safety), NABH compliance evidence, highest analytical complexity |
| Custom 5,000+ | Bespoke analytics require onboarding engagement and custom development |

### How bundles relate to meter tiers

| Meter tier | Bundles it enables |
|---|---|
| Basic | None (consumption trends only — no domain analytics possible) |
| Standard | Manufacturing (partial), Kitchen, HVAC & Building |
| Advanced | Manufacturing (full), Kitchen, HVAC & Building, Healthcare |
| Power Quality | All bundles + PQ-specific analysis within each |

### Example combined bills (meters + intelligence bundle)

| Scenario | Meters | Bundle | Total |
|---|---|---|---|
| CNC factory: 5 meters + Manufacturing | ₹3,095 (1 Adv + 3 Std + 1 Basic) | ₹2,500 | ₹5,595/month |
| Restaurant: 3 meters + Kitchen | ₹2,196 (1 Adv + 2 Std) | ₹4,000 | ₹6,196/month |
| Hospital: 8 meters + Healthcare + Kitchen | ₹5,591 (1 Adv + 5 Std + 2 Basic) | ₹4,000 + ₹4,000 | ₹13,591/month |
| Office building: 6 meters + HVAC & Building | ₹3,693 (1 Adv + 4 Std + 1 Basic) | ₹3,000 | ₹6,693/month |

---

## What Has Not Been Decided Yet

- [ ] Pricing for API access (read-only data export for large customers / ERP integrations)
- [ ] Whether to offer a free trial period on IoT tier (e.g. first 30 days free per meter)
- [ ] Volume discount for 20+ meters on same site
- [ ] Exact scope and pricing for Custom Intelligence engagements

---

## What Has Been Decided

| Decision | Choice |
|---|---|
| Core platform | **Free** — manual entry always |
| Revenue driver | **IoT data ingestion** — paid per smart meter |
| Pricing unit | **Per smart meter** (data layer) + **per site** (intelligence layer) |
| Intelligence layer | **Industry bundles** — named by vertical, not by equipment |
| Bundle model | Multiple bundles per site allowed (hospital = Healthcare + Kitchen + HVAC) |
| Custom analytics | **Open** — available as Custom Intelligence at ₹5,000+/site/month |
| Infrastructure cost driver | IoT data volume, not manual entries |
| Upgrade path | Manual free → IoT paid, same platform, no migration |
| B2B2C commission | 30% of IoT tier + intelligence bundle fees, recurring |
| Data retention (free) | 2 years minimum |
| Hardware supply | Third-party contractors for B2C; partner (Lotus Controls / Titan) for B2B2C |
| Coming soon | Textile, Food Processing, Cold Chain & Logistics |
