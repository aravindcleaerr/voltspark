# VoltSpark IoT Metering — Hardware Reference

**Partner:** Lotus Controls (authorised Schneider Electric distributor)
**Site:** Unnathi CNC Technologies, Precision Engineering Unit
**Date purchased:** April 2026

---

## Hardware Purchased

### 1. Schneider ESX Panel Server Universal — 110-277VAC/DC

| Attribute | Value |
|---|---|
| Product family | EcoStruxure Panel Server — Universal |
| Power supply | 110–277VAC/DC (wide-range — industrial grade) |
| Role in VoltSpark | Edge gateway — collects Modbus RTU from all meters, pushes to cloud via MQTT/HTTPS |
| Protocol (downstream) | Modbus RTU over RS485 (2-wire) |
| Protocol (upstream) | MQTT over TLS or HTTPS POST → `/api/iot/ingest` |
| VoltSpark `gatewayType` | `ESX_UNIVERSAL` |
| Max RS485 devices | Up to 32 Modbus slaves on one bus |
| Connectivity | Ethernet (RJ45) + optional Wi-Fi |
| Web UI | Local config at `http://192.168.1.100` |
| Differs from PAS600 | PAS600 (Basic) = Schneider Conzerv meters only. ESX Universal = any Modbus RTU/TCP device, third-party compatible |

**Why ESX over PAS600:** The Universal variant was locally available and supports any RS485 Modbus device — future-proofs against non-Schneider meter additions.

---

### 2. Schneider EM6400NG CL-1RS (Conzerv)

| Attribute | Value |
|---|---|
| Full name | Conzerv EM6400NG — Class 1, RS485 |
| Part number | METSEEM6400NGRSCL1 |
| Role | Sub-feeder / incomer energy meter |
| Interface | Modbus RTU over RS485 |
| Default Modbus address | 1 (configurable 1–247) |
| Default baud rate | 9600 bps (configurable) |
| Accuracy class | Class 1 (±1% energy) |
| Measurements | kWh, kVAh, kVARh, kW, kVA, kVAR, V (L-L, L-N per phase), A (per phase), PF, Hz |
| Advanced | Max demand (MD), TOU (time-of-use), multi-tariff (4 rates), load profile |
| THD | Not on EM6400NG — need EM6436/EM6438 for harmonics |
| VoltSpark `model` field | `EM6400NG+` |
| MeterReading fields populated | All standard fields; `thdVoltage` / `thdCurrent` = null |
| CT ratio | Site-specific (e.g., 200/5A for feeder, 500/5A for incomer) |
| Datasheet | [R&D/LotusVS/Inputs/EM6400NG+_METSEEM6400NGRSCL1.pdf](../R&D/LotusVS/Inputs/EM6400NG+_METSEEM6400NGRSCL1.pdf) |

---

### 3. Schneider EM1200 CL-1RS

| Attribute | Value |
|---|---|
| Full name | Conzerv EM1200 — Class 1, RS485 |
| Role | Basic sub-meter for individual loads (lighting, utility, HVAC) |
| Interface | Modbus RTU over RS485 |
| Default Modbus address | 1 (configurable) |
| Default baud rate | 9600 bps |
| Accuracy class | Class 1 (±1% energy) |
| Measurements | kWh, kVAh, kVARh, kW, kVA, kVAR, V (L-N per phase), A (per phase), PF, Hz |
| NOT supported | Max demand, TOU, multi-tariff, THD, harmonics, load profile |
| VoltSpark `model` field | `EM1200` |
| MeterReading fields populated | `activePowerKW`, `voltageR/Y/B`, `currentR/Y/B`, `powerFactor`, `frequencyHz`, `energyKwh`, `energyKvarhImport` — demand and THD fields = null |
| When to use | Simple load monitoring where demand tracking is not needed |
| Datasheet | [R&D/LotusVS/Inputs/EM1200 and 1220.pdf](../R&D/LotusVS/Inputs/EM1200%20and%201220.pdf) |

---

## RS485 Bus Wiring Plan (Unnathi CNC site)

```
ESX Panel Server Universal
│  (RS485 Port — 2-wire, max 32 devices)
│
├── Modbus Addr 1 ── EM6400NG+ (Incomer / Main LT Panel)   CT: 500/5A
├── Modbus Addr 2 ── EM6400NG+ (CNC Bay Feeder)            CT: 200/5A
├── Modbus Addr 3 ── EM6400NG+ (Solar ACDB)                CT: 100/5A
└── Modbus Addr 4 ── EM1200    (Utility & Lighting Feeder)  CT: 100/5A

(Future slots: Addr 5-32 available for expansion)
```

**Cable:** Shielded twisted-pair (STP), max 1200m total bus length.
**Termination:** 120Ω resistor at far end of RS485 bus.

---

## Data Flow

```
EM6400NG+ × 3  ──┐
EM1200      × 1  ──┤── RS485 bus ──→ ESX Panel Server Universal
                  │                        │
                  └────────────────────    │ Ethernet / Wi-Fi
                                           ↓
                                  MQTT (TLS) or HTTPS POST
                                           ↓
                           VoltSpark Cloud — /api/iot/ingest
                                           ↓
                           MeterReading → ConsumptionEntry
                           Alerts, Trends, Dashboard
```

---

## Modbus Register Quick Reference

### EM6400NG+ — Key Registers (Modbus RTU, Function Code 03)

| Register | Parameter | Unit | Notes |
|---|---|---|---|
| 3900 | Active Energy Import (kWh) | 0.01 kWh | 32-bit, 2 registers |
| 3902 | Reactive Energy Import (kVARh) | 0.01 kVARh | 32-bit |
| 3904 | Apparent Energy (kVAh) | 0.01 kVAh | 32-bit |
| 3910 | Active Power Total (kW) | 0.001 kW | 32-bit |
| 3914 | Reactive Power Total (kVAR) | 0.001 kVAR | 32-bit |
| 3916 | Apparent Power Total (kVA) | 0.001 kVA | 32-bit |
| 3920 | Power Factor Total | 0.001 | — |
| 3924 | Frequency (Hz) | 0.01 Hz | — |
| 3028 | Voltage L1-N (V) | 0.1 V | — |
| 3030 | Voltage L2-N (V) | 0.1 V | — |
| 3032 | Voltage L3-N (V) | 0.1 V | — |
| 3000 | Current L1 (A) | 0.001 A | — |
| 3002 | Current L2 (A) | 0.001 A | — |
| 3004 | Current L3 (A) | 0.001 A | — |
| 3960 | Max Demand (kW) | 0.001 kW | — |

*Full register map: EM6400NG+ datasheet Appendix A.*

### EM1200 — Key Registers (Modbus RTU, Function Code 03)

| Register | Parameter | Unit | Notes |
|---|---|---|---|
| 3900 | Active Energy Import (kWh) | 0.01 kWh | 32-bit |
| 3910 | Active Power Total (kW) | 0.001 kW | 32-bit |
| 3916 | Apparent Power Total (kVA) | 0.001 kVA | 32-bit |
| 3920 | Power Factor Total | 0.001 | — |
| 3924 | Frequency (Hz) | 0.01 Hz | — |
| 3028 | Voltage L1-N (V) | 0.1 V | — |
| 3030 | Voltage L2-N (V) | 0.1 V | — |
| 3032 | Voltage L3-N (V) | 0.1 V | — |
| 3000 | Current L1 (A) | 0.001 A | — |
| 3002 | Current L2 (A) | 0.001 A | — |
| 3004 | Current L3 (A) | 0.001 A | — |

*No max demand or THD registers on EM1200. Full register map: EM1200 datasheet.*

---

## VoltSpark Codebase Status

| Item | Status |
|---|---|
| `ESX_UNIVERSAL` gateway type in `constants.ts` | Added |
| `gatewayType @default` in `schema.prisma` | Updated to ESX_UNIVERSAL |
| EM6400NG+ seed data (CNC Bay + Solar) | Present |
| EM1200 seed data (Utility & Lighting feeder) | Added |
| `IoTGateway` model supports ESX via free serial number | Yes |
| `/api/iot/ingest` endpoint (normalized JSON) | Shipped |
| Gateway-side Modbus polling (Python / ESX firmware) | Pending — external to app |

---

## Next Steps

- [ ] Configure ESX Panel Server web UI: scan RS485 bus, assign slave addresses 1–4
- [ ] Set MQTT broker URL + topic prefix in ESX web UI to match VoltSpark config
- [ ] Generate API key on VoltSpark IoT → Gateways page and enter in ESX publish config
- [ ] Verify first reading appears in VoltSpark `/iot/readings` dashboard
- [ ] Confirm EM1200 `demandKW` / `thdVoltage` are null (expected — meter does not support)
- [ ] Add EM7230 as incomer if demand control relay output is needed in future

---

## Cost Reference (Local distributor pricing — April 2026)

| Item | Approx. Price |
|---|---|
| EM6400NG CL-1RS (each) | ₹4,000 – 6,000 |
| EM1200 CL-1RS (each) | ₹1,800 – 3,000 |
| ESX Panel Server Universal | ₹28,000 – 38,000 |
