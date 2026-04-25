// True PF Revealer math library.
// All inputs treat THDi as a decimal (0.35 means 35%).
// Source: InPhase Energy Consultant Meet 2026-04-23 closing slide.
// Reference cases live in true-pf.test.ts.

export function distortionPF(THDi: number): number {
  return 1 / Math.sqrt(1 + THDi * THDi);
}

export function truePF(DPF: number, THDi: number): number {
  return DPF * distortionPF(THDi);
}

export type ScenarioLabel = 'now' | 'afterAPFC' | 'afterAHF';

export interface Scenario {
  label: ScenarioLabel;
  dpf: number;
  thdi: number;
  distortionPF: number;
  truePF: number;
  estimatedPenalty: number; // ₹/month
}

export interface ScenarioInput {
  dpfNow: number;          // 0.5–1.0
  thdiNow: number;         // decimal e.g. 0.35
  currentPenalty: number;  // ₹/month, user-supplied
  bescomThreshold?: number; // default 0.95 (regulatory floor)
}

// APFC corrects displacement PF to ~0.99 but cannot touch THDi.
// AHF reduces THDi to ~5% and lifts DPF to unity.
const APFC_DPF_TARGET = 0.99;
const AHF_DPF_TARGET = 1.00;
const AHF_THDI_TARGET = 0.05;
const DEFAULT_THRESHOLD = 0.95;

export function computeScenarios(input: ScenarioInput): Scenario[] {
  const threshold = input.bescomThreshold ?? DEFAULT_THRESHOLD;

  const nowDpf = input.dpfNow;
  const nowThdi = input.thdiNow;
  const nowDist = distortionPF(nowThdi);
  const nowTrue = truePF(nowDpf, nowThdi);

  const apfcDpf = APFC_DPF_TARGET;
  const apfcDist = nowDist;
  const apfcTrue = truePF(apfcDpf, nowThdi);

  const ahfDpf = AHF_DPF_TARGET;
  const ahfThdi = AHF_THDI_TARGET;
  const ahfDist = distortionPF(ahfThdi);
  const ahfTrue = truePF(ahfDpf, ahfThdi);

  // Anchor the penalty curve to the user's actual current bill.
  // Penalty assumed proportional to (threshold − truePF) shortfall.
  const shortfall = (tpf: number) => Math.max(0, threshold - tpf);
  const nowShort = shortfall(nowTrue);
  const slope = nowShort > 0 ? input.currentPenalty / nowShort : 0;
  const penaltyAt = (tpf: number) => Math.round(slope * shortfall(tpf));

  return [
    {
      label: 'now',
      dpf: nowDpf,
      thdi: nowThdi,
      distortionPF: nowDist,
      truePF: nowTrue,
      estimatedPenalty: input.currentPenalty,
    },
    {
      label: 'afterAPFC',
      dpf: apfcDpf,
      thdi: nowThdi,
      distortionPF: apfcDist,
      truePF: apfcTrue,
      estimatedPenalty: penaltyAt(apfcTrue),
    },
    {
      label: 'afterAHF',
      dpf: ahfDpf,
      thdi: ahfThdi,
      distortionPF: ahfDist,
      truePF: ahfTrue,
      estimatedPenalty: penaltyAt(ahfTrue),
    },
  ];
}

// Maps a 4-button bucket selector to a representative midpoint THDi.
// The buckets mirror the spec's wording so labels stay consistent end-to-end.
export const THDI_BUCKETS = [
  { id: 'light',  label: 'VFD-light (<10%)',     midpoint: 0.05 },
  { id: 'mixed',  label: 'Mixed (10–30%)',       midpoint: 0.20 },
  { id: 'heavy',  label: 'VFD-heavy (30–60%)',   midpoint: 0.45 },
  { id: 'severe', label: 'Severe (>60%)',         midpoint: 0.80 },
] as const;

export type ThdiBucketId = typeof THDI_BUCKETS[number]['id'];

export function bucketToThdi(id: ThdiBucketId): number {
  const b = THDI_BUCKETS.find(b => b.id === id);
  return b ? b.midpoint : 0.20;
}
