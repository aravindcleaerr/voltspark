/**
 * Scripted timeline events that drive cross-source coupling in the dummy data.
 *
 * Each app's seeder reads this file and bakes correlated patterns into its tables.
 * This is what makes the chatbot's cross-source answers feel real:
 *   - Deferred PMs in mTrack -> breakdowns shortly after
 *   - Reflow excursions in VoltSpark Q-Apps -> AOI defect spikes linked by ID
 *   - Asset cost climbs in PlantCost -> traceable to repeated breakdowns
 *
 * All dates in IST (UTC+5:30). Demo date: 2026-05-15.
 */

export type ScriptedEvent =
  | {
      kind: 'pm_deferral';
      eventId: string;
      machine: string;
      startDate: string;       // YYYY-MM-DD when the deferral first happens
      occurrences: number;     // how many consecutive PMs deferred
      notes: string;
    }
  | {
      kind: 'thermocouple_drift';
      eventId: string;
      machine: string;
      startDate: string;
      durationDays: number;
      driftSeverity: 'low' | 'rising' | 'critical';
      notes: string;
    }
  | {
      kind: 'breakdown';
      eventId: string;
      machine: string;
      date: string;
      durationMinutes: number;
      cause: string;
      linkedTo?: string;       // eventId this breakdown follows from
      notes: string;
    }
  | {
      kind: 'paste_batch_issue';
      eventId: string;
      startDate: string;
      durationDays: number;
      notes: string;
    }
  | {
      kind: 'shutdown';
      eventId: string;
      startDate: string;
      durationDays: number;
      reason: string;
    };

export const SCRIPTED_EVENTS: ScriptedEvent[] = [
  // 2024 — calm year, mostly normal operations

  // 2025 — early issues build up
  {
    kind: 'pm_deferral',
    eventId: 'EV-2025-001',
    machine: 'PNP-02',
    startDate: '2025-09-01',
    occurrences: 3,
    notes: 'PNP-02 weekly PMs deferred 3 weeks in a row — operations pressure during festival season',
  },
  {
    kind: 'breakdown',
    eventId: 'EV-2025-002',
    machine: 'PNP-02',
    date: '2025-10-08',
    durationMinutes: 240,
    cause: 'feeder_jam',
    linkedTo: 'EV-2025-001',
    notes: 'Feeder jam following deferred PMs — worn nozzle caused tape mis-alignment',
  },
  {
    kind: 'thermocouple_drift',
    eventId: 'EV-2025-003',
    machine: 'REF-01',
    startDate: '2025-08-15',
    durationDays: 180,
    driftSeverity: 'low',
    notes: 'Zone-3 thermocouple slow drift — AOI reject rate climbs gradually from 60 ppm to 180 ppm over 6 months',
  },

  // Diwali 2025 shutdown
  {
    kind: 'shutdown',
    eventId: 'EV-2025-004',
    startDate: '2025-10-29',
    durationDays: 5,
    reason: 'Diwali plant shutdown',
  },

  // 2026 — building up to demo time
  {
    kind: 'thermocouple_drift',
    eventId: 'EV-2026-001',
    machine: 'REF-01',
    startDate: '2026-02-01',
    durationDays: 14,
    driftSeverity: 'rising',
    notes: 'REF-01 thermocouple drift accelerates — multiple zone-3 excursions per shift',
  },
  {
    kind: 'breakdown',
    eventId: 'EV-2026-002',
    machine: 'REF-01',
    date: '2026-02-14',
    durationMinutes: 480,
    cause: 'thermocouple_full_failure',
    linkedTo: 'EV-2026-001',
    notes: 'REF-01 zone-3 thermocouple full failure — line down 8 hours; 540 units lost; ~₹2.7L direct cost + opportunity',
  },
  {
    kind: 'paste_batch_issue',
    eventId: 'EV-2026-003',
    startDate: '2026-03-08',
    durationDays: 3,
    notes: 'Solder paste batch B-4451 had high viscosity — tombstoning + insufficient solder defects spike across all production for 3 days',
  },
  {
    kind: 'pm_deferral',
    eventId: 'EV-2026-004',
    machine: 'AOI-01',
    startDate: '2026-04-12',
    occurrences: 2,
    notes: 'AOI-01 quarterly camera calibration deferred — false-reject rate climbs in late April',
  },

  // Critical for the demo: this is the kind of pattern the chatbot will surface in cross-source queries
];

/**
 * Helper: was a PM deferred for a given (machine, scheduledDate)?
 */
export function isPmDeferred(machine: string, scheduledDate: Date): boolean {
  return SCRIPTED_EVENTS.some((e) => {
    if (e.kind !== 'pm_deferral' || e.machine !== machine) return false;
    const start = new Date(e.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7 * e.occurrences);
    return scheduledDate >= start && scheduledDate <= end;
  });
}

/**
 * Helper: is a date inside a thermocouple-drift window?
 */
export function getDriftSeverity(machine: string, date: Date): 'low' | 'rising' | 'critical' | null {
  for (const e of SCRIPTED_EVENTS) {
    if (e.kind !== 'thermocouple_drift' || e.machine !== machine) continue;
    const start = new Date(e.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + e.durationDays);
    if (date >= start && date <= end) return e.driftSeverity;
  }
  return null;
}

/**
 * Helper: is a date inside a paste-batch-issue window?
 */
export function isPasteBatchIssue(date: Date): boolean {
  return SCRIPTED_EVENTS.some((e) => {
    if (e.kind !== 'paste_batch_issue') return false;
    const start = new Date(e.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + e.durationDays);
    return date >= start && date <= end;
  });
}

/**
 * Helper: is a date inside a shutdown?
 */
export function isShutdown(date: Date): boolean {
  return SCRIPTED_EVENTS.some((e) => {
    if (e.kind !== 'shutdown') return false;
    const start = new Date(e.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + e.durationDays);
    return date >= start && date <= end;
  });
}

export const SEED_TIME_WINDOW = {
  start: '2023-05-15',   // 3 years before demo
  end: '2026-05-14',     // demo eve — data freshness
};
