import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const existing = await prisma.meterAlert.findFirst({ where: { id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.acknowledge) data.acknowledgedAt = new Date();
  if (body.resolve) data.resolvedAt = new Date();

  const updated = await prisma.meterAlert.update({ where: { id }, data });
  return NextResponse.json(updated);
}
