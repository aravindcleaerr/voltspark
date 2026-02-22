import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { createTrainingProgramSchema } from '@/lib/validations';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const programs = await prisma.trainingProgram.findMany({
    where: { clientId: result.clientId },
    include: { _count: { select: { attendance: true } }, attendance: { where: { attended: true }, select: { id: true } } },
    orderBy: { scheduledDate: 'desc' },
  });
  const data = programs.map(p => ({ ...p, attendedCount: p.attendance.length, attendance: undefined }));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createTrainingProgramSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { scheduledDate, ...rest } = parsed.data;
  const program = await prisma.trainingProgram.create({ data: { ...rest, scheduledDate: new Date(scheduledDate), clientId: result.clientId } });
  return NextResponse.json(program, { status: 201 });
}
