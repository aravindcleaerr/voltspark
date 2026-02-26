import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    energySourceCount,
    activeTargets,
    recentConsumption,
    deviationEntries,
    trainingPrograms,
    completedTraining,
    totalAttendance,
    attendedCount,
    audits,
    openFindings,
    capas,
    closedCapas,
  ] = await Promise.all([
    prisma.energySource.count({ where: { clientId, isActive: true } }),
    prisma.energyTarget.count({ where: { isActive: true, energySource: { clientId } } }),
    prisma.consumptionEntry.findMany({ where: { clientId, date: { gte: thirtyDaysAgo } }, orderBy: { date: 'desc' }, take: 30, include: { energySource: { select: { name: true, unit: true } } } }),
    prisma.consumptionEntry.count({ where: { clientId, hasDeviation: true, date: { gte: thirtyDaysAgo } } }),
    prisma.trainingProgram.count({ where: { clientId } }),
    prisma.trainingProgram.count({ where: { clientId, status: 'COMPLETED' } }),
    prisma.trainingAttendance.count({ where: { trainingProgram: { clientId } } }),
    prisma.trainingAttendance.count({ where: { attended: true, trainingProgram: { clientId } } }),
    prisma.audit.count({ where: { clientId } }),
    prisma.auditFinding.count({ where: { status: { not: 'CLOSED' }, audit: { clientId } } }),
    prisma.cAPA.count({ where: { clientId } }),
    prisma.cAPA.count({ where: { clientId, status: 'CLOSED' } }),
  ]);

  // Calculate compliance sub-scores
  const sourceScore = energySourceCount > 0 ? Math.min(100, energySourceCount * 20) : 0;
  const targetScore = activeTargets > 0 ? Math.min(100, activeTargets * 25) : 0;

  const recentCount = recentConsumption.length;
  const dataCurrencyScore = recentCount >= 20 ? 100 : recentCount >= 10 ? 70 : recentCount >= 5 ? 40 : recentCount > 0 ? 20 : 0;

  const trainingScore = trainingPrograms > 0 ? Math.round((completedTraining / trainingPrograms) * 100) : 0;
  const attendanceRate = totalAttendance > 0 ? Math.round((attendedCount / totalAttendance) * 100) : 0;

  const auditScore = audits > 0 ? Math.min(100, audits * 30) : 0;
  const findingScore = openFindings === 0 ? 100 : Math.max(0, 100 - openFindings * 15);

  const capaClosureRate = capas > 0 ? Math.round((closedCapas / capas) * 100) : 100;

  const overallScore = Math.round(
    (sourceScore * 0.15 + targetScore * 0.10 + dataCurrencyScore * 0.25 + ((trainingScore + attendanceRate) / 2) * 0.20 + ((auditScore + findingScore) / 2) * 0.15 + capaClosureRate * 0.15)
  );

  const deviationAlerts = await prisma.consumptionEntry.findMany({
    where: { clientId, hasDeviation: true },
    orderBy: { date: 'desc' },
    take: 5,
    include: { energySource: { select: { name: true } } },
  });

  // Energy cost summary
  const costEntries = await prisma.consumptionEntry.findMany({
    where: { clientId, cost: { not: null } },
    orderBy: { date: 'desc' },
    take: 100,
    select: { date: true, cost: true, energySource: { select: { name: true, type: true } } },
  });
  const totalMonthlyCost = costEntries.reduce((sum, e) => sum + (e.cost || 0), 0);

  // Predicted next month cost (linear trend from utility bills)
  const recentBills = await prisma.utilityBill.findMany({
    where: { clientId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    take: 6,
    select: { year: true, month: true, totalAmount: true },
  });

  let predictedNextMonthCost: number | null = null;
  let costTrend: { month: string; amount: number }[] = [];
  if (recentBills.length >= 2) {
    const billsAsc = [...recentBills].reverse();
    costTrend = billsAsc.map(b => ({ month: `${b.year}-${String(b.month).padStart(2, '0')}`, amount: b.totalAmount }));
    // Simple linear regression
    const n = billsAsc.length;
    const xs = billsAsc.map((_, i) => i);
    const ys = billsAsc.map(b => b.totalAmount);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
    const sumX2 = xs.reduce((a, x) => a + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    predictedNextMonthCost = Math.round(intercept + slope * n);
    if (predictedNextMonthCost < 0) predictedNextMonthCost = 0;
  }

  // Client profile for industry benchmarking
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { industry: true, employeeCount: true, name: true },
  });

  return NextResponse.json({
    complianceScore: { overall: overallScore, sources: sourceScore, targets: targetScore, dataCurrency: dataCurrencyScore, training: Math.round((trainingScore + attendanceRate) / 2), audits: Math.round((auditScore + findingScore) / 2), capa: capaClosureRate },
    stats: { energySources: energySourceCount, activeTargets, recentEntries: recentCount, deviations: deviationEntries, trainingPrograms, completedTraining, audits, openFindings, totalCapas: capas, closedCapas },
    recentConsumption,
    deviationAlerts,
    energyCost: { totalRecent: totalMonthlyCost, predictedNextMonth: predictedNextMonthCost, recentBillTrend: costTrend },
    clientProfile: { industry: client?.industry || null, employeeCount: client?.employeeCount || null, name: client?.name || '' },
  });
}
