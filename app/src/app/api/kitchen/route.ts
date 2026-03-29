import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { createKitchenSchema, updateKitchenSchema } from '@/lib/kitchen-validations';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'KITCHEN');
  if ('error' in addonCheck) return addonCheck.error;

  const kitchen = await prisma.kitchen.findUnique({
    where: { clientId: result.clientId },
    include: { zones: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!kitchen) return NextResponse.json(null);
  return NextResponse.json(kitchen);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (!result.user.orgRole) return NextResponse.json({ error: 'Consultants only' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'KITCHEN');
  if ('error' in addonCheck) return addonCheck.error;

  const existing = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (existing) return NextResponse.json({ error: 'Kitchen profile already exists for this client' }, { status: 409 });

  const body = await request.json();
  const parsed = createKitchenSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const kitchen = await prisma.kitchen.create({
    data: { ...parsed.data, clientId: result.clientId },
  });

  return NextResponse.json(kitchen, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'KITCHEN');
  if ('error' in addonCheck) return addonCheck.error;

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile found' }, { status: 404 });

  const body = await request.json();
  const parsed = updateKitchenSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.kitchen.update({
    where: { id: kitchen.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
