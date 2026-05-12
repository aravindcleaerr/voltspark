import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDrivewaveClientId, checkApiKey, parsePeriod, drivewaveNotSeededResponse } from '@/lib/plantmind';

export const dynamic = 'force-dynamic';

/**
 * GET /api/defect-events?machineId=AOI-01&defectType=tombstoning&period=last_7_days
 * All filters optional. Defaults to last_30_days if no period given.
 * Caps result list at 500 events to keep payload bounded.
 *
 * Filter semantics:
 *   machineId          — point of DETECTION (downstream: AOI-01, ICT-01, FCT-01, etc.)
 *   linkedToMachineId  — point of ROOT CAUSE (upstream: REF-01, PNP-01, etc.). Joins
 *                        via ProcessExcursion: returns defects linked to any excursion
 *                        on that upstream machine in the period. Use this to answer
 *                        "what defects did the REF-01 thermocouple drift cause?"
 *   linkedExcursionId  — single specific excursion ID
 */
export async function GET(request: NextRequest) {
  const authError = checkApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machineId');
  const linkedToMachineId = searchParams.get('linkedToMachineId');
  const linkedExcursionId = searchParams.get('linkedExcursionId');
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

  if (linkedExcursionId) {
    where.linkedReflowExcursionId = linkedExcursionId;
  } else if (linkedToMachineId) {
    const upstreamExcursions = await prisma.processExcursion.findMany({
      where: {
        clientId,
        machineId: linkedToMachineId,
        detectedAt: { gte: period.start, lte: period.end },
      },
      select: { id: true },
    });
    const ids = upstreamExcursions.map(e => e.id);
    if (ids.length === 0) {
      return NextResponse.json({
        filter: {
          machineId: machineId || null,
          linkedToMachineId,
          linkedExcursionId: null,
          defectType: defectType || null,
          period: period.label,
        },
        count: 0,
        returned: 0,
        events: [],
        note: `No ProcessExcursions found on ${linkedToMachineId} in this period.`,
      });
    }
    where.linkedReflowExcursionId = { in: ids };
  }

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
      linkedToMachineId: linkedToMachineId || null,
      linkedExcursionId: linkedExcursionId || null,
      defectType: defectType || null,
      period: period.label,
    },
    count,
    returned: events.length,
    events,
  });
}
