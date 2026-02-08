import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCAPASchema } from '@/lib/validations';
import { generateCAPANumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const priority = searchParams.get('priority');
  const where: any = {};
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createCAPASchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { actionDueDate, ...rest } = parsed.data;
  const count = await prisma.cAPA.count();
  const capaNumber = generateCAPANumber(count);

  const capa = await prisma.cAPA.create({
    data: { ...rest, capaNumber, raisedById: (session.user as any).id, actionDueDate: actionDueDate ? new Date(actionDueDate) : undefined },
  });
  return NextResponse.json(capa, { status: 201 });
}
