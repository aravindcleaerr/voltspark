import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const entry = await prisma.consumptionEntry.findFirst({
    where: { id: params.id, clientId: result.clientId },
    include: { energySource: true, recordedBy: { select: { name: true } } },
  });
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(entry);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole !== 'CLIENT_ADMIN' && result.user.orgRole !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.consumptionEntry.deleteMany({ where: { id: params.id, clientId: result.clientId } });
  return NextResponse.json({ success: true });
}
