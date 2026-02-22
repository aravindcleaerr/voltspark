import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { createConsumptionEntrySchema } from '@/lib/validations';
import { detectDeviation } from '@/lib/deviation';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const deviationsOnly = searchParams.get('deviationsOnly') === 'true';
  const limit = parseInt(searchParams.get('limit') || '100');

  const where: any = { clientId: result.clientId };
  if (sourceId) where.energySourceId = sourceId;
  if (deviationsOnly) where.hasDeviation = true;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const entries = await prisma.consumptionEntry.findMany({
    where,
    include: {
      energySource: { select: { name: true, type: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
    take: limit,
  });
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createConsumptionEntrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { date, ...rest } = parsed.data;
  const entryDate = new Date(date);
  const month = entryDate.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  const year = entryDate.getFullYear();
  const quarterlyPeriod = `${year}-Q${quarter}`;

  const target = await prisma.energyTarget.findFirst({
    where: { energySourceId: rest.energySourceId, period: quarterlyPeriod },
  });

  // Look up cost per unit from energy source
  const source = await prisma.energySource.findUnique({
    where: { id: rest.energySourceId },
    select: { costPerUnit: true },
  });
  const cost = source?.costPerUnit ? rest.value * source.costPerUnit : null;

  let deviationData = {};
  if (target) {
    const dailyTarget = target.targetValue / 90;
    const deviationResult = detectDeviation(rest.value, dailyTarget);
    deviationData = { hasDeviation: deviationResult.hasDeviation, deviationPercent: deviationResult.deviationPercent, deviationSeverity: deviationResult.severity, deviationNote: deviationResult.note };
  }

  const entry = await prisma.consumptionEntry.create({
    data: { ...rest, date: entryDate, clientId: result.clientId, recordedById: result.user.id, cost, ...deviationData },
    include: { energySource: { select: { name: true } }, recordedBy: { select: { name: true } } },
  });
  return NextResponse.json(entry, { status: 201 });
}
