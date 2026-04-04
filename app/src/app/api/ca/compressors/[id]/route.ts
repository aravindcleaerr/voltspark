import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'COMPRESSED_AIR');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const compressor = await prisma.compressor.findFirst({
    where: { id, clientId: result.clientId },
    include: { meter: { select: { id: true, name: true } } },
  });

  if (!compressor) return NextResponse.json({ error: 'Compressor not found' }, { status: 404 });
  return NextResponse.json(compressor);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'COMPRESSED_AIR');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  const existing = await prisma.compressor.findFirst({ where: { id, clientId: result.clientId } });
  if (!existing) return NextResponse.json({ error: 'Compressor not found' }, { status: 404 });

  const body = await request.json();
  const updated = await prisma.compressor.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (!['CLIENT_ADMIN'].includes(result.user.clientRole || '') && !result.user.orgRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const addonCheck = await requireAddon(result.clientId, 'COMPRESSED_AIR');
  if ('error' in addonCheck) return addonCheck.error;

  const { id } = await params;
  await prisma.compressor.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
