import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';
import { detectDeviation } from '@/lib/deviation';

/**
 * POST /api/iot/aggregate
 * Aggregates IoT MeterReadings into ConsumptionEntry records.
 * Body: { date?: string (ISO), days?: number (default 1, max 30) }
 * Processes all IoT meters linked to an EnergySource.
 */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const addonCheck = await requireAddon(result.clientId, 'IOT_METERING');
  if ('error' in addonCheck) return addonCheck.error;

  const body = await request.json().catch(() => ({}));
  const days = Math.min(Math.max(parseInt(body.days) || 1, 1), 30);
  const endDate = body.date ? new Date(body.date) : new Date(Date.now() - 24 * 60 * 60 * 1000); // default: yesterday

  // Get all active meters with energySource linked
  const meters = await prisma.ioTMeter.findMany({
    where: { clientId: result.clientId, isActive: true, energySourceId: { not: null } },
    include: { energySource: { select: { id: true, costPerUnit: true, unit: true } } },
  });

  if (meters.length === 0) {
    return NextResponse.json({ error: 'No meters linked to energy sources' }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const results: Array<{ meterId: string; meterName: string; date: string; status: string; value?: number }> = [];

  for (let d = days - 1; d >= 0; d--) {
    const targetDate = new Date(endDate);
    targetDate.setDate(targetDate.getDate() - d);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    const dateStr = dayStart.toISOString().slice(0, 10);

    for (const meter of meters) {
      if (!meter.energySourceId || !meter.energySource) continue;

      // Check for existing entry (dedup by notes marker)
      const existing = await prisma.consumptionEntry.findFirst({
        where: {
          clientId: result.clientId,
          energySourceId: meter.energySourceId,
          date: { gte: dayStart, lte: dayEnd },
          notes: { contains: `IOT_METER:${meter.id}` },
        },
      });

      if (existing) {
        skipped++;
        results.push({ meterId: meter.id, meterName: meter.name, date: dateStr, status: 'skipped (exists)' });
        continue;
      }

      // Get first and last energyKwh reading of the day
      const [firstReading, lastReading] = await Promise.all([
        prisma.meterReading.findFirst({
          where: { meterId: meter.id, timestamp: { gte: dayStart, lte: dayEnd }, energyKwh: { not: null } },
          orderBy: { timestamp: 'asc' },
          select: { energyKwh: true, timestamp: true },
        }),
        prisma.meterReading.findFirst({
          where: { meterId: meter.id, timestamp: { gte: dayStart, lte: dayEnd }, energyKwh: { not: null } },
          orderBy: { timestamp: 'desc' },
          select: { energyKwh: true, timestamp: true },
        }),
      ]);

      if (!firstReading || !lastReading || firstReading.energyKwh === null || lastReading.energyKwh === null) {
        skipped++;
        results.push({ meterId: meter.id, meterName: meter.name, date: dateStr, status: 'skipped (no readings)' });
        continue;
      }

      const deltaKwh = lastReading.energyKwh - firstReading.energyKwh;
      if (deltaKwh < 0) {
        failed++;
        results.push({ meterId: meter.id, meterName: meter.name, date: dateStr, status: 'failed (negative delta - meter reset?)' });
        continue;
      }

      if (deltaKwh === 0 && firstReading.timestamp.getTime() === lastReading.timestamp.getTime()) {
        skipped++;
        results.push({ meterId: meter.id, meterName: meter.name, date: dateStr, status: 'skipped (single reading)' });
        continue;
      }

      // Calculate cost
      const cost = meter.energySource.costPerUnit ? deltaKwh * meter.energySource.costPerUnit : null;

      // Deviation detection
      const month = dayStart.getMonth() + 1;
      const quarter = Math.ceil(month / 3);
      const year = dayStart.getFullYear();
      const quarterlyPeriod = `${year}-Q${quarter}`;

      const target = await prisma.energyTarget.findFirst({
        where: { energySourceId: meter.energySourceId, period: quarterlyPeriod },
      });

      let deviationData = {};
      if (target && target.targetValue > 0) {
        const dailyTarget = target.targetValue / 90;
        const dev = detectDeviation(deltaKwh, dailyTarget);
        deviationData = {
          hasDeviation: dev.hasDeviation,
          deviationPercent: dev.deviationPercent,
          deviationSeverity: dev.severity,
          deviationNote: dev.note,
        };
      }

      try {
        await prisma.consumptionEntry.create({
          data: {
            clientId: result.clientId,
            energySourceId: meter.energySourceId,
            recordedById: result.user.id,
            date: dayStart,
            value: Math.round(deltaKwh * 100) / 100,
            unit: meter.energySource.unit || 'kWh',
            cost,
            meterReading: lastReading.energyKwh,
            previousReading: firstReading.energyKwh,
            notes: `IOT_AUTO|IOT_METER:${meter.id}|${meter.name}`,
            ...deviationData,
          },
        });
        created++;
        results.push({ meterId: meter.id, meterName: meter.name, date: dateStr, status: 'created', value: Math.round(deltaKwh * 100) / 100 });
      } catch {
        failed++;
        results.push({ meterId: meter.id, meterName: meter.name, date: dateStr, status: 'failed (db error)' });
      }
    }
  }

  return NextResponse.json({ created, skipped, failed, results });
}
