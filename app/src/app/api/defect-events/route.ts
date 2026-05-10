import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDrivewaveClientId, checkApiKey, parsePeriod, drivewaveNotSeededResponse } from '@/lib/plantmind';

export const dynamic = 'force-dynamic';

/**
 * GET /api/defect-events?machineId=AOI-01&defectType=tombstoning&period=last_7_days
 * All filters optional. Defaults to last_30_days if no period given.
 * Caps result list at 500 events to keep payload bounded.
 */
export async function GET(request: NextRequest) {
  const authError = checkApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machineId');
  const defectType = searchParams.get('defectType');
  const period = parsePeriod(searchParams, 30);
  const clientId = await getDrivewaveClientId();
  if (!clientId) return drivewaveNotSeededResponse();

  const where: any = {
    clientId,
    detectedAt: { gte: period.start, lte: period.end },
  };
  if (machineId) where.detectedAtMachine = machineId;
  if (defectType) where.defectType = defectType;

  const count = await prisma.defectEvent.count({ where });
  const rows = await prisma.defectEvent.findMany({
    where,
    orderBy: { detectedAt: 'desc' },
    take: 500,
  });

  const events = rows.map(r => ({
    id: r.id,
    detectedAt: r.detectedAt.toISOString(),
    detectedAtMachine: r.detectedAtMachine,
    boardSerial: r.boardSerial,
    defectType: r.defectType,
    severity: r.severity,
    componentRef: r.componentRef,
    actionTaken: r.actionTaken,
    rootCauseSuspect: r.rootCauseSuspect,
    linkedReflowExcursionId: r.linkedReflowExcursionId,
  }));

  return NextResponse.json({
    filter: {
      machineId: machineId || null,
      defectType: defectType || null,
      period: period.label,
    },
    count,
    returned: events.length,
    events,
  });
}
