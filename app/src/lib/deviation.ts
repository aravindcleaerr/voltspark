import { DEVIATION_THRESHOLD_WARNING, DEVIATION_THRESHOLD_CRITICAL } from './constants';

export interface DeviationResult {
  hasDeviation: boolean;
  deviationPercent: number;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  note: string;
}

export function detectDeviation(
  actualValue: number,
  targetValue: number,
  thresholdWarning: number = DEVIATION_THRESHOLD_WARNING,
  thresholdCritical: number = DEVIATION_THRESHOLD_CRITICAL
): DeviationResult {
  if (targetValue === 0) {
    return {
      hasDeviation: false,
      deviationPercent: 0,
      severity: 'NORMAL',
      note: 'No target set for comparison',
    };
  }

  const deviationPercent = ((actualValue - targetValue) / targetValue) * 100;
  const absDeviation = Math.abs(deviationPercent);

  if (absDeviation <= thresholdWarning) {
    return {
      hasDeviation: false,
      deviationPercent: Math.round(deviationPercent * 10) / 10,
      severity: 'NORMAL',
      note: 'Within target range',
    };
  } else if (absDeviation <= thresholdCritical) {
    return {
      hasDeviation: true,
      deviationPercent: Math.round(deviationPercent * 10) / 10,
      severity: 'WARNING',
      note: `${Math.round(deviationPercent * 10) / 10}% deviation from target - review recommended`,
    };
  } else {
    return {
      hasDeviation: true,
      deviationPercent: Math.round(deviationPercent * 10) / 10,
      severity: 'CRITICAL',
      note: `${Math.round(deviationPercent * 10) / 10}% deviation from target - immediate action required`,
    };
  }
}
