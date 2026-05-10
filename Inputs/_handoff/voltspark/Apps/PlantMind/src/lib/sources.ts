/**
 * Backend HTTP clients for the four data sources PlantMind federates.
 *
 * Source URLs are configured via env vars so the same code works locally
 * (all on localhost:300X) and in production (separate Vercel domains).
 */

import type { Source } from './types';

const VOLTSPARK = process.env.VOLTSPARK_BASE_URL || 'http://localhost:3000';
const PLANTCOST = process.env.PLANTCOST_BASE_URL || 'http://localhost:3001';
const MTRACK = process.env.MTRACK_BASE_URL || 'http://localhost:3002';

async function getJson(url: string, source: Source) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`[${source}] ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json();
}

// ============================================================
// VoltSpark — Energy / Equipment
// ============================================================

export async function getMeterTelemetry(args: {
  machineId: string;
  periodStart: string; // ISO date
  periodEnd: string;
}) {
  const params = new URLSearchParams(args as any);
  return getJson(`${VOLTSPARK}/api/meter-readings?${params}`, 'VoltSpark Energy');
}

export async function getConsumptionSummary(args: { machineId?: string; period: string }) {
  const params = new URLSearchParams(args as any);
  return getJson(`${VOLTSPARK}/api/consumption-summary?${params}`, 'VoltSpark Energy');
}

// ============================================================
// VoltSpark — Q-Apps tab
// ============================================================

export async function getProduction(args: {
  lineId?: string;
  periodStart: string;
  periodEnd: string;
}) {
  const params = new URLSearchParams(args as any);
  return getJson(`${VOLTSPARK}/api/production-records?${params}`, 'VoltSpark Q-Apps');
}

export async function getDefects(args: {
  machineId?: string;
  defectType?: string;
  period: string;
}) {
  const params = new URLSearchParams(args as any);
  return getJson(`${VOLTSPARK}/api/defect-events?${params}`, 'VoltSpark Q-Apps');
}

export async function getProcessExcursions(args: {
  machineId?: string;
  parameter?: string;
  period: string;
}) {
  const params = new URLSearchParams(args as any);
  return getJson(`${VOLTSPARK}/api/process-excursions?${params}`, 'VoltSpark Q-Apps');
}

// ============================================================
// PlantCost
// ============================================================

export async function getAssets(args: { category?: string } = {}) {
  const params = new URLSearchParams(args as any);
  return getJson(`${PLANTCOST}/api/assets?${params}`, 'PlantCost');
}

export async function getCostSummary(args: { assetCode?: string; period: string }) {
  const params = new URLSearchParams(args as any);
  return getJson(`${PLANTCOST}/api/cost-summary?${params}`, 'PlantCost');
}

// ============================================================
// mTrack
// ============================================================

export async function getOverduePms(args: { criticality?: string } = {}) {
  const params = new URLSearchParams(args as any);
  return getJson(`${MTRACK}/api/pms?status=overdue&${params}`, 'mTrack');
}

export async function getBreakdowns(args: { equipmentCode?: string; period: string }) {
  const params = new URLSearchParams(args as any);
  return getJson(`${MTRACK}/api/breakdowns?${params}`, 'mTrack');
}
