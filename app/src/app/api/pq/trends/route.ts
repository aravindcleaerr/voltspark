import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'POWER_QUALITY');
  if ('error' in addonCheck) return addonCheck.error;

  const searchParams = request.nextUrl.searchParams;
  const meterId = searchParams.get('meterId');
  const days = Math.min(parseInt(searchParams.get('days') || '30'), 90);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const where: Record<string, unknown> = { clientId: result.clientId, date: { gte: since } };
  if (meterId) where.meterId = meterId;

  const snapshots = await prisma.pQSnapshot.findMany({
    where,
    include: { meter: { select: { id: true, name: true } } },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(snapshots);
}
