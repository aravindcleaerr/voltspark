import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { updateCAPASchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const capa = await prisma.cAPA.findFirst({
    where: { id: params.id, clientId: result.clientId },
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
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = updateCAPASchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: any = { ...parsed.data };
  if (data.actionDueDate) data.actionDueDate = new Date(data.actionDueDate);
  if (data.actionCompletedDate) data.actionCompletedDate = new Date(data.actionCompletedDate);
  if (data.verificationDate) data.verificationDate = new Date(data.verificationDate);

  const updated = await prisma.cAPA.updateMany({ where: { id: params.id, clientId: result.clientId }, data });
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const capa = await prisma.cAPA.findUnique({ where: { id: params.id } });
  return NextResponse.json(capa);
}
