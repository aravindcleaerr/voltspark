import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { loadManagementConfigSchema } from '@/lib/kitchen-validations';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const kitchen = await prisma.kitchen.findUnique({
    where: { clientId: result.clientId },
    include: { zones: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  return NextResponse.json({
    autoShedEnabled: kitchen.autoShedEnabled,
    warningThresholdPct: kitchen.warningThresholdPct,
    criticalThresholdPct: kitchen.criticalThresholdPct,
    shedTier3AtPct: kitchen.shedTier3AtPct,
    shedTier2AtPct: kitchen.shedTier2AtPct,
    restoreBelowPct: kitchen.restoreBelowPct,
    contractedDemandKVA: kitchen.contractedDemandKVA,
    zones: kitchen.zones.map((z) => ({
      id: z.id,
      name: z.name,
      zoneType: z.zoneType,
      priorityTier: z.priorityTier,
      maxLoadKW: z.maxLoadKW,
      haccpEnabled: z.haccpEnabled,
    })),
  });
}

export async function PUT(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const body = await request.json();
  const parsed = loadManagementConfigSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.kitchen.update({
    where: { id: kitchen.id },
    data: parsed.data,
  });

  return NextResponse.json({
    autoShedEnabled: updated.autoShedEnabled,
    warningThresholdPct: updated.warningThresholdPct,
    criticalThresholdPct: updated.criticalThresholdPct,
    shedTier3AtPct: updated.shedTier3AtPct,
    shedTier2AtPct: updated.shedTier2AtPct,
    restoreBelowPct: updated.restoreBelowPct,
  });
}
