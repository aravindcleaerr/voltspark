import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  if (body.closedDate) body.closedDate = new Date(body.closedDate);

  const finding = await prisma.auditFinding.update({ where: { id: params.id }, data: body });
  return NextResponse.json(finding);
}
