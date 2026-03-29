import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { updateMeterSchema } from '@/lib/iot-validations';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const meter = await prisma.ioTMeter.findFirst({
    where: { id, clientId: result.clientId },
    include: {
      gateway: { select: { id: true, name: true, isOnline: true, lastSeenAt: true, gatewayType: true } },
      energySource: { select: { id: true, name: true, type: true } },
    },
  });

  if (!meter) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });
  return NextResponse.json(meter);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const existing = await prisma.ioTMeter.findFirst({ where: { id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });

  const body = await request.json();
  const parsed = updateMeterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

  // Verify energy source if changing
  if (parsed.data.energySourceId) {
    const source = await prisma.energySource.findFirst({ where: { id: parsed.data.energySourceId, clientId: result.clientId } });
    if (!source) return NextResponse.json({ error: 'Energy source not found' }, { status: 404 });
  }

  const updated = await prisma.ioTMeter.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (!['CLIENT_ADMIN'].includes(result.user.clientRole || '') && !result.user.orgRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const existing = await prisma.ioTMeter.findFirst({ where: { id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });

  await prisma.ioTMeter.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
