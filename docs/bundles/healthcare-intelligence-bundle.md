# Healthcare Intelligence Bundle — Specification

**Version:** 0.1 (draft) · **Date:** 2026-05-16
**Status:** Design spec — not yet built. **No hospital customer yet** — see risk note.
**Purpose:** Define the Healthcare Intelligence bundle, AND act as the **contrast case** that stress-tests whether the 8-component bundle template (from `manufacturing-intelligence-bundle.md`) is genuinely industry-neutral.
**Companion:** `asset-context-profile.md` (keystone schema) · `manufacturing-intelligence-bundle.md` (the template being cloned).
**Grounded in:** `docs/voltspark-field-engineering/field-guides/healthcare-hospital-volt-spark-field-guide.md`.

> **Why this is the contrast case.** Manufacturing and a hospital are near-opposites: a machining shop has *high* freedom to cut energy; a hospital has *near-zero* freedom on its critical loads. If the same 8-component structure fills cleanly for both, the template is proven. Where it strains, we learn what to fix. The findings are in the final section — **read that first if short on time.**

> **Risk flag.** volt-spark.in already sells this bundle at ₹4,000/site with zero hospital customers. A hospital facility manager who knows NABH cold will not be impressed by a generic kWh dashboard. This spec must be delivered *deep*, or the bundle marked "Early Access" until a hospital proof site exists.

---

## 0 · Bundle identity

| Field | Value |
|---|---|
| Bundle name | Healthcare Intelligence |
| Price | ₹4,000 / site / month (live on volt-spark.in) |
| Hard dependency | Standard-tier meters or above; Power Quality tier strongly recommended at the main incomer |
| Target sub-segment | Secondary & tertiary care **hospitals**; diagnostic centres as a lighter variant |
| Composes these addons | **Power Quality** (critical — medical equipment, ventilator-trip protection) · IoT Metering · Compressed Air (medical-air leak detection) · **HVAC analytics** *(see Finding 3 — should become a shared addon)* |
| Proof customers | **None yet** — bundle is sold ahead of delivery |

### The 7 dimensions — how this bundle is parameterised

| Dimension | Value for Healthcare | vs Manufacturing |
|---|---|---|
| Unit of output | **Patient / occupied bed-day** (also: OT case, sterilisation cycle, scan) | mfg: a part — *and singular, not multi-valued* |
| Risk currency | **Patient safety, NABH accreditation, liability** — ₹ is secondary | mfg: scrap ₹ + penalty ₹ |
| Optimization freedom | **Near zero** on critical loads (ICU/OT/imaging/life-support); moderate on shiftable loads (CSSD, laundry, kitchen) | mfg: high everywhere |
| Load profile | Flat, **24/7, never idle**; HVAC-dominated; predictable daily peaks | mfg: spiky, shift-driven, off-shift idle |
| Dominant load | **HVAC (60–70% of total energy)** | mfg: process machines |
| Regulator | NABH (HIC.8), JCI FMS, IGBC Green Hospital, AERB (imaging) | mfg: ZED, ISO 50001 |
| Buyer & language | Facility manager / CFO / NABH committee — "uptime", "accreditation", "kWh per bed-day", "patient safety" | mfg: owner — "₹/part", "scrap" |

**The inversion:** the "optimization freedom: near-zero" cell predicts everything. In Manufacturing the bundle's job is *squeeze cost out*. In Healthcare the job is *guarantee nothing fails and prove it to the auditor* — energy savings is the minority of the value.

---

## Component 1 · Vocabulary & entity model

| Entity | Description | Maps to |
|---|---|---|
| **Zone / Department** | Ward, ICU, OT complex, CSSD, imaging, laundry, kitchen, lab | New model (sub-location) |
| **CriticalFeeder** | Flag — is this feeder on the UPS/DG-backed critical bus? The central concept. | `criticality` field on the `AssetContextProfile` |
| **Bed / PatientCensus** | Occupied beds per day — the primary denominator | New model |
| **OTSession** | One surgical case | New model |
| **SterilisationCycle** | One autoclave run | New model (often *inferred*) |
| **ImagingScan** | One MRI / CT / scan | New model (inferred or RIS-integrated) |
| **DGRun / UPSEvent** | Backup-power events — run hours, failover, battery autonomy | New model |
| **ColdChainPoint** | Vaccine fridge, blood bank, pharmacy store | New model + sensor link |
| **ClinicalIncident** | "Equipment tripped during a procedure" — links to a PQ event for liability | New model |

**Metering map:** each `Meter` links to the `Zone` or critical asset it measures. The critical-vs-non-critical split is the first thing onboarding captures.

---

## Component 2 · Equipment library (Healthcare AssetTemplates)

Every row is one `AssetTemplate` (`bundleType: HEALTHCARE`). Rated kW + tier from the healthcare field guide. **Note the `criticality` column — it carries the optimization-freedom dimension.**

| Template key | Equipment | Rated kW | Cycle | Criticality | Tier |
|---|---|---|---|---|---|
| `chiller` | Scroll/screw/centrifugal chiller | 22–375 | continuous | important | Advanced |
| `ahu-ot` | OT laminar-flow AHU | 5.5–15 | continuous (OT hours) | **critical** | Standard |
| `ahu-ward` | Ward AHU / FCU | 5–30 | continuous | standard | Standard |
| `crac` | Precision cooling (lab/server) | 3–15 | continuous | important | Standard |
| `medical-air-compressor` | Oil-free medical air compressor | 7.5–55 | continuous | **critical** | Advanced |
| `medical-vacuum` | Vacuum / suction plant | 5.5–22 | continuous | **critical** | Standard |
| `cssd-autoclave` | Steam steriliser (CSSD) | 3.5–68 | batch (shiftable) | important | Advanced |
| `eto-steriliser` | ETO cold steriliser | 2–5 | batch | important | Standard |
| `mri-scanner` | MRI (1.5T/3.0T) + 24/7 helium compressor | 15–200 | event + base load | **critical** | Advanced |
| `ct-scanner` | CT scanner | 5–140 | event | **critical** | Advanced |
| `linac` | Linear accelerator (radiotherapy) | 15–150 | event | **critical** | Advanced |
| `xray-dr` | Digital X-ray room | 2–80 | event | important | Standard |
| `laundry` | Washer / dryer / ironer / tunnel | 20–110 | batch (shiftable) | standard | Advanced |
| `ups-critical` | Critical-bus UPS | 20–1000 | continuous | **critical** | Standard/Adv |
| `diet-kitchen` | Hospital diet kitchen | 20–80 | batch (3 services) | standard | Standard |
| `cold-chain` | Vaccine fridge / blood bank / pharmacy | 0.3–5 | continuous | **critical** | Basic + temp sensor |
| `common-lighting` | Lobby / corridor / parking | 5–40 | varies | non-critical | Basic |

---

## Component 3 · Industry KPIs

| KPI | Definition | Input tier |
|---|---|---|
| **kWh per occupied bed-day** | Total kWh ÷ (occupied beds × days) — the CFO metric | L2 (needs census) |
| **kWh per OT surgical case** | OT-complex kWh ÷ surgical cases | L2 |
| **kWh per sterilisation cycle** | CSSD kWh ÷ autoclave cycles | L2 |
| **kWh per MRI/CT scan** | Imaging-feeder kWh ÷ scans | L2 |
| **HVAC energy as % of total** | The single biggest lever (60–70%) | L1 |
| **Critical-load uptime %** | Time critical feeders had clean power ÷ total | L1 |
| **DG run-hours + diesel ₹** | Backup-power dependency and cost | L1 / event |
| **UPS losses (kW heat)** | UPS input − UPS output — wasted as heat | L1 |
| **Chiller COP / EER** | Cooling output ÷ electrical input | L1 + temp sensors |
| **kWh per meal served** | Kitchen kWh ÷ meals (NABH cost metric) | L2 |
| **Peak demand vs contract** | 15-min peak kVA vs sanctioned | L1 |
| **ToD-shiftable load captured %** | Shiftable kWh actually run off-peak | L1 |

Benchmark anchor: **25–35 kWh/bed-day** is efficient (NABH Green guidelines); the field-guide example hospital runs 41 — 18–65% over.

---

## Component 4 · Alert logic — SAFETY-coded, not cost-coded

The inversion is sharpest here. Manufacturing's top severity was HIGH (a scrapped part). Healthcare needs a tier **above** HIGH: **SAFETY**.

| Alert | Trigger | Severity | Currency / message | Action |
|---|---|---|---|---|
| **Voltage sag on a critical feeder** | Sag/swell on ICU/OT/life-support feeder | **SAFETY** | "Ventilator/monitor trip risk — event logged" | Log for liability; investigate source |
| **Critical-load power loss / DG failover** | Critical feeder loses grid; DG starts | **SAFETY** | Patient-safety event | Verify DG carried load; log |
| **UPS on battery / low autonomy** | Critical UPS on battery, autonomy falling | **SAFETY** | Minutes of backup left | Escalate to facility + biomedical |
| **Cold-chain temperature breach** | Vaccine/blood fridge out of band | **SAFETY** | Spoiled vaccines / blood units | Immediate intervention |
| **OT AHU airflow/pressure deviation** | OT AHU power/airflow outside envelope | **HIGH** | Infection-control / positive-pressure loss | Inspect AHU, HEPA |
| **MRI helium-compressor degradation** | Slow current-rise trend on MRI base load | **HIGH** | Magnet quench risk (₹₹₹) | Service cryogenics |
| **Chiller COP degradation** | COP trending down | **MEDIUM** | Energy cost ₹ | Service / clean condenser |
| **Demand overshoot** | 15-min kVA toward contract limit | **MEDIUM** | Penalty ₹ | Stagger non-critical loads |
| **ToD opportunity missed** | Autoclave/laundry ran in peak window | **LOW** | Cost nudge | Reschedule to off-peak |

**Severity ladder for Healthcare:** SAFETY > HIGH > MEDIUM > LOW. Most alerts are reliability/safety — energy-cost alerts are the minority. *(This is Finding 1 — the ACP severity enum must be a superset.)*

---

## Component 5 · Compliance frameworks pre-loaded

- **NABH** — Standard HIC.8 (energy management); the primary Indian hospital framework. Energy data auto-feeds the evidence trail.
- **JCI FMS** — Facility Management & Safety chapter (for JCI-accredited hospitals).
- **IGBC Green Hospital** — green building / energy rating submissions.
- **Electrical safety** — IS 10560 / IEC 60364-7-710 — patient-zone equipotential bonding, supplementary earthing.
- **AERB** — radiation-equipment compliance for LINAC / imaging (referenced, not energy-derived).
- **Cold-chain compliance** — vaccine/blood storage temperature logs (sensor-derived).

---

## Component 6 · Operations data schema

| Data | Capture method | Tier |
|---|---|---|
| PatientCensus (occupied beds/day) | Entered daily (one number) or HIS integration | Event / integrated |
| OTSession | OT scheduling system, or entered | Event |
| SterilisationCycle | **Inferred** from autoclave power signature, or CSSD log | Inferred / event |
| ImagingScan count | RIS/PACS integration, or **inferred** from power bursts | Inferred / integrated |
| DGRun / UPSEvent | **Inferred** from feeder source switch, or entered | Inferred / event |
| Cold-chain temperature | **Live sensor** (already supported by VoltSpark) | Live |
| Meals served | Dietary department log | Event |

Hospitals more often have a HIS/RIS than a machining SME has an ERP — so **integration is more viable here than in Manufacturing**. But census still works as a single daily number entered by hand; inference covers the rest.

---

## Component 7 · Report templates (audience-tuned)

1. **Facility manager / CFO monthly report** — kWh/bed-day vs benchmark, HVAC %, ToD savings captured, demand status.
2. **NABH HIC.8 evidence pack** — auto-generated energy-management documentation, trends, equipment-wise breakdown. Removes a manual reporting burden.
3. **Critical-power assurance report** — DG/UPS readiness, critical-load uptime %, full sag/swell event log. Doubles as **liability evidence**: proves whether an equipment trip was a grid event (hospital not liable) or an internal fault.
4. **Department cost-allocation report** — energy per OT case / per scan / per bed-day, for hospital finance.
5. **IGBC / Green Hospital submission pack.**

---

## Component 8 · Benchmarks, onboarding questionnaire, savings playbook

### Benchmarks (intra-industry)
kWh/bed-day (25–35 efficient) · HVAC % of total · kWh/OT case · chiller COP · UPS-loss % — vs a network of hospitals, grouped by `templateKey` and bed-band.

### Onboarding questionnaire (Healthcare-specific intake)
- Bed count + departments (ICU/OT/imaging/CSSD/laundry/kitchen present?)
- Number of OTs; imaging equipment (MRI/CT/LINAC?)
- NABH / JCI status — accredited, preparing, or neither → sets compliance urgency
- DG sets — count, rating, typical run-hours
- Critical-bus single-line diagram — which feeders are UPS/DG-backed
- HVAC plant — chiller type & count
- Biggest concern: cost / uptime / accreditation / patient safety → sets pain currency

### Savings playbook (each tied to an ROI template)
| Measure | Capex | Note |
|---|---|---|
| CSSD autoclave ToD shift | zero | Run last cycles 22:00+; ~₹65k/yr (field guide) |
| Laundry ToD shift | zero | Most shiftable hospital load |
| Chiller optimisation / sequencing | low | HVAC is 60–70% — biggest lever |
| UPS loss reduction | low–med | 30–50 kW heat waste at a large hospital |
| LED retrofit (common areas) | low | Non-clinical only |
| VFD on AHU fans / CHW pumps | med | |
| Non-clinical-zone AHU scheduling | zero | **Carefully** — never clinical zones |

---

## Context maturity levels (this bundle)

| Level | Inputs added | What the customer gets |
|---|---|---|
| **L0** | A meter only | Generic kWh charts |
| **L1** | + zone + criticality + tariff | HVAC %, critical-uptime, demand/PF, ToD gaps, **real ₹** |
| **L2** | + design-intent templates + census/OT/scan data | kWh/bed-day, kWh/case, deviation-from-design, safety alerts |
| **L3** | + HIS/RIS integration + cross-hospital benchmarks | Department cost allocation, NABH auto-packs, network benchmarking |

---

## Mapping to VoltSpark architecture

**The keystone** (`AssetTemplate`, `AssetContextProfile`, `ContextReview`) is shared — see `asset-context-profile.md`. Healthcare's equipment library = `AssetTemplate` rows with `bundleType: HEALTHCARE`. The **critical-vs-non-critical** concept is simply the `criticality` field already on the ACP — no new mechanism needed. ✅

**Net-new Healthcare models** (all carry `clientId`):
`Zone` · `Bed`/`PatientCensus` · `OTSession` · `SterilisationCycle` · `ImagingScan` · `DGRun`/`UPSEvent` · `ColdChainPoint` · `ClinicalIncident`.

**Reuses:** ACP, IoT Metering, Power Quality addon, the sensor-breach feature (cold chain), Framework Engine, `requireClient()`.

---

## Build phasing

- **Phase A** — pilot at one hospital: zone model, critical-feeder flag, HVAC %, kWh/bed-day (census entered by hand), critical-load uptime, cold-chain alerts. *Do not build until a hospital proof site exists.*
- **Phase B** — full equipment library, OT/CSSD/imaging KPIs, NABH evidence pack, critical-power assurance report.
- **Phase C** — HIS/RIS integration, cross-hospital benchmarks.

---

## CONTRAST-CASE FINDINGS — does the 8-component template hold?

**Verdict: the template holds. All 8 components filled cleanly for a hospital.** ✅ But the stress test surfaced **four concrete refinements** to feed back into the shared design:

**Finding 1 — the severity enum must be a superset.** Manufacturing's top severity is HIGH (a scrapped part). Healthcare needs **SAFETY** above it ("could harm a patient"). The ACP `defaultAlerts` severity field must be `SAFETY | HIGH | MEDIUM | LOW` — a single enum both bundles draw from; Manufacturing simply never uses SAFETY.

**Finding 2 — "idle detection" must not live in the core.** A hospital is never idle; shift-off logic is meaningless. The Healthcare bundle simply omits those KPIs — which only works if the core never *assumes* them. This confirms the **core-neutrality principle** in `asset-context-profile.md §8`. Action: audit the existing codebase for hard-coded idle/shift assumptions.

**Finding 3 — HVAC analytics is a shared capability, not bundle-private.** Healthcare needs COP/EER/chiller analysis; so does the HVAC & Building bundle. Duplicating it is wrong. Resolution: **HVAC analytics should be a horizontal addon** (like Power Quality, Compressed Air) that *both* the Healthcare and HVAC bundles compose. The bundle-vs-addon taxonomy gains one item.

**Finding 4 — `unitOfOutput` must be multi-valued.** Manufacturing has effectively one unit (a part). Healthcare has several at once — bed-day, OT case, sterilisation cycle, scan. The ACP `unitOfOutput` should be a primary + secondaries (array), not a single string.

**Conclusion:** the 8-component anatomy, the 7-dimension table, and the ACP keystone all survived a near-opposite industry. The 7-dimension table did its job — the single cell "optimization freedom: near-zero" correctly predicted the entire inversion (alerts safety-coded not cost-coded; the bundle's job is assurance, not savings). The four findings are schema-level, not structural — the template is sound to clone for Kitchen and HVAC next.
