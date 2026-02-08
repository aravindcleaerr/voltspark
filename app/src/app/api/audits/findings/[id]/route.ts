import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (body.dueDate) body.dueDate = new Date(body.dueDate);
  if (body.closedDate) body.closedDate = new Date(body.closedDate);

  const finding = await prisma.auditFinding.update({ where: { id: params.id }, data: body });
  return NextResponse.json(finding);
}
