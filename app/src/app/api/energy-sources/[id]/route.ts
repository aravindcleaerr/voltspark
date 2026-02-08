import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const source = await prisma.energySource.findUnique({
    where: { id: params.id },
    include: { targets: { orderBy: { createdAt: 'desc' } }, consumptionEntries: { orderBy: { date: 'desc' }, take: 30 } },
  });
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(source);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const source = await prisma.energySource.update({ where: { id: params.id }, data: body });
  return NextResponse.json(source);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.energySource.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
