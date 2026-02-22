import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const program = await prisma.trainingProgram.findFirst({
    where: { id: params.id, clientId: result.clientId },
    include: { attendance: { include: { user: { select: { id: true, name: true, department: true, employeeId: true } } } } },
  });
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(program);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (body.scheduledDate) body.scheduledDate = new Date(body.scheduledDate);
  if (body.completionDate) body.completionDate = new Date(body.completionDate);

  const program = await prisma.trainingProgram.updateMany({ where: { id: params.id, clientId: result.clientId }, data: body });
  if (program.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.trainingProgram.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}
