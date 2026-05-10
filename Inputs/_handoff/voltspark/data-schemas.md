# Data Schemas — Vitesco Demo Stack

*All four apps. Industry-aligned for SMT / ECU PCBA assembly line. Customer: Drivewave Automotive Pvt Ltd. Time horizon: 3 years (2023-05 to 2026-05).*

---

## App naming + URLs (proposed)

| App | Role | Stack | Deployment URL (proposed) |
|---|---|---|---|
| **VoltSpark** | Energy + Equipment + Q-Apps tab (existing) | Next.js + Prisma + libSQL (Turso) | existing |
| **PlantCost** | SAP-equivalent (cost / asset) | Next.js + Prisma + SQLite/libSQL | `plantcost-drivewave.vercel.app` |
| **mTrack** | MES-equivalent (maintenance) | Next.js + Prisma + SQLite/libSQL | `mtrack-drivewave.vercel.app` |
| **PlantMind** | AI Chat app (federation layer) | Next.js + Gemini 2.5 Flash + function calling | `plantmind.vercel.app` |
| **PCB Scanner** | Vision AI (Aravind's segment, sealed off) | Next.js + Gemini Vision API | `pcbscan.vercel.app` |

---

## 1. VoltSpark additions

VoltSpark already has the multi-tenant Organization → Client model. We onboard Drivewave as a new Client and add three SMT-specific tables alongside the existing schema.

### 1.1 Existing tables we'll reuse for Drivewave

These tables already exist; we just seed Drivewave-specific data:

| Existing model | What we seed |
|---|---|
| `Organization` | Or use existing Drivewave-owning org if Aravind has one |
| `Client` | New record: *Drivewave Automotive Pvt Ltd*, industry: "Automotive Electronics", Pune address |
| `EnergySource` | One per machine: SPI-01, PNP-01, PNP-02, REF-01, AOI-01, ICT-01, FCT-01, CONV-01 |
| `IoTMeter` | One meter per EnergySource, with `tag` matching the equipment ID |
| `MeterReading` | **Hourly readings, 3 years** = 8 machines × 26,280 hourly readings = ~210K rows. Each row: `kwh`, `voltage_l1/l2/l3`, `current_l1/l2/l3`, `power_factor`, `thd`, `frequency`. Plausible patterns: REF-01 dominates; PNP-01/02 high but stable; AOI/SPI/ICT/FCT low but steady; CONV-01 negligible. |
| `ConsumptionEntry` | Daily consumption summary per machine (8 × 1095 days = ~8800 rows) |
| `UtilityBill` | Monthly bill for the Drivewave plant (36 rows). Includes PF penalty, demand overshoot, usage by ToU bucket. |
| `Inspection` + `InspectionResponse` | Q-Apps inspections — daily SMT line audits, weekly process audits, monthly compliance audits |
| `Incident` | Quality incidents — used for the "AOI rejects" / "process deviation" events |
| `CAPA` | Corrective actions linked to incidents |
| `Audit` + `AuditFinding` | IATF 16949 compliance audits |

### 1.2 New tables to add

#### `ProductionRecord`
One row per shift per line. Drivewave runs 1 SMT line, 3 shifts × 6 days × 52 weeks × 3 years = **~2,800 rows**.

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `clientId` | string | FK to Client |
| `lineId` | string | "LINE-01" |
| `shiftDate` | DateTime | |
| `shiftNumber` | int | 1, 2, or 3 |
| `unitsPlanned` | int | typically 800 |
| `unitsProduced` | int | typically 720-810 (90-101% planned) |
| `unitsRejected` | int | derived from FPY |
| `oee` | float | 0.75-0.85 typically |
| `fpy` | float | first-pass yield, 0.96-0.99 |
| `ppmDefects` | int | 50-500 |
| `cycleTimeAvgSeconds` | float | 45-65 |
| `downtimeMinutesPlanned` | int | |
| `downtimeMinutesUnplanned` | int | |
| `notes` | string? | |

#### `DefectEvent`
One row per defect detected at AOI / ICT / FCT. Average ~80 defects per shift × 2,800 shifts = **~224K rows**.

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `clientId` | string | FK to Client |
| `productionRecordId` | string | FK |
| `detectedAt` | DateTime | |
| `detectedAtMachine` | string | "AOI-01", "ICT-01", "FCT-01" |
| `boardSerial` | string | unique per ECU board |
| `defectType` | string | enum: tombstoning, insufficient_solder, solder_bridge, missing_component, misaligned_component, wrong_polarity, cold_joint, solder_ball, lifted_lead, pad_damage |
| `severity` | string | "low", "medium", "high" |
| `componentRef` | string? | e.g. "C42", "U5", "R107" |
| `actionTaken` | string | enum: rework, scrap, accept_with_deviation |
| `rootCauseSuspect` | string? | e.g. "reflow_profile_drift", "paste_viscosity", "feeder_misalign" |
| `linkedReflowExcursionId` | string? | optional FK to a reflow process event — enables the cross-source query #3 |

#### `ProcessExcursion`
Process deviations from spec — reflow profile out of bounds, paste age, etc. **~800 rows over 3 years** (sparse).

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `clientId` | string | FK |
| `machineId` | string | "REF-01", "SPI-01" |
| `parameter` | string | "zone3_temperature", "soak_time", "paste_age" |
| `expectedValue` | float | spec value |
| `observedValue` | float | actual |
| `durationSeconds` | int | how long out of bounds |
| `severity` | string | "warning", "critical" |
| `detectedAt` | DateTime | |
| `resolvedAt` | DateTime? | |
| `notes` | string? | |

### 1.3 Q-Apps tab UI inside VoltSpark

A new menu item *"Q-Apps"* on the Drivewave dashboard. Pages:

- **Production overview** — table of recent shifts with OEE / FPY / defects, sortable
- **Defects log** — table of recent DefectEvents, filterable by machine and defect type
- **Process excursions** — table of ProcessExcursions
- **Audits / CAPAs** — reuses existing VoltSpark audit + CAPA UI

Viewer-only. No entry forms.

---

## 2. PlantCost (SAP-equivalent)

Standalone Next.js + Prisma + SQLite app, separate URL, separate DB. Sober blue-grey enterprise styling.

### 2.1 Schema

#### `Asset`
One row per piece of equipment. **8 rows.**

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `assetCode` | string @unique | "SPI-01" etc |
| `assetName` | string | "Solder Paste Inspection — Cyberoptics class" |
| `category` | string | "SMT Inspection", "SMT Placement", "SMT Reflow", "Test", "Conveyance" |
| `purchasePriceInr` | float | e.g. 25000000 (₹2.5 crore for PNP) |
| `purchasePriceEur` | float | derived |
| `currentBookValueInr` | float | depreciated |
| `purchaseDate` | DateTime | 3-5 years ago |
| `manufacturer` | string | generic ("Yamaha-class", "BTU-class") |
| `installedAtPlant` | string | "Pune SMT-1" |
| `lifespanYears` | int | typically 7-10 |
| `depreciationMethod` | string | "straight_line" |

#### `WorkOrder`
Cost-side work orders (not maintenance work orders — those live in mTrack). Things like consumables purchase, calibration vendor charges, line-modification capex. **~500 rows over 3 years.**

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `workOrderNumber` | string @unique | "WO-2024-00342" |
| `assetCode` | string | FK-ish |
| `category` | string | "consumable", "calibration", "spare_part", "line_mod" |
| `description` | string | |
| `costInr` | float | |
| `vendor` | string | generic vendor names |
| `issuedAt` | DateTime | |
| `closedAt` | DateTime? | |
| `status` | string | "open", "closed" |

#### `MonthlyCostSummary`
Per-machine monthly totals for fast chatbot lookup. **8 machines × 36 months = 288 rows.**

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `assetCode` | string | |
| `yearMonth` | string | "2026-03" |
| `energyCostInr` | float | from VoltSpark consumption × tariff |
| `maintenanceCostInr` | float | from mTrack PMs + breakdowns |
| `consumablesCostInr` | float | from WorkOrder |
| `depreciationInr` | float | monthly straight-line |
| `totalRunCostInr` | float | sum |
| `unitsProduced` | int | from VoltSpark ProductionRecord (allocated to line not machine, but stored here for chatbot ease) |
| `costPerUnitInr` | float | derived |

### 2.2 Pages
- `/` — Asset list table
- `/asset/[id]` — Asset detail (current value, monthly cost trend chart, work-order list)
- `/reports` — Monthly cost summary table

### 2.3 API endpoints (for PlantMind)
- `GET /api/assets`
- `GET /api/asset/:assetCode`
- `GET /api/cost-summary?asset=...&period=...`
- `GET /api/work-orders?asset=...&category=...`

---

## 3. mTrack (MES-equivalent for maintenance)

Standalone Next.js + Prisma + SQLite app, separate URL, separate DB. Amber/red status pill styling so it's visibly distinct from PlantCost.

### 3.1 Schema

#### `Equipment`
Mirrors PlantCost.Asset but with maintenance-specific fields. **8 rows.**

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `equipmentCode` | string @unique | "SPI-01" etc — must match across apps |
| `equipmentName` | string | |
| `criticality` | string | "A", "B", "C" — A = line-stopper |
| `pmFrequencyDays` | int | 7, 30, 90 typical |
| `nextPmDate` | DateTime | |
| `lastPmDate` | DateTime | |
| `daysOverdue` | int | derived |

#### `PMRecord`
One row per scheduled or completed PM. **8 machines × varied cadence × 3 years = ~700 rows.**

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `equipmentCode` | string | |
| `pmType` | string | "weekly_check", "monthly_full", "quarterly_calibration", "annual_overhaul" |
| `scheduledDate` | DateTime | |
| `completedDate` | DateTime? | null = overdue or upcoming |
| `technicianId` | string | "TECH-01" through "TECH-05" |
| `durationMinutes` | int? | |
| `findings` | string? | |
| `costInr` | float? | spare parts + labor |

#### `Breakdown`
Unplanned downtime events. **~200 rows over 3 years (a few per month).**

| Field | Type | Notes |
|---|---|---|
| `id` | string | cuid |
| `equipmentCode` | string | |
| `startedAt` | DateTime | |
| `restoredAt` | DateTime? | |
| `durationMinutes` | int | |
| `cause` | string | "feeder_jam", "vacuum_loss", "thermocouple_drift", "encoder_fault", "software_error", "operator_error" |
| `actionTaken` | string | |
| `productionImpactUnits` | int | units lost during downtime |
| `costInr` | float? | repair cost |

### 3.2 Pages
- `/` — PM dashboard table (Overdue / Due This Week / OK pills)
- `/equipment/[code]` — equipment detail (PM history + breakdown history)
- `/breakdowns` — chronological breakdown log

### 3.3 API endpoints (for PlantMind)
- `GET /api/equipment`
- `GET /api/pms?status=overdue&sort=criticality`
- `GET /api/equipment/:code/pms`
- `GET /api/breakdowns?equipment=...&period=...`

---

## 4. PlantMind (AI Chat app)

No DB of its own. Pure orchestration layer. Calls the four sources via REST API.

### 4.1 Stack
- Next.js + Vercel
- Gemini 2.5 Flash via the official `@google/generative-ai` SDK
- Function-calling configured with the function definitions in §4.2
- Optional: lightweight chat history in localStorage (for demo continuity)
- XLSX export via `exceljs` library

### 4.2 Function definitions

The LLM only ever calls these — never writes raw SQL. Each maps to one (or for cross-source, multiple) backend API call.

```
get_meter_telemetry(machine_id: str, period_start: date, period_end: date)
  → calls VoltSpark /api/meter-readings
  → returns: array of {timestamp, kwh, pf, thd, voltage, current}

get_consumption_summary(machine_id?: str, period: str)
  → calls VoltSpark /api/consumption-summary
  → returns: aggregated totals + anomalies

get_qapps_production(line_id?: str, period_start: date, period_end: date)
  → calls VoltSpark /api/production-records
  → returns: shift-level OEE/FPY/defect rates

get_qapps_defects(machine_id?: str, defect_type?: str, period: str)
  → calls VoltSpark /api/defect-events
  → returns: array of defect events

get_qapps_process_excursions(machine_id?: str, parameter?: str, period: str)
  → calls VoltSpark /api/process-excursions
  → returns: deviations from spec

get_sap_assets(category?: str)
  → calls PlantCost /api/assets
  → returns: asset list with values

get_sap_cost_summary(asset_code?: str, period: str)
  → calls PlantCost /api/cost-summary
  → returns: monthly cost breakdown

get_mes_overdue_pms(criticality?: str)
  → calls mTrack /api/pms?status=overdue
  → returns: equipment list with days overdue

get_mes_breakdowns(equipment_code?: str, period: str)
  → calls mTrack /api/breakdowns
  → returns: breakdown events

generate_xlsx_report(report_type: str, params: object)
  → server-side aggregation + exceljs
  → returns: download URL for the generated file
```

### 4.3 Source labels in responses

Every chatbot response includes a footer:

> *Sources: VoltSpark (Energy) · mTrack (MES)*

This is the visible multi-source story. The chatbot's response template appends this automatically based on which functions were called.

### 4.4 Pages
- `/` — chat interface (single page, similar to Claude / ChatGPT minimal UI)
- `/api/chat` — server route handling the Gemini call + function dispatch
- `/api/report/[id]` — XLSX file download endpoint

---

## 5. PCB Scanner (vision segment, separate)

Sealed off from this stack. Brief schema for completeness:

- `/` — upload PCB image
- Server calls Gemini Vision API with few-shot prompt (good + bad reference examples per defect class)
- Returns verdict: defect type(s) detected, severity, confidence
- No persistent DB needed — stateless inspection per upload
- Optional: keep last 50 inspections in localStorage for demo continuity

---

## 6. 3-year seed strategy

### 6.1 Volume estimate per app

| Table | Row count | Storage |
|---|---|---|
| VoltSpark MeterReading (hourly × 8 machines × 3 yr) | ~210K rows | ~30 MB |
| VoltSpark ConsumptionEntry (daily × 8 × 3 yr) | ~8.8K rows | ~1 MB |
| VoltSpark ProductionRecord (3 shifts × 6 days × 52 weeks × 3 yr) | ~2.8K rows | <1 MB |
| VoltSpark DefectEvent (avg 80/shift × 2.8K shifts) | ~224K rows | ~30 MB |
| VoltSpark ProcessExcursion (sparse) | ~800 rows | <1 MB |
| VoltSpark UtilityBill (monthly) | 36 rows | trivial |
| VoltSpark Inspection / Incident / CAPA | ~500 rows total | trivial |
| PlantCost Asset | 8 rows | trivial |
| PlantCost WorkOrder | ~500 rows | <1 MB |
| PlantCost MonthlyCostSummary | 288 rows | trivial |
| mTrack Equipment | 8 rows | trivial |
| mTrack PMRecord | ~700 rows | <1 MB |
| mTrack Breakdown | ~200 rows | trivial |

**Total: ~450K rows across all apps, ~65 MB. Trivial for SQLite.** Comfortably handled by libSQL on Vercel.

### 6.2 Seed script approach

Write **one master seeder** in TypeScript that:

1. Generates a realistic time-series for each machine's energy (3-year hourly with shift-based + weekday/weekend patterns + drift over time).
2. Derives per-shift `ProductionRecord` from the energy patterns + fixed OEE/FPY distributions.
3. For each shift, generates `DefectEvent` rows from a defect-distribution per machine.
4. Inserts `ProcessExcursion` rows on roughly 1% of shifts, biased toward REF-01.
5. Computes monthly `UtilityBill` from the consumption.
6. Generates `MonthlyCostSummary` (PlantCost) by joining VoltSpark consumption × tariff × maintenance cost.
7. Generates `PMRecord` per machine according to PM cadence; 5-10% of PMs are deferred (creates the overdue-PM story for Query #2).
8. Generates `Breakdown` events more frequently for machines whose PMs were deferred — gives the chatbot a juicy correlation to surface in cross-source queries.
9. Generates `Inspection`, `Incident`, `CAPA` linked to the defect distribution.

**Coupling between datasets is the magic.** When the chatbot answers *"AOI rejects on Line 1 with reflow profile excursions"*, the answer is grounded in **actual coupled data** — not random — because the seeder generated reflow excursions and AOI defects with realistic correlation.

This is ~1 day to write properly. Pays for itself in demo credibility.

### 6.3 Seasonality / drift to bake in

Realistic patterns the Germans expect:
- **Annual:** cooling season higher AC load → marginally higher kWh in Apr-Sep.
- **Weekly:** Sunday off (or low load), Saturday partial.
- **Daily:** 3-shift = roughly flat; small ramp-up at shift handovers.
- **Drift:** REF-01 thermocouple drift increases gradually starting ~6 months before a breakdown event we'll plant in (e.g.) March 2026 — Germans like to see "the problem was visible in the data months before the breakdown."
- **Festivals:** Diwali shutdown ~5 days, year-end shutdown 5 days, summer maintenance week.

---

## 7. Build order (reflecting schemas)

| Day | Build focus |
|---|---|
| Fri 8 May (today) | Industry research; lock customer name; write Prisma schemas (this doc); set up 3 fresh Vercel projects; reply to Vinay |
| Sat 9 May | Reskin VoltSpark for Drivewave + write seed script + seed energy/consumption/bill data; build PlantCost schema + viewer UI |
| Sun 10 May | Build mTrack schema + viewer UI; seed Q-Apps tables + tab UI inside VoltSpark; finish PlantCost seed |
| Mon 11 May | PlantMind UI + Gemini integration + first 3 function calls (single-source warm-up working) |
| Tue 12 May | Remaining function calls + cross-source orchestration + XLSX export |
| Wed 13 May | First joint dry run with Suresh; revisions |
| Thu 14 May | Final polish + contingency tests + second dry run |
| Fri 15 May | Setup at venue 09:00; demo 09:30–11:00 |

---

## 8. What's *not* in scope

- Real ingestion pipelines (the data is seeded, not streamed).
- Real authentication for PlantCost / mTrack / PlantMind (basic placeholder login is enough).
- Multi-tenant for the new apps (Drivewave is the only customer in scope).
- Mobile apps for the new mini-apps (web only).
- Real-time updates (point-in-time data is fine for demo).
- AWS Bedrock deployment (Gemini direct for demo; verbal Bedrock framing for production).
