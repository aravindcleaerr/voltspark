import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { generateApiKey } from '@/lib/kitchen-auth';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'KITCHEN');
  if ('error' in addonCheck) return addonCheck.error;

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const keys = await prisma.kitchenApiKey.findMany({
    where: { kitchenId: kitchen.id },
    select: { id: true, keyPrefix: true, name: true, isActive: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(keys);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const kitchen = await prisma.kitchen.findUnique({ where: { clientId: result.clientId } });
  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  const body = await request.json();
  const name = body.name || 'API Key';

  const { fullKey, keyHash, keyPrefix } = generateApiKey();

  await prisma.kitchenApiKey.create({
    data: { kitchenId: kitchen.id, keyHash, keyPrefix, name },
  });

  // Return the full key ONCE — user must copy it
  return NextResponse.json({ key: fullKey, prefix: keyPrefix, name }, { status: 201 });
}
