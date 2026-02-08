import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const program = await prisma.trainingProgram.findUnique({
    where: { id: params.id },
    include: { attendance: { include: { user: { select: { id: true, name: true, department: true, employeeId: true } } } } },
  });
  if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(program);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (body.scheduledDate) body.scheduledDate = new Date(body.scheduledDate);
  if (body.completionDate) body.completionDate = new Date(body.completionDate);

  const program = await prisma.trainingProgram.update({ where: { id: params.id }, data: body });
  return NextResponse.json(program);
}
