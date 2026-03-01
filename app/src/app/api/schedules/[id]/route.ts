import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/** PUT — update a recurring schedule */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await prisma.recurringSchedule.findFirst({ where: { id: params.id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const updated = await prisma.recurringSchedule.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      frequency: body.frequency ?? existing.frequency,
      dayOfMonth: body.dayOfMonth !== undefined ? (body.dayOfMonth ? parseInt(body.dayOfMonth) : null) : existing.dayOfMonth,
      dayOfWeek: body.dayOfWeek !== undefined ? (body.dayOfWeek !== null ? parseInt(body.dayOfWeek) : null) : existing.dayOfWeek,
      monthOfYear: body.monthOfYear !== undefined ? (body.monthOfYear ? parseInt(body.monthOfYear) : null) : existing.monthOfYear,
      reminderDays: body.reminderDays ? parseInt(body.reminderDays) : existing.reminderDays,
      assignedToId: body.assignedToId !== undefined ? (body.assignedToId || null) : existing.assignedToId,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : existing.endDate,
    },
  });

  return NextResponse.json(updated);
}

/** DELETE — remove a recurring schedule */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole !== 'CLIENT_ADMIN' && !result.user.orgRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.recurringSchedule.findFirst({ where: { id: params.id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.recurringSchedule.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
