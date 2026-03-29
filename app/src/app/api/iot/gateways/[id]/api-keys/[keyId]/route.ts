import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; keyId: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id, keyId } = await params;
  const gateway = await prisma.ioTGateway.findFirst({ where: { id, clientId: result.clientId } });
  if (!gateway) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });

  const key = await prisma.ioTApiKey.findFirst({ where: { id: keyId, gatewayId: id } });
  if (!key) return NextResponse.json({ error: 'API key not found' }, { status: 404 });

  await prisma.ioTApiKey.update({ where: { id: keyId }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
