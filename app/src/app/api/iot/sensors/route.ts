import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

const createSensorSchema = z.object({
  gatewayId: z.string().min(1),
  name: z.string().min(1).max(100),
  sensorSerial: z.string().max(100).optional(),
  modbusAddress: z.number().int().min(1).max(247).optional(),
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  sensorType: z.enum(['TEMPERATURE', 'HUMIDITY', 'CO2', 'VIBRATION', 'PRESSURE', 'AIR_QUALITY', 'OTHER']),
  unit: z.string().max(20),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  criticalDelta: z.number().positive().optional(),
  location: z.string().max(200).optional(),
  assetName: z.string().max(100).optional(),
});

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const sensors = await prisma.ioTSensor.findMany({
    where: { clientId: result.clientId },
    include: {
      gateway: { select: { name: true } },
      _count: { select: { readings: true, alerts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(sensors);
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createSensorSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify gateway belongs to this client
  const gw = await prisma.ioTGateway.findFirst({ where: { id: parsed.data.gatewayId, clientId: result.clientId } });
  if (!gw) return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });

  const sensor = await prisma.ioTSensor.create({
    data: { ...parsed.data, clientId: result.clientId },
  });

  return NextResponse.json(sensor, { status: 201 });
}
