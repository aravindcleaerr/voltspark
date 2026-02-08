import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditSchema } from '@/lib/validations';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const audits = await prisma.audit.findMany({
    include: { leadAuditor: { select: { name: true } }, _count: { select: { findings: true } } },
    orderBy: { auditDate: 'desc' },
  });
  return NextResponse.json(audits);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role === 'EMPLOYEE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createAuditSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { auditDate, nextAuditDate, ...rest } = parsed.data;
  const audit = await prisma.audit.create({
    data: { ...rest, auditDate: new Date(auditDate), nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : undefined },
  });
  return NextResponse.json(audit, { status: 201 });
}
