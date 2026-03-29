import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { generateIoTApiKey } from '@/lib/iot-auth';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const gateway = await prisma.ioTGateway.findFirst({ where: { id, clientId: result.clientId } });
  if (!gateway) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });

  const keys = await prisma.ioTApiKey.findMany({
    where: { gatewayId: id },
    select: { id: true, name: true, keyPrefix: true, isActive: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(keys);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const gateway = await prisma.ioTGateway.findFirst({ where: { id, clientId: result.clientId } });
  if (!gateway) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });

  const body = await request.json();
  const name = body.name || 'Default Key';

  const { fullKey, keyHash, keyPrefix } = generateIoTApiKey();

  await prisma.ioTApiKey.create({
    data: { gatewayId: id, keyHash, keyPrefix, name },
  });

  // Return full key ONCE — user must copy immediately
  return NextResponse.json({ fullKey, keyPrefix, name, message: 'Copy this key now. It will not be shown again.' }, { status: 201 });
}
