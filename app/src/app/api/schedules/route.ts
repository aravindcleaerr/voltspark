import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/** GET — list all recurring schedules for current client */
export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const schedules = await prisma.recurringSchedule.findMany({
    where: { clientId: result.clientId },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(schedules);
}

/** POST — create a new recurring schedule */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { title, description, category, frequency, dayOfMonth, dayOfWeek, monthOfYear, startDate, endDate, reminderDays, assignedToId } = body;

  if (!title || !category || !frequency || !startDate) {
    return NextResponse.json({ error: 'title, category, frequency, startDate are required' }, { status: 400 });
  }

  const schedule = await prisma.recurringSchedule.create({
    data: {
      clientId: result.clientId,
      title,
      description: description || null,
      category,
      frequency,
      dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null,
      dayOfWeek: dayOfWeek !== undefined && dayOfWeek !== null ? parseInt(dayOfWeek) : null,
      monthOfYear: monthOfYear ? parseInt(monthOfYear) : null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      reminderDays: reminderDays ? parseInt(reminderDays) : 7,
      assignedToId: assignedToId || null,
      createdById: result.user.id,
    },
  });

  return NextResponse.json(schedule, { status: 201 });
}
