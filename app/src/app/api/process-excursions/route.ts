import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDrivewaveClientId, checkApiKey, parsePeriod, drivewaveNotSeededResponse } from '@/lib/plantmind';

export const dynamic = 'force-dynamic';

/**
 * GET /api/process-excursions?machineId=REF-01&parameter=zone3_temperature&period=last_7_days
 * All filters optional.
 */
export async function GET(request: NextRequest) {
  const authError = checkApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machineId');
  const parameter = searchParams.get('parameter');
  const period = parsePeriod(searchParams, 30);
  const clientId = await getDrivewaveClientId();
  if (!clientId) return drivewaveNotSeededResponse();

  const where: any = {
    clientId,
    detectedAt: { gte: period.start, lte: period.end },
  };
  if (machineId) where.machineId = machineId;
  if (parameter) where.parameter = parameter;

  const count = await prisma.processExcursion.count({ where });
  const rows = await prisma.processExcursion.findMany({
    where,
    orderBy: { detectedAt: 'desc' },
    take: 500,
  });

  const excursions = rows.map(r => ({
    id: r.id,
    detectedAt: r.detectedAt.toISOString(),
    machineId: r.machineId,
    parameter: r.parameter,
    expectedValue: r.expectedValue,
    observedValue: r.observedValue,
    durationSeconds: r.durationSeconds,
    severity: r.severity,
    resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
    notes: r.notes,
  }));

  return NextResponse.json({
    filter: {
      machineId: machineId || null,
      parameter: parameter || null,
      period: period.label,
    },
    count,
    returned: excursions.length,
    excursions,
  });
}
