import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const [inspections, templates] = await Promise.all([
    prisma.inspection.findMany({
      where: { clientId: result.clientId },
      include: {
        template: { select: { name: true, category: true } },
        inspector: { select: { name: true } },
      },
      orderBy: { inspectionDate: 'desc' },
    }),
    prisma.inspectionTemplate.findMany({
      where: {
        OR: [
          { isBuiltIn: true },
          { organizationId: result.user.organizationId },
        ],
      },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  return NextResponse.json({ inspections, templates });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  if (result.user.clientRole === 'VIEWER' || result.user.clientRole === 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { templateId, inspectionDate, location } = body;

  if (!templateId || !inspectionDate) {
    return NextResponse.json({ error: 'templateId and inspectionDate are required' }, { status: 400 });
  }

  const inspection = await prisma.inspection.create({
    data: {
      clientId: result.clientId,
      templateId,
      inspectorId: result.user.id,
      inspectionDate: new Date(inspectionDate),
      location: location || undefined,
      status: 'IN_PROGRESS',
    },
    include: { template: true },
  });

  return NextResponse.json(inspection, { status: 201 });
}
