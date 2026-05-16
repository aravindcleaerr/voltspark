// Asset Context Profile — shared serialization helpers. The DB stores the
// structured context (powerStates, operatingEnvelope, KPIs, failure modes) as
// JSON strings (codebase convention); these helpers parse them at the API
// boundary so UI code receives plain objects.

export function jsonParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

/** A raw AssetTemplate row (JSON columns still strings). */
interface RawTemplate {
  powerStatesJson: string;
  operatingEnvelopeJson: string;
  primaryKpisJson: string;
  failureModesJson: string;
  defaultAlertsJson: string;
  [k: string]: unknown;
}

/** Parse an AssetTemplate's JSON columns into objects for the client. */
export function serializeTemplate(t: RawTemplate) {
  return {
    ...t,
    powerStates: jsonParse(t.powerStatesJson, [] as unknown[]),
    operatingEnvelope: jsonParse(t.operatingEnvelopeJson, {} as Record<string, unknown>),
    primaryKpis: jsonParse(t.primaryKpisJson, [] as string[]),
    failureModes: jsonParse(t.failureModesJson, [] as unknown[]),
    defaultAlerts: jsonParse(t.defaultAlertsJson, [] as unknown[]),
  };
}

/** A raw AssetContextProfile row (JSON columns still strings). */
interface RawProfile {
  operatingEnvelopeJson: string;
  activeKpisJson: string;
  failureModesJson: string;
  reportAudiencesJson: string;
  [k: string]: unknown;
}

/** Parse an AssetContextProfile's JSON columns into objects for the client. */
export function serializeProfile(p: RawProfile) {
  return {
    ...p,
    operatingEnvelope: jsonParse(p.operatingEnvelopeJson, {} as Record<string, unknown>),
    activeKpis: jsonParse(p.activeKpisJson, [] as string[]),
    failureModes: jsonParse(p.failureModesJson, [] as unknown[]),
    reportAudiences: jsonParse(p.reportAudiencesJson, [] as string[]),
  };
}

/** Human labels for KPI keys used across templates. */
export const KPI_LABELS: Record<string, string> = {
  kwh_per_part: 'kWh per part',
  cost_per_part: '₹ per part',
  idle_energy_pct: 'Idle energy %',
  machine_utilisation_pct: 'Machine utilisation %',
  off_shift_consumption: 'Off-shift consumption',
  spindle_on_ratio: 'Spindle-on ratio',
  pf_penalty_risk: 'PF penalty risk ₹',
  peak_demand_vs_contract: 'Peak demand vs contract',
  cost_per_machine_hour: 'Cost per machine-hour',
  cut_completion_rate: 'Cut completion rate',
  interruptions_per_month: 'Interruptions / month',
  idle_after_job_hours: 'Idle-after-job hours',
  specific_energy_kwh_m3: 'Specific energy kWh/m³',
  load_unload_ratio: 'Load/unload ratio',
  leak_cost: 'Leak cost ₹',
  true_pf: 'True power factor',
  thd_trend: 'THD trend',
};

/** Pain-currency options — what failure costs this asset measures in. */
export const PAIN_CURRENCIES = ['cost', 'scrap', 'uptime', 'compliance', 'safety'] as const;

/** Report audiences an ACP can be shaped for. */
export const REPORT_AUDIENCES = ['owner', 'supervisor', 'auditor', 'customer'] as const;
