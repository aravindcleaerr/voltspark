import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiKey } from '@/lib/kitchen-auth';
import { titanReadingSchema, titanReadingBatchSchema } from '@/lib/kitchen-validations';

export async function POST(request: NextRequest, { params }: { params: Promise<{ meterId: string }> }) {
  const authResult = await requireApiKey(request);
  if ('error' in authResult) return authResult.error;

  const { meterId } = await params;
  const { kitchenId } = authResult;

  // Verify kitchen exists
  const kitchen = await prisma.kitchen.findUnique({ where: { id: kitchenId } });
  if (!kitchen) return NextResponse.json({ error: 'Kitchen not found' }, { status: 404 });

  const body = await request.json();

  // Support single reading or batch
  let readings: any[];
  if (body.readings) {
    const parsed = titanReadingBatchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    readings = parsed.data.readings;
  } else {
    const parsed = titanReadingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    readings = [parsed.data];
  }

  // Resolve zone by meterId
  const zone = await prisma.kitchenZone.findFirst({
    where: { kitchenId, meterId },
  });

  // Insert readings
  const records = readings.map((r) => ({
    kitchenId,
    zoneId: zone?.id || null,
    meterId,
    timestamp: new Date(r.timestamp),
    activePowerKW: r.activePowerKW,
    apparentPowerKVA: r.apparentPowerKVA ?? null,
    reactivePowerKVAR: r.reactivePowerKVAR ?? null,
    powerFactor: r.powerFactor ?? null,
    voltageR: r.voltageR ?? null,
    voltageY: r.voltageY ?? null,
    voltageB: r.voltageB ?? null,
    currentR: r.currentR ?? null,
    currentY: r.currentY ?? null,
    currentB: r.currentB ?? null,
    frequencyHz: r.frequencyHz ?? null,
    energyKwh: r.energyKwh ?? null,
    demandMaxKVA: r.demandMaxKVA ?? null,
    demandCurrentKVA: r.demandCurrentKVA ?? null,
    thdVoltage: r.thdVoltage ?? null,
    thdCurrent: r.thdCurrent ?? null,
    ai1Value: r.ai1Value ?? null,
    ai2Value: r.ai2Value ?? null,
    do1State: r.do1State ?? null,
    do2State: r.do2State ?? null,
  }));

  await prisma.titanReading.createMany({ data: records });

  // Check demand thresholds
  const latestReading = records[records.length - 1];
  const currentKVA = latestReading.apparentPowerKVA || latestReading.activePowerKW / (latestReading.powerFactor || 0.9);
  const contractedKVA = kitchen.contractedDemandKVA;
  const demandPct = (currentKVA / contractedKVA) * 100;

  let status: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';

  if (demandPct >= kitchen.criticalThresholdPct) {
    status = 'CRITICAL';
    await prisma.demandEvent.create({
      data: {
        kitchenId,
        type: demandPct > 100 ? 'BREACH' : 'CRITICAL',
        severity: 'CRITICAL',
        demandKVA: currentKVA,
        thresholdKVA: contractedKVA * (kitchen.criticalThresholdPct / 100),
        contractedDemandKVA: contractedKVA,
        pf: latestReading.powerFactor,
        message: demandPct > 100
          ? `Demand breach: ${currentKVA.toFixed(1)} kVA exceeds contracted ${contractedKVA} kVA`
          : `Critical demand: ${currentKVA.toFixed(1)} kVA (${demandPct.toFixed(0)}% of contracted)`,
      },
    });
  } else if (demandPct >= kitchen.warningThresholdPct) {
    status = 'WARNING';
    // Only log warning if last event wasn't a recent warning (within 5 min)
    const recentWarning = await prisma.demandEvent.findFirst({
      where: { kitchenId, type: 'WARNING', createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
    });
    if (!recentWarning) {
      await prisma.demandEvent.create({
        data: {
          kitchenId,
          type: 'WARNING',
          severity: 'WARNING',
          demandKVA: currentKVA,
          thresholdKVA: contractedKVA * (kitchen.warningThresholdPct / 100),
          contractedDemandKVA: contractedKVA,
          pf: latestReading.powerFactor,
          message: `Demand warning: ${currentKVA.toFixed(1)} kVA (${demandPct.toFixed(0)}% of contracted)`,
        },
      });
    }
  }

  return NextResponse.json({
    received: records.length,
    demandKVA: Math.round(currentKVA * 10) / 10,
    demandPct: Math.round(demandPct),
    status,
  });
}
