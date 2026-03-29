import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const meter = await prisma.ioTMeter.findFirst({ where: { id, clientId: result.clientId } });
  if (!meter) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 2000);

  const where: Record<string, unknown> = { meterId: id };
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, unknown>).gte = new Date(from);
    if (to) (where.timestamp as Record<string, unknown>).lte = new Date(to);
  }

  const readings = await prisma.meterReading.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return NextResponse.json(readings);
}
