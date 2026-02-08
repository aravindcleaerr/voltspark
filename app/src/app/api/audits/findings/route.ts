import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditFindingSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createAuditFindingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { dueDate, ...rest } = parsed.data;
  const lastFinding = await prisma.auditFinding.findFirst({ where: { auditId: rest.auditId }, orderBy: { findingNumber: 'desc' } });

  const finding = await prisma.auditFinding.create({
    data: { ...rest, findingNumber: (lastFinding?.findingNumber || 0) + 1, dueDate: dueDate ? new Date(dueDate) : undefined },
  });
  return NextResponse.json(finding, { status: 201 });
}
