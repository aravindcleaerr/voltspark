import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'KITCHEN');
  if ('error' in addonCheck) return addonCheck.error;

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  const where: any = { kitchenId: kitchen.id };
  if (type) where.type = type;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [events, total] = await Promise.all([
    prisma.demandEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.demandEvent.count({ where }),
  ]);

  // Summary stats for current month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthStats = await prisma.demandEvent.groupBy({
    by: ['type'],
    where: { kitchenId: kitchen.id, createdAt: { gte: monthStart } },
    _count: true,
  });

  return NextResponse.json({
    events,
    total,
    page,
    pages: Math.ceil(total / limit),
    monthStats: monthStats.reduce((acc: any, s) => { acc[s.type] = s._count; return acc; }, {}),
  });
}
