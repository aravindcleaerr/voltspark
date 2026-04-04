import { NextResponse } from 'next/server';
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
    include: { meter: { select: { id: true, name: true } } },
  });

  // Get last 30 days of readings per compressor
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const compressorData = await Promise.all(
    compressors.map(async (comp) => {
      const readings = await prisma.cAReading.findMany({
        where: { compressorId: comp.id, date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'asc' },
      });

      const totalKwh = readings.reduce((s, r) => s + r.energyKwh, 0);
      const totalM3 = readings.reduce((s, r) => s + (r.airFlowM3 || 0), 0);
      const totalRunHours = readings.reduce((s, r) => s + (r.runHours || 0), 0);
      const avgSpecificEnergy = totalM3 > 0 ? totalKwh / totalM3 : null;
      const avgLoadPct = readings.filter(r => r.loadPercent !== null).length > 0
        ? readings.filter(r => r.loadPercent !== null).reduce((s, r) => s + (r.loadPercent || 0), 0) / readings.filter(r => r.loadPercent !== null).length
        : null;
      const anomalyCount = readings.filter(r => r.hasAnomaly).length;

      // Estimated annual cost (extrapolate 30 days)
      const costPerKwh = 8.2; // default grid rate, could fetch from client
      const estAnnualCost = (totalKwh / Math.max(readings.length, 1)) * 365 * costPerKwh;

      // Leak estimation: if specific energy > 0.12, excess is likely leaks
      const benchmarkSE = 0.12; // kWh/m³ benchmark for screw compressors
      const leakWasteKwh = avgSpecificEnergy && avgSpecificEnergy > benchmarkSE && totalM3 > 0
        ? (avgSpecificEnergy - benchmarkSE) * totalM3
        : 0;
      const leakCostMonthly = leakWasteKwh * costPerKwh;

      return {
        compressor: comp,
        stats: { totalKwh, totalM3, totalRunHours, avgSpecificEnergy, avgLoadPct, anomalyCount, estAnnualCost, leakCostMonthly, readingCount: readings.length },
        trend: readings.map(r => ({ date: r.date, specificEnergy: r.specificEnergy, loadPercent: r.loadPercent, energyKwh: r.energyKwh, airFlowM3: r.airFlowM3 })),
      };
    })
  );

  // Totals
  const totalMonthlyKwh = compressorData.reduce((s, c) => s + c.stats.totalKwh, 0);
  const totalMonthlyM3 = compressorData.reduce((s, c) => s + c.stats.totalM3, 0);
  const overallSE = totalMonthlyM3 > 0 ? totalMonthlyKwh / totalMonthlyM3 : null;
  const totalLeakCost = compressorData.reduce((s, c) => s + c.stats.leakCostMonthly, 0);
  const totalAnomalies = compressorData.reduce((s, c) => s + c.stats.anomalyCount, 0);

  return NextResponse.json({
    summary: { totalMonthlyKwh, totalMonthlyM3, overallSE, totalLeakCost, totalAnomalies, compressorCount: compressors.length },
    compressors: compressorData,
  });
}
