import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDrivewaveClientId, checkApiKey, parsePeriod, drivewaveNotSeededResponse } from '@/lib/plantmind';

export const dynamic = 'force-dynamic';

/**
 * GET /api/consumption-summary?machineId=PNP-02&period=2026-03
 *   - machineId optional — omitted = plant-wide.
 *   - period: YYYY-MM | YYYY-MM-DD..YYYY-MM-DD | last_N_days. Defaults to last_30_days.
 *
 * Returns aggregate kWh + PF stats + anomaly count over the period.
 * Anomalies = readings with powerFactor < 0.85.
 */
export async function GET(request: NextRequest) {
  const authError = checkApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machineId');
  const period = parsePeriod(searchParams, 30);
  const clientId = await getDrivewaveClientId();
  if (!clientId) return drivewaveNotSeededResponse();

  // Resolve meter IDs in scope
  let meterIds: string[];
  if (machineId) {
    const source = await prisma.energySource.findFirst({
      where: { clientId, meterNumber: machineId },
      include: { iotMeters: { select: { id: true } } },
    });
    meterIds = source?.iotMeters.map(m => m.id) ?? [];
  } else {
    const allMeters = await prisma.ioTMeter.findMany({
      where: { clientId },
      select: { id: true },
    });
    meterIds = allMeters.map(m => m.id);
  }

  if (meterIds.length === 0) {
    return NextResponse.json({
      machineId: machineId || null,
      period: period.label,
      totalKwh: 0,
      avgPowerFactor: null,
      minPowerFactor: null,
      maxPowerFactor: null,
      avgThd: null,
      anomalyCount: 0,
      anomalies: [],
      note: 'No meters in scope',
    });
  }

  const rows = await prisma.meterReading.findMany({
    where: {
      meterId: { in: meterIds },
      timestamp: { gte: period.start, lte: period.end },
    },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, activePowerKW: true, powerFactor: true, thdVoltage: true },
  });

  let totalKwh = 0;
  let pfSum = 0, pfMin = Infinity, pfMax = -Infinity, pfCount = 0;
  let thdSum = 0, thdCount = 0;
  const anomalies: { timestamp: string; type: string; value: number }[] = [];

  for (const r of rows) {
    totalKwh += r.activePowerKW ?? 0; // hourly cadence → 1h = kWh equals kW
    if (r.powerFactor !== null && r.powerFactor !== undefined) {
      pfSum += r.powerFactor;
      pfMin = Math.min(pfMin, r.powerFactor);
      pfMax = Math.max(pfMax, r.powerFactor);
      pfCount++;
      if (r.powerFactor < 0.85) {
        anomalies.push({
          timestamp: r.timestamp.toISOString(),
          type: 'low_power_factor',
          value: Number(r.powerFactor.toFixed(3)),
        });
      }
    }
    if (r.thdVoltage !== null && r.thdVoltage !== undefined) {
      thdSum += r.thdVoltage;
      thdCount++;
    }
  }

  // Trim anomaly list to first 50 to keep payload manageable
  const trimmedAnomalies = anomalies.slice(0, 50);

  return NextResponse.json({
    machineId: machineId || null,
    period: period.label,
    totalKwh: Number(totalKwh.toFixed(2)),
    avgPowerFactor: pfCount ? Number((pfSum / pfCount).toFixed(3)) : null,
    minPowerFactor: pfCount ? Number(pfMin.toFixed(3)) : null,
    maxPowerFactor: pfCount ? Number(pfMax.toFixed(3)) : null,
    avgThd: thdCount ? Number((thdSum / thdCount).toFixed(2)) : null,
    anomalyCount: anomalies.length,
    anomalies: trimmedAnomalies,
  });
}
