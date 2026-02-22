import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  // Get client tariff config
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { gridTariffRate: true, solarTariffRate: true, dgTariffRate: true, contractDemand: true, powerFactorTarget: true },
  });

  // Get all consumption entries with cost
  const entries = await prisma.consumptionEntry.findMany({
    where: { clientId },
    include: { energySource: { select: { name: true, type: true, costPerUnit: true } } },
    orderBy: { date: 'asc' },
  });

  // Group by month
  const monthlyData: Record<string, { month: string; totalCost: number; totalUnits: number; sources: Record<string, { cost: number; units: number }> }> = {};

  for (const entry of entries) {
    const d = new Date(entry.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, totalCost: 0, totalUnits: 0, sources: {} };
    }
    const m = monthlyData[monthKey];
    const cost = entry.cost || 0;
    m.totalCost += cost;
    m.totalUnits += entry.value;

    const srcName = entry.energySource.name;
    if (!m.sources[srcName]) m.sources[srcName] = { cost: 0, units: 0 };
    m.sources[srcName].cost += cost;
    m.sources[srcName].units += entry.value;
  }

  const monthly = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate totals and averages
  const totalCost = monthly.reduce((sum, m) => sum + m.totalCost, 0);
  const totalUnits = monthly.reduce((sum, m) => sum + m.totalUnits, 0);
  const avgMonthlyCost = monthly.length > 0 ? totalCost / monthly.length : 0;

  // Last month vs previous month comparison
  const lastMonth = monthly.length > 0 ? monthly[monthly.length - 1] : null;
  const prevMonth = monthly.length > 1 ? monthly[monthly.length - 2] : null;
  const momChange = lastMonth && prevMonth && prevMonth.totalCost > 0
    ? Math.round(((lastMonth.totalCost - prevMonth.totalCost) / prevMonth.totalCost) * 100)
    : null;

  // Source breakdown (aggregate)
  const sourceBreakdown: Record<string, { name: string; totalCost: number; totalUnits: number }> = {};
  for (const entry of entries) {
    const name = entry.energySource.name;
    if (!sourceBreakdown[name]) sourceBreakdown[name] = { name, totalCost: 0, totalUnits: 0 };
    sourceBreakdown[name].totalCost += entry.cost || 0;
    sourceBreakdown[name].totalUnits += entry.value;
  }

  return NextResponse.json({
    tariffs: client,
    summary: { totalCost, totalUnits, avgMonthlyCost, monthCount: monthly.length, momChange },
    monthly,
    sourceBreakdown: Object.values(sourceBreakdown),
    lastMonth,
  });
}
