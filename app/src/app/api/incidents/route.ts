import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const incidents = await prisma.incident.findMany({
    where: { clientId: result.clientId },
    include: {
      reportedBy: { select: { name: true } },
      closedBy: { select: { name: true } },
    },
    orderBy: { incidentDate: 'desc' },
  });

  return NextResponse.json(incidents);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const body = await request.json();
  const { type, severity, title, description, location, incidentDate, immediateAction } = body;

  if (!type || !severity || !title || !description || !incidentDate) {
    return NextResponse.json({ error: 'type, severity, title, description, and incidentDate are required' }, { status: 400 });
  }

  const incident = await prisma.incident.create({
    data: {
      clientId: result.clientId,
      type,
      severity,
      title,
      description,
      location: location || undefined,
      incidentDate: new Date(incidentDate),
      reportedById: result.user.id,
      immediateAction: immediateAction || undefined,
      status: 'OPEN',
    },
  });

  return NextResponse.json(incident, { status: 201 });
}
