# Manufacturing Intelligence Bundle — Specification

**Version:** 0.2 (draft) · **Date:** 2026-05-16
**Status:** Design spec — not yet built
**Purpose:** Define the Manufacturing Intelligence bundle end-to-end, AND serve as the **clone template** every future bundle (Kitchen, HVAC, Healthcare) is copied from.
**Companion:** `asset-context-profile.md` — the keystone schema this bundle's templates and profiles instantiate.
**Reality-checked against:** Inspen Technology (12-machine precision shop, wire-cut EDM, defense) and Unnathi CNC (32 machines, 4 units, ZED Gold).

> **Why this doc exists.** `volt-spark.in` already *sells* a "Manufacturing Intelligence" bundle at ₹2,500/site/month, described in one line of three features. That is a marketing SKU, not an intelligence package. This spec defines what must actually be inside it so the product can deliver against the price already being charged.

---

## 0 · Bundle identity

| Field | Value |
|---|---|
| Bundle name | Manufacturing Intelligence |
| Price | ₹2,500 / site / month (live on volt-spark.in) |
| Hard dependency | Requires Standard-tier (₹599) meters or above — kWh/part needs per-phase data |
| Target sub-segment | **Discrete machining & fabrication SMEs** — CNC turning/milling, EDM, grinding, gear cutting, tool rooms, SPM/transfer-line shops. NOT process industries (cement, chemicals, bulk food) — those get their own bundle later. |
| Composes these addons | Compressed Air (most shops have a screw compressor) · IoT Metering · Power Quality (optional, EDM/rectifier/Swiss-CNC shops) |
| Proof customers | Unnathi CNC, A Plus Fixtures, Inspen Technology |

### The 7 dimensions — how this bundle is parameterised

| Dimension | Value for Manufacturing |
|---|---|
| Unit of output | A **part / job / batch** |
| Risk currency | **Scrapped part ₹** + **lost production-hour ₹** + **BESCOM demand/PF penalty ₹** |
| Optimization freedom | **High** — idle machines can be switched off, load shifted to off-peak, non-critical loads shed |
| Load profile | Spiky, shift-driven, weekends/off-shift idle |
| Dominant load | Process machines (spindle + servo + hydraulics) + compressed air |
| Regulator | ZED, ISO 50001, Electrical Safety, Factory Act |
| Buyer & language | Plant owner / MD — speaks "₹ per part", "scrap", "machine uptime", not "kWh" |

---

## Component 1 · Vocabulary & entity model

The bundle introduces these entities on top of the generic core (Client, EnergySource, ConsumptionEntry, Meter, MeterReading):

| Entity | Description | Maps to |
|---|---|---|
| **MachineType** | Taxonomy node — "CNC VMC", "Wire-cut EDM", etc. Carries the design-intent template (Component 2). | = `AssetTemplate` rows, `bundleType: MANUFACTURING` (see `asset-context-profile.md`) |
| **Machine** | A discrete production asset. Has a MachineType, nameplate kW, year, criticality. | New model → each `Machine` owns one `AssetContextProfile` |
| **Shift** | A named work window (A: 06:00–14:00, etc.) + working-days calendar. | New model (or reuse `RecurringSchedule`) |
| **ProductionJob** | A work order — part no., target qty, machine, start/end. | New model |
| **Part** | What is produced — part number, optional unit value (₹). | New model |
| **ProductionCycle** | One machining cycle = one part or one operation. | New model (often *inferred*, see Component 6) |
| **Operator** | Links to `User`; the bundle tracks operator↔machine assignment. | Reuse `User` + join |
| **Cell / Bay** | A grouping of machines (= a sub-DB feeder). | Sub-location field |
| **StoppageEvent** | Downtime: breakdown / no-operator / no-material / power-trip / tool-change. | New model |
| **ScrapEvent** | A rejected part + root-cause code. | New model |

**Metering map:** each `Meter` is linked to the `Machine`(s) or `Cell` it measures. A bay-level meter → many machines; a per-machine meter → one. This map is what makes every downstream insight machine-aware.

---

## Component 2 · Equipment library (the design-intent templates)

This is the **design-aware core**. Each MachineType ships an **Asset Template** — physics-informed defaults that turn raw watts into meaning. Sourced from `docs/voltspark-field-engineering/field-guides/cnc-volt-spark-field-guide.md` and `cnc-shop-energy-reference.md`.

**Template schema (every machine type fills this in):**

```
machineType:        <name>
ratedPowerRange:    <kW low–high>
powerStates:        [ OFF, IDLE, SETUP, RUNNING, INTERRUPTED ]  + signature per state
cycleStructure:     short-repetitive | long-unattended | batch
wasteModes:         [ ... known ways this machine wastes energy/money ]
primaryKPIs:        [ ... ]
defaultAlerts:      [ ... thresholds ]
recommendedTier:    Basic | Standard | Advanced | Power Quality
```

### Worked templates

**Wire-cut EDM** *(Inspen pilot machine — Phillips PWE 400 FR)*
- Rated: 5–15 kW · recommended tier: Standard (PQ if harmonics in scope)
- States: OFF / IDLE (dielectric pump + chiller) / WIRE-THREADING / CUTTING-rough / CUTTING-finish / INTERRUPTED
- Cycle: **long-unattended** — 4–12 hr per defense component
- Waste modes: mid-cut power interruption → scrapped part; wire-break idle; running idle overnight after job complete; poor true-PF from non-linear draw
- KPIs: kWh/part, cut-completion rate, interruptions/month, idle-after-job hours
- Default alerts: power dip during CUTTING = **HIGH**; load drop to IDLE while job not flagged complete = **MEDIUM**

**CNC Vertical Machining Centre (VMC)** *(Unnathi BFW BMV-60, Haas VF-2; A Plus CNCs)*
- Rated: 10–40 kW · tier: Standard (Adv/PQ for high-speed spindle)
- States: OFF / IDLE (controller + hydraulics + coolant standby) / SETUP / CUTTING / RAPID
- Cycle: **short-repetitive** — minutes per part, many parts/shift
- Waste modes: long idle-with-power between jobs; coolant/hydraulics running through lunch; spindle warm-up overrun; ATC inrush demand spikes
- KPIs: kWh/part, idle-power %, parts/shift, spindle-on ratio
- Default alerts: idle >30 min during shift = **LOW**; machine on outside shift calendar = **MEDIUM**

**CNC Turning Centre** *(Unnathi Pride JAGUAR, BFW PL-series)*
- Rated: 11–40 kW · tier: Standard
- Same state model as VMC; cycle short-repetitive. Aux load 30–50% of spindle.

**Centerless / Cylindrical / Surface Grinder** *(Unnathi Micromatic GCU-350)*
- Rated: 9–44 kW · tier: Standard
- Waste modes: large GW induction motor at partial load → **naturally low PF 0.65–0.75 → high PF-penalty risk**; coolant pump always on; long dressing idle
- Default alert: PF on grinding feeder < 0.80 = **MEDIUM** (penalty ₹)

**Air Compressor** *(handled by Compressed Air addon — bundle composes it)*
- Rated: 7.5–110 kW · tier: Advanced (max-demand + ToD)
- KPIs: specific energy kWh/m³, load/unload ratio, leak cost ₹
- Default alert: degrading load/unload ratio = **MEDIUM** (leak signature)

**Electroplating rectifier** *(Unnathi Unit 3 — 6-pulse SCR)*
- Rated: 30–60 kW · tier: **Power Quality (mandatory)**
- Waste mode: true PF 0.70–0.75 while displacement PF reads 0.90+ → hidden penalty
- Default alert: true-PF/displacement-PF gap > 0.10 = **MEDIUM**

### Full equipment library (Manufacturing AssetTemplates)

Every row is one `AssetTemplate` (`bundleType: MANUFACTURING`). Rated-kW and tier from the CNC field guide.

| Template key | Machine type | Rated kW | Cycle structure | Tier | Primary waste mode |
|---|---|---|---|---|---|
| `cnc-turning` | CNC Turning Centre | 11–55 | short-repetitive | Standard | idle-with-power between jobs |
| `cnc-vmc` | CNC Vertical Machining Centre | 10–58 | short-repetitive | Standard | idle; coolant/hydraulics through breaks |
| `cnc-hmc` | CNC Horizontal Machining Centre | 28–85 | short-repetitive | Standard | pallet-changer idle |
| `swiss-cnc` | Swiss-type / sliding-head CNC | 5–20 | long-unattended | Power Quality | bearing wear (THD signature) |
| `wire-cut-edm` | Wire-cut EDM | 5–15 | long-unattended | Standard (PQ opt.) | mid-cut interruption → scrap |
| `sinker-edm` | Sinker / die-sink EDM | 5–20 | long-unattended | Standard | dielectric / idle |
| `centerless-grinder` | Centerless Grinder | 9–44 | short-repetitive | Standard | low PF; coolant always on |
| `cylindrical-grinder` | Cylindrical / OD Grinder | 10–32 | short-repetitive | Standard | low PF; dressing idle |
| `surface-grinder` | Surface Grinder | 3–15 | short-repetitive | Standard | coolant idle |
| `gear-cutting` | Gear Hobbing / Shaping | 11–22 | batch | Standard | setup idle |
| `spm` | Special Purpose Machine (drill/tap/transfer/hone/broach) | 10–45 | varies | Standard | hydraulic-pack idle |
| `induction-hardening` | Induction Hardening | 30–120 | batch | Power Quality | demand spike; harmonics |
| `pdc-machine` | Pressure Die Casting machine + furnace | 37–145 | batch | Advanced | furnace 24/7 base load |
| `air-compressor` | Rotary-screw Air Compressor | 7.5–110 | continuous | Advanced | leaks; load/unload cycling |
| `plating-rectifier` | Electroplating Rectifier (6-pulse SCR) | 30–60 | batch | Power Quality | true-PF gap; harmonics |
| `welding` | TIG / Orbital Welding | 5–16 | event | Basic | low duty; idle |
| `shop-utility` | Lighting / cranes / coolant aux | 5–37 | varies | Basic | off-shift consumption |

> Build priority matches the pipeline: `wire-cut-edm` (Inspen) → `cnc-vmc` / `cnc-turning` / `*-grinder` (Unnathi, A Plus) → `air-compressor` → `plating-rectifier` (Unnathi Unit 3) → the rest.

---

## Component 3 · Industry KPIs

What the Manufacturing dashboard **leads with** — denominators the buyer actually thinks in:

| KPI | Definition | Input tier needed |
|---|---|---|
| **₹ per part** | (kWh × tariff) ÷ parts produced | L2 (needs part count) |
| **kWh per part (SEC)** | Specific energy consumption per part/job | L2 |
| **Idle energy %** | Energy drawn in IDLE state ÷ total | L1 (meter + shift calendar) |
| **Machine utilisation %** | RUNNING hours ÷ available shift hours | L1 |
| **Off-shift consumption** | Energy used outside the shift calendar | L1 |
| **Compressed-air specific energy** | kWh/m³ — from Compressed Air addon | L1 |
| **Power factor + penalty risk ₹** | True PF vs 0.85 threshold → ₹ exposure | L0 (bill) / L1 (meter) |
| **Peak demand vs contract** | 15-min peak kVA vs sanctioned demand | L1 |
| **Cost per machine-hour** | ₹ ÷ RUNNING hours | L1 |
| **Production energy intensity** | Site kWh ÷ total parts (or ÷ production ₹) | L2 |
| **Energy per operator-hour** | Ties energy to the scarce-operator pain (Inspen) | L2 |

KPIs degrade gracefully: idle %, utilisation, off-shift, PF and demand all work at **L1 with just a meter + shift calendar** — the ₹/part family needs production data. The bundle is useful before the customer enters a single job.

---

## Component 4 · Alert logic (the design-aware heart)

A generic tool says "this is unusual." This bundle says "this violates how the machine is supposed to run, here is the physical cause, here is the ₹ cost."

| Alert | Trigger | Severity | Currency / message | Recommended action |
|---|---|---|---|---|
| **Mid-cycle power interruption** | Voltage dip / load collapse during CUTTING state on a long-cycle machine | **HIGH** | "Part likely scrapped — ~₹X at risk" | Inspect part on next shift |
| **Demand overshoot** | 15-min avg kVA on track to exceed sanctioned demand | **HIGH** | Penalty on the **whole month's** demand charge | Stagger machine starts |
| **PF dip** | True PF below 0.87 (headroom over 0.85 penalty) | **MEDIUM** | "PF penalty ₹X/month accruing" | Check / tune APFC, capacitor bank |
| **Off-shift load** | Machine / compressor / lighting drawing power outside shift calendar | **MEDIUM** | "₹X/month wasted overnight" | Switch-off SOP, auto-off timer |
| **Excessive idle** | Machine in IDLE > 30 min during a shift | **LOW–MEDIUM** | Operator-absence / scheduling signal | Re-schedule scarce operators |
| **Abnormal machine power** | RUNNING-state power outside the template's expected band | **MEDIUM** | Tool wear / bearing / coolant fault | Maintenance check |
| **Compressor leak signature** | Load/unload ratio degrading (Compressed Air addon) | **MEDIUM** | "Leak ~₹X/month" | Ultrasonic leak survey |
| **Ghost consumption** | Energy rising while part count flat | **MEDIUM** | Energy with no output | Investigate idle / scrap |

**Severity → currency rule for Manufacturing:** HIGH = a scrapped part or a demand penalty (one-time large ₹). MEDIUM = recurring monthly ₹ waste. LOW = an efficiency nudge.

---

## Component 5 · Compliance frameworks pre-loaded

The bundle ships these framework templates into VoltSpark's existing Framework Engine, with each requirement pre-mapped to the module that supplies its evidence:

- **ZED** (Zero Defect Zero Effect) — MSME certification; energy data auto-feeds the environment pillar. *Unnathi is ZED Gold — renewal data builds itself.*
- **ISO 50001** — energy review, baseline, EnPIs, significant energy uses (SEUs), objectives & targets.
- **Electrical Safety** — earthing, protection devices, panel condition → feeds the Safety Risk Score.
- **Factory Act / statutory** — electrical inspector, periodic testing, certificate expiry tracking.
- **(Roadmap) Defense Vendor Readiness pack** — process traceability + per-job energy/test records for shops supplying BEL / DRDO / HAL / BDL (Inspen, Unnathi). Not built; flagged because both proof customers need it.

---

## Component 6 · Operations data schema

How production data enters — minimising what a human must type (**entered → inferred → integrated**):

| Data | Capture method | Tier |
|---|---|---|
| ProductionJob (part no., qty, machine, time) | Entered (mobile quick-entry) or integrated (ERP/MES) | Event-driven |
| Part / cycle count | **Inferred** from power signature (count CUTTING→IDLE transitions) · or entered · or PLC poll | Live / inferred |
| Operator assignment | Entered (shift roster) or QR scan at machine | Slow / event |
| StoppageEvent | Entered (mobile + reason code) or **inferred** (unexpected IDLE/OFF in shift) | Event-driven |
| ScrapEvent | Entered (mobile — qty + cause) | Event-driven |

**Minimum viable:** shift calendar + inferred cycle count → already yields kWh/part. **Full:** ERP job integration → exact ₹/part per job. Most target SMEs (Inspen at 14 staff, no energy manager) have **no ERP** — so the bundle must ship **inference first, integration later**.

---

## Component 7 · Report templates (audience-tuned)

Same data, three+ outputs, each shaped by who reads it:

1. **Owner / MD monthly report** — ₹/part trend, idle ₹ recovered, top-3 waste sources, demand & PF penalty status, savings vs baseline. Plain rupees, no jargon.
2. **ISO 50001 / ZED audit pack** — energy review, baseline, EnPIs, SEUs, objectives & targets, evidence links. Auditor-ready, generated from live data.
3. **Shift / machine performance report** — per-machine utilisation, kWh/part, stoppages — for the production supervisor.
4. **(Roadmap) Customer trust artifact** — per-job energy record + "uninterrupted-run certificate" for defense/aerospace OEM customers. The Inspen wedge into the BEL/DRDO supply chain.

---

## Component 8 · Benchmarks, onboarding questionnaire, savings playbook

### Benchmarks (intra-industry, asset-level — only possible because of Component 2)
- kWh/part by machine type — *your VMC vs the network-median VMC*
- Idle-energy % vs network
- Compressed-air specific energy (kWh/m³) vs network
- Off-shift consumption % vs network

Seed from your own clients first (Unnathi, A Plus, Inspen); the benchmark sharpens as the network grows.

### Onboarding questionnaire (the Manufacturing-specific intake — bundle-aware `/start`)
- What do you manufacture? (precision parts / tooling / fabrication / job work)
- Who are your main customers? *(defense/aerospace → flags compliance + traceability needs)*
- How many machines? List by type → equipment library auto-picks templates
- Shift pattern (1 / 2 / 3 shifts, days/week)
- Compressor? Solar? DG backup?
- Sanctioned demand (kVA) + tariff → from BESCOM bill photo
- Biggest pain: cost / scrap / uptime / operators / compliance → sets the pain currency

> This questionnaire is literally the Inspen site-visit checklist. The field visit already proved these are the right questions — the bundle just turns them into a product form.

### Savings playbook (opportunity catalog — each tied to an existing ROI template)
| Measure | Capex | Links to |
|---|---|---|
| Idle-off SOP / auto-off timers | ~zero | Savings tracker |
| Off-peak load shifting (ToD tariff) | zero | ROI: ToD |
| VFD on compressor / hydraulic pump | low | ROI: VFD |
| APFC / capacitor bank for PF | low | ROI: APFC |
| Compressed-air leak fix | low | Compressed Air addon |
| LED retrofit | low | ROI: LED |
| Rooftop solar (A Plus has it) | high | ROI: Solar |

---

## Technical · State detection & cycle inference

The bundle's intelligence depends on segmenting the raw power trace into states. This resolves *how*, and the meter resolution it needs.

**The classifier:**
- The `AssetTemplate` defines expected kW bands per state (OFF / IDLE / SETUP / RUNNING / INTERRUPTED) as % of rated power.
- Each meter reading maps to a state by band + **hysteresis** — a state must hold N consecutive readings before switching (prevents flapping on noise).
- **Cycle inference:** for short-repetitive machines, a RUNNING → IDLE → RUNNING sequence within the template's expected cycle gap = one `ProductionCycle` = one part. For long-unattended machines, one continuous RUNNING block = one job.
- **Interruption:** a RUNNING → OFF/IDLE drop that is *not* a normal cycle end — too early, or a load *collapse* rather than a ramp-down — is flagged INTERRUPTED.

**Meter resolution required:**
- State detection needs kW samples fine enough to resolve the shortest meaningful transition.
- **Long-unattended cycles** (EDM, furnace, Swiss CNC) — cycles run hours → 1–5 min polling is ample; even a Basic-tier meter works.
- **Short-repetitive cycles** (VMC, turning, grinder) — parts run minutes → need ≤1 min polling for clean per-part counting → Standard tier.
- So: the bundle nominally requires Standard+, but the "Standard+" rule is driven by *short-cycle* machines. Long-unattended assets can run on Basic-tier polling.

**Interruption vs. voltage sag:**
- Load-collapse interruption (load drops and *stays* down) is visible at 1-min resolution — enough to flag a likely-scrapped part.
- True sub-second voltage-sag forensics needs Power Quality tier. The bundle does load-collapse detection at Standard tier; PQ tier is the upgrade for sag root-cause.

## Context maturity levels (this bundle)

| Level | Inputs added | What the customer gets |
|---|---|---|
| **L0** | A meter only | Generic kWh charts + bill analysis (what competitors do) |
| **L1** | + machine type + tariff + shift calendar | Idle %, utilisation, off-shift waste, PF/demand penalty alerts, **real ₹** |
| **L2** | + design-intent templates + production data | kWh/part, ₹/part, deviation-from-design alerts, operator-hour insight |
| **L3** | + ERP integration + cross-client benchmarks | Per-job traceability, audit packs, network benchmarking |

The bundle delivers value at every level and gets smarter as context is added — which is also the consultant's upsell ladder.

---

## Mapping to VoltSpark architecture

**Reuses:** `Client` (tenant), `EnergySource` / `Meter` / `MeterReading` (IoT framework), `ConsumptionEntry`, Framework Engine, Savings Tracker, 7 ROI templates, `requireClient()` auth, console addon-toggle UI.

**The keystone** — `AssetTemplate`, `AssetContextProfile`, `ContextReview` — is specced separately in `asset-context-profile.md`. Manufacturing's `MachineType` = `AssetTemplate` rows with `bundleType: MANUFACTURING`; each `Machine` owns one `AssetContextProfile`.

**Net-new Manufacturing models** (all carry `clientId` for tenant isolation):
`Machine` · `Shift` · `ProductionJob` · `Part` · `ProductionCycle` · `StoppageEvent` · `ScrapEvent`.

**Net-new services:** state-detection engine (power trace → OFF/IDLE/SETUP/RUNNING/INTERRUPTED), cycle-count inference, the design-aware alert evaluator.

**Bundle gating:** the Manufacturing bundle is a flag on `Client` (extends the existing addon toggle). When off, machine entities are hidden and the dashboard falls back to L0.

---

## Build phasing

**Phase A — Inspen pilot MVP** *(one meter, one wire-cut EDM — locked scope)*

Build:
- `AssetTemplate` (`wire-cut-edm` only) + one `AssetContextProfile` for the EDM
- State-detection classifier — OFF / IDLE / CUTTING / INTERRUPTED (long-unattended cycle)
- Two alerts: mid-cut interruption (HIGH, load-collapse based), off-shift run (MEDIUM)
- kWh/part + cost/part via inferred cycle count
- One owner monthly report

Out of scope for Phase A: production-job entry, ScrapEvent, compliance packs, multi-machine, benchmarks.

**Acceptance:** a 30-day report showing, for the EDM — kWh per cut, cost per cut, number of interruptions, day vs night running. Goal: Sreenath sees something about his own machine he did not already know.

**Meter:** prefer the Standard-class EM6400NG (already purchased) on the EDM for headroom; the EM1200 (Basic) is an acceptable fallback — the EDM's 4–12 hr cycles are long enough that Basic-tier polling resolves state cleanly.

**Phase B — full bundle** — remaining equipment templates, ProductionJob/Part/Stoppage/Scrap, all KPIs, all alerts, compliance packs, audit reports, onboarding questionnaire.

**Phase C — network** — benchmarks, ERP integration, defense trust artifact.

---

## Reality check

**Inspen (12 machines, single shift, no energy manager, no ERP):** Phase A fits exactly — one EDM meter, inferred cycle count, mid-cut interruption alert. The bundle at ₹2,500 + one Basic meter ₹299 = **₹2,799/month**, inside the pilot-tier range. No ERP → inference-first is mandatory, not optional. ✅

**Unnathi (32 machines, 4 units, 2-shift, ZED Gold):** exercises the full bundle — multi-machine bay meters, equipment library breadth (VMC + turning + grinder + EDM + rectifier), cross-unit kWh/part benchmarking, ZED renewal auto-reporting. The electroplating rectifier proves the bundle must compose the Power Quality addon. ✅

**Meter resolution — resolved:** state detection needs kW samples fine enough to catch the shortest transition (see "State detection" section above). The Inspen EDM runs 4–12 hr cycles, so 1–5 min polling resolves cut/idle/interruption cleanly — even a Basic-tier meter suffices for *this* pilot. Use the Standard-class EM6400NG if available for headroom; the EM1200 is a valid fallback. The bundle's "Standard+" requirement is driven by *short-cycle* machines (VMC, turning), not the EDM.

---

## How to clone this for the next bundle

Every bundle = the same 8 components + the 7-dimension table + maturity levels + architecture mapping. To build the **Kitchen**, **HVAC**, or **Healthcare** bundle, copy this file and re-fill each section. The structure is fixed; only the domain knowledge changes — that is what keeps VoltSpark multi-industry without the model collapsing into mush.
