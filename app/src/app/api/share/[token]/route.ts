import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public Shareable View API — no auth required.
 * Returns compliance data for vendor qualification.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  const view = await prisma.shareableView.findUnique({ where: { token } });
  if (!view || !view.isActive) {
    return NextResponse.json({ error: 'View not found or inactive' }, { status: 404 });
  }

  // Check expiry
  if (view.expiresAt && new Date() > view.expiresAt) {
    return NextResponse.json({ error: 'This view has expired' }, { status: 410 });
  }

  // Increment view count
  await prisma.shareableView.update({
    where: { id: view.id },
    data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
  });

  const clientId = view.clientId;
  const sections = view.sections ? JSON.parse(view.sections) : ['compliance', 'certifications', 'safety', 'improvements'];

  // Get client info
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { name: true, address: true, industry: true, employeeCount: true },
  });

  const settings = await prisma.appSetting.findMany({
    where: { clientId },
    select: { key: true, value: true },
  });
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const data: Record<string, any> = { client, companyName: settingsMap['company_name'] || client?.name };

  // Compliance section
  if (sections.includes('compliance')) {
    const frameworks = await prisma.clientFramework.findMany({
      where: { clientId },
      include: {
        framework: { select: { name: true, code: true } },
        requirementStatuses: {
          select: { status: true, requirement: { select: { code: true, title: true, category: true, isCritical: true } } },
          orderBy: { requirement: { sortOrder: 'asc' } },
        },
      },
    });
    data.compliance = frameworks.map(cf => {
      const total = cf.requirementStatuses.length;
      const compliant = cf.requirementStatuses.filter(r => r.status === 'COMPLIANT').length;
      return {
        framework: cf.framework.name,
        code: cf.framework.code,
        status: cf.status,
        score: total > 0 ? Math.round((compliant / total) * 100) : 0,
        totalRequirements: total,
        compliantRequirements: compliant,
        requirements: cf.requirementStatuses.map(rs => ({
          code: rs.requirement.code,
          title: rs.requirement.title,
          category: rs.requirement.category,
          status: rs.status,
          isCritical: rs.requirement.isCritical,
        })),
      };
    });
  }

  // Certifications section
  if (sections.includes('certifications')) {
    data.certifications = await prisma.certification.findMany({
      where: { clientId },
      select: { name: true, category: true, issuingBody: true, status: true, issueDate: true, expiryDate: true, certificateNumber: true },
      orderBy: { name: 'asc' },
    });
  }

  // Safety section
  if (sections.includes('safety')) {
    const [incidents, inspections] = await Promise.all([
      prisma.incident.findMany({
        where: { clientId },
        select: { type: true, severity: true, status: true, incidentDate: true },
      }),
      prisma.inspection.findMany({
        where: { clientId },
        select: { overallResult: true, score: true, inspectionDate: true, status: true },
      }),
    ]);
    const resolved = incidents.filter(i => i.status === 'CLOSED').length;
    data.safety = {
      totalIncidents: incidents.length,
      resolvedIncidents: resolved,
      resolutionRate: incidents.length > 0 ? Math.round((resolved / incidents.length) * 100) : 100,
      totalInspections: inspections.length,
      completedInspections: inspections.filter(i => i.status === 'COMPLETED').length,
      avgInspectionScore: inspections.length > 0
        ? Math.round(inspections.reduce((s, i) => s + (i.score || 0), 0) / inspections.length)
        : null,
    };
  }

  // Improvements section
  if (sections.includes('improvements')) {
    const measures = await prisma.savingsMeasure.findMany({
      where: { clientId },
      select: { name: true, category: true, status: true, investmentCost: true, cumulativeSavings: true },
    });
    data.improvements = {
      totalMeasures: measures.length,
      implemented: measures.filter(m => m.status !== 'PLANNED').length,
      totalInvestment: measures.reduce((s, m) => s + m.investmentCost, 0),
      totalSavings: measures.reduce((s, m) => s + (m.cumulativeSavings || 0), 0),
    };
  }

  return NextResponse.json({
    title: view.title,
    generatedAt: new Date().toISOString(),
    data,
  });
}
