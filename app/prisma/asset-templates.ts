// Manufacturing equipment library — the design-intent templates that turn
// raw watts into meaning. Each row becomes one AssetTemplate (bundleType
// MANUFACTURING). Sourced from docs/bundles/manufacturing-intelligence-bundle.md
// Component 2 and the CNC field guide. Re-runnable: seedAssetTemplates() upserts
// by `key`, so this is safe to call on every full seed.
import type { PrismaClient } from '../src/generated/prisma/client';

// powerStates express expected kW as a % of the asset's rated power. The
// state-detection engine (built later) classifies each meter reading into a
// state by which band it falls in. Shared presets keep the library consistent.
const STATES = {
  // Short-cycle machine tools (VMC, turning, grinder): many parts per shift.
  shortCycle: [
    { state: 'OFF', label: 'Powered down', expectedKwPctRange: [0, 2] },
    { state: 'IDLE', label: 'Controller + hydraulics + coolant standby', expectedKwPctRange: [2, 25] },
    { state: 'SETUP', label: 'Job change / warm-up', expectedKwPctRange: [15, 45] },
    { state: 'RUNNING', label: 'Cutting', expectedKwPctRange: [25, 110] },
  ],
  // Long-unattended machines (EDM, Swiss CNC): one job runs for hours.
  longUnattended: [
    { state: 'OFF', label: 'Powered down', expectedKwPctRange: [0, 2] },
    { state: 'IDLE', label: 'Pumps / chiller / controller standby', expectedKwPctRange: [5, 30] },
    { state: 'RUNNING', label: 'Cutting / machining', expectedKwPctRange: [30, 105] },
  ],
  // Batch process equipment (furnace, hardening, gear cutting).
  batch: [
    { state: 'OFF', label: 'Powered down', expectedKwPctRange: [0, 3] },
    { state: 'HEATING', label: 'Ramp to setpoint', expectedKwPctRange: [50, 110] },
    { state: 'HOLDING', label: 'At temperature / processing', expectedKwPctRange: [20, 60] },
  ],
  // Continuously running utilities (air compressor).
  continuous: [
    { state: 'OFF', label: 'Stopped', expectedKwPctRange: [0, 2] },
    { state: 'UNLOAD', label: 'Running unloaded (no air demand)', expectedKwPctRange: [20, 40] },
    { state: 'LOAD', label: 'Compressing', expectedKwPctRange: [60, 110] },
  ],
  // Simple on/off utilities (lighting, cranes, coolant aux).
  onOff: [
    { state: 'OFF', label: 'Off', expectedKwPctRange: [0, 3] },
    { state: 'ON', label: 'In use', expectedKwPctRange: [10, 110] },
  ],
};

// A single Manufacturing template, before JSON fields are stringified.
interface TemplateDef {
  key: string;
  name: string;
  category: string;
  ratedPowerMinKw: number;
  ratedPowerMaxKw: number;
  cycleStructure: string;
  criticalityDefault: string;
  recommendedMeterTier: string;
  primaryWasteMode: string;
  powerStates: { state: string; label: string; expectedKwPctRange: number[] }[];
  operatingEnvelope: Record<string, unknown>;
  primaryKpis: string[];
  failureModes: Record<string, unknown>[];
  defaultAlerts: Record<string, unknown>[];
}

// Standard single-shift envelope shared by most discrete-machining assets.
const SHIFT_ENVELOPE = {
  pfRange: [0.85, 0.98],
  voltageBand: [395, 433],
  runWindow: { shiftRef: 'A,B', allowedOutsideShift: false },
};

const ALERT_OFF_SHIFT = {
  key: 'off_shift_load', trigger: 'Drawing power outside the shift calendar',
  severity: 'MEDIUM', currency: 'cost',
};
const ALERT_EXCESS_IDLE = {
  key: 'excessive_idle', trigger: 'In IDLE > 30 min during a shift',
  severity: 'LOW', currency: 'cost',
};
const ALERT_DEMAND = {
  key: 'demand_overshoot', trigger: '15-min avg kVA on track to exceed sanctioned demand',
  severity: 'HIGH', currency: 'penalty',
};

export const MANUFACTURING_ASSET_TEMPLATES: TemplateDef[] = [
  {
    key: 'cnc-turning', name: 'CNC Turning Centre', category: 'machine-tool',
    ratedPowerMinKw: 11, ratedPowerMaxKw: 55, cycleStructure: 'short-repetitive',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Idle-with-power between jobs; aux load 30-50% of spindle',
    powerStates: STATES.shortCycle, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['kwh_per_part', 'idle_energy_pct', 'machine_utilisation_pct', 'cost_per_machine_hour'],
    failureModes: [
      { key: 'idle_between_jobs', label: 'Ran idle with power between jobs', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
      { key: 'off_shift_run', label: 'Left on after the shift ended', currency: 'cost', costModel: 'idle_kw * off_shift_hours * tariff' },
    ],
    defaultAlerts: [ALERT_EXCESS_IDLE, ALERT_OFF_SHIFT, ALERT_DEMAND],
  },
  {
    key: 'cnc-vmc', name: 'CNC Vertical Machining Centre', category: 'machine-tool',
    ratedPowerMinKw: 10, ratedPowerMaxKw: 58, cycleStructure: 'short-repetitive',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Long idle-with-power between jobs; coolant/hydraulics running through breaks',
    powerStates: STATES.shortCycle, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['kwh_per_part', 'idle_energy_pct', 'machine_utilisation_pct', 'spindle_on_ratio'],
    failureModes: [
      { key: 'idle_between_jobs', label: 'Long idle with power between jobs', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
      { key: 'coolant_through_break', label: 'Coolant/hydraulics ran through lunch break', currency: 'cost', costModel: 'aux_kw * break_hours * tariff' },
    ],
    defaultAlerts: [
      { key: 'excessive_idle', trigger: 'In IDLE > 30 min during a shift', severity: 'LOW', currency: 'cost' },
      { key: 'machine_outside_shift', trigger: 'Machine on outside the shift calendar', severity: 'MEDIUM', currency: 'cost' },
      ALERT_DEMAND,
    ],
  },
  {
    key: 'cnc-hmc', name: 'CNC Horizontal Machining Centre', category: 'machine-tool',
    ratedPowerMinKw: 28, ratedPowerMaxKw: 85, cycleStructure: 'short-repetitive',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Pallet-changer idle; hydraulics running between pallets',
    powerStates: STATES.shortCycle, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['kwh_per_part', 'idle_energy_pct', 'machine_utilisation_pct'],
    failureModes: [
      { key: 'pallet_idle', label: 'Idle during pallet change', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
    ],
    defaultAlerts: [ALERT_EXCESS_IDLE, ALERT_OFF_SHIFT, ALERT_DEMAND],
  },
  {
    key: 'swiss-cnc', name: 'Swiss-type / Sliding-head CNC', category: 'machine-tool',
    ratedPowerMinKw: 5, ratedPowerMaxKw: 20, cycleStructure: 'long-unattended',
    criticalityDefault: 'important', recommendedMeterTier: 'POWER_QUALITY',
    primaryWasteMode: 'Bearing wear shows as a rising THD / current signature',
    powerStates: STATES.longUnattended,
    operatingEnvelope: { ...SHIFT_ENVELOPE, thdCurrentMax: 8 },
    primaryKpis: ['kwh_per_part', 'idle_energy_pct', 'thd_trend'],
    failureModes: [
      { key: 'bearing_wear', label: 'Spindle bearing wear (THD signature drift)', currency: 'uptime', costModel: 'maintenance_callout + downtime_hours' },
    ],
    defaultAlerts: [
      { key: 'abnormal_power', trigger: 'RUNNING-state power outside the expected band', severity: 'MEDIUM', currency: 'uptime' },
      ALERT_OFF_SHIFT,
    ],
  },
  {
    key: 'wire-cut-edm', name: 'Wire-cut EDM', category: 'machine-tool',
    ratedPowerMinKw: 5, ratedPowerMaxKw: 15, cycleStructure: 'long-unattended',
    criticalityDefault: 'critical', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Mid-cut power interruption scraps a part worth hours of machining',
    powerStates: STATES.longUnattended,
    operatingEnvelope: { pfRange: [0.80, 0.95], voltageBand: [395, 433], runWindow: { shiftRef: 'A', allowedOutsideShift: true } },
    primaryKpis: ['kwh_per_part', 'cut_completion_rate', 'interruptions_per_month', 'idle_after_job_hours'],
    failureModes: [
      { key: 'mid_cycle_interruption', label: 'Power loss mid-cut — part likely scrapped', currency: 'scrap', unitCost: 8500 },
      { key: 'overnight_idle', label: 'Ran idle after the job completed', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
    ],
    defaultAlerts: [
      { key: 'mid_cycle_interruption', trigger: 'Load collapse during CUTTING state', severity: 'HIGH', currency: 'scrap' },
      { key: 'idle_after_job', trigger: 'Dropped to IDLE while job not flagged complete', severity: 'MEDIUM', currency: 'cost' },
    ],
  },
  {
    key: 'sinker-edm', name: 'Sinker / Die-sink EDM', category: 'machine-tool',
    ratedPowerMinKw: 5, ratedPowerMaxKw: 20, cycleStructure: 'long-unattended',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Dielectric pump and filtration left running while idle',
    powerStates: STATES.longUnattended,
    operatingEnvelope: { pfRange: [0.80, 0.95], voltageBand: [395, 433], runWindow: { shiftRef: 'A', allowedOutsideShift: true } },
    primaryKpis: ['kwh_per_part', 'idle_energy_pct', 'interruptions_per_month'],
    failureModes: [
      { key: 'mid_cycle_interruption', label: 'Power loss mid-burn — part at risk', currency: 'scrap', unitCost: 6000 },
      { key: 'dielectric_idle', label: 'Dielectric system ran while idle', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
    ],
    defaultAlerts: [
      { key: 'mid_cycle_interruption', trigger: 'Load collapse during machining', severity: 'HIGH', currency: 'scrap' },
      ALERT_OFF_SHIFT,
    ],
  },
  {
    key: 'centerless-grinder', name: 'Centerless Grinder', category: 'machine-tool',
    ratedPowerMinKw: 9, ratedPowerMaxKw: 44, cycleStructure: 'short-repetitive',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Large grinding-wheel induction motor at partial load → naturally low PF 0.65-0.75',
    powerStates: STATES.shortCycle,
    operatingEnvelope: { pfRange: [0.78, 0.92], voltageBand: [395, 433], runWindow: { shiftRef: 'A,B', allowedOutsideShift: false } },
    primaryKpis: ['kwh_per_part', 'pf_penalty_risk', 'idle_energy_pct'],
    failureModes: [
      { key: 'low_pf_penalty', label: 'Low power factor on the grinding feeder → penalty', currency: 'penalty', costModel: 'pf_penalty_formula' },
      { key: 'coolant_always_on', label: 'Coolant pump never switched off', currency: 'cost', costModel: 'coolant_kw * idle_hours * tariff' },
    ],
    defaultAlerts: [
      { key: 'pf_low', trigger: 'PF on the grinding feeder < 0.80', severity: 'MEDIUM', currency: 'penalty' },
      ALERT_EXCESS_IDLE,
    ],
  },
  {
    key: 'cylindrical-grinder', name: 'Cylindrical / OD Grinder', category: 'machine-tool',
    ratedPowerMinKw: 10, ratedPowerMaxKw: 32, cycleStructure: 'short-repetitive',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Low PF; long idle during wheel dressing',
    powerStates: STATES.shortCycle,
    operatingEnvelope: { pfRange: [0.78, 0.92], voltageBand: [395, 433], runWindow: { shiftRef: 'A,B', allowedOutsideShift: false } },
    primaryKpis: ['kwh_per_part', 'pf_penalty_risk', 'idle_energy_pct'],
    failureModes: [
      { key: 'low_pf_penalty', label: 'Low power factor → penalty', currency: 'penalty', costModel: 'pf_penalty_formula' },
      { key: 'dressing_idle', label: 'Long idle during wheel dressing', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
    ],
    defaultAlerts: [
      { key: 'pf_low', trigger: 'PF < 0.80', severity: 'MEDIUM', currency: 'penalty' },
      ALERT_EXCESS_IDLE,
    ],
  },
  {
    key: 'surface-grinder', name: 'Surface Grinder', category: 'machine-tool',
    ratedPowerMinKw: 3, ratedPowerMaxKw: 15, cycleStructure: 'short-repetitive',
    criticalityDefault: 'standard', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Coolant left running while the machine sits idle',
    powerStates: STATES.shortCycle, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['idle_energy_pct', 'machine_utilisation_pct'],
    failureModes: [
      { key: 'coolant_idle', label: 'Coolant ran while idle', currency: 'cost', costModel: 'coolant_kw * idle_hours * tariff' },
    ],
    defaultAlerts: [ALERT_EXCESS_IDLE, ALERT_OFF_SHIFT],
  },
  {
    key: 'gear-cutting', name: 'Gear Hobbing / Shaping', category: 'machine-tool',
    ratedPowerMinKw: 11, ratedPowerMaxKw: 22, cycleStructure: 'batch',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Long setup idle between batches',
    powerStates: STATES.shortCycle, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['kwh_per_part', 'idle_energy_pct', 'machine_utilisation_pct'],
    failureModes: [
      { key: 'setup_idle', label: 'Long setup idle between batches', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
    ],
    defaultAlerts: [ALERT_EXCESS_IDLE, ALERT_OFF_SHIFT],
  },
  {
    key: 'spm', name: 'Special Purpose Machine', category: 'machine-tool',
    ratedPowerMinKw: 10, ratedPowerMaxKw: 45, cycleStructure: 'varies',
    criticalityDefault: 'important', recommendedMeterTier: 'STANDARD',
    primaryWasteMode: 'Hydraulic power-pack running while the machine is idle',
    powerStates: STATES.shortCycle, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['kwh_per_part', 'idle_energy_pct', 'machine_utilisation_pct'],
    failureModes: [
      { key: 'hydraulic_pack_idle', label: 'Hydraulic pack ran while idle', currency: 'cost', costModel: 'hyd_kw * idle_hours * tariff' },
    ],
    defaultAlerts: [ALERT_EXCESS_IDLE, ALERT_OFF_SHIFT],
  },
  {
    key: 'induction-hardening', name: 'Induction Hardening', category: 'process-equipment',
    ratedPowerMinKw: 30, ratedPowerMaxKw: 120, cycleStructure: 'batch',
    criticalityDefault: 'critical', recommendedMeterTier: 'POWER_QUALITY',
    primaryWasteMode: 'Demand spikes on heat-up; harmonics from the induction supply',
    powerStates: STATES.batch,
    operatingEnvelope: { pfRange: [0.85, 0.98], voltageBand: [395, 433], thdCurrentMax: 10, runWindow: { shiftRef: 'A,B', allowedOutsideShift: false } },
    primaryKpis: ['kwh_per_part', 'peak_demand_vs_contract', 'pf_penalty_risk'],
    failureModes: [
      { key: 'demand_spike', label: 'Heat-up demand spike pushed peak kVA over contract', currency: 'penalty', costModel: 'demand_penalty_formula' },
    ],
    defaultAlerts: [ALERT_DEMAND, { key: 'thd_high', trigger: 'Current THD above the expected band', severity: 'MEDIUM', currency: 'penalty' }],
  },
  {
    key: 'pdc-machine', name: 'Pressure Die Casting machine + furnace', category: 'process-equipment',
    ratedPowerMinKw: 37, ratedPowerMaxKw: 145, cycleStructure: 'batch',
    criticalityDefault: 'critical', recommendedMeterTier: 'ADVANCED',
    primaryWasteMode: 'Holding furnace runs 24/7 as a large base load',
    powerStates: STATES.batch,
    operatingEnvelope: { pfRange: [0.85, 0.98], voltageBand: [395, 433], runWindow: { shiftRef: 'A,B,C', allowedOutsideShift: true } },
    primaryKpis: ['kwh_per_part', 'peak_demand_vs_contract', 'off_shift_consumption'],
    failureModes: [
      { key: 'furnace_overhold', label: 'Furnace held hot with no production scheduled', currency: 'cost', costModel: 'furnace_kw * idle_hours * tariff' },
    ],
    defaultAlerts: [ALERT_DEMAND, { key: 'furnace_idle_hold', trigger: 'Furnace at holding load with no parts produced', severity: 'MEDIUM', currency: 'cost' }],
  },
  {
    key: 'air-compressor', name: 'Rotary-screw Air Compressor', category: 'utility',
    ratedPowerMinKw: 7.5, ratedPowerMaxKw: 110, cycleStructure: 'continuous',
    criticalityDefault: 'critical', recommendedMeterTier: 'ADVANCED',
    primaryWasteMode: 'Air leaks and excessive load/unload cycling',
    powerStates: STATES.continuous,
    operatingEnvelope: { pfRange: [0.88, 0.98], voltageBand: [395, 433], runWindow: { shiftRef: 'A,B', allowedOutsideShift: false } },
    primaryKpis: ['specific_energy_kwh_m3', 'load_unload_ratio', 'leak_cost'],
    failureModes: [
      { key: 'air_leak', label: 'Compressed-air leak — runs loaded with no consumption', currency: 'cost', costModel: 'leak_flow * specific_energy * tariff' },
      { key: 'unload_cycling', label: 'Excessive load/unload cycling', currency: 'cost', costModel: 'unload_kw * unload_hours * tariff' },
    ],
    defaultAlerts: [
      { key: 'compressor_leak', trigger: 'Load/unload ratio degrading vs baseline', severity: 'MEDIUM', currency: 'cost' },
      ALERT_OFF_SHIFT,
    ],
  },
  {
    key: 'plating-rectifier', name: 'Electroplating Rectifier (6-pulse SCR)', category: 'process-equipment',
    ratedPowerMinKw: 30, ratedPowerMaxKw: 60, cycleStructure: 'batch',
    criticalityDefault: 'important', recommendedMeterTier: 'POWER_QUALITY',
    primaryWasteMode: 'True PF 0.70-0.75 while displacement PF reads 0.90+ → hidden penalty',
    powerStates: STATES.batch,
    operatingEnvelope: { pfRange: [0.70, 0.90], voltageBand: [395, 433], thdCurrentMax: 30, runWindow: { shiftRef: 'A,B', allowedOutsideShift: false } },
    primaryKpis: ['true_pf', 'pf_penalty_risk', 'kwh_per_part'],
    failureModes: [
      { key: 'true_pf_gap', label: 'True-PF to displacement-PF gap → hidden penalty', currency: 'penalty', costModel: 'pf_penalty_formula' },
    ],
    defaultAlerts: [
      { key: 'true_pf_gap', trigger: 'True-PF / displacement-PF gap > 0.10', severity: 'MEDIUM', currency: 'penalty' },
    ],
  },
  {
    key: 'welding', name: 'TIG / Orbital Welding', category: 'machine-tool',
    ratedPowerMinKw: 5, ratedPowerMaxKw: 16, cycleStructure: 'event',
    criticalityDefault: 'standard', recommendedMeterTier: 'BASIC',
    primaryWasteMode: 'Low duty cycle; left energised between welds',
    powerStates: STATES.onOff, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['idle_energy_pct', 'off_shift_consumption'],
    failureModes: [
      { key: 'idle_energised', label: 'Welder energised between welds', currency: 'cost', costModel: 'idle_kw * hours * tariff' },
    ],
    defaultAlerts: [ALERT_OFF_SHIFT],
  },
  {
    key: 'shop-utility', name: 'Lighting / Cranes / Coolant Aux', category: 'utility',
    ratedPowerMinKw: 5, ratedPowerMaxKw: 37, cycleStructure: 'varies',
    criticalityDefault: 'standard', recommendedMeterTier: 'BASIC',
    primaryWasteMode: 'Consumption outside working hours',
    powerStates: STATES.onOff, operatingEnvelope: SHIFT_ENVELOPE,
    primaryKpis: ['off_shift_consumption'],
    failureModes: [
      { key: 'off_shift_lighting', label: 'Lighting / aux left on after the shift', currency: 'cost', costModel: 'load_kw * off_shift_hours * tariff' },
    ],
    defaultAlerts: [ALERT_OFF_SHIFT],
  },
];

// Upsert every Manufacturing template by `key`. Idempotent — safe on every seed.
export async function seedAssetTemplates(prisma: PrismaClient): Promise<number> {
  for (const t of MANUFACTURING_ASSET_TEMPLATES) {
    const data = {
      bundleType: 'MANUFACTURING',
      name: t.name,
      category: t.category,
      ratedPowerMinKw: t.ratedPowerMinKw,
      ratedPowerMaxKw: t.ratedPowerMaxKw,
      cycleStructure: t.cycleStructure,
      criticalityDefault: t.criticalityDefault,
      recommendedMeterTier: t.recommendedMeterTier,
      primaryWasteMode: t.primaryWasteMode,
      powerStatesJson: JSON.stringify(t.powerStates),
      operatingEnvelopeJson: JSON.stringify(t.operatingEnvelope),
      primaryKpisJson: JSON.stringify(t.primaryKpis),
      failureModesJson: JSON.stringify(t.failureModes),
      defaultAlertsJson: JSON.stringify(t.defaultAlerts),
    };
    await prisma.assetTemplate.upsert({
      where: { key: t.key },
      create: { key: t.key, ...data },
      update: data,
    });
  }
  return MANUFACTURING_ASSET_TEMPLATES.length;
}
