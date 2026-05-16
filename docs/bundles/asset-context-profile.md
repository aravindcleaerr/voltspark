# Asset Context Profile — Schema Specification

**Version:** 0.1 (draft) · **Date:** 2026-05-16
**Status:** Design spec — not yet built
**Purpose:** Define the **keystone** object of context-aware VoltSpark. Every bundle (Manufacturing, Healthcare, …) and every smart feature (alerts, reports, AI answers, benchmarks) reads from this object. Build this and the bundles become views on top of it.

> **The one-line idea.** Today VoltSpark stores a meter and a stream of kWh. The Asset Context Profile (ACP) stores *what the meter is looking at* — the machine, its design intent, what failure costs, who reads the report. The same electrical signal becomes meaningful because the ACP gives it context.

---

## 1 · Two object types

| Object | Scope | Lifecycle | Analogy |
|---|---|---|---|
| **AssetTemplate** | Global (reference data, not tenant-scoped) | Seeded once per bundle; versioned | The equipment library / catalog |
| **AssetContextProfile** | Per-client, per-asset (`clientId` required) | Created at onboarding from a template, then tuned + kept fresh | The filled-in profile of one real machine |

**AssetTemplate** is the industry knowledge — "what a wire-cut EDM is", "what an MRI scanner is". A bundle ships a set of them. It is deliberately **not** tenant-scoped (same exception as the 7 global ROI templates) — it is a catalog, not customer data.

**AssetContextProfile** is one customer's one asset. You onboard an asset by picking a template; the ACP is pre-filled from the template defaults, then tuned to the real machine. Every ACP **must** carry `clientId` for tenant isolation.

---

## 2 · AssetTemplate — the equipment library entry

```prisma
model AssetTemplate {
  id                   String   @id @default(cuid())
  key                  String   @unique          // "wire-cut-edm", "mri-scanner"
  bundleType           String                     // "MANUFACTURING" | "HEALTHCARE" | ...
  name                 String                     // "Wire-cut EDM"
  category             String                     // "machine-tool" | "imaging" | "hvac" | ...
  version              Int      @default(1)        // bump when defaults change

  // Design-intent defaults
  ratedPowerMinKw      Float?
  ratedPowerMaxKw      Float?
  cycleStructure       String   // "short-repetitive" | "long-unattended" | "batch" | "continuous"
  criticalityDefault   String   // "critical" | "important" | "standard" | "non-critical"
  recommendedMeterTier String   // "BASIC" | "STANDARD" | "ADVANCED" | "POWER_QUALITY"

  // Structured defaults (JSON — see §5 for shapes)
  powerStates          Json     // [{ state, label, expectedKwPctRange }]
  operatingEnvelope    Json     // { pfRange, voltageBand, sensorBands, ... }
  primaryKpis          Json     // ["kwh_per_part", "idle_energy_pct", ...]
  failureModes         Json     // [{ key, label, currency, costModel }]
  defaultAlerts        Json     // [{ key, trigger, severity, currency }]

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

> **SQLite/Turso note:** Prisma `Json` is supported on SQLite. If the codebase prefers the existing convention, store as `String` and `JSON.parse`/`stringify` at the boundary — but `Json` is cleaner and recommended here.

---

## 3 · AssetContextProfile — one real asset

```prisma
model AssetContextProfile {
  id               String   @id @default(cuid())
  clientId         String                          // REQUIRED — tenant isolation
  client           Client   @relation(fields: [clientId], references: [id])

  name             String                          // "Wire-cut EDM #1"
  templateKey      String                          // → AssetTemplate.key
  templateVersion  Int                             // which template version was applied

  // --- Linkage: what measures this asset ---
  energySourceId   String?                         // existing EnergySource / Meter
  meteringMode     String   @default("DEDICATED")  // "DEDICATED" | "BAY_SHARED"

  // --- Static: design intent (seeded from template, then tuned) ---
  assetCategory    String
  manufacturer     String?
  model            String?
  yearInstalled    Int?
  ratedPowerKw     Float?
  criticality      String                          // critical | important | standard | non-critical

  // --- Static: operating envelope (the "good" band) ---
  operatingEnvelope Json                            // { powerStates, pfRange, voltageBand, sensorBands, runWindow }

  // --- Business context ---
  unitOfOutput     String?                         // "part" | "patient-day" | "scan" | "room-night"
  painCurrency     String?                         // "cost" | "scrap" | "uptime" | "compliance" | "safety"
  activeKpis       Json                            // KPI keys enabled for this asset

  // --- Failure cost model (turns physics into ₹/risk) ---
  failureModes     Json                            // [{ key, label, currency, unitCost }]

  // --- Audience: who reports about this asset are shaped for ---
  reportAudiences  Json                            // ["owner","supervisor","auditor","customer"]

  // --- Live / derived ---
  currentState     String?                         // last detected state
  lastStateAt      DateTime?

  // --- Reconciliation (see §6) ---
  reconcileStatus  String   @default("UNVERIFIED")  // OK | DRIFT | UNVERIFIED
  reconcileNote    String?
  lastReconciledAt DateTime?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  reviews          ContextReview[]

  @@index([clientId])
}
```

---

## 4 · ContextReview — the 5-tier refresh model in practice

Every product treats onboarding as a one-time form, so context rots. The ACP fixes this: each **context section** has an owner and a refresh policy. `ContextReview` is the row that says "this section was last verified on X, is due again on Y."

```prisma
model ContextReview {
  id             String   @id @default(cuid())
  clientId       String                            // REQUIRED
  profileId      String
  profile        AssetContextProfile @relation(fields: [profileId], references: [id])

  section        String   // "DESIGN" | "ENVELOPE" | "BUSINESS" | "TARIFF" | "OPERATIONS"
  refreshTier    String   // "STATIC" | "SLOW" | "EVENT" | "LIVE"
  ownerUserId    String?  // who keeps this section fresh
  lastReviewedAt DateTime?
  nextReviewAt   DateTime?
  status         String   @default("CURRENT")      // CURRENT | DUE | STALE

  @@index([clientId])
}
```

| Section | Default tier | Default review cadence |
|---|---|---|
| DESIGN (asset type, nameplate, rated power) | STATIC | On change only |
| ENVELOPE (expected bands, run window) | STATIC | Yearly |
| BUSINESS (unit of output, pain currency, KPIs) | SLOW | Yearly |
| TARIFF (rates, demand, PF formula) | SLOW | Quarterly |
| OPERATIONS (jobs, occupancy, shifts) | EVENT / LIVE | Continuous |

A nightly job flips `status` to `DUE`/`STALE` past `nextReviewAt` — this powers a "verify your tariff" prompt and feeds the compliance calendar. *v1 may defer ContextReview and track refresh inline; the table is what makes staleness queryable across the whole portfolio.*

---

## 5 · JSON shapes

```jsonc
// operatingEnvelope
{
  "powerStates": [
    { "state": "OFF",      "expectedKwPctRange": [0, 2] },
    { "state": "IDLE",     "expectedKwPctRange": [2, 25] },
    { "state": "RUNNING",  "expectedKwPctRange": [25, 110] }
  ],
  "pfRange": [0.80, 0.98],
  "voltageBand": [395, 433],          // 415V ±~4%
  "runWindow": { "shiftRef": "A,B", "allowedOutsideShift": false },
  "sensorBands": { "tempC": [18, 45] }
}

// failureModes  (each occurrence has a ₹ cost)
[
  { "key": "mid_cycle_interruption", "label": "Power loss mid-cut",
    "currency": "scrap", "unitCost": 8500 },
  { "key": "overnight_idle", "label": "Ran idle after job complete",
    "currency": "cost", "costModel": "idle_kw * hours * tariff" }
]
```

---

## 6 · The context reconciliation loop — live data audits static data

The most important behaviour. Onboarding inputs are imperfect; nobody enters a perfect nameplate. So a background job continuously checks the **declared static context** against the **measured live stream** and flags drift. This means you do **not** need perfect day-1 inputs — the system converges.

| Check | Declared | Measured | If mismatch → |
|---|---|---|---|
| Nameplate sanity | `ratedPowerKw` | sustained peak kW | DRIFT — "nameplate wrong or meter mismapped" |
| Tariff sanity | TARIFF section rate | rate implied by latest bill | DRIFT — "tariff on file may be outdated" |
| Run-window sanity | `runWindow` | observed run pattern | DRIFT — "asset runs outside declared shift" |
| Asset-type sanity | `templateKey` power signature | observed signature shape | DRIFT — "signature doesn't match a <type>" |

`reconcileStatus` on the ACP holds the result (`OK` / `DRIFT` / `UNVERIFIED`); `reconcileNote` carries the human-readable finding. DRIFT surfaces as a low-severity "verify your setup" item, never a hard failure.

---

## 7 · How a bundle plugs in

1. **Bundle ships AssetTemplates.** Manufacturing seeds `wire-cut-edm`, `cnc-vmc`, `cnc-turning`, `grinder`, `air-compressor`, … Healthcare seeds `mri-scanner`, `cssd-autoclave`, `ot-ahu`, `chiller`, `vaccine-fridge`, …
2. **Onboarding creates ACPs.** The bundle-aware questionnaire asks "what assets?"; each answer picks a template and creates an ACP pre-filled from template defaults.
3. **User tunes the ACP.** Real nameplate, real failure costs — or leaves defaults and lets reconciliation correct them.
4. **Every feature reads the ACP.** The alert engine reads `operatingEnvelope` + `failureModes`; reports read `reportAudiences`; benchmarks group by `templateKey`; the AI layer reads the whole profile.

The bundle never hard-codes "machine" or "ward" — it supplies *templates*; the ACP is the *container*. This is what keeps VoltSpark multi-industry.

---

## 8 · Core neutrality principle

For the ACP to work, the **universal core must never bypass it**. Audit the existing codebase for industry bias:

- ❌ Code that assumes a "shift calendar" always exists → a 24/7 hospital has no shift-off.
- ❌ Code that assumes "idle detection" is always meaningful → a hospital is never idle.
- ❌ Hard-coded "kWh per part" → meaningless for a ward.
- ✅ Core reads `unitOfOutput`, `operatingEnvelope`, `painCurrency` from the ACP and adapts.

**Rule:** any logic that differs by industry belongs in an AssetTemplate or the ACP — never in the core.

---

## 9 · Maturity levels expressed through the ACP

| Level | ACP completeness |
|---|---|
| **L0** | No ACP — just a raw meter. Generic kWh charts. |
| **L1** | ACP exists: `templateKey` + `operatingEnvelope` + tariff. Idle/utilisation/penalty insight, real ₹. |
| **L2** | ACP has full design intent + `failureModes` + production/occupancy data. Deviation-from-design, cost-per-output. |
| **L3** | ACP enriched by ERP/integration; `ContextReview` fully owned; cross-client benchmarking on `templateKey`. |

---

## 10 · Net-new vs reused

**Net-new models:** `AssetTemplate`, `AssetContextProfile`, `ContextReview`.
**Reuses:** `Client`, `EnergySource`/`Meter`/`MeterReading`, `ConsumptionEntry`, `requireClient()`, Framework Engine, ROI templates.
**Net-new services:** state-detection engine (writes `currentState`), reconciliation job (writes `reconcileStatus`), the design-aware alert evaluator (reads `operatingEnvelope` + `failureModes`).

Bundle-specific entities (Manufacturing's `Machine`/`ProductionJob`, Healthcare's `Ward`/`OT`) attach to an ACP rather than duplicating context — the ACP is the shared spine.
