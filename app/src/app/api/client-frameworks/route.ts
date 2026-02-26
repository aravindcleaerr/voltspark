import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const clientFrameworks = await prisma.clientFramework.findMany({
    where: { clientId: result.clientId },
    include: {
      framework: {
        include: {
          _count: { select: { requirements: true } },
        },
      },
    },
    orderBy: { assignedDate: 'desc' },
  });

  // For each client framework, get requirement status counts
  const enriched = await Promise.all(
    clientFrameworks.map(async (cf) => {
      const statuses = await prisma.requirementStatus.groupBy({
        by: ['status'],
        where: { clientFrameworkId: cf.id },
        _count: true,
      });

      const statusMap: Record<string, number> = {};
      for (const s of statuses) {
        statusMap[s.status] = s._count;
      }

      return { ...cf, requirementStatuses: statusMap };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  if (result.user.clientRole === 'VIEWER' || result.user.clientRole === 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { frameworkId, targetDate } = body;

  if (!frameworkId) {
    return NextResponse.json({ error: 'frameworkId is required' }, { status: 400 });
  }

  // Check if already assigned
  const existing = await prisma.clientFramework.findUnique({
    where: { clientId_frameworkId: { clientId: result.clientId, frameworkId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Framework already assigned' }, { status: 409 });
  }

  const cf = await prisma.clientFramework.create({
    data: {
      clientId: result.clientId,
      frameworkId,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status: 'ACTIVE',
      score: 0,
    },
    include: { framework: true },
  });

  // Initialize requirement statuses
  const requirements = await prisma.frameworkRequirement.findMany({
    where: { frameworkId },
  });

  for (const req of requirements) {
    await prisma.requirementStatus.create({
      data: {
        clientFrameworkId: cf.id,
        requirementId: req.id,
        status: 'NOT_STARTED',
        updatedById: result.user.id,
      },
    });
  }

  return NextResponse.json(cf, { status: 201 });
}
