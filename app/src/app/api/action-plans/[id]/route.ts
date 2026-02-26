import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const plan = await prisma.actionPlan.findFirst({
    where: { id: params.id, clientId },
    include: {
      createdBy: { select: { name: true } },
      clientFramework: { include: { framework: { select: { name: true } } } },
      items: {
        orderBy: { sortOrder: 'asc' },
        include: { assignee: { select: { name: true } } },
      },
    },
  });

  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const plan = await prisma.actionPlan.findFirst({ where: { id: params.id, clientId } });
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();

  // Update action item status
  if (body.itemId) {
    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === 'DONE') updateData.completedAt = new Date();
    if (body.status !== 'DONE') updateData.completedAt = null;

    await prisma.actionItem.update({
      where: { id: body.itemId },
      data: updateData,
    });

    // Check if all items done → auto-complete plan
    const items = await prisma.actionItem.findMany({ where: { actionPlanId: params.id } });
    const allDone = items.every(i => i.status === 'DONE');
    if (allDone && plan.status === 'ACTIVE') {
      await prisma.actionPlan.update({ where: { id: params.id }, data: { status: 'COMPLETED' } });
    }

    return NextResponse.json({ ok: true });
  }

  // Add new item
  if (body.addItem) {
    const maxOrder = await prisma.actionItem.findFirst({
      where: { actionPlanId: params.id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const item = await prisma.actionItem.create({
      data: {
        actionPlanId: params.id,
        title: body.addItem.title,
        description: body.addItem.description || null,
        assigneeId: body.addItem.assigneeId || null,
        dueDate: body.addItem.dueDate ? new Date(body.addItem.dueDate) : null,
        priority: body.addItem.priority || 'MEDIUM',
        sortOrder: (maxOrder?.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(item, { status: 201 });
  }

  // Update plan itself
  const updated = await prisma.actionPlan.update({
    where: { id: params.id },
    data: {
      title: body.title ?? plan.title,
      description: body.description ?? plan.description,
      status: body.planStatus ?? plan.status,
      targetDate: body.targetDate ? new Date(body.targetDate) : plan.targetDate,
    },
  });

  return NextResponse.json(updated);
}
