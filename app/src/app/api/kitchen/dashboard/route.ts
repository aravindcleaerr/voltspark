import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;

  const kitchen = await prisma.kitchen.findUnique({
    where: { clientId: result.clientId },
    include: { zones: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  });

  if (!kitchen) return NextResponse.json({ error: 'No kitchen profile' }, { status: 404 });

  // Get latest reading per zone (or per meter)
  const meterIds = kitchen.zones.map((z) => z.meterId).filter(Boolean) as string[];
  const latestReadings: Record<string, any> = {};
  let totalKW = 0;
  let totalKVA = 0;
  let weightedPf = 0;
  let pfWeight = 0;

  for (const mid of meterIds) {
    const reading = await prisma.titanReading.findFirst({
      where: { kitchenId: kitchen.id, meterId: mid },
      orderBy: { timestamp: 'desc' },
    });
    if (reading) {
      latestReadings[mid] = reading;
      totalKW += reading.activePowerKW;
      const kva = reading.apparentPowerKVA || reading.activePowerKW / (reading.powerFactor || 0.9);
      totalKVA += kva;
      if (reading.powerFactor) {
        weightedPf += reading.powerFactor * reading.activePowerKW;
        pfWeight += reading.activePowerKW;
      }
    }
  }

  const avgPf = pfWeight > 0 ? weightedPf / pfWeight : null;
  const demandPct = kitchen.contractedDemandKVA > 0 ? (totalKVA / kitchen.contractedDemandKVA) * 100 : 0;
  let demandStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (demandPct >= kitchen.criticalThresholdPct) demandStatus = 'CRITICAL';
  else if (demandPct >= kitchen.warningThresholdPct) demandStatus = 'WARNING';

  // ToD slab detection
  let todCurrentSlab = null;
  if (kitchen.todSlabsJson) {
    try {
      const slabs = JSON.parse(kitchen.todSlabsJson);
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      todCurrentSlab = slabs.find((s: any) => {
        if (s.startHour < s.endHour) return currentHour >= s.startHour && currentHour < s.endHour;
        return currentHour >= s.startHour || currentHour < s.endHour; // wraps midnight
      }) || null;
    } catch {}
  }

  // Zone status with latest readings
  const zoneStatus = kitchen.zones.map((z) => {
    const reading = z.meterId ? latestReadings[z.meterId] : null;
    return {
      id: z.id,
      name: z.name,
      zoneType: z.zoneType,
      priorityTier: z.priorityTier,
      maxLoadKW: z.maxLoadKW,
      meterId: z.meterId,
      haccpEnabled: z.haccpEnabled,
      currentKW: reading?.activePowerKW ?? null,
      currentPF: reading?.powerFactor ?? null,
      temperature: reading?.ai1Value ?? null,
      lastReading: reading?.timestamp ?? null,
      haccpOk: z.haccpEnabled && reading?.ai1Value != null
        ? reading.ai1Value >= (z.minTempC ?? -999) && reading.ai1Value <= (z.maxTempC ?? 999)
        : null,
    };
  });

  // Penalty forecast for current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), kitchen.billingCycleDay);
  if (monthStart > now) monthStart.setMonth(monthStart.getMonth() - 1);

  const peakReading = await prisma.titanReading.findFirst({
    where: { kitchenId: kitchen.id, timestamp: { gte: monthStart } },
    orderBy: { apparentPowerKVA: 'desc' },
  });

  const peakDemandKVA = peakReading?.apparentPowerKVA || peakReading?.activePowerKW || 0;
  let mdPenaltyForecast = 0;
  if (peakDemandKVA > kitchen.contractedDemandKVA) {
    const excess = peakDemandKVA - kitchen.contractedDemandKVA;
    mdPenaltyForecast = excess * (kitchen.demandChargePerKVA || 0) * kitchen.mdPenaltyMultiplier;
  }

  // Recent demand history (last 60 min, sampled every 5 min)
  const historyStart = new Date(Date.now() - 60 * 60 * 1000);
  const recentReadings = await prisma.titanReading.findMany({
    where: { kitchenId: kitchen.id, timestamp: { gte: historyStart } },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, activePowerKW: true, apparentPowerKVA: true, powerFactor: true },
  });

  // Sample every ~5 min
  const sampledHistory: any[] = [];
  let lastSample = 0;
  for (const r of recentReadings) {
    const t = new Date(r.timestamp).getTime();
    if (t - lastSample >= 4 * 60 * 1000) {
      sampledHistory.push({
        time: r.timestamp,
        kw: r.activePowerKW,
        kva: r.apparentPowerKVA || r.activePowerKW / (r.powerFactor || 0.9),
      });
      lastSample = t;
    }
  }

  // Month-to-date totals
  const monthReadings = await prisma.titanReading.aggregate({
    where: { kitchenId: kitchen.id, timestamp: { gte: monthStart } },
    _count: true,
  });

  // Recent events
  const recentEvents = await prisma.demandEvent.findMany({
    where: { kitchenId: kitchen.id, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return NextResponse.json({
    kitchen: {
      id: kitchen.id,
      name: kitchen.name,
      discomCode: kitchen.discomCode,
      connectionType: kitchen.connectionType,
      contractedDemandKVA: kitchen.contractedDemandKVA,
      warningThresholdPct: kitchen.warningThresholdPct,
      criticalThresholdPct: kitchen.criticalThresholdPct,
      pfTarget: kitchen.pfTarget,
      autoShedEnabled: kitchen.autoShedEnabled,
    },
    demand: {
      currentKW: Math.round(totalKW * 10) / 10,
      currentKVA: Math.round(totalKVA * 10) / 10,
      contractedKVA: kitchen.contractedDemandKVA,
      demandPct: Math.round(demandPct),
      status: demandStatus,
      avgPf: avgPf ? Math.round(avgPf * 1000) / 1000 : null,
    },
    todCurrentSlab,
    penaltyForecast: {
      mdPenalty: Math.round(mdPenaltyForecast),
      peakDemandKVA: Math.round(peakDemandKVA * 10) / 10,
      pfStatus: avgPf != null && avgPf < kitchen.pfTarget ? 'AT_RISK' : 'OK',
    },
    zones: zoneStatus,
    demandHistory: sampledHistory,
    recentEvents,
    readingsCount: monthReadings._count,
  });
}
