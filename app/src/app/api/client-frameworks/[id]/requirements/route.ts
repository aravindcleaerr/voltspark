import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { id } = await params;

  const clientFramework = await prisma.clientFramework.findUnique({
    where: { id },
    include: {
      framework: {
        include: {
          requirements: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });

  if (!clientFramework || clientFramework.clientId !== result.clientId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const statuses = await prisma.requirementStatus.findMany({
    where: { clientFrameworkId: id },
    include: { updatedBy: { select: { name: true } } },
  });

  const statusMap: Record<string, any> = {};
  for (const s of statuses) {
    statusMap[s.requirementId] = s;
  }

  const requirements = clientFramework.framework.requirements.map((req) => ({
    ...req,
    status: statusMap[req.id] || null,
  }));

  return NextResponse.json({
    id: clientFramework.id,
    framework: {
      id: clientFramework.framework.id,
      code: clientFramework.framework.code,
      name: clientFramework.framework.name,
      description: clientFramework.framework.description,
      version: clientFramework.framework.version,
    },
    status: clientFramework.status,
    score: clientFramework.score,
    targetDate: clientFramework.targetDate,
    assignedDate: clientFramework.assignedDate,
    requirements,
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { id } = await params;

  if (result.user.clientRole === 'VIEWER' || result.user.clientRole === 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clientFramework = await prisma.clientFramework.findUnique({ where: { id } });
  if (!clientFramework || clientFramework.clientId !== result.clientId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const { requirementId, status, notes, evidenceLinks } = body;

  if (!requirementId || !status) {
    return NextResponse.json({ error: 'requirementId and status are required' }, { status: 400 });
  }

  const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updated = await prisma.requirementStatus.upsert({
    where: {
      clientFrameworkId_requirementId: { clientFrameworkId: id, requirementId },
    },
    update: {
      status,
      notes: notes || undefined,
      evidenceLinks: evidenceLinks || undefined,
      updatedById: result.user.id,
    },
    create: {
      clientFrameworkId: id,
      requirementId,
      status,
      notes: notes || undefined,
      evidenceLinks: evidenceLinks || undefined,
      updatedById: result.user.id,
    },
  });

  // Recalculate score
  const allStatuses = await prisma.requirementStatus.findMany({
    where: { clientFrameworkId: id },
    include: { requirement: { select: { weight: true } } },
  });

  let totalWeight = 0;
  let compliantWeight = 0;
  for (const s of allStatuses) {
    if (s.status !== 'NOT_APPLICABLE') {
      totalWeight += s.requirement.weight;
      if (s.status === 'COMPLIANT') {
        compliantWeight += s.requirement.weight;
      }
    }
  }

  const newScore = totalWeight > 0 ? Math.round((compliantWeight / totalWeight) * 100) : 0;
  await prisma.clientFramework.update({
    where: { id },
    data: { score: newScore },
  });

  return NextResponse.json({ ...updated, newScore });
}
