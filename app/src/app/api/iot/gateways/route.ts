import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { createGatewaySchema } from '@/lib/iot-validations';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const gateways = await prisma.ioTGateway.findMany({
    where: { clientId: result.clientId },
    include: {
      meters: { select: { id: true, name: true, meterType: true, isActive: true }, where: { isActive: true } },
      apiKeys: { select: { id: true, name: true, keyPrefix: true, isActive: true, lastUsedAt: true }, where: { isActive: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(gateways);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const body = await request.json();
  const parsed = createGatewaySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

  const gateway = await prisma.ioTGateway.create({
    data: { ...parsed.data, clientId: result.clientId },
  });

  return NextResponse.json(gateway, { status: 201 });
}
