import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const measures = await prisma.savingsMeasure.findMany({
    where: { clientId },
    include: {
      energySource: { select: { name: true } },
      createdBy: { select: { name: true } },
      entries: { orderBy: { year: 'asc' } },
    },
    orderBy: { implementationDate: 'desc' },
  });

  // Aggregate stats
  const totalInvestment = measures.reduce((s, m) => s + m.investmentCost, 0);
  const totalMonthlySavings = measures
    .filter(m => m.status !== 'PLANNED')
    .reduce((s, m) => s + (m.actualMonthlySavings || m.estimatedMonthlySavings || 0), 0);
  const totalCumulativeSavings = measures.reduce((s, m) => s + (m.cumulativeSavings || 0), 0);
  const implementedCount = measures.filter(m => m.status !== 'PLANNED').length;
  const verifiedCount = measures.filter(m => m.status === 'VERIFIED').length;

  // Monthly savings trend (aggregate all entries by month)
  const monthlyTrend: Record<string, { month: string; savings: number; kwhSaved: number }> = {};
  for (const m of measures) {
    for (const e of m.entries) {
      const key = `${e.year}-${String(e.month).padStart(2, '0')}`;
      if (!monthlyTrend[key]) monthlyTrend[key] = { month: key, savings: 0, kwhSaved: 0 };
      monthlyTrend[key].savings += e.savingsAmount;
      monthlyTrend[key].kwhSaved += e.kwhSaved || 0;
    }
  }
  const trend = Object.values(monthlyTrend).sort((a, b) => a.month.localeCompare(b.month));

  return NextResponse.json({
    measures,
    summary: {
      totalInvestment,
      totalMonthlySavings,
      totalCumulativeSavings,
      implementedCount,
      verifiedCount,
      totalMeasures: measures.length,
      projectedAnnualSavings: totalMonthlySavings * 12,
    },
    trend,
  });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const body = await request.json();
  const measure = await prisma.savingsMeasure.create({
    data: {
      clientId,
      name: body.name,
      description: body.description || null,
      category: body.category,
      energySourceId: body.energySourceId || null,
      investmentCost: body.investmentCost,
      implementationDate: new Date(body.implementationDate),
      status: body.status || 'PLANNED',
      estimatedMonthlySavings: body.estimatedMonthlySavings || null,
      estimatedKwhSavings: body.estimatedKwhSavings || null,
      notes: body.notes || null,
      createdById: user.id,
    },
  });

  return NextResponse.json(measure, { status: 201 });
}
