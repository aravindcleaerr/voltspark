/**
 * Time / shift / production-pattern helpers.
 * Deterministic — uses a seedable PRNG so seed runs are reproducible.
 */

import { DRIVEWAVE } from './equipment';
import { isShutdown } from './scripted-events';

// ============================================================
// Deterministic PRNG (mulberry32) — same seed -> same sequence
// ============================================================

let _seed = 20260515;

export function setSeed(s: number) {
  _seed = s >>> 0;
}

export function rand(): number {
  let t = (_seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number, decimals = 2): number {
  return Number((rand() * (max - min) + min).toFixed(decimals));
}

export function randPick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function randNormal(mean: number, std: number): number {
  // Box-Muller
  const u1 = rand() || 1e-9;
  const u2 = rand();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// ============================================================
// Date / shift helpers
// ============================================================

export function* dateRange(start: Date, end: Date): Generator<Date> {
  const d = new Date(start);
  while (d <= end) {
    yield new Date(d);
    d.setDate(d.getDate() + 1);
  }
}

export function isSunday(d: Date): boolean {
  return d.getDay() === 0;
}

export function isWorkingDay(d: Date): boolean {
  if (isSunday(d)) return false;
  if (isShutdown(d)) return false;
  return true;
}

export type ShiftMeta = {
  date: Date;
  shiftNumber: 1 | 2 | 3;
  startHour: number;        // 0-23
  endHour: number;          // exclusive
  isWorking: boolean;
};

export function shiftsForDay(d: Date): ShiftMeta[] {
  const isWorking = isWorkingDay(d);
  return [
    { date: d, shiftNumber: 1 as const, startHour: 6, endHour: 14, isWorking },
    { date: d, shiftNumber: 2 as const, startHour: 14, endHour: 22, isWorking },
    { date: d, shiftNumber: 3 as const, startHour: 22, endHour: 30, isWorking },
  ];
}

// ============================================================
// Energy patterns
// ============================================================

/**
 * Hourly kWh draw for a machine — incorporates shift/idle pattern,
 * weekly seasonality, and small noise.
 */
export function hourlyKwh(
  machine: { kwAvg: number; kwPeak: number },
  date: Date,
  hour: number,
): number {
  if (!isWorkingDay(date)) {
    // Weekend / shutdown — small standby load
    return machine.kwAvg * 0.05 + randNormal(0, 0.1);
  }

  // Shift handover dip 10 min around 6, 14, 22 — flatten to ~hourly
  const handoverDip = [6, 14, 22].includes(hour) ? 0.85 : 1.0;

  // Inter-shift micro-seasonality: shift 3 (night) slightly lower
  const shiftFactor = hour >= 22 || hour < 6 ? 0.92 : 1.0;

  // Annual cooling-season modifier (HVAC adds load Apr-Sep)
  const month = date.getMonth() + 1;
  const coolingFactor = month >= 4 && month <= 9 ? 1.05 : 1.0;

  const base = machine.kwAvg * handoverDip * shiftFactor * coolingFactor;
  const noise = randNormal(0, machine.kwAvg * 0.03);
  return Math.max(0, base + noise);
}

/**
 * Power factor for a machine — REF-01 has natural lower PF; others ~0.95.
 */
export function powerFactor(machineCode: string, date: Date): number {
  const base = machineCode === 'REF-01' ? 0.88 : 0.95;
  return Math.max(0.7, Math.min(0.99, base + randNormal(0, 0.015)));
}

/**
 * Total Harmonic Distortion (THD) — REF-01 is naturally high, others low.
 */
export function thd(machineCode: string): number {
  if (machineCode === 'REF-01') return randFloat(7, 12);  // %
  if (machineCode.startsWith('PNP')) return randFloat(3, 6);
  return randFloat(2, 4);
}

// ============================================================
// Production / quality patterns
// ============================================================

/**
 * Baseline OEE for a shift — drifts slightly down over 3 years to reflect normal aging.
 */
export function baselineOEE(shiftDate: Date): number {
  const ageMonths =
    (shiftDate.getTime() - new Date('2023-05-15').getTime()) /
    (1000 * 60 * 60 * 24 * 30);
  // Start at 0.83, drift to ~0.78 over 3 years
  const drift = -0.0014 * ageMonths;
  const noise = randNormal(0, 0.02);
  return Math.max(0.65, Math.min(0.92, 0.83 + drift + noise));
}

/**
 * Baseline FPY — automotive Tier-1 should be ~98%
 */
export function baselineFPY(): number {
  return Math.max(0.94, Math.min(0.995, randNormal(0.985, 0.008)));
}

/**
 * Baseline cycle time (seconds) — designed CT 55s.
 */
export function baselineCycleTime(): number {
  return randNormal(55, 4);
}
