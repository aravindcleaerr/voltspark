import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { createEnergyTargetSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get('sourceId');
  const where: any = { energySource: { clientId: result.clientId } };
  if (sourceId) where.energySourceId = sourceId;

  const targets = await prisma.energyTarget.findMany({ where, include: { energySource: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(targets);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER' || result.user.clientRole === 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createEnergyTargetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const target = await prisma.energyTarget.create({ data: parsed.data });
  return NextResponse.json(target, { status: 201 });
}
