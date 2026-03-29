import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { createMeterSchema } from '@/lib/iot-validations';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const gatewayId = request.nextUrl.searchParams.get('gatewayId');

  const meters = await prisma.ioTMeter.findMany({
    where: { clientId: result.clientId, isActive: true, ...(gatewayId ? { gatewayId } : {}) },
    include: {
      gateway: { select: { id: true, name: true, isOnline: true, lastSeenAt: true } },
      energySource: { select: { id: true, name: true, type: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(meters);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const body = await request.json();
  const parsed = createMeterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

  // Verify gateway belongs to this client
  const gateway = await prisma.ioTGateway.findFirst({ where: { id: parsed.data.gatewayId, clientId: result.clientId } });
  if (!gateway) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });

  // Verify energy source belongs to this client (if provided)
  if (parsed.data.energySourceId) {
    const source = await prisma.energySource.findFirst({ where: { id: parsed.data.energySourceId, clientId: result.clientId } });
    if (!source) return NextResponse.json({ error: 'Energy source not found' }, { status: 404 });
  }

  const meter = await prisma.ioTMeter.create({
    data: { ...parsed.data, clientId: result.clientId },
  });

  return NextResponse.json(meter, { status: 201 });
}
