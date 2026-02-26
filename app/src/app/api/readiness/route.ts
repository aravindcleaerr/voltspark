import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/**
 * Pre-audit readiness check — auto-scans platform data to determine
 * whether each requirement in a client framework has sufficient evidence.
 */
export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const cfId = request.nextUrl.searchParams.get('clientFrameworkId');
  if (!cfId) return NextResponse.json({ error: 'clientFrameworkId is required' }, { status: 400 });

  const cf = await prisma.clientFramework.findUnique({
    where: { id: cfId },
    include: {
      framework: {
        include: { requirements: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });

  if (!cf || cf.clientId !== clientId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Gather platform data counts for evidence checks
  const [
    energySourceCount,
    consumptionMonths,
    activeTargets,
    completedTraining,
    totalTrainingAttendees,
    attendedCount,
    auditCount,
    recentAudit,
    closedCapas,
    totalCapas,
    inspectionCount,
    certValid,
    certTotal,
  ] = await Promise.all([
    prisma.energySource.count({ where: { clientId, isActive: true } }),
    prisma.consumptionEntry.groupBy({ by: ['date'], where: { clientId } }).then(rows => {
      const months = new Set(rows.map(r => {
        const d = new Date(r.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      }));
      return months.size;
    }),
    prisma.energyTarget.count({ where: { isActive: true, energySource: { clientId } } }),
    prisma.trainingProgram.count({ where: { clientId, status: 'COMPLETED' } }),
    prisma.trainingAttendance.count({ where: { trainingProgram: { clientId } } }),
    prisma.trainingAttendance.count({ where: { attended: true, trainingProgram: { clientId } } }),
    prisma.audit.count({ where: { clientId } }),
    prisma.audit.findFirst({ where: { clientId, status: 'COMPLETED' }, orderBy: { completedDate: 'desc' } }),
    prisma.cAPA.count({ where: { clientId, status: 'CLOSED' } }),
    prisma.cAPA.count({ where: { clientId } }),
    prisma.inspection.count({ where: { clientId, status: 'COMPLETED' } }),
    prisma.certification.count({ where: { clientId, status: 'VALID' } }),
    prisma.certification.count({ where: { clientId } }),
  ]);

  const attendanceRate = totalTrainingAttendees > 0 ? Math.round((attendedCount / totalTrainingAttendees) * 100) : 0;
  const capaClosureRate = totalCapas > 0 ? Math.round((closedCapas / totalCapas) * 100) : 100;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentAuditWithin6m = recentAudit?.completedDate && new Date(recentAudit.completedDate) >= sixMonthsAgo;

  // Evidence checks per module
  const evidenceChecks: Record<string, { met: boolean; detail: string; autoDetected: boolean }> = {
    ENERGY_SOURCE: {
      met: energySourceCount >= 1,
      detail: energySourceCount > 0 ? `${energySourceCount} energy sources registered` : 'No energy sources registered',
      autoDetected: true,
    },
    CONSUMPTION: {
      met: consumptionMonths >= 3 && activeTargets >= 1,
      detail: `${consumptionMonths} months of data, ${activeTargets} active targets`,
      autoDetected: true,
    },
    TRAINING: {
      met: completedTraining >= 1 && attendanceRate >= 80,
      detail: `${completedTraining} completed programs, ${attendanceRate}% attendance`,
      autoDetected: true,
    },
    AUDIT: {
      met: auditCount >= 1 && !!recentAuditWithin6m,
      detail: recentAuditWithin6m
        ? `Last audit: ${new Date(recentAudit!.completedDate!).toLocaleDateString('en-IN')}`
        : auditCount > 0 ? 'Last audit >6 months ago' : 'No audits conducted',
      autoDetected: true,
    },
    CAPA: {
      met: capaClosureRate >= 70,
      detail: `${capaClosureRate}% CAPA closure rate (${closedCapas}/${totalCapas})`,
      autoDetected: true,
    },
    INSPECTION: {
      met: inspectionCount >= 1,
      detail: inspectionCount > 0 ? `${inspectionCount} completed inspections` : 'No inspections completed',
      autoDetected: true,
    },
  };

  // Requirement statuses
  const statuses = await prisma.requirementStatus.findMany({
    where: { clientFrameworkId: cfId },
  });
  const statusMap: Record<string, string> = {};
  for (const s of statuses) statusMap[s.requirementId] = s.status;

  // Build readiness per requirement
  const requirements = cf.framework.requirements.map(req => {
    const currentStatus = statusMap[req.id] || 'NOT_STARTED';
    const evidenceModule = req.evidenceModule;

    let evidenceAvailable = false;
    let evidenceDetail = 'No auto-detection available — manual verification needed';
    let autoDetected = false;

    if (evidenceModule && evidenceChecks[evidenceModule]) {
      const check = evidenceChecks[evidenceModule];
      evidenceAvailable = check.met;
      evidenceDetail = check.detail;
      autoDetected = check.autoDetected;
    }

    const isReady = currentStatus === 'COMPLIANT' || currentStatus === 'NOT_APPLICABLE';
    const hasEvidence = evidenceAvailable || currentStatus === 'COMPLIANT';

    return {
      id: req.id,
      code: req.code,
      category: req.category,
      title: req.title,
      isCritical: req.isCritical,
      weight: req.weight,
      currentStatus,
      evidenceModule,
      evidenceAvailable,
      evidenceDetail,
      autoDetected,
      isReady,
      hasEvidence,
    };
  });

  const totalReqs = requirements.length;
  const readyCount = requirements.filter(r => r.isReady).length;
  const evidenceCount = requirements.filter(r => r.hasEvidence).length;
  const criticalMissing = requirements.filter(r => r.isCritical && !r.isReady);
  const readinessScore = totalReqs > 0 ? Math.round((readyCount / totalReqs) * 100) : 0;

  // Action items — things that need to happen before audit
  const actionItems = requirements
    .filter(r => !r.isReady)
    .map(r => ({
      code: r.code,
      title: r.title,
      isCritical: r.isCritical,
      reason: r.currentStatus === 'NOT_STARTED' ? 'Not started'
        : r.currentStatus === 'IN_PROGRESS' ? 'Still in progress'
        : r.currentStatus === 'NON_COMPLIANT' ? 'Non-compliant — needs remediation'
        : 'Status unknown',
      evidenceGap: !r.hasEvidence ? r.evidenceDetail : null,
    }));

  return NextResponse.json({
    framework: { code: cf.framework.code, name: cf.framework.name, version: cf.framework.version },
    score: cf.score,
    readinessScore,
    totalRequirements: totalReqs,
    readyCount,
    evidenceCount,
    criticalMissing: criticalMissing.length,
    requirements,
    actionItems,
  });
}
