import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/**
 * Impact Report — comprehensive multi-section report for consultants to present to clients.
 * Aggregates data from ALL platform modules into a structured report.
 */
export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const period = request.nextUrl.searchParams.get('period') || 'all'; // 'quarter', 'year', 'all'
  const now = new Date();
  let fromDate: Date | null = null;
  if (period === 'quarter') {
    fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  } else if (period === 'year') {
    fromDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  }

  const dateFilter = fromDate ? { gte: fromDate } : undefined;

  // Fetch all data in parallel
  const [
    client,
    energySources,
    consumptionEntries,
    targets,
    trainingPrograms,
    trainingAttendanceAll,
    audits,
    capas,
    frameworks,
    inspections,
    incidents,
    certifications,
    utilityBills,
    savingsMeasures,
    roiCalcs,
    actionPlans,
    documents,
  ] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId }, select: { name: true, industry: true, employeeCount: true, gridTariffRate: true, contractDemand: true, powerFactorTarget: true } }),
    prisma.energySource.findMany({ where: { clientId, isActive: true }, select: { id: true, name: true, type: true, unit: true } }),
    prisma.consumptionEntry.findMany({
      where: { clientId, ...(dateFilter ? { date: dateFilter } : {}) },
      include: { energySource: { select: { name: true, type: true, costPerUnit: true } } },
      orderBy: { date: 'asc' },
    }),
    prisma.energyTarget.findMany({ where: { isActive: true, energySource: { clientId } }, include: { energySource: { select: { name: true } } } }),
    prisma.trainingProgram.findMany({ where: { clientId }, include: { _count: { select: { attendance: true } } } }),
    prisma.trainingAttendance.findMany({ where: { trainingProgram: { clientId } }, select: { attended: true } }),
    prisma.audit.findMany({ where: { clientId }, include: { _count: { select: { findings: true } }, findings: { select: { status: true } } } }),
    prisma.cAPA.findMany({ where: { clientId }, select: { status: true, priority: true, createdAt: true } }),
    prisma.clientFramework.findMany({ where: { clientId }, include: { framework: { select: { name: true, code: true } }, requirementStatuses: { select: { status: true } } } }),
    prisma.inspection.findMany({ where: { clientId }, select: { status: true, score: true, overallResult: true, inspectionDate: true } }),
    prisma.incident.findMany({ where: { clientId }, select: { severity: true, status: true, incidentDate: true } }),
    prisma.certification.findMany({ where: { clientId }, select: { name: true, status: true, expiryDate: true, category: true } }),
    prisma.utilityBill.findMany({ where: { clientId }, orderBy: [{ year: 'asc' }, { month: 'asc' }] }),
    prisma.savingsMeasure.findMany({ where: { clientId }, include: { entries: true } }),
    prisma.rOICalculation.findMany({ where: { clientId } }),
    prisma.actionPlan.findMany({ where: { clientId }, include: { items: { select: { status: true, priority: true } } } }),
    prisma.document.count({ where: { clientId } }),
  ]);

  // ===============================
  // SECTION 1: Executive Summary
  // ===============================
  const totalEnergyCost = consumptionEntries.reduce((s, e) => s + (e.cost || 0), 0);
  const totalSavings = savingsMeasures.reduce((s, m) => s + (m.cumulativeSavings || 0), 0);
  const totalInvestment = savingsMeasures.reduce((s, m) => s + m.investmentCost, 0);
  const totalPfPenalties = utilityBills.reduce((s, b) => s + (b.pfPenalty || 0), 0);
  const complianceScores = frameworks.map(f => f.score || 0);
  const avgComplianceScore = complianceScores.length > 0 ? Math.round(complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length) : 0;
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status !== 'CLOSED').length;

  const executiveSummary = {
    clientName: client?.name || 'Unknown',
    industry: client?.industry || 'Unknown',
    reportPeriod: period,
    generatedAt: now.toISOString(),
    highlights: {
      totalEnergyCost: Math.round(totalEnergyCost),
      totalSavings: Math.round(totalSavings),
      savingsRate: totalEnergyCost > 0 ? Math.round((totalSavings / totalEnergyCost) * 100) : 0,
      avgComplianceScore,
      frameworkCount: frameworks.length,
      totalIncidents,
      openIncidents,
      documentsCount: documents,
    },
  };

  // ===============================
  // SECTION 2: Energy Performance
  // ===============================
  // Monthly consumption trend
  const monthlyConsumption: Record<string, { month: string; totalKwh: number; totalCost: number; sources: Record<string, number> }> = {};
  for (const e of consumptionEntries) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyConsumption[key]) monthlyConsumption[key] = { month: key, totalKwh: 0, totalCost: 0, sources: {} };
    monthlyConsumption[key].totalKwh += e.value;
    monthlyConsumption[key].totalCost += e.cost || 0;
    const srcName = e.energySource.name;
    monthlyConsumption[key].sources[srcName] = (monthlyConsumption[key].sources[srcName] || 0) + e.value;
  }
  const consumptionTrend = Object.values(monthlyConsumption).sort((a, b) => a.month.localeCompare(b.month));

  // Source mix
  const sourceMix: Record<string, { name: string; total: number; cost: number }> = {};
  for (const e of consumptionEntries) {
    const name = e.energySource.name;
    if (!sourceMix[name]) sourceMix[name] = { name, total: 0, cost: 0 };
    sourceMix[name].total += e.value;
    sourceMix[name].cost += e.cost || 0;
  }

  // Target performance
  const targetPerformance = targets.map(t => ({
    source: t.energySource.name,
    period: t.period,
    target: t.targetValue,
    actual: t.actualValue,
    met: t.actualValue != null && t.actualValue <= t.targetValue,
  }));

  const energyPerformance = {
    totalConsumption: Math.round(consumptionEntries.reduce((s, e) => s + e.value, 0)),
    totalCost: Math.round(totalEnergyCost),
    monthlyTrend: consumptionTrend,
    sourceMix: Object.values(sourceMix),
    targetPerformance,
    sourceCount: energySources.length,
  };

  // ===============================
  // SECTION 3: Compliance Status
  // ===============================
  const complianceStatus = frameworks.map(f => {
    const statuses = f.requirementStatuses;
    const total = statuses.length;
    const compliant = statuses.filter(s => s.status === 'COMPLIANT').length;
    const inProgress = statuses.filter(s => s.status === 'IN_PROGRESS').length;
    const nonCompliant = statuses.filter(s => s.status === 'NON_COMPLIANT').length;
    return {
      framework: f.framework.name,
      code: f.framework.code,
      score: f.score || 0,
      total,
      compliant,
      inProgress,
      nonCompliant,
      notStarted: total - compliant - inProgress - nonCompliant - statuses.filter(s => s.status === 'NOT_APPLICABLE').length,
    };
  });

  const certificationStatus = certifications.map(c => ({
    name: c.name,
    status: c.status,
    category: c.category,
    expiryDate: c.expiryDate?.toISOString() || null,
  }));

  // ===============================
  // SECTION 4: Safety Performance
  // ===============================
  const inspectionResults = {
    total: inspections.length,
    completed: inspections.filter(i => i.status === 'COMPLETED').length,
    avgScore: inspections.filter(i => i.score).length > 0
      ? Math.round(inspections.filter(i => i.score).reduce((s, i) => s + (i.score || 0), 0) / inspections.filter(i => i.score).length)
      : 0,
    passed: inspections.filter(i => i.overallResult === 'PASS').length,
    failed: inspections.filter(i => i.overallResult === 'FAIL').length,
  };

  const incidentSummary = {
    total: incidents.length,
    bySeverity: {
      nearMiss: incidents.filter(i => i.severity === 'NEAR_MISS').length,
      minor: incidents.filter(i => i.severity === 'MINOR').length,
      major: incidents.filter(i => i.severity === 'MAJOR').length,
      fatal: incidents.filter(i => i.severity === 'FATAL').length,
    },
    open: openIncidents,
    closed: incidents.filter(i => i.status === 'CLOSED').length,
  };

  const safetyPerformance = {
    inspections: inspectionResults,
    incidents: incidentSummary,
    certifications: certificationStatus,
    validCerts: certifications.filter(c => c.status === 'VALID').length,
    expiredCerts: certifications.filter(c => c.status === 'EXPIRED').length,
    expiringSoonCerts: certifications.filter(c => c.status === 'EXPIRING_SOON').length,
  };

  // ===============================
  // SECTION 5: Financial Impact
  // ===============================
  const savingsByCategory: Record<string, number> = {};
  for (const m of savingsMeasures) {
    savingsByCategory[m.category] = (savingsByCategory[m.category] || 0) + (m.cumulativeSavings || 0);
  }

  const financialImpact = {
    totalInvestment: Math.round(totalInvestment),
    totalSavings: Math.round(totalSavings),
    roi: totalInvestment > 0 ? Math.round((totalSavings / totalInvestment) * 100) : 0,
    totalPfPenalties: Math.round(totalPfPenalties),
    avgMonthlyBill: utilityBills.length > 0 ? Math.round(utilityBills.reduce((s, b) => s + b.totalAmount, 0) / utilityBills.length) : 0,
    savingsByCategory,
    implementedMeasures: savingsMeasures.filter(m => m.status !== 'PLANNED').length,
    plannedMeasures: savingsMeasures.filter(m => m.status === 'PLANNED').length,
    proposedROIInvestment: roiCalcs.reduce((s, r) => s + r.investmentCost, 0),
    proposedROISavings: roiCalcs.reduce((s, r) => s + r.annualSavings, 0),
  };

  // ===============================
  // SECTION 6: Improvement Roadmap
  // ===============================
  const actionPlansSummary = actionPlans.map(p => {
    const items = p.items;
    const done = items.filter(i => i.status === 'DONE').length;
    const overdue = items.filter(i => i.status !== 'DONE').length; // simplified
    return {
      title: p.title,
      status: p.status,
      totalItems: items.length,
      doneItems: done,
      completionRate: items.length > 0 ? Math.round((done / items.length) * 100) : 0,
    };
  });

  const improvementRoadmap = {
    actionPlans: actionPlansSummary,
    completedMeasures: savingsMeasures.filter(m => m.status === 'VERIFIED').map(m => ({ name: m.name, category: m.category, savings: m.cumulativeSavings })),
    plannedMeasures: savingsMeasures.filter(m => m.status === 'PLANNED').map(m => ({ name: m.name, category: m.category, estimatedSavings: m.estimatedMonthlySavings ? m.estimatedMonthlySavings * 12 : null })),
    pendingROI: roiCalcs.filter(r => r.status === 'DRAFT' || r.status === 'SHARED').map(r => ({ name: r.name, type: r.templateType, annualSavings: r.annualSavings, paybackMonths: r.paybackMonths })),
  };

  // ===============================
  // SECTION 7: Consultant Recommendations
  // ===============================
  const recommendations: { priority: number; title: string; impact: string; category: string }[] = [];

  // Auto-generate recommendations based on data
  if (totalPfPenalties > 10000) {
    recommendations.push({ priority: 1, title: 'Install APFC panel for power factor correction', impact: `Avoid ₹${Math.round(totalPfPenalties).toLocaleString('en-IN')} in annual PF penalties`, category: 'COST_REDUCTION' });
  }
  const expiredCerts = certifications.filter(c => c.status === 'EXPIRED');
  if (expiredCerts.length > 0) {
    recommendations.push({ priority: 1, title: `Renew ${expiredCerts.length} expired certification(s)`, impact: 'Maintain compliance and avoid regulatory penalties', category: 'COMPLIANCE' });
  }
  const openCapas = capas.filter(c => c.status !== 'CLOSED');
  if (openCapas.length > 3) {
    recommendations.push({ priority: 2, title: `Close ${openCapas.length} open CAPA items`, impact: 'Improve audit readiness and reduce recurring issues', category: 'COMPLIANCE' });
  }
  const plannedSavings = savingsMeasures.filter(m => m.status === 'PLANNED');
  if (plannedSavings.length > 0) {
    const estAnnual = plannedSavings.reduce((s, m) => s + (m.estimatedMonthlySavings || 0) * 12, 0);
    recommendations.push({ priority: 2, title: `Implement ${plannedSavings.length} planned improvement measure(s)`, impact: `Estimated annual savings: ₹${Math.round(estAnnual).toLocaleString('en-IN')}`, category: 'SAVINGS' });
  }
  for (const f of frameworks) {
    if ((f.score || 0) < 60) {
      recommendations.push({ priority: 1, title: `Focus on ${f.framework.name} compliance (currently ${f.score || 0}%)`, impact: 'Achieve certification readiness', category: 'COMPLIANCE' });
    }
  }

  // ===============================
  // SECTION 8: Training Summary
  // ===============================
  const totalAttendance = trainingAttendanceAll.length;
  const attendedCount = trainingAttendanceAll.filter(a => a.attended).length;

  const trainingSummary = {
    totalPrograms: trainingPrograms.length,
    completedPrograms: trainingPrograms.filter(p => p.status === 'COMPLETED').length,
    attendanceRate: totalAttendance > 0 ? Math.round((attendedCount / totalAttendance) * 100) : 0,
    totalEmployees: client?.employeeCount || 0,
  };

  // ===============================
  // CAPA Summary
  // ===============================
  const closedCapas = capas.filter(c => c.status === 'CLOSED').length;
  const capaSummary = {
    total: capas.length,
    open: capas.filter(c => c.status !== 'CLOSED').length,
    closed: closedCapas,
    closureRate: capas.length > 0 ? Math.round((closedCapas / capas.length) * 100) : 100,
    byPriority: {
      critical: capas.filter(c => c.priority === 'CRITICAL').length,
      high: capas.filter(c => c.priority === 'HIGH').length,
      medium: capas.filter(c => c.priority === 'MEDIUM').length,
      low: capas.filter(c => c.priority === 'LOW').length,
    },
  };

  return NextResponse.json({
    executiveSummary,
    energyPerformance,
    complianceStatus,
    safetyPerformance,
    financialImpact,
    improvementRoadmap,
    recommendations: recommendations.sort((a, b) => a.priority - b.priority),
    trainingSummary,
    capaSummary,
  });
}
