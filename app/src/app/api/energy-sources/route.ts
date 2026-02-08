import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEnergySourceSchema } from '@/lib/validations';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sources = await prisma.energySource.findMany({
    where: { isActive: true },
    include: {
      targets: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { consumptionEntries: true } },
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role === 'EMPLOYEE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createEnergySourceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const source = await prisma.energySource.create({ data: parsed.data });
  return NextResponse.json(source, { status: 201 });
}
