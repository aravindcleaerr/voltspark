import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    prisma.energySource.count({ where: { isActive: true } }),
    prisma.energyTarget.count({ where: { isActive: true } }),
    prisma.consumptionEntry.findMany({ where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: 'desc' }, take: 30, include: { energySource: { select: { name: true, unit: true } } } }),
    prisma.consumptionEntry.count({ where: { hasDeviation: true, date: { gte: thirtyDaysAgo } } }),
    prisma.trainingProgram.count(),
    prisma.trainingProgram.count({ where: { status: 'COMPLETED' } }),
    prisma.trainingAttendance.count(),
    prisma.trainingAttendance.count({ where: { attended: true } }),
    prisma.audit.count(),
    prisma.auditFinding.count({ where: { status: { not: 'CLOSED' } } }),
    prisma.cAPA.count(),
    prisma.cAPA.count({ where: { status: 'CLOSED' } }),
  ]);

  // Calculate ZED compliance sub-scores
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

  // Recent deviations for alerts
  const deviationAlerts = await prisma.consumptionEntry.findMany({
    where: { hasDeviation: true },
    orderBy: { date: 'desc' },
    take: 5,
    include: { energySource: { select: { name: true } } },
  });

  return NextResponse.json({
    complianceScore: { overall: overallScore, sources: sourceScore, targets: targetScore, dataCurrency: dataCurrencyScore, training: Math.round((trainingScore + attendanceRate) / 2), audits: Math.round((auditScore + findingScore) / 2), capa: capaClosureRate },
    stats: { energySources: energySourceCount, activeTargets, recentEntries: recentCount, deviations: deviationEntries, trainingPrograms, completedTraining, audits, openFindings, totalCapas: capas, closedCapas },
    recentConsumption,
    deviationAlerts,
  });
}
