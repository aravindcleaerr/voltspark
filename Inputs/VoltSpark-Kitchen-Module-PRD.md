# VoltSpark — Kitchen Intelligence Module
## Product Requirements Document (PRD)
### Add-on Module for Commercial Induction Kitchens
**Prepared by:** Akshaya Createch
**Branding:** "Akshaya Createch Kitchen Intelligence, powered by VoltSpark"
**Integration model:** Embedded add-on module within VoltSpark SaaS
**Client access:** Kitchen client gets a VoltSpark login with a Kitchen workspace type

---

## 1. Context & Problem Statement

Akshaya Createch installs commercial induction kitchen systems for restaurants, cloud kitchens, hospitals, temples, colleges, and corporate cafeterias across South India. These kitchens face three financial pain points that technology can eliminate:

1. **Maximum Demand (MD) Penalties** — HT/LT commercial consumers have a contracted demand with their DISCOM. Multiple induction burners firing simultaneously can spike demand beyond contracted limits. BESCOM charges 2× the MD rate for excess demand. A single bad month can cost ₹7,000–₹50,000+ in penalties.

2. **Power Factor (PF) Penalties** — BESCOM mandates PF ≥ 0.90. Below threshold: 1–2% surcharge per 0.01 drop on the entire monthly bill. Unmanaged induction loads can cause PF dips.

3. **Time-of-Day (ToD) Overspend** — BESCOM HT consumers pay +20–50% surcharge during peak hours (6–10 AM, 6–10 PM). Shiftable kitchen tasks running during peak hours waste ₹15,000–₹1,00,000+/year.

**The solution:** The Kitchen Intelligence module turns VoltSpark from a post-facto bill analyzer into a real-time penalty prevention and load management platform, specific to commercial induction kitchens.

---

## 2. Hardware Ecosystem

### Primary IoT Device: Tor Titan (by Tor.ai)
- **Device:** Tor Titan Multi-Function Meter / Power Monitoring Unit
- **Website:** www.tor.ai
- **Models relevant for kitchen use:**

| Model | Use Case | Key Features |
|-------|----------|--------------|
| **Titan 212** | Starter kitchen (incomer only) | No display, RS-485 + WiFi + BLE, 68 params |
| **Titan 312** | Smart kitchen (main monitoring) | 3.5" TFT display, RS-485 + WiFi + BLE |
| **Titan 313** | Smart kitchen (monitoring + control) | Display + WiFi + BLE + **2 Digital I/O** |
| **Titan 411** | Enterprise (full instrumentation) | Display + WiFi + BLE + **2 Digital I/O** + Transient Analysis |

### Key Titan Capabilities Used by This Module:
- **68 electrical parameters:** Voltage (phase/line), Current (per phase), Active/Reactive/Apparent Power, Power Factor (phase-wise + average), Energy (kWh, kVARh), **Maximum Demand (cumulative + peak)**, Frequency, THD Voltage, THD Current, Harmonics to 31st order
- **Built-in WiFi (IEEE 802.11):** Pushes data to cloud at configurable intervals
- **Digital Outputs (313/411):** 2× DOs — used to trigger load-shedding relays/contactors
- **Analog Inputs (313/411):** 2× AI (4–20mA or 0–500 ohm) — used for temperature probes (HACCP)
- **Built-in Scheduling (313/411):** RTC-based event triggers — can auto-shed loads on ToD schedule
- **Modbus RS-485:** For local polling if WiFi not reliable
- **Accuracy:** Class 0.5S (utility-grade)

### Load Control Hardware (Akshaya Createch supplies):
- **Schneider Electric** contactors/relays for load shedding
- APFC (Automatic Power Factor Correction) panels — Schneider or equivalent
- MCB/RCCB protection panels per zone
- Akshaya Createch designs the SLD and commissions the full panel

---

## 3. System Architecture

```
Kitchen Floor
├── Induction Zone 1 (5 kW)  ─┐
├── Induction Zone 2 (5 kW)  ─┤─── Schneider Contactor ─── Titan 313 DO1
├── Induction Zone 3 (5 kW)  ─┘
├── Induction Zone 4 (5 kW)  ─┐
├── Induction Zone 5 (5 kW)  ─┤─── Schneider Contactor ─── Titan 313 DO2
├── Warming Zone (2 kW)       ─┘
│
├── Titan 313/411 (per zone or at incomer)
│   ├── CT sensors per phase (3-phase monitoring)
│   ├── Temperature probes via Analog Input (HACCP)
│   ├── Digital Output → Contactor coil (load shed)
│   └── WiFi → HTTP/MQTT → VoltSpark Cloud API
│
└── APFC Panel → PF correction

VoltSpark Cloud
├── Data ingestion API (receives Titan readings)
├── Kitchen Intelligence Module
│   ├── Real-time demand calculator
│   ├── MD penalty predictor
│   ├── Load management rules engine
│   ├── ToD optimizer
│   ├── HACCP temperature logger
│   └── Alert dispatcher
├── Dashboard (web + mobile)
└── Reports (PDF export)
```

---

## 4. Data Integration

### 4.1 Titan → VoltSpark (Primary: WiFi Push)

**Recommended:** Configure Titan WiFi to HTTP POST readings to VoltSpark endpoint.

**Endpoint:** `POST /api/v1/kitchen/meters/{meter_id}/readings`

**Headers:**
```
Authorization: Bearer {api_key}
Content-Type: application/json
```

**Payload (from Titan, mapped to VoltSpark schema):**
```json
{
  "meter_id": "TITAN-313-XXXX",
  "timestamp": "2026-03-24T14:30:00+05:30",
  "electrical": {
    "voltage_r": 231.5,
    "voltage_y": 229.8,
    "voltage_b": 232.1,
    "current_r": 18.4,
    "current_y": 22.1,
    "current_b": 19.7,
    "active_power_kw": 12.4,
    "reactive_power_kvar": 3.2,
    "apparent_power_kva": 12.8,
    "power_factor_avg": 0.968,
    "power_factor_r": 0.971,
    "power_factor_y": 0.965,
    "power_factor_b": 0.970,
    "frequency_hz": 49.98,
    "energy_kwh": 2456.7,
    "energy_kvarh": 321.4,
    "demand_max_kva": 24.3,
    "demand_current_kva": 12.8,
    "thd_voltage_r": 2.1,
    "thd_voltage_y": 2.3,
    "thd_voltage_b": 2.0,
    "thd_current_r": 4.2,
    "thd_current_y": 3.9,
    "thd_current_b": 4.1
  },
  "analog_inputs": {
    "ai1_value": 12.4,
    "ai2_value": 8.7
  },
  "digital_outputs": {
    "do1_state": false,
    "do2_state": false
  }
}
```

**Polling interval:** 30 seconds (real-time mode) or 5 minutes (analytics mode). Configurable per kitchen tier.

### 4.2 Fallback: RS-485 Modbus → IoT Gateway → VoltSpark

For sites without reliable WiFi:
1. Akshaya Createch installs a small industrial IoT gateway (e.g., Raspberry Pi 4 or similar)
2. Gateway polls Titan via Modbus RTU RS-485 every 30 seconds
3. Gateway pushes to VoltSpark via cellular (4G) or LAN
4. VoltSpark provides a lightweight gateway agent (Node.js/Python script)

**Modbus register map:** Titan's Modbus register map (available from Tor.ai) maps to the JSON fields above.

### 4.3 Load Control: VoltSpark → Titan Digital Output

For automatic load shedding (Titan 313/411 only):

**Endpoint:** `POST /api/v1/kitchen/meters/{meter_id}/control`
```json
{
  "command": "set_digital_output",
  "do_channel": 1,
  "state": true,
  "reason": "md_limit_approach",
  "duration_seconds": 120
}
```

VoltSpark backend sends this command to the kitchen's local gateway agent, which writes the Modbus coil register on the Titan, energizing the DO → triggering the Schneider contactor → shedding the priority 3 zone.

---

## 5. New Database Entities

Add these to VoltSpark's data model:

### 5.1 Kitchen (extends existing Workspace/Client entity)
```
Kitchen {
  id: UUID
  workspace_id: UUID (FK → existing Workspace)
  name: string
  address: string
  discom: enum (BESCOM | MSEDCL | TNEB | KSEB | TSSPDCL | OTHER)
  connection_type: enum (LT_COMMERCIAL | HT)
  contracted_demand_kva: float
  sanctioned_load_kw: float
  md_tariff_rate_per_kva: float         // e.g., 400.00 for BESCOM
  md_penalty_multiplier: float          // e.g., 2.0 (2× rate for excess)
  pf_threshold: float                   // e.g., 0.90
  pf_penalty_rate_per_point: float      // % surcharge per 0.01 below threshold
  tod_schedule: JSON                    // array of {name, start, end, multiplier}
  billing_cycle_start_day: int          // typically 1 or 15
  demand_warning_threshold: float       // e.g., 0.80 (80% of contracted)
  demand_critical_threshold: float      // e.g., 0.92
  created_at: timestamp
}
```

### 5.2 KitchenZone
```
KitchenZone {
  id: UUID
  kitchen_id: UUID
  name: string                          // e.g., "Burner 1", "Tawa Station", "Stock Pot"
  zone_type: enum (BURNER | TAWA | FRYER | STOCK_POT | WARMER | UTILITY | OTHER)
  titan_meter_id: string
  titan_do_channel: int | null          // 1 or 2, null if no control
  priority_tier: int                    // 1 (never shed), 2 (shed if critical), 3 (shed at warning)
  max_power_kw: float
  haccp_enabled: boolean
  haccp_ai_channel: int | null          // Titan analog input channel for temp probe
  target_temp_c: float | null
  min_temp_c: float | null
  max_temp_c: float | null
  is_active: boolean
}
```

### 5.3 TitanReading (time-series, high-volume)
```
TitanReading {
  id: UUID
  meter_id: string
  kitchen_id: UUID
  zone_id: UUID | null
  timestamp: timestamp (indexed)
  // Electrical
  voltage_r, voltage_y, voltage_b: float
  current_r, current_y, current_b: float
  active_power_kw: float
  reactive_power_kvar: float
  apparent_power_kva: float
  power_factor: float
  frequency_hz: float
  energy_kwh: float
  energy_kvarh: float
  demand_max_kva: float
  demand_current_kva: float
  thd_voltage: float
  thd_current: float
  // I/O state
  ai1_value: float | null
  ai2_value: float | null
  do1_state: boolean | null
  do2_state: boolean | null
}
```
*Use TimescaleDB hypertable or Supabase time-series for efficient storage and querying.*

### 5.4 TemperatureLog (HACCP)
```
TemperatureLog {
  id: UUID
  zone_id: UUID
  kitchen_id: UUID
  timestamp: timestamp
  temperature_c: float
  is_within_range: boolean
  alert_triggered: boolean
}
```

### 5.5 DemandEvent
```
DemandEvent {
  id: UUID
  kitchen_id: UUID
  timestamp: timestamp
  event_type: enum (WARNING | CRITICAL | BREACH)
  demand_kva: float
  contracted_demand_kva: float
  excess_kva: float
  action_taken: enum (ALERT_SENT | LOAD_SHED | MANUAL_OVERRIDE | NONE)
  zones_shed: string[]
  resolved_at: timestamp | null
}
```

### 5.6 MonthlyKitchenSummary
```
MonthlyKitchenSummary {
  id: UUID
  kitchen_id: UUID
  billing_month: date                   // first day of month
  total_energy_kwh: float
  peak_demand_kva: float
  contracted_demand_kva: float
  md_penalty_amount: float
  md_penalties_avoided: float           // estimated savings from load management
  avg_power_factor: float
  pf_penalty_amount: float
  pf_incentive_amount: float
  tod_peak_kwh: float
  tod_off_peak_kwh: float
  tod_savings_amount: float
  total_savings_vs_unmanaged: float
  haccp_compliance_rate: float          // % of time within target temp range
  demand_events_count: int
  load_shed_events_count: int
}
```

---

## 6. Feature Specifications

### 6.1 Kitchen Workspace Onboarding

**Trigger:** User creates a new workspace and selects "Commercial Kitchen" as the workspace type.

**Onboarding wizard (5 steps):**

1. **Kitchen Profile** — Name, address, DISCOM selection, connection type (LT/HT)
2. **Tariff Configuration** — Contracted demand (kVA), MD tariff rate, MD penalty multiplier, PF threshold, PF penalty rate, billing cycle start day
3. **ToD Schedule** — Load the DISCOM-specific ToD schedule (pre-populated templates for BESCOM, MSEDCL, TNEB etc.) or custom entry. Fields: period name, start time, end time, rate multiplier.
4. **Meter Configuration** — Add Titan meter(s): enter Meter ID, select model (212/312/313/411), assign to kitchen. Generate API key for the meter to push data.
5. **Zone Mapping** — For each Titan meter, define zones: zone name, type, priority tier, DO channel (for control), HACCP settings (enable/disable, AI channel, target temp range).

### 6.2 Real-Time Kitchen Dashboard

**URL:** `/kitchen/{kitchen_id}/dashboard`
**Refresh:** WebSocket / SSE for real-time updates (30-second data cadence)

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Kitchen Name]        [ToD Badge: PEAK ⏱ 1h 23m left]    │
│  Bengaluru · BESCOM · Contracted: 30 kVA                    │
├──────────────────┬──────────────────┬───────────────────────┤
│  DEMAND GAUGE    │   POWER FACTOR   │   LIVE COST RATE      │
│  ○ 18.4 / 30 kVA│   PF: 0.968      │   ₹ 142 / hour        │
│  [61% — GREEN]  │   [Above 0.90 ✓] │   [Tariff: Peak ×1.4] │
├──────────────────┴──────────────────┴───────────────────────┤
│  PENALTY FORECAST — This Month                              │
│  MD Penalty: ₹ 0 (peak demand 24.3 kVA < 30 kVA ✓)        │
│  PF Penalty: ₹ 0 (avg PF 0.972 ✓)                         │
│  ToD Savings to date: ₹ 4,230                               │
├─────────────────────────────────────────────────────────────┤
│  ZONE MONITOR                                               │
│  [Burner 1: 4.8kW] [Burner 2: 5.0kW] [Tawa: 3.2kW]       │
│  [Stock Pot: 4.1kW] [Fryer: 0kW OFF] [Warmer: 0.8kW]      │
├─────────────────────────────────────────────────────────────┤
│  RECENT ALERTS    │  LOAD CONTROL STATUS                    │
│  [None today ✓]   │  Auto-shedding: ENABLED                 │
│                   │  P3 shed at 80% · P2 shed at 92%        │
└───────────────────┴─────────────────────────────────────────┘
```

**Demand Gauge widget:**
- Circular arc gauge (0 to 110% of contracted demand)
- 0–75%: Green
- 75–90%: Amber + pulse animation
- 90–100%: Red + alert
- 100%+: Red flashing + auto-shed triggered
- Show: current kVA, contracted kVA, % utilization, trend arrow (↑↓)

**ToD Badge:**
- Shows current tariff period: PEAK / NORMAL / OFF-PEAK
- Color: Red (peak) / Yellow (normal) / Green (off-peak)
- Countdown timer to next period change
- Multiplier shown: ×1.4 etc.

**Live cost rate:**
- Current ₹/hour based on actual kW × current tariff rate
- Running today's total cost

### 6.3 Load Management Rules Engine

**URL:** `/kitchen/{kitchen_id}/load-management`

**Configuration UI:**
- Toggle: Auto load management ON/OFF
- Demand ceiling slider: configurable % of contracted demand (default 90%)
- Priority tier assignment table: drag-and-drop zones between tiers
- Shed rules:
  - "Shed Tier 3 when demand reaches ___% of contracted" (default 80%)
  - "Shed Tier 2 when demand reaches ___% of contracted" (default 92%)
  - "Restore zones after ___minutes" (default 3 min, then re-evaluate)
- Burner sequencing: enable staggered start (delay between simultaneous activations): 0/2/3/5 seconds

**Auto-shedding logic (backend):**
```
Every 30 seconds:
  current_demand = latest TitanReading.apparent_power_kva
  contracted = kitchen.contracted_demand_kva

  if current_demand >= contracted * critical_threshold:
    shed all Tier 3 zones → send DO command to Titan
    shed all Tier 2 zones → send DO command to Titan
    log DemandEvent(CRITICAL, action=LOAD_SHED)
    send alert (SMS + email)

  elif current_demand >= contracted * warning_threshold:
    shed all Tier 3 zones → send DO command to Titan
    log DemandEvent(WARNING, action=LOAD_SHED)
    send alert (SMS)

  else if zones_shed and current_demand < contracted * 0.75:
    restore zones (after cooldown period)
    log restoration
```

**Load shed history table:**
- Date/time, demand at shed, zones shed, duration, demand post-shed

### 6.4 Penalty Predictor

**URL:** Widget on dashboard + expanded view at `/kitchen/{kitchen_id}/penalty-forecast`

**Algorithm:**
```
// MD Penalty Prediction
peak_so_far = MAX(demand_current_kva) in current billing month
projected_peak = peak_so_far  // worst case: current peak is the month's peak
if projected_peak > contracted_demand:
  excess = projected_peak - contracted_demand
  md_penalty = excess * md_tariff_rate * md_penalty_multiplier
else:
  md_penalty = 0

// PF Penalty Prediction
avg_pf_so_far = AVG(power_factor) in current billing month
if avg_pf_so_far < pf_threshold:
  deficit = pf_threshold - avg_pf_so_far
  pf_penalty = total_energy_cost_so_far * (deficit / 0.01) * pf_penalty_rate_per_point
else:
  pf_penalty = 0

// Savings vs unmanaged baseline
// Assume without load management, peak demand = theoretical max (sum of all zone max_power_kw)
theoretical_unmanaged_peak = SUM(zone.max_power_kw for zone in kitchen.zones) / 0.9  // in kVA
unmanaged_md_penalty = max(0, theoretical_unmanaged_peak - contracted_demand) * md_tariff_rate * 2
savings_avoided = unmanaged_md_penalty - md_penalty
```

**UI Display:**
- Card: "Projected MD Penalty: ₹ 0" (green) or "₹ 12,400 ⚠️" (red)
- Card: "Projected PF Penalty: ₹ 0" (green)
- Card: "Savings vs unmanaged: ₹ 18,200 this month" (gold)
- Bar chart: daily peak demand vs contracted demand (current month)

### 6.5 Time-of-Day Optimizer

**URL:** Widget on dashboard + `/kitchen/{kitchen_id}/tod-optimizer`

**DISCOM ToD Schedule Templates (pre-load these):**
```javascript
BESCOM_HT_TOD: [
  { name: "Morning Peak", start: "06:00", end: "10:00", multiplier: 1.40 },
  { name: "Normal", start: "10:00", end: "18:00", multiplier: 1.00 },
  { name: "Evening Peak", start: "18:00", end: "22:00", multiplier: 1.40 },
  { name: "Off-Peak", start: "22:00", end: "06:00", multiplier: 0.85 }
]
// Add similar templates for MSEDCL, TNEB, TSSPDCL, KSEB, APEPDCL
```

**UI:**
- 24-hour timeline bar showing tariff periods with colour coding
- Current period highlighted
- Shiftable loads section: list zones marked as "shiftable" (e.g., cleaning, water heating)
- Recommendation: "Consider scheduling stock prep (Zone 4) after 22:00 to save ₹X/day"
- Month-to-date ToD savings tracker

### 6.6 HACCP Temperature Log Module

**Only available if:** Kitchen has Titan 313 or 411 with analog inputs + temperature probes

**URL:** `/kitchen/{kitchen_id}/haccp`

**Features:**
- Per-zone temperature timeline chart (last 8 hours, current shift)
- Temperature range bands: green (within target), red (outside range)
- Real-time temperature display per zone
- Alert: SMS/email when temperature deviates from target range for >5 minutes
- **HACCP Report Generator:**
  - Select date range
  - Generate PDF report with:
    - Kitchen name, address, date range
    - Zone-wise temperature log (every reading with timestamp)
    - Compliance summary: % of time within target range
    - Deviation incidents (time, duration, max deviation)
    - Digital signature field + report reference number
  - Format acceptable for FSSAI, NABH, and hospitality chain audits

### 6.7 Power Quality Monitor

**URL:** `/kitchen/{kitchen_id}/power-quality`

**Widgets:**
- THD Voltage (per phase) — bar chart, alert if >5%
- THD Current (per phase) — bar chart, alert if >15%
- Voltage unbalance % — gauge
- Frequency deviation — gauge (normal: 49.5–50.5 Hz)
- Harmonic spectrum chart (for Titan 411: up to 31st harmonic)
- Transient event log (Titan 411 only): 30-second snapshots triggered by events

**Why this matters for kitchens:** Multiple induction loads can inject harmonics into the building's electrical system. High THD can damage other equipment and trigger DISCOM penalties in some states.

### 6.8 Monthly Intelligence Report

**Generated:** Automatically on billing cycle end date. Also on-demand.
**Format:** PDF (branded: "Akshaya Createch Kitchen Intelligence Report, powered by VoltSpark")

**Report sections:**
1. **Executive Summary** — total energy, total cost, total savings, penalty status
2. **Energy Consumption** — daily kWh bar chart, zone-wise pie chart, comparison to previous month
3. **Demand Management** — peak demand vs contracted (daily chart), demand events, MD penalty status, savings achieved
4. **Power Factor** — monthly avg PF, PF trend chart, penalty/incentive calculation
5. **ToD Analysis** — peak vs off-peak consumption split, ToD savings calculation
6. **Load Management Events** — table of shed events: date/time, trigger, duration, zones shed, demand post-shed
7. **HACCP Compliance** (if enabled) — compliance %, incident summary
8. **Total Savings Summary** — itemized: MD penalty avoided + PF incentive + ToD savings = Total ₹ saved vs baseline
9. **Recommendations** — 3 actionable tips for next month

### 6.9 Alert System

**Alert channels:** In-app notification + Email + WhatsApp/SMS (via Twilio or MSG91)

**Alert types:**

| Alert | Trigger | Channel | Priority |
|-------|---------|---------|----------|
| Demand Warning | Current demand > 80% of contracted | WhatsApp + Email | HIGH |
| Demand Critical | Current demand > 92% of contracted | WhatsApp + SMS | CRITICAL |
| Demand Breach | Current demand > contracted | WhatsApp + SMS + In-app | CRITICAL |
| PF Warning | Avg PF drops below (threshold + 0.02) | Email | MEDIUM |
| PF Penalty Trigger | Avg PF drops below threshold | WhatsApp + Email | HIGH |
| HACCP Deviation | Zone temp outside range >5 min | WhatsApp + Email | HIGH |
| Voltage Anomaly | Phase voltage deviation >10% | Email | MEDIUM |
| High THD | THD Voltage >5% sustained | Email | MEDIUM |
| Monthly Penalty Forecast | Projected penalty >₹5,000 | Email (weekly) | MEDIUM |
| Meter Offline | No data received for >15 min | Email | HIGH |

### 6.10 Multi-Outlet Chain Dashboard

**For kitchen chain operators (restaurant chains, hospital groups, etc.)**
**URL:** `/kitchen/portfolio`

**Features:**
- Card grid: one card per kitchen location
- Each card shows: location name, current demand %, PF status, today's penalty risk (green/amber/red)
- Aggregate stats: total energy this month, total savings, total sites at risk
- Click through to individual kitchen dashboard
- Comparative table: all locations ranked by penalty risk or energy efficiency
- Consolidated monthly report (all outlets)

---

## 7. UI/UX Design Guidelines

**Integrate with VoltSpark's existing design system.** Additional kitchen-specific elements:

- **Kitchen workspace icon:** ChefHat or similar (distinct from factory/industrial workspace)
- **Demand gauge:** Circular arc, uses brand colors: Green (#22c55e) / Amber (#f59e0b) / Red (#ef4444)
- **ToD badge:** Pill with icon — 🔴 PEAK / 🟡 NORMAL / 🟢 OFF-PEAK
- **Zone tiles:** Card grid, each showing zone name, current kW, status indicator
- **Penalty amounts:** Always show in ₹ with Indian number formatting (₹1,24,500 not ₹124,500)
- **Charts:** Use existing VoltSpark chart library (recharts/chart.js) — no new dependencies
- **HACCP report:** PDF generation using existing VoltSpark PDF infrastructure (if any) or jsPDF/puppeteer

---

## 8. API Endpoints to Add

### Meter Data Ingestion
```
POST   /api/v1/kitchen/meters/:meter_id/readings       # Titan pushes readings
GET    /api/v1/kitchen/meters/:meter_id/readings/live  # SSE stream for dashboard
GET    /api/v1/kitchen/meters/:meter_id/readings       # Historical query (with filters)
```

### Kitchen Management
```
POST   /api/v1/kitchens                                # Create kitchen
GET    /api/v1/kitchens/:id                            # Get kitchen details
PATCH  /api/v1/kitchens/:id                            # Update settings
GET    /api/v1/kitchens/:id/dashboard                  # Dashboard data bundle
GET    /api/v1/kitchens/:id/zones                      # List zones
POST   /api/v1/kitchens/:id/zones                      # Add zone
```

### Load Management
```
GET    /api/v1/kitchens/:id/load-management/config     # Get LM configuration
PUT    /api/v1/kitchens/:id/load-management/config     # Update LM rules
POST   /api/v1/kitchens/:id/load-management/override   # Manual zone override
GET    /api/v1/kitchens/:id/load-management/events     # Shed event history
POST   /api/v1/kitchen/meters/:meter_id/control        # Send DO command to Titan
```

### Analytics
```
GET    /api/v1/kitchens/:id/penalty-forecast           # Current month forecast
GET    /api/v1/kitchens/:id/monthly-summary/:month     # Monthly summary
GET    /api/v1/kitchens/:id/tod-analysis               # ToD breakdown
GET    /api/v1/kitchens/:id/power-quality              # PQ metrics
```

### HACCP
```
GET    /api/v1/kitchens/:id/haccp/current              # Live temps
GET    /api/v1/kitchens/:id/haccp/logs                 # Temperature history
POST   /api/v1/kitchens/:id/haccp/report               # Generate PDF report
```

### Reports
```
POST   /api/v1/kitchens/:id/reports/monthly            # Generate monthly report
GET    /api/v1/kitchens/:id/reports                    # List reports
GET    /api/v1/kitchens/:id/reports/:report_id/pdf     # Download PDF
```

---

## 9. VoltSpark Pricing Module Extension

Add a "Kitchen Intelligence" tier/add-on to VoltSpark pricing:

| VoltSpark Plan | Kitchen Add-on | Price |
|---|---|---|
| Free | Not available | — |
| Pro | Kitchen Intelligence Basic (monitoring only, no load control) | +₹999/kitchen/month |
| Pro | Kitchen Intelligence Smart (monitoring + load control + HACCP) | +₹1,999/kitchen/month |
| Enterprise | Kitchen Intelligence Enterprise (chains, custom SLAs) | Custom |

---

## 10. Development Phases

### Phase 1 — Foundation (MVP)
- Kitchen workspace type + onboarding wizard
- Titan data ingestion API (WiFi push endpoint)
- Real-time dashboard (demand gauge, PF, zone monitor)
- Basic alerts (demand warning, PF alert, meter offline)
- DISCOM ToD schedule templates (BESCOM priority)

### Phase 2 — Intelligence
- Penalty predictor
- Load management rules engine + DO control API
- ToD optimizer with savings tracker
- Monthly intelligence report (PDF)
- Enhanced alert system (WhatsApp via MSG91)

### Phase 3 — Compliance & Scale
- HACCP temperature logging + report generator
- Power quality monitor + harmonic charts
- Multi-outlet chain dashboard
- Modbus gateway agent (for RS-485 fallback)
- Transient event viewer (Titan 411)

---

## 11. Technical Notes for VoltSpark Dev Team

1. **Time-series data storage:** TitanReadings will be high-volume (30-second intervals × multiple meters per kitchen). Use TimescaleDB (if PostgreSQL-based) or consider a dedicated time-series store. Apply data retention policies: raw data 90 days, 5-min aggregates 1 year, hourly aggregates forever.

2. **WebSocket / SSE:** The real-time dashboard requires live data push. Implement SSE (Server-Sent Events) endpoint for the dashboard bundle — simpler than WebSockets for unidirectional data push.

3. **Titan WiFi configuration:** Tor.ai's Titan supports custom HTTP endpoint configuration via the mobile app or RS-485 Modbus registers. Provide Akshaya Createch with a configuration guide for setting up the Titan to push to VoltSpark's endpoint.

4. **Digital Output control latency:** The load-shed command must complete within 5 seconds of a demand breach detection to be effective. Ensure the control API path is low-latency and not blocked by heavy analytics jobs.

5. **Indian number formatting:** All currency displays must use Indian lakhs/crores format: ₹1,23,456 not ₹123,456. Use `Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR'})`.

6. **DISCOM templates:** Build a `discom_tariff_templates` table with pre-seeded data for major DISCOMs (BESCOM, MSEDCL, TNEB, KSEB, TSSPDCL, APEPDCL). Allow custom override per kitchen. Keep this maintainable as tariff orders change annually.

7. **Tor.ai API partnership:** Consider reaching out to Tor.ai for an official API partnership — they may expose a Tor.ai platform API that VoltSpark can consume instead of raw Modbus, simplifying integration.

---

## 12. Hardware Recommendation Summary for Website / Proposal

| Kitchen Size | Titan Model | Deployment | VoltSpark Tier |
|---|---|---|---|
| Small restaurant / single cloud kitchen | Titan 212 (1 unit at incomer) | WiFi push, monitoring only | Kitchen Basic |
| Multi-zone restaurant / canteen | Titan 313 (1 incomer + per zone) | WiFi push + DO load control | Kitchen Smart |
| Hospital / hotel / chain / institution | Titan 411 (incomer + sub-meters) | WiFi + RS-485 gateway + transient analysis | Kitchen Enterprise |

**Schneider Electric** provides: contactors for load shedding, APFC panels, distribution boards, MCBs/RCCBs.

---

*Document version: 1.0 — March 2026*
*Prepared by Akshaya Createch for VoltSpark development team*
*Hardware reference: Tor Titan brochure (tor.ai), Schneider Electric commercial portfolio*
