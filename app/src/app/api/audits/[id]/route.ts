import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const audit = await prisma.audit.findFirst({
    where: { id: params.id, clientId: result.clientId },
    include: { leadAuditor: { select: { name: true, email: true } }, findings: { orderBy: { findingNumber: 'asc' } } },
  });
  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(audit);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (body.auditDate) body.auditDate = new Date(body.auditDate);
  if (body.completedDate) body.completedDate = new Date(body.completedDate);
  if (body.nextAuditDate) body.nextAuditDate = new Date(body.nextAuditDate);

  const audit = await prisma.audit.updateMany({ where: { id: params.id, clientId: result.clientId }, data: body });
  if (audit.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.audit.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}
