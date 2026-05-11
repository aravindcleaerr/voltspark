/**
 * Canonical register name → MeterReading DB field mapping.
 * Canonical names follow VS-Meter Profile spec (docs/voltspark-field-engineering).
 * Phase convention: a→R, b→Y, c→B (Indian 3-phase R-Y-B = international A-B-C).
 */

type MeterReadingInsert = {
  activePowerKW: number;
  apparentPowerKVA?: number;
  reactivePowerKVAR?: number;
  powerFactor?: number;
  voltageR?: number;
  voltageY?: number;
  voltageB?: number;
  voltageAvg?: number;
  currentR?: number;
  currentY?: number;
  currentB?: number;
  currentAvg?: number;
  energyKwh?: number;
  energyKwhExport?: number;
  energyKvarhImport?: number;
  energyKvarhExport?: number;
  demandKW?: number;
  demandKVA?: number;
  maxDemandKW?: number;
  maxDemandKVA?: number;
  frequencyHz?: number;
  thdVoltage?: number;
  thdCurrent?: number;
  voltageUnbalance?: number;
  currentUnbalance?: number;
  extraDataJson?: string;
};

/** Map from canonical register name to MeterReading field path */
const DIRECT_MAP: Record<string, keyof MeterReadingInsert> = {
  // Voltage (L-N)
  v_a: 'voltageR',
  v_b: 'voltageY',
  v_c: 'voltageB',
  v_avg_ln: 'voltageAvg',
  // Current
  i_a: 'currentR',
  i_b: 'currentY',
  i_c: 'currentB',
  i_avg: 'currentAvg',
  // Power totals
  kw_total: 'activePowerKW',
  kva_total: 'apparentPowerKVA',
  kvar_total: 'reactivePowerKVAR',
  pf_avg: 'powerFactor',
  // Energy
  kwh_import: 'energyKwh',
  kwh_export: 'energyKwhExport',
  kvarh_import: 'energyKvarhImport',
  kvarh_export: 'energyKvarhExport',
  // Demand
  demand_kw: 'demandKW',
  demand_kva: 'demandKVA',
  kw_max_demand: 'maxDemandKW',
  kva_max_demand: 'maxDemandKVA',
  max_demand_kw: 'maxDemandKW',
  max_demand_kva: 'maxDemandKVA',
  // Frequency
  hz: 'frequencyHz',
  freq_hz: 'frequencyHz',
  // Unbalance
  v_unbalance: 'voltageUnbalance',
  i_unbalance: 'currentUnbalance',
};

/**
 * Convert a canonical readings object (from VS-Meter Profile telemetry payload)
 * to a MeterReading insert shape. activePowerKW defaults to 0 if kw_total absent.
 * Per-phase THD is averaged across phases and stored in thdVoltage/thdCurrent.
 * Any unmapped canonical names are packed into extraDataJson.
 */
export function canonicalToMeterReading(readings: Record<string, number>): MeterReadingInsert {
  const result: Partial<MeterReadingInsert> = {};
  const extra: Record<string, number> = {};

  // Per-phase THD accumulators
  const thdV: number[] = [];
  const thdI: number[] = [];

  for (const [key, value] of Object.entries(readings)) {
    if (typeof value !== 'number' || isNaN(value)) continue;

    // Per-phase THD — accumulate for averaging
    if (/^thd_v_[abc]$/.test(key)) { thdV.push(value); continue; }
    if (/^thd_i_[abc]$/.test(key)) { thdI.push(value); continue; }
    // Aggregate THD
    if (key === 'thd_v_avg' || key === 'thd_voltage') { result.thdVoltage = value; continue; }
    if (key === 'thd_i_avg' || key === 'thd_current') { result.thdCurrent = value; continue; }
    // Harmonic arrays and other advanced registers → extra
    if (/^harmonic_/.test(key) || /^v_[abc][abc]$/.test(key)) { extra[key] = value; continue; }

    const field = DIRECT_MAP[key];
    if (field) {
      (result as Record<string, number>)[field] = value;
    } else {
      extra[key] = value;
    }
  }

  // Average per-phase THDs into aggregate fields (only if aggregate not already set)
  if (thdV.length > 0 && result.thdVoltage === undefined)
    result.thdVoltage = thdV.reduce((a, b) => a + b, 0) / thdV.length;
  if (thdI.length > 0 && result.thdCurrent === undefined)
    result.thdCurrent = thdI.reduce((a, b) => a + b, 0) / thdI.length;

  // Pack per-phase THD into extra if present (useful for PQ module)
  if (thdV.length > 0) {
    const phases = ['a', 'b', 'c'];
    thdV.forEach((v, i) => { extra[`thd_v_${phases[i]}`] = v; });
  }
  if (thdI.length > 0) {
    const phases = ['a', 'b', 'c'];
    thdI.forEach((v, i) => { extra[`thd_i_${phases[i]}`] = v; });
  }

  if (Object.keys(extra).length > 0)
    result.extraDataJson = JSON.stringify(extra);

  return {
    activePowerKW: result.activePowerKW ?? 0,
    ...result,
  };
}
