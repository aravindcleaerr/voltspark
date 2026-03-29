import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { createZoneSchema } from '@/lib/kitchen-validations';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'KITCHEN');
  if ('error' in addonCheck) return addonCheck.error;

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const zones = await prisma.kitchenZone.findMany({
    where: { kitchenId: kitchen.id },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(zones);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const body = await request.json();
  const parsed = createZoneSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const zone = await prisma.kitchenZone.create({
    data: { ...parsed.data, kitchenId: kitchen.id },
  });

  return NextResponse.json(zone, { status: 201 });
}
