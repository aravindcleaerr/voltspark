import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { updateZoneSchema } from '@/lib/kitchen-validations';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const zone = await prisma.kitchenZone.findFirst({ where: { id, kitchenId: kitchen.id } });
  if (!zone) return NextResponse.json({ error: 'Zone not found' }, { status: 404 });

  const body = await request.json();
  const parsed = updateZoneSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.kitchenZone.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole !== 'CLIENT_ADMIN' && !result.user.orgRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const zone = await prisma.kitchenZone.findFirst({ where: { id, kitchenId: kitchen.id } });
  if (!zone) return NextResponse.json({ error: 'Zone not found' }, { status: 404 });

  await prisma.kitchenZone.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
