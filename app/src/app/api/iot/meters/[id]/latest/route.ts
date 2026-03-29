import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const meter = await prisma.ioTMeter.findFirst({ where: { id, clientId: result.clientId } });
  if (!meter) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });

  const reading = await prisma.meterReading.findFirst({
    where: { meterId: id },
    orderBy: { timestamp: 'desc' },
  });

  if (!reading) return NextResponse.json({ error: 'No readings found' }, { status: 404 });
  return NextResponse.json(reading);
}
