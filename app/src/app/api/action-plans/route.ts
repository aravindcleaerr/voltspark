import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const plans = await prisma.actionPlan.findMany({
    where: { clientId },
    include: {
      createdBy: { select: { name: true } },
      clientFramework: { include: { framework: { select: { name: true, code: true } } } },
      items: {
        orderBy: { sortOrder: 'asc' },
        include: { assignee: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Summary
  const activePlans = plans.filter(p => p.status === 'ACTIVE').length;
  const totalItems = plans.reduce((s, p) => s + p.items.length, 0);
  const doneItems = plans.reduce((s, p) => s + p.items.filter(i => i.status === 'DONE').length, 0);
  const overdueItems = plans.reduce((s, p) => s + p.items.filter(i =>
    i.status !== 'DONE' && i.dueDate && new Date(i.dueDate) < new Date()
  ).length, 0);

  return NextResponse.json({
    plans,
    summary: {
      totalPlans: plans.length,
      activePlans,
      totalItems,
      doneItems,
      overdueItems,
      completionRate: totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0,
    },
  });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const body = await request.json();
  const plan = await prisma.actionPlan.create({
    data: {
      clientId,
      title: body.title,
      description: body.description || null,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      clientFrameworkId: body.clientFrameworkId || null,
      status: body.status || 'ACTIVE',
      createdById: user.id,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
