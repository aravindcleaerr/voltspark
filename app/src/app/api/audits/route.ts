import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { createAuditSchema } from '@/lib/validations';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const audits = await prisma.audit.findMany({
    where: { clientId: result.clientId },
    include: { leadAuditor: { select: { name: true } }, _count: { select: { findings: true } } },
    orderBy: { auditDate: 'desc' },
  });
  return NextResponse.json(audits);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER' || result.user.clientRole === 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createAuditSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { auditDate, nextAuditDate, ...rest } = parsed.data;
  const audit = await prisma.audit.create({
    data: { ...rest, clientId: result.clientId, auditDate: new Date(auditDate), nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : undefined },
  });
  return NextResponse.json(audit, { status: 201 });
}
