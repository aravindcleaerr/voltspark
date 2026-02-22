import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const source = await prisma.energySource.findFirst({
    where: { id: params.id, clientId: result.clientId },
    include: { targets: { orderBy: { createdAt: 'desc' } }, consumptionEntries: { orderBy: { date: 'desc' }, take: 30 } },
  });
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(source);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const source = await prisma.energySource.updateMany({ where: { id: params.id, clientId: result.clientId }, data: body });
  if (source.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.energySource.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole !== 'CLIENT_ADMIN' && result.user.orgRole !== 'OWNER' && result.user.orgRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.energySource.updateMany({ where: { id: params.id, clientId: result.clientId }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
