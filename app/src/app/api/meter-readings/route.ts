import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDrivewaveClientId, checkApiKey, parsePeriod, drivewaveNotSeededResponse } from '@/lib/plantmind';

export const dynamic = 'force-dynamic';

/**
 * GET /api/meter-readings?machineId=PNP-02&periodStart=2026-03-01&periodEnd=2026-03-31
 * Returns hourly meter readings for a single machine (matched by EnergySource.meterNumber
 * which is the equipment code, e.g. "PNP-02").
 */
export async function GET(request: NextRequest) {
  const authError = checkApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machineId');
  if (!machineId) {
    return NextResponse.json({ error: 'machineId query param is required' }, { status: 400 });
  }
  const period = parsePeriod(searchParams, 30);
  const clientId = await getDrivewaveClientId();
  if (!clientId) return drivewaveNotSeededResponse();

  const energySource = await prisma.energySource.findFirst({
    where: { clientId, meterNumber: machineId },
    include: { iotMeters: true },
  });
  if (!energySource || energySource.iotMeters.length === 0) {
    return NextResponse.json({
      machineId,
      periodStart: period.start.toISOString().slice(0, 10),
      periodEnd: period.end.toISOString().slice(0, 10),
      readings: [],
      note: `No meter found for machineId=${machineId}`,
    });
  }

  const meterIds = energySource.iotMeters.map(m => m.id);
  const rows = await prisma.meterReading.findMany({
    where: {
      meterId: { in: meterIds },
      timestamp: { gte: period.start, lte: period.end },
    },
    orderBy: { timestamp: 'asc' },
    select: {
      timestamp: true,
      activePowerKW: true,
      voltageAvg: true,
      currentR: true,
      powerFactor: true,
      thdVoltage: true,
    },
  });

  const readings = rows.map(r => ({
    timestamp: r.timestamp.toISOString(),
    kwh: Number((r.activePowerKW ?? 0).toFixed(3)),
    voltage: r.voltageAvg !== null && r.voltageAvg !== undefined ? Number(r.voltageAvg.toFixed(2)) : null,
    current: r.currentR !== null && r.currentR !== undefined ? Number(r.currentR.toFixed(2)) : null,
    powerFactor: r.powerFactor !== null && r.powerFactor !== undefined ? Number(r.powerFactor.toFixed(3)) : null,
    thd: r.thdVoltage !== null && r.thdVoltage !== undefined ? Number(r.thdVoltage.toFixed(2)) : null,
  }));

  return NextResponse.json({
    machineId,
    periodStart: period.start.toISOString().slice(0, 10),
    periodEnd: period.end.toISOString().slice(0, 10),
    readings,
  });
}
