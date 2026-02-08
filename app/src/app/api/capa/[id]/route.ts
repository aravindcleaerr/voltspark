import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCAPASchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const capa = await prisma.cAPA.findUnique({
    where: { id: params.id },
    include: {
      raisedBy: { select: { name: true, email: true } },
      assignedTo: { select: { name: true, email: true } },
      comments: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!capa) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(capa);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = updateCAPASchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: any = { ...parsed.data };
  if (data.actionDueDate) data.actionDueDate = new Date(data.actionDueDate);
  if (data.actionCompletedDate) data.actionCompletedDate = new Date(data.actionCompletedDate);
  if (data.verificationDate) data.verificationDate = new Date(data.verificationDate);

  const capa = await prisma.cAPA.update({ where: { id: params.id }, data });
  return NextResponse.json(capa);
}
