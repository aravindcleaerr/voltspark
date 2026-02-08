import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const audit = await prisma.audit.findUnique({
    where: { id: params.id },
    include: { leadAuditor: { select: { name: true, email: true } }, findings: { orderBy: { findingNumber: 'asc' } } },
  });
  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(audit);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (body.auditDate) body.auditDate = new Date(body.auditDate);
  if (body.completedDate) body.completedDate = new Date(body.completedDate);
  if (body.nextAuditDate) body.nextAuditDate = new Date(body.nextAuditDate);

  const audit = await prisma.audit.update({ where: { id: params.id }, data: body });
  return NextResponse.json(audit);
}
