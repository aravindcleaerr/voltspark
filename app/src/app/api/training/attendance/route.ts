import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { bulkAttendanceSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = bulkAttendanceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { trainingProgramId, attendance } = parsed.data;
  for (const record of attendance) {
    await prisma.trainingAttendance.upsert({
      where: { trainingProgramId_userId: { trainingProgramId, userId: record.userId } },
      update: { attended: record.attended, score: record.score, feedback: record.feedback },
      create: { trainingProgramId, userId: record.userId, attended: record.attended, score: record.score, feedback: record.feedback },
    });
  }
  return NextResponse.json({ success: true });
}
