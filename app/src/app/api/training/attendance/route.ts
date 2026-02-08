import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bulkAttendanceSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role === 'EMPLOYEE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
