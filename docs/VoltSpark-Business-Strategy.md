# VoltSpark — Business Strategy & Product Roadmap

**Date:** 29 March 2026
**Status:** Living document — brainstorm in progress

---

## 1. Core Identity

**VoltSpark is a manual-entry energy & compliance management platform.**

It is NOT an IoT company. It is NOT a hardware company. It is a **software platform** that helps industrial and commercial businesses:
- Track energy consumption and costs
- Manage compliance (ZED, ISO 50001, Electrical Safety)
- Prove savings in ₹ to justify investments
- Help consultants scale their practice

**The key insight:** Most Indian SMEs and MSMEs don't have smart meters, BMS systems, or IoT infrastructure. They have utility bills, logbooks, and Excel sheets. VoltSpark meets them where they are — **manual entry first, automation later**.

---

## 2. Two-Layer Product Architecture

### Layer 1: Core Platform (Free / Near-Free)
Manual-entry energy management that works for ANY business.

**What's included:**
- Energy source & consumption tracking
- Utility bill entry & analysis (PF penalty, demand overshoot detection)
- Compliance framework management (ZED, ISO 50001, Electrical Safety)
- Audit & finding management
- CAPA workflow
- Training program tracking
- Safety inspections & incidents
- Certification tracker with expiry alerts
- Savings tracker (prove ₹ saved per improvement)
- ROI calculator (7 templates: solar, VFD, LED, APFC, compressed air, motors, transformer)
- Action plans & document library
- Government scheme eligibility matching
- Shareable compliance view (vendor qualification)
- PDF reports & data export
- Consultant portfolio dashboard (manage multiple clients)

**Why near-free?**
- Builds the user base — every consultant who signs up brings 5-20 clients
- Manual entry has near-zero marginal cost (no hardware, no real-time infra)
- The data entered becomes the foundation for paid add-on upsells
- Creates switching cost — once 6 months of data is in VoltSpark, they won't leave

### Layer 2: Intelligence Add-Ons (Paid)
Industry-specific, IoT-enabled, real-time modules that connect to hardware.

**These are the revenue drivers.** Each add-on:
- Requires hardware (meters, sensors, gateways) — sold/installed by partners like Akshaya Createch
- Pushes data to VoltSpark via API (not manual entry)
- Provides real-time dashboards, alerts, and automated penalty prevention
- Justifies itself with measurable ₹ savings (pays for itself)

---

## 3. Customer Categories & Verticals

VoltSpark's core platform is **industry-agnostic**. Any business that pays an electricity bill can use it. But add-on modules are **vertical-specific**.

### Category A: Industrial Manufacturing (Current — Unnathi CNC)
**Profile:** CNC shops, auto component makers, pharma, electronics, textile mills, foundries, food processing
**Size:** 10-500 employees, ₹1Cr-100Cr turnover
**Pain:** High energy bills (₹2-20L/month), ZED/ISO compliance pressure, PF penalties, demand overshoot
**Core use:** Energy tracking, compliance, utility bill analysis, savings tracking
**Add-on potential:**
- **Power Quality Monitor** — harmonic analysis, voltage monitoring, THD alerts
- **Compressed Air Intelligence** — leak detection, pressure monitoring (compressed air = 30% of factory energy)
- **Motor & Drive Monitor** — VFD performance, motor health, load profiling
- **Production Energy Link** — energy per unit of production (kWh/part)

### Category B: Commercial Kitchens (Planned — Kitchen Module)
**Profile:** Restaurants, cloud kitchens, hospital canteens, temple kitchens, corporate cafeterias, hotel kitchens
**Size:** 1-50 induction zones, ₹50K-5L/month electricity
**Pain:** MD penalties from simultaneous induction loads, PF dips, ToD overspend, FSSAI/HACCP compliance
**Core use:** Utility bill tracking, basic compliance
**Add-on: Kitchen Intelligence** (built)
- Real-time demand monitoring via Titan meters
- Automatic load shedding to prevent MD penalties
- ToD optimization
- HACCP temperature logging
- Penalty predictor

### Category C: Commercial Buildings
**Profile:** Office complexes, IT parks, malls, showrooms, co-working spaces
**Size:** 50kVA - 2MVA, ₹2-50L/month electricity
**Pain:** HVAC is 40-60% of bill, chiller inefficiency, lighting waste, tenant sub-metering
**Core use:** Energy cost tracking, utility bill analysis
**Add-on potential:**
- **HVAC Intelligence** — chiller COP monitoring, AHU optimization via BMS integration
- **Tenant Sub-Metering** — automated billing, fair allocation
- **Lighting & Occupancy** — scheduling, daylight harvesting analytics

### Category D: Hospitals & Healthcare
**Profile:** Hospitals, diagnostic centers, nursing homes, pharma manufacturing
**Size:** 100kVA+, ₹5-50L/month, 24x7 critical loads
**Pain:** Backup power costs (DG), NABH compliance, biomedical waste energy, cold chain for blood/pharma
**Core use:** Compliance tracking (NABH energy requirements), training, certification tracking
**Add-on potential:**
- **Critical Power Monitor** — UPS/DG/solar switchover monitoring, power reliability scoring
- **Cold Chain Monitor** — blood bank, pharmacy, lab temperature logging (regulatory compliance)
- **Medical Gas Monitor** — oxygen plant, vacuum pump energy tracking

### Category E: Educational Institutions
**Profile:** Engineering colleges, universities, schools with hostels
**Size:** 50-500kVA, ₹1-10L/month
**Pain:** Wastage in hostels/labs, solar rooftop underperformance, no accountability
**Core use:** Energy tracking, solar performance, training records
**Add-on potential:**
- **Solar Performance Monitor** — inverter API integration, generation vs expected, degradation tracking
- **Campus Zone Metering** — hostel vs lab vs admin breakdowns

### Category F: Cold Storage & Warehousing
**Profile:** Cold storage for agriculture, pharma, frozen food
**Size:** 50-500kVA, 24x7 compressor loads
**Pain:** Compressor energy = 70% of bill, temperature excursions = spoilage, DG backup costs
**Core use:** Energy tracking, compliance
**Add-on potential:**
- **Cold Room Intelligence** — compressor energy vs tonnage, door-open tracking, defrost optimization
- **Temperature Compliance** — FSSAI/APEDA logging, automated alerts

### Category G: Water & Wastewater
**Profile:** Municipal water treatment, STP/ETP operators, packaged drinking water
**Size:** Pump energy dominates — ₹1-20L/month
**Pain:** Pump efficiency degrades over time, chemical dosing energy, CPCB compliance
**Core use:** Energy tracking, compliance, CAPA
**Add-on potential:**
- **Pump Intelligence** — specific energy (kWh/KL), pump curve monitoring, VFD optimization

### Category H: Hospitality (Hotels, Resorts)
**Profile:** Hotels (50-500 rooms), resorts, convention centers
**Pain:** HVAC + hot water + laundry + kitchen = massive bill, seasonal variation, guest comfort vs efficiency
**Core use:** Utility bill analysis, energy cost tracking
**Add-on potential:**
- **Kitchen Intelligence** (same module as Category B)
- **HVAC Intelligence** (same as Category C)
- **Laundry & Hot Water Monitor** — boiler/heat pump efficiency

---

## 4. Pricing Strategy

### Philosophy
- **Core is free to acquire users** — the product sells itself
- **Add-ons are priced to pay for themselves** — if the add-on saves ₹20K/month, charge ₹2-5K/month
- **Consultants are the distribution channel** — they sign up, add clients, and upsell add-ons
- **Hardware is separate** — VoltSpark doesn't sell hardware; partners (like Akshaya Createch) sell and install

### Proposed Pricing Tiers

| | Starter | Professional | Enterprise |
|---|---|---|---|
| **Price** | Free | ₹2,999/month | Custom |
| **Clients** | 1 | Up to 10 | Unlimited |
| **Users per client** | 3 | Unlimited | Unlimited |
| **Core features** | All | All | All |
| **Add-ons** | Not available | Available (per-client pricing) | Custom bundle |
| **Support** | Community/email | Email + WhatsApp | Dedicated |
| **Data retention** | 1 year | 3 years | Unlimited |
| **PDF reports** | Basic | Branded | White-label |
| **API access** | No | Read-only | Full |

### Add-On Pricing (per client per month)

| Add-On | Basic (Monitoring) | Smart (Monitoring + Control) |
|---|---|---|
| Kitchen Intelligence | ₹999 | ₹1,999 |
| Power Quality Monitor | ₹799 | — |
| Compressed Air Intelligence | ₹999 | ₹1,999 |
| Solar Performance Monitor | ₹499 | — |
| Cold Room Intelligence | ₹999 | ₹1,999 |
| HVAC Intelligence | ₹1,499 | ₹2,999 |
| Production Energy Link | ₹1,499 | — |

**"Smart" tier** = includes hardware control (load shedding, alerts to relays) via digital outputs.
**"Basic" tier** = monitoring and analytics only, no control.

### Revenue Math (Example)
- 50 consultants × 5 clients avg = 250 clients on Pro (₹2,999/mo)
- 250 × ₹2,999 = ₹7.5L/month platform revenue
- 50 clients with Kitchen add-on × ₹1,499 avg = ₹75K/month add-on revenue
- 30 clients with other add-ons × ₹999 avg = ₹30K/month
- **Total: ~₹8.5L/month (~₹1Cr/year) at 250 paying clients**

---

## 5. Go-To-Market Strategy

### Phase 1: Consultant-Led (Current)
- **Target:** Energy consultants, ZED/ISO consultants, ESCOs
- **Motion:** Consultant signs up → adds their clients → enters data → generates reports
- **Value prop for consultant:** "Manage 10 clients from one dashboard. Prove your value in ₹."
- **Value prop for factory owner:** "Your consultant now gives you a live compliance dashboard instead of a PDF once a quarter."

### Phase 2: Direct-to-Factory (Next)
- **Target:** Factory owners who don't have a consultant
- **Motion:** Self-service signup → guided onboarding → basic energy tracking
- **Value prop:** "Enter your utility bill, see where your money is going. Free."
- **Upsell:** "Want a consultant? We can connect you." (referral to partner consultants)

### Phase 3: Channel Partners (Scale)
- **Target:** Hardware OEMs (Schneider, Siemens, ABB), DISCOM franchisees, BEE empaneled auditors
- **Motion:** "Bundle VoltSpark with your product/service. Your customers get free energy management. You get data and upsell opportunities."
- **Example:** Schneider sells APFC panel → customer gets free VoltSpark access → Schneider sees PF improvement data → upsells next panel

### Phase 4: Platform Play
- **Aggregated anonymized industry benchmarks** ("Your factory uses 15% more energy per unit than industry average")
- **Consultant marketplace** (connect factory owners with consultants)
- **Hardware marketplace** (recommend certified hardware partners)
- **Carbon credit integration** (track and monetize energy savings)

---

## 6. Technical Architecture for Add-Ons

### How Add-Ons Work
1. **enabledAddons** field on Client model stores JSON array: `["KITCHEN", "POWER_QUALITY"]`
2. **Consultant enables** add-on from Portfolio page (toggle per client)
3. **Sidebar dynamically shows** sections for enabled add-ons
4. **API routes check** `requireAddon(clientId, 'ADDON_CODE')` before serving data
5. **Hardware pushes data** via API key auth (not user session)
6. **Each add-on** has its own Prisma models, API routes, and UI pages

### Add-On Template (for building new ones)
```
Models:     app/prisma/schema.prisma (add new models)
Auth:       app/src/lib/addons.ts (requireAddon check)
Ingestion:  app/src/app/api/{addon}/meters/[id]/readings/route.ts
APIs:       app/src/app/api/{addon}/*.ts
Pages:      app/src/app/(app)/{addon}/*.tsx
Sidebar:    app/src/components/layout/Sidebar.tsx (conditional section)
Seed:       app/prisma/seed.ts (demo data)
```

### Data Architecture for IoT Add-Ons
- **Time-series readings** stored in SQLite/Turso (works for <10 clients)
- **At scale (100+ clients):** migrate time-series to TimescaleDB or ClickHouse
- **Data retention:** Raw data 90 days, 5-min aggregates 1 year, hourly aggregates forever
- **Ingestion rate:** 30s intervals per meter, batch of up to 100 readings per push

---

## 7. Competitive Landscape

| Competitor | What They Do | VoltSpark Advantage |
|---|---|---|
| **Zenatix (Schneider)** | IoT-first, HVAC focus, enterprise only | We start free/manual, serve SMEs |
| **EnergyBrain / Carbon Clean** | Large industrial only, expensive | We serve the ₹1Cr-100Cr MSME segment |
| **GridPoint** | US market, commercial buildings | India-specific: ZED, BESCOM, ₹ formatting |
| **Excel / WhatsApp** | What everyone uses today | Structured, auditable, multi-client |
| **Custom dashboards** | Built by each consultant | Multi-tenant SaaS, no dev needed |

**VoltSpark's moat:**
1. Manual-entry-first approach (no hardware dependency)
2. Multi-tenant consultant model (one platform, many clients)
3. Indian compliance built-in (ZED, BESCOM, FSSAI)
4. ₹ savings quantification (ROI calculator, savings tracker)
5. Add-on architecture (grow revenue per client over time)

---

## 8. First 10 Customers Plan

| # | Name | Type | Location | How to Reach | Add-on Potential |
|---|---|---|---|---|---|
| 1 | Unnathi CNC | CNC Machining | Peenya, Bengaluru | Already onboarded | Power Quality |
| 2 | (Target) Cloud kitchen chain | Commercial Kitchen | Bengaluru | Akshaya Createch network | Kitchen Intelligence |
| 3 | (Target) Auto component MSME | Manufacturing | Peenya/Bommasandra | CLIK B2B contacts | Compressed Air |
| 4 | (Target) Hospital kitchen | Healthcare + Kitchen | Bengaluru | Akshaya Createch | Kitchen Intelligence |
| 5 | (Target) Cold storage | Agri cold chain | Karnataka | Industry association | Cold Room |
| 6 | (Target) Engineering college | Education | Karnataka | Direct outreach | Solar Monitor |
| 7 | (Target) Pharma manufacturer | Pharma | Bengaluru | Consultant referral | Power Quality |
| 8 | (Target) Hotel/resort | Hospitality | Bengaluru/Mysuru | Hospitality network | Kitchen + HVAC |
| 9 | (Target) IT park/commercial building | Commercial | Bengaluru | Builder network | HVAC, Sub-metering |
| 10 | (Target) ZED consultant | Consulting | Any | ZED network events | Platform (10 clients) |

---

## 9. Open Questions

- [ ] Should the free tier have a time limit (free for 6 months, then ₹999/mo)?
- [ ] Should we charge per client or per user?
- [ ] Do we need a reseller/white-label tier for large consulting firms?
- [ ] What's the minimum hardware setup for Kitchen Intelligence to be useful? (1 meter at incomer only?)
- [ ] Should we build a mobile app (React Native) or is PWA sufficient?
- [ ] When do we need to move off SQLite/Turso to PostgreSQL for scale?
- [ ] Do we want to integrate with Tally/accounting software for automatic bill entry?
- [ ] Should savings tracker auto-calculate from consumption data (before/after comparison)?

---

*This is a living document. Update as decisions are made and customers are onboarded.*
