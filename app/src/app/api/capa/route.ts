import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { createCAPASchema } from '@/lib/validations';
import { generateCAPANumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const priority = searchParams.get('priority');
  const where: any = { clientId: result.clientId };
  if (status) where.status = status;
  if (type) where.type = type;
  if (priority) where.priority = priority;

  const capas = await prisma.cAPA.findMany({
    where,
    include: { raisedBy: { select: { name: true } }, assignedTo: { select: { name: true } }, _count: { select: { comments: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(capas);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createCAPASchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { actionDueDate, ...rest } = parsed.data;
  const count = await prisma.cAPA.count({ where: { clientId: result.clientId } });
  const capaNumber = generateCAPANumber(count);

  const capa = await prisma.cAPA.create({
    data: { ...rest, clientId: result.clientId, capaNumber, raisedById: result.user.id, actionDueDate: actionDueDate ? new Date(actionDueDate) : undefined },
  });
  return NextResponse.json(capa, { status: 201 });
}
