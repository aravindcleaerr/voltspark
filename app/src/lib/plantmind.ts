/**
 * Helpers for the PlantMind-facing API endpoints.
 *
 * These endpoints are called server-to-server by the PlantMind chatbot for the
 * Vitesco / Schaeffler demo on 15 May 2026. They are scoped to the Drivewave
 * tenant by hardcoded slug lookup and protected by an X-API-Key shared secret.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DRIVEWAVE_SLUG = 'drivewave';

let cachedDrivewaveId: string | null = null;

export async function getDrivewaveClientId(): Promise<string | null> {
  if (cachedDrivewaveId) return cachedDrivewaveId;
  const client = await prisma.client.findUnique({ where: { slug: DRIVEWAVE_SLUG } });
  if (!client) return null;
  cachedDrivewaveId = client.id;
  return cachedDrivewaveId;
}

export function drivewaveNotSeededResponse() {
  return NextResponse.json(
    { error: `Drivewave tenant (slug=${DRIVEWAVE_SLUG}) not found. Seed has not been run on this database.` },
    { status: 503 },
  );
}

/**
 * Verifies the X-API-Key header against process.env.PLANTMIND_API_KEY.
 *
 * If PLANTMIND_API_KEY is not set in the environment, requests are allowed
 * through (demo-friendly default). To enforce, set the env var on Vercel.
 */
export function checkApiKey(request: NextRequest): NextResponse | null {
  const expected = process.env.PLANTMIND_API_KEY;
  if (!expected) return null;
  const provided = request.headers.get('x-api-key');
  if (provided !== expected) {
    return NextResponse.json({ error: 'Invalid or missing X-API-Key' }, { status: 401 });
  }
  return null;
}

export type PeriodRange = { start: Date; end: Date; label: string };

/**
 * Parses a period spec into a [start, end] date range.
 * Accepts:
 *   - `YYYY-MM`           → that calendar month
 *   - `YYYY-MM-DD..YYYY-MM-DD` → arbitrary range
 *   - `last_N_days`       → N days ago to today (default N=7 if missing)
 *   - explicit periodStart + periodEnd query params (yyyy-mm-dd)
 */
export function parsePeriod(searchParams: URLSearchParams, defaultDays = 30): PeriodRange {
  const periodStart = searchParams.get('periodStart');
  const periodEnd = searchParams.get('periodEnd');
  if (periodStart && periodEnd) {
    return {
      start: new Date(`${periodStart}T00:00:00.000Z`),
      end: new Date(`${periodEnd}T23:59:59.999Z`),
      label: `${periodStart}..${periodEnd}`,
    };
  }

  const period = searchParams.get('period');
  if (!period) {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - defaultDays);
    return { start, end, label: `last_${defaultDays}_days` };
  }

  // last_N_days
  const lastMatch = period.match(/^last_(\d+)_days?$/);
  if (lastMatch) {
    const n = parseInt(lastMatch[1], 10);
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - n);
    return { start, end, label: period };
  }

  // YYYY-MM-DD..YYYY-MM-DD
  const rangeMatch = period.match(/^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/);
  if (rangeMatch) {
    return {
      start: new Date(`${rangeMatch[1]}T00:00:00.000Z`),
      end: new Date(`${rangeMatch[2]}T23:59:59.999Z`),
      label: period,
    };
  }

  // YYYY-MM (calendar month)
  const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const y = parseInt(monthMatch[1], 10);
    const m = parseInt(monthMatch[2], 10);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    return { start, end, label: period };
  }

  // Fallback — treat as last_7_days
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 7);
  return { start, end, label: 'last_7_days' };
}
