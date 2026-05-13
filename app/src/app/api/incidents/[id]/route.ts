import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const incident = await prisma.incident.findFirst({
    where: { id: params.id, clientId: result.clientId },
    include: {
      reportedBy: { select: { name: true, email: true } },
      closedBy: { select: { name: true, email: true } },
      meterAlert: { include: { meter: { select: { id: true, name: true, model: true, location: true } } } },
      frameworkRequirement: { select: { code: true, title: true, framework: { select: { code: true, name: true } } } },
    },
  });
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(incident);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const allowed = ['status', 'rootCause', 'immediateAction', 'correctiveAction', 'preventiveAction', 'followUpDate'];
  const data: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) data[k] = body[k];

  if (typeof data.followUpDate === 'string') data.followUpDate = new Date(data.followUpDate);

  // Closing transition: stamp closedDate + closedById from session user
  if (data.status === 'CLOSED') {
    data.closedDate = new Date();
    data.closedById = result.user.id;
  }

  const updated = await prisma.incident.updateMany({
    where: { id: params.id, clientId: result.clientId },
    data,
  });
  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const incident = await prisma.incident.findUnique({ where: { id: params.id } });
  return NextResponse.json(incident);
}
