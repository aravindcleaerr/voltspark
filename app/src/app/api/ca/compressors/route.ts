import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'COMPRESSED_AIR');
  if ('error' in addonCheck) return addonCheck.error;

  const compressors = await prisma.compressor.findMany({
    where: { clientId: result.clientId, isActive: true },
    include: {
      meter: { select: { id: true, name: true, meterType: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(compressors);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'COMPRESSED_AIR');
  if ('error' in addonCheck) return addonCheck.error;

  const body = await request.json();
  const { name, make, model, type, ratedPowerKW, ratedFlowM3Min, ratedPressureBar, motorEfficiency, isVSD, location, meterId, commissionedDate } = body;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  if (meterId) {
    const meter = await prisma.ioTMeter.findFirst({ where: { id: meterId, clientId: result.clientId } });
    if (!meter) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });
  }

  const compressor = await prisma.compressor.create({
    data: {
      clientId: result.clientId,
      name, make, model, type: type || 'SCREW',
      ratedPowerKW: ratedPowerKW ? parseFloat(ratedPowerKW) : undefined,
      ratedFlowM3Min: ratedFlowM3Min ? parseFloat(ratedFlowM3Min) : undefined,
      ratedPressureBar: ratedPressureBar ? parseFloat(ratedPressureBar) : undefined,
      motorEfficiency: motorEfficiency ? parseFloat(motorEfficiency) : undefined,
      isVSD: !!isVSD, location,
      meterId: meterId || undefined,
      commissionedDate: commissionedDate ? new Date(commissionedDate) : undefined,
    },
  });

  return NextResponse.json(compressor, { status: 201 });
}
