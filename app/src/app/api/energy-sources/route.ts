import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { createEnergySourceSchema } from '@/lib/validations';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const sources = await prisma.energySource.findMany({
    where: { clientId: result.clientId, isActive: true },
    include: {
      targets: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { consumptionEntries: true } },
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createEnergySourceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const source = await prisma.energySource.create({ data: { ...parsed.data, clientId: result.clientId } });
  return NextResponse.json(source, { status: 201 });
}
