import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/**
 * POST /api/savings/auto-calculate
 * For each IMPLEMENTED SavingsMeasure with an energySourceId:
 * - Compares consumption before vs after implementationDate
 * - Calculates monthly kWh delta and ₹ savings
 * - Creates/updates SavingsEntry records with method='CALCULATED'
 */
export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  if (result.user.clientRole === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const measures = await prisma.savingsMeasure.findMany({
    where: {
      clientId: result.clientId,
      status: { in: ['IMPLEMENTED', 'VERIFIED'] },
      energySourceId: { not: null },
    },
    include: { energySource: { select: { id: true, costPerUnit: true } } },
  });

  if (measures.length === 0) {
    return NextResponse.json({ error: 'No implemented measures linked to energy sources', calculated: 0 });
  }

  let calculated = 0;
  let skipped = 0;
  const results: Array<{ measureId: string; name: string; month: string; kwhSaved: number; savingsAmount: number }> = [];

  for (const measure of measures) {
    if (!measure.energySourceId || !measure.energySource) { skipped++; continue; }

    const implDate = new Date(measure.implementationDate);
    const costPerUnit = measure.energySource.costPerUnit || 0;

    // Get baseline: average daily consumption for 3 months BEFORE implementation
    const baselineStart = new Date(implDate);
    baselineStart.setMonth(baselineStart.getMonth() - 3);

    const baselineEntries = await prisma.consumptionEntry.findMany({
      where: {
        clientId: result.clientId,
        energySourceId: measure.energySourceId,
        date: { gte: baselineStart, lt: implDate },
      },
      select: { value: true, date: true },
    });

    if (baselineEntries.length < 10) { skipped++; continue; } // Need enough baseline data

    const baselineTotalKwh = baselineEntries.reduce((s, e) => s + e.value, 0);
    const baselineDays = Math.max(1, Math.ceil((implDate.getTime() - baselineStart.getTime()) / (24 * 3600 * 1000)));
    const baselineDailyKwh = baselineTotalKwh / baselineDays;

    // Get post-implementation months
    const now = new Date();
    const monthsAfter = (now.getFullYear() - implDate.getFullYear()) * 12 + (now.getMonth() - implDate.getMonth());

    for (let m = 0; m < Math.min(monthsAfter, 24); m++) {
      const targetMonth = new Date(implDate);
      targetMonth.setMonth(targetMonth.getMonth() + m + 1);
      const year = targetMonth.getFullYear();
      const month = targetMonth.getMonth() + 1;

      // Check if already calculated for this month
      const existing = await prisma.savingsEntry.findUnique({
        where: { measureId_year_month: { measureId: measure.id, year, month } },
      });
      if (existing && existing.method === 'MANUAL') { skipped++; continue; } // Don't overwrite manual entries

      // Get actual consumption for this month
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      const monthEntries = await prisma.consumptionEntry.findMany({
        where: {
          clientId: result.clientId,
          energySourceId: measure.energySourceId,
          date: { gte: monthStart, lte: monthEnd },
        },
        select: { value: true },
      });

      if (monthEntries.length === 0) continue;

      const actualMonthKwh = monthEntries.reduce((s, e) => s + e.value, 0);
      const daysInMonth = monthEnd.getDate();
      const expectedMonthKwh = baselineDailyKwh * daysInMonth;
      const kwhSaved = Math.max(0, expectedMonthKwh - actualMonthKwh);
      const savingsAmount = kwhSaved * costPerUnit;

      const monthLabel = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1]} ${year}`;

      if (existing) {
        await prisma.savingsEntry.update({
          where: { id: existing.id },
          data: { kwhSaved, savingsAmount, method: 'CALCULATED', notes: `Auto: baseline ${baselineDailyKwh.toFixed(0)} kWh/day, actual ${(actualMonthKwh / daysInMonth).toFixed(0)} kWh/day` },
        });
      } else {
        await prisma.savingsEntry.create({
          data: { measureId: measure.id, year, month, kwhSaved, savingsAmount, method: 'CALCULATED', notes: `Auto: baseline ${baselineDailyKwh.toFixed(0)} kWh/day, actual ${(actualMonthKwh / daysInMonth).toFixed(0)} kWh/day` },
        });
      }

      calculated++;
      results.push({ measureId: measure.id, name: measure.name, month: monthLabel, kwhSaved: Math.round(kwhSaved), savingsAmount: Math.round(savingsAmount) });
    }

    // Update measure's actual savings with latest month's data
    if (results.length > 0) {
      const latest = results[results.length - 1];
      await prisma.savingsMeasure.update({
        where: { id: measure.id },
        data: { actualKwhSavings: latest.kwhSaved, actualMonthlySavings: latest.savingsAmount },
      });
    }
  }

  return NextResponse.json({ calculated, skipped, measures: measures.length, results });
}
