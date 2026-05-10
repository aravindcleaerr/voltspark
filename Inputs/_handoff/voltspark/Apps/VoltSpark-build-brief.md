# VoltSpark Build Brief — Vitesco Demo (15 May 2026)

**For:** VoltSpark development team
**Drafted:** 2026-05-10
**Hard deadline:** EOD Monday 11 May (so PlantMind integration can start Tuesday)
**Demo:** Friday 15 May, 09:30–11:00 IST, Vitesco Tech Centre Bangalore

---

## Why this exists

Schaeffler's *Quality Operations Strategy* leadership (Aurelio Eramo + Michael Hutzler from Germany, Umesh Revanna from Asia Pacific) is visiting Bangalore on 15 May to evaluate AI for Quality solutions. SIS is presenting two segments — vision AI (Aravind, 30 min) and Gen AI multi-source data analytics (Suresh Kamat, 20 min, the chatbot **PlantMind**).

PlantMind federates data across four operational systems mocking a Tier-1 automotive electronics supplier called **Drivewave Automotive Pvt Ltd**. VoltSpark plays two of those four roles in the demo:

- **VoltSpark Energy** — energy + equipment telemetry (existing capability)
- **VoltSpark Q-Apps** — production records, defect events, process excursions (NEW)

VoltSpark also serves as the dashboard the audience opens in a browser tab at the start of the demo, so it needs to look credible for an automotive electronics customer (not the existing CNC-machining customer).

---

## What to build (in priority order)

### Phase 1 — Backend (MUST be done by EOD Mon 11 May)

PlantMind cannot integrate without these. If anything slips, slip Phase 2 not Phase 1.

1. **Onboard a fresh Client: "Drivewave Automotive Pvt Ltd"** (slug `drivewave`). Industry: *Automotive Electronics — Tier-1 Supplier*. Plant: *Pune SMT-1*. Multi-tenant — must not affect existing clients.
2. **Add 3 new Prisma models** — see `Apps/VoltSpark-additions.prisma` for the exact schema. Models: `ProductionRecord`, `DefectEvent`, `ProcessExcursion`. Add the corresponding back-relations (`productionRecords`, `defectEvents`, `processExcursions`) to the existing `Client` model.
3. **Run migration** — `npx prisma migrate dev --name add_qapps_smt_models`
4. **Wire the seed script** — see `Apps/VoltSpark-additions-seed.ts`. It depends on three shared files which need to be copied into the VoltSpark repo:
   - `Apps/_shared/equipment.ts` → `voltspark/prisma/_shared/equipment.ts`
   - `Apps/_shared/scripted-events.ts` → `voltspark/prisma/_shared/scripted-events.ts`
   - `Apps/_shared/time-helpers.ts` → `voltspark/prisma/_shared/time-helpers.ts`
   Adjust the import paths in `VoltSpark-additions-seed.ts` after copying. Then call the exported `seedDrivewaveQAppsData()` from VoltSpark's main `prisma/seed.ts`.
5. **Seed Drivewave's existing-model data** before running the new seeder:
   - `EnergySource` (8 rows — one per machine code: SPI-01, PNP-01, PNP-02, REF-01, AOI-01, ICT-01, FCT-01, CONV-01)
   - `IoTMeter` (8 rows — one per EnergySource, `tag` matches the equipment code)
   - `MeterReading` (~210K rows — hourly across 3 years, using the energy patterns in `_shared/time-helpers.ts`)
   - `ConsumptionEntry` (~8.8K rows — daily summary)
   - `UtilityBill` (36 rows — monthly bills with PF penalty + demand overshoot baked in for 2 months)
   - A handful of `Inspection`, `Incident`, `CAPA`, `Audit` records to populate the existing audit / quality UI for Drivewave
6. **Build 5 new API endpoints** — exact contracts in §API Contracts below. Must accept the query params PlantMind sends. Must scope to Drivewave's `clientId`. JSON responses with flat field names matching the Prisma models.

### Phase 2 — UI (SHOULD be done by EOD Mon 11 May)

The Drivewave dashboard must look credible when the audience opens it as a browser tab.

7. **Equipment-name visibility** — wherever VoltSpark's existing UI lists energy sources / meters / dashboards, the names should display as the SMT-line cast (Pick-and-Place, Reflow Oven, AOI, etc.) when Drivewave is the active client. No hardcoding — uses the seeded `EnergySource.name`.
8. **New Q-Apps tab** in VoltSpark's left-nav for Drivewave only (or a feature flag). Four sub-pages, all viewer-only:
   - **Production overview** — table of recent shifts: date, shift, units produced/rejected, OEE, FPY, PPM, cycle time. Filter by date range + line.
   - **Defects log** — table of recent DefectEvents: timestamp, machine, defect type, severity, action taken, root cause suspect. Filter by machine + defect type + date range.
   - **Process excursions** — table of ProcessExcursion rows: machine, parameter, expected, observed, severity, detected at. Filter by machine + parameter.
   - **Audits / CAPAs** — reuse the existing audit + CAPA UI; just verify it renders cleanly for Drivewave.

### Phase 3 — Polish (NICE if time permits)

9. Sparkline / trend on the Production overview (OEE over last 30 shifts).
10. "Bad actor" highlight — defects log highlights machines exceeding 100 PPM in red.
11. Drill-down from a process excursion → defect events linked to it (via `linkedReflowExcursionId`).

---

## API Contracts — exact specs PlantMind sends and expects

PlantMind calls VoltSpark via these 5 endpoints. The query params, field names, and JSON shape MUST match — PlantMind's function-calling layer was built against this contract.

For demo simplicity, scope to Drivewave's `clientId` server-side (hardcode lookup `where: { slug: "drivewave" }` or use an API key per-client; either is fine for the demo).

### `GET /api/meter-readings`

Query: `?machineId=PNP-02&periodStart=2026-03-01&periodEnd=2026-03-31`

Response (200 OK):
```json
{
  "machineId": "PNP-02",
  "periodStart": "2026-03-01",
  "periodEnd": "2026-03-31",
  "readings": [
    { "timestamp": "2026-03-01T06:00:00Z", "kwh": 6.4, "voltage": 415.2, "current": 9.1, "powerFactor": 0.94, "thd": 4.2 },
    ...
  ]
}
```

### `GET /api/consumption-summary`

Query: `?machineId=PNP-02&period=2026-03` *(or `period=last_30_days`)*. `machineId` optional — omitted = plant-wide.

Response:
```json
{
  "machineId": "PNP-02",
  "period": "2026-03",
  "totalKwh": 5040,
  "avgPowerFactor": 0.94,
  "minPowerFactor": 0.86,
  "maxPowerFactor": 0.97,
  "avgThd": 4.5,
  "anomalyCount": 3,
  "anomalies": [
    { "timestamp": "2026-03-08T14:00:00Z", "type": "low_power_factor", "value": 0.86 }
  ]
}
```

### `GET /api/production-records`

Query: `?lineId=LINE-01&periodStart=2026-04-01&periodEnd=2026-04-30`. `lineId` defaults to `LINE-01`.

Response: array of records with the exact field names from `ProductionRecord` model:
```json
{
  "lineId": "LINE-01",
  "records": [
    {
      "shiftDate": "2026-04-15",
      "shiftNumber": 1,
      "unitsPlanned": 800,
      "unitsProduced": 765,
      "unitsRejected": 14,
      "oee": 0.812,
      "fpy": 0.982,
      "ppmDefects": 18300,
      "cycleTimeAvgSeconds": 54.2,
      "downtimeMinutesPlanned": 30,
      "downtimeMinutesUnplanned": 8
    },
    ...
  ]
}
```

### `GET /api/defect-events`

Query: `?machineId=AOI-01&defectType=tombstoning&period=last_7_days`. All optional.

Response:
```json
{
  "filter": { "machineId": "AOI-01", "defectType": "tombstoning", "period": "last_7_days" },
  "count": 42,
  "events": [
    {
      "detectedAt": "2026-05-08T10:23:00Z",
      "detectedAtMachine": "AOI-01",
      "boardSerial": "ECU-2026-00123456",
      "defectType": "tombstoning",
      "severity": "medium",
      "componentRef": "C42",
      "actionTaken": "rework",
      "rootCauseSuspect": "paste_viscosity",
      "linkedReflowExcursionId": "ckxxx..."
    },
    ...
  ]
}
```

### `GET /api/process-excursions`

Query: `?machineId=REF-01&parameter=zone3_temperature&period=last_7_days`. All optional.

Response:
```json
{
  "filter": { "machineId": "REF-01", "parameter": "zone3_temperature", "period": "last_7_days" },
  "count": 8,
  "excursions": [
    {
      "id": "ckxxx...",
      "detectedAt": "2026-05-07T14:32:00Z",
      "machineId": "REF-01",
      "parameter": "zone3_temperature",
      "expectedValue": 245.0,
      "observedValue": 257.4,
      "durationSeconds": 95,
      "severity": "warning",
      "resolvedAt": "2026-05-07T14:34:00Z",
      "notes": "Zone-3 thermocouple drift event — severity rising"
    },
    ...
  ]
}
```

**Period parsing helper** — accept these formats across all endpoints:
- `YYYY-MM` → that calendar month
- `YYYY-MM-DD..YYYY-MM-DD` → range
- `last_N_days` → from N days ago to today

---

## Inputs delivered to you

All in `d:\Project-AI\PSS\Vitesco\Apps\`:

| File | Use |
|---|---|
| `VoltSpark-additions.prisma` | The 3 new Prisma models. Paste into VoltSpark's `schema.prisma`. Don't forget the back-relations on `Client`. |
| `VoltSpark-additions-seed.ts` | Seed script for new tables. Adjust import paths after copying `_shared/` into VoltSpark repo. |
| `_shared/equipment.ts` | The 8-machine SMT cast + Drivewave tenant config. Copy into VoltSpark repo. |
| `_shared/scripted-events.ts` | Timeline of "interesting moments" that drive realistic correlations. Copy in. |
| `_shared/time-helpers.ts` | Deterministic PRNG, shift schedules, energy patterns. Copy in. |

For broader context: `d:\Project-AI\PSS\Vitesco\grand-plan.md` (overall demo plan) and `d:\Project-AI\PSS\Vitesco\data-schemas.md` (full schema reference).

---

## Acceptance criteria

You're done with Phase 1 when:

- [ ] Drivewave client exists in DB with industry/plant/contract-demand/PF-target populated.
- [ ] All 8 EnergySource + IoTMeter rows seeded with SMT-cast names (SPI-01 through CONV-01).
- [ ] ~210K MeterReading rows seeded across 3 years (2023-05-15 to 2026-05-14).
- [ ] All three new Q-Apps tables seeded: ~2,800 ProductionRecords, ~800 ProcessExcursions, ~224K DefectEvents.
- [ ] Each of the 5 API endpoints returns valid JSON to a `curl` test against Drivewave's data, scoped correctly, with the exact field names above.
- [ ] **Spot-check Q3's killer query data:** call `/api/process-excursions?machineId=REF-01&parameter=zone3_temperature&period=last_180_days` — should return ≥10 rows. Then call `/api/defect-events?machineId=AOI-01&period=last_180_days` — at least 25% of rows in the drift window should have `linkedReflowExcursionId` populated. **This is the data coupling that makes the cross-source chatbot demo work.**

You're done with Phase 2 when:

- [ ] Logging in as Drivewave's user, the existing energy dashboards display the SMT equipment names (PNP-02, REF-01, etc.) — not Unnathi-CNC equipment.
- [ ] A new "Q-Apps" tab is visible in the left nav and renders the 4 sub-pages cleanly.
- [ ] All existing Drivewave dashboards (Energy / Compliance / Audits / etc.) load without errors.

---

## Don't break

- Existing customers (Unnathi CNC, A Plus Fixtures, anyone else in production). Drivewave is a new tenant; no schema changes affect existing data.
- Existing dashboards. The new tables are additive.
- Migration: ONLY a new migration file — no edits to existing migrations.

---

## Questions to flag back

If any of these don't match what's in VoltSpark today, raise them ASAP — they affect the schema or seed:

- Multi-tenant filter shape — does `Client.slug = "drivewave"` work, or is there an Org-prefix pattern to follow?
- Existing `EnergySource` model fields — does it support our equipment metadata (kwAvg, kwPeak, criticality)? If missing, we extend it or attach a sidecar table.
- Authentication on the new API endpoints — do you want to require an API key, JWT, or leave public-with-read-only for the demo? (PlantMind will pass whatever's required via env var.)

---

*If you're using Claude Code to execute this brief, paste this whole document into a new session in the VoltSpark repo and ask: "Execute the Phase 1 portion of this brief end-to-end, asking me to clarify anything ambiguous before each major change."*
