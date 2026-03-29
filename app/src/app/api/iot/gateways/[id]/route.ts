import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { updateGatewaySchema } from '@/lib/iot-validations';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const gateway = await prisma.ioTGateway.findFirst({
    where: { id, clientId: result.clientId },
    include: {
      meters: { orderBy: { createdAt: 'asc' } },
      apiKeys: { select: { id: true, name: true, keyPrefix: true, isActive: true, lastUsedAt: true, createdAt: true } },
    },
  });

  if (!gateway) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
  return NextResponse.json(gateway);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const existing = await prisma.ioTGateway.findFirst({ where: { id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });

  const body = await request.json();
  const parsed = updateGatewaySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.ioTGateway.update({ where: { id }, data: parsed.data });
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
  const existing = await prisma.ioTGateway.findFirst({ where: { id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });

  // Soft delete - deactivate
  await prisma.ioTGateway.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
