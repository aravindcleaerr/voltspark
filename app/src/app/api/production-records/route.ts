import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDrivewaveClientId, checkApiKey, parsePeriod, drivewaveNotSeededResponse } from '@/lib/plantmind';

export const dynamic = 'force-dynamic';

/**
 * GET /api/production-records?lineId=LINE-01&periodStart=2026-04-01&periodEnd=2026-04-30
 * lineId defaults to LINE-01.
 */
export async function GET(request: NextRequest) {
  const authError = checkApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const lineId = searchParams.get('lineId') || 'LINE-01';
  const period = parsePeriod(searchParams, 30);
  const clientId = await getDrivewaveClientId();
  if (!clientId) return drivewaveNotSeededResponse();

  const rows = await prisma.productionRecord.findMany({
    where: {
      clientId,
      lineId,
      shiftDate: { gte: period.start, lte: period.end },
    },
    orderBy: [{ shiftDate: 'asc' }, { shiftNumber: 'asc' }],
  });

  const records = rows.map(r => ({
    shiftDate: r.shiftDate.toISOString().slice(0, 10),
    shiftNumber: r.shiftNumber,
    unitsPlanned: r.unitsPlanned,
    unitsProduced: r.unitsProduced,
    unitsRejected: r.unitsRejected,
    oee: r.oee,
    fpy: r.fpy,
    ppmDefects: r.ppmDefects,
    cycleTimeAvgSeconds: r.cycleTimeAvgSeconds,
    downtimeMinutesPlanned: r.downtimeMinutesPlanned,
    downtimeMinutesUnplanned: r.downtimeMinutesUnplanned,
    notes: r.notes,
  }));

  return NextResponse.json({ lineId, period: period.label, count: records.length, records });
}
