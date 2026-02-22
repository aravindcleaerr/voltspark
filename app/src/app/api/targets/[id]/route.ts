import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const target = await prisma.energyTarget.update({ where: { id: params.id }, data: body });
  return NextResponse.json(target);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole !== 'CLIENT_ADMIN' && result.user.orgRole !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.energyTarget.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
