import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEnergyTargetSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId');
  const where: any = {};
  if (sourceId) where.energySourceId = sourceId;
  const targets = await prisma.energyTarget.findMany({ where, include: { energySource: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(targets);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role === 'EMPLOYEE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const parsed = createEnergyTargetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const target = await prisma.energyTarget.create({ data: parsed.data });
  return NextResponse.json(target, { status: 201 });
}
