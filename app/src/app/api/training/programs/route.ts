import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTrainingProgramSchema } from '@/lib/validations';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const programs = await prisma.trainingProgram.findMany({
    include: { _count: { select: { attendance: true } }, attendance: { where: { attended: true }, select: { id: true } } },
    orderBy: { scheduledDate: 'desc' },
  });
  const result = programs.map(p => ({ ...p, attendedCount: p.attendance.length, attendance: undefined }));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role === 'EMPLOYEE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createTrainingProgramSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { scheduledDate, ...rest } = parsed.data;
  const program = await prisma.trainingProgram.create({ data: { ...rest, scheduledDate: new Date(scheduledDate) } });
  return NextResponse.json(program, { status: 201 });
}
