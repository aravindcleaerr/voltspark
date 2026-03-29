import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const severity = searchParams.get('severity');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const acknowledged = searchParams.get('acknowledged');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const where: Record<string, unknown> = { clientId: result.clientId };
  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (acknowledged === 'true') where.acknowledgedAt = { not: null };
  if (acknowledged === 'false') where.acknowledgedAt = null;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
  }

  const [alerts, total] = await Promise.all([
    prisma.meterAlert.findMany({
      where,
      include: { meter: { select: { id: true, name: true, meterType: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.meterAlert.count({ where }),
  ]);

  return NextResponse.json({ alerts, total, page, limit, totalPages: Math.ceil(total / limit) });
}
