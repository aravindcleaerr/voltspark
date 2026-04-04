import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'COMPRESSED_AIR');
  if ('error' in addonCheck) return addonCheck.error;

  const searchParams = request.nextUrl.searchParams;
  const compressorId = searchParams.get('compressorId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: Record<string, unknown> = { clientId: result.clientId };
  if (compressorId) where.compressorId = compressorId;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const readings = await prisma.cAReading.findMany({
    where,
    include: { compressor: { select: { name: true } } },
    orderBy: { date: 'desc' },
    take: 200,
  });

  return NextResponse.json(readings);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'COMPRESSED_AIR');
  if ('error' in addonCheck) return addonCheck.error;

  const body = await request.json();
  const { compressorId, date, energyKwh, runHours, loadHours, airFlowM3, avgPressureBar, notes } = body;

  if (!compressorId || !date || energyKwh === undefined) {
    return NextResponse.json({ error: 'compressorId, date, and energyKwh are required' }, { status: 400 });
  }

  const compressor = await prisma.compressor.findFirst({ where: { id: compressorId, clientId: result.clientId } });
  if (!compressor) return NextResponse.json({ error: 'Compressor not found' }, { status: 404 });

  // Auto-calculate metrics
  const specificEnergy = airFlowM3 && airFlowM3 > 0 ? energyKwh / airFlowM3 : null;
  const loadPercent = runHours && loadHours ? (loadHours / runHours) * 100 : null;

  // Anomaly detection
  let hasAnomaly = false;
  let anomalyNote = '';
  // Specific energy: typical range 0.08-0.15 kWh/m³, above 0.2 is wasteful
  if (specificEnergy && specificEnergy > 0.20) {
    hasAnomaly = true;
    anomalyNote = `High specific energy: ${specificEnergy.toFixed(3)} kWh/m³ (target: <0.15). Possible leak or inefficiency.`;
  }
  // Load percent: below 50% suggests oversized compressor or excessive unloading
  if (loadPercent !== null && loadPercent < 50 && runHours && runHours > 4) {
    hasAnomaly = true;
    anomalyNote += `${anomalyNote ? ' ' : ''}Low load factor: ${loadPercent.toFixed(0)}% — compressor may be oversized.`;
  }

  const reading = await prisma.cAReading.create({
    data: {
      clientId: result.clientId, compressorId, date: new Date(date),
      energyKwh: parseFloat(energyKwh), runHours: runHours ? parseFloat(runHours) : null,
      loadHours: loadHours ? parseFloat(loadHours) : null, airFlowM3: airFlowM3 ? parseFloat(airFlowM3) : null,
      avgPressureBar: avgPressureBar ? parseFloat(avgPressureBar) : null,
      specificEnergy, loadPercent, hasAnomaly, anomalyNote: anomalyNote || null, notes,
    },
  });

  return NextResponse.json(reading, { status: 201 });
}
