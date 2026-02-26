import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Consultant Analytics — cross-client portfolio insights.
 * Only accessible to users with multiple client access.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Get all clients this user has access to
  const clientAccess = await prisma.clientAccess.findMany({
    where: { userId },
    include: { client: { select: { id: true, name: true, industry: true, employeeCount: true } } },
  });

  if (clientAccess.length === 0) {
    return NextResponse.json({ error: 'No clients' }, { status: 404 });
  }

  const clientIds = clientAccess.map(ca => ca.client.id);

  // Parallel queries across all clients
  const [
    complianceData,
    savingsData,
    capaData,
    incidentData,
    certData,
    billData,
  ] = await Promise.all([
    // Compliance scores per client
    prisma.clientFramework.findMany({
      where: { clientId: { in: clientIds } },
      include: {
        client: { select: { name: true } },
        framework: { select: { name: true, code: true } },
        requirementStatuses: { select: { status: true } },
      },
    }),
    // Savings per client
    prisma.savingsMeasure.findMany({
      where: { clientId: { in: clientIds } },
      select: { clientId: true, investmentCost: true, cumulativeSavings: true, status: true, actualMonthlySavings: true },
    }),
    // CAPA per client
    prisma.cAPA.findMany({
      where: { clientId: { in: clientIds } },
      select: { clientId: true, status: true, priority: true },
    }),
    // Incidents per client
    prisma.incident.findMany({
      where: { clientId: { in: clientIds } },
      select: { clientId: true, status: true, severity: true },
    }),
    // Certifications per client
    prisma.certification.findMany({
      where: { clientId: { in: clientIds } },
      select: { clientId: true, status: true, expiryDate: true },
    }),
    // Utility bills per client (last 3 months)
    prisma.utilityBill.findMany({
      where: { clientId: { in: clientIds } },
      select: { clientId: true, totalAmount: true, unitsConsumed: true, year: true, month: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
  ]);

  // Build per-client health scores
  const clientScores = clientAccess.map(ca => {
    const cid = ca.client.id;

    // Compliance
    const frameworks = complianceData.filter(cf => cf.clientId === cid);
    const complianceScores = frameworks.map(cf => {
      const total = cf.requirementStatuses.length;
      const compliant = cf.requirementStatuses.filter(r => r.status === 'COMPLIANT').length;
      return total > 0 ? (compliant / total) * 100 : 0;
    });
    const avgCompliance = complianceScores.length > 0 ? Math.round(complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length) : 0;

    // Savings
    const savings = savingsData.filter(s => s.clientId === cid);
    const totalInvestment = savings.reduce((s, m) => s + m.investmentCost, 0);
    const totalSavings = savings.reduce((s, m) => s + (m.cumulativeSavings || 0), 0);
    const monthlySavings = savings.filter(m => m.status !== 'PLANNED').reduce((s, m) => s + (m.actualMonthlySavings || 0), 0);

    // CAPA
    const capas = capaData.filter(c => c.clientId === cid);
    const closedCapas = capas.filter(c => c.status === 'CLOSED').length;
    const capaClosureRate = capas.length > 0 ? Math.round((closedCapas / capas.length) * 100) : 100;

    // Safety
    const incidents = incidentData.filter(i => i.clientId === cid);
    const openIncidents = incidents.filter(i => i.status !== 'CLOSED').length;

    // Certifications
    const certs = certData.filter(c => c.clientId === cid);
    const expiringSoon = certs.filter(c => {
      if (!c.expiryDate) return false;
      const days = (c.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 30;
    }).length;

    // Bills
    const bills = billData.filter(b => b.clientId === cid).slice(0, 3);
    const avgBill = bills.length > 0 ? Math.round(bills.reduce((s, b) => s + b.totalAmount, 0) / bills.length) : 0;

    // Composite health score (0-100)
    const healthScore = Math.round(
      avgCompliance * 0.30 +
      capaClosureRate * 0.20 +
      (openIncidents === 0 ? 100 : Math.max(0, 100 - openIncidents * 25)) * 0.20 +
      (expiringSoon === 0 ? 100 : Math.max(0, 100 - expiringSoon * 20)) * 0.15 +
      (savings.length > 0 ? Math.min(100, (totalSavings / Math.max(totalInvestment, 1)) * 100) : 50) * 0.15
    );

    return {
      clientId: cid,
      clientName: ca.client.name,
      industry: ca.client.industry,
      employeeCount: ca.client.employeeCount,
      healthScore,
      compliance: avgCompliance,
      capaClosureRate,
      openIncidents,
      expiringSoonCerts: expiringSoon,
      totalInvestment,
      totalSavings,
      monthlySavings,
      avgMonthlyBill: avgBill,
      frameworkCount: frameworks.length,
    };
  });

  // Portfolio summary
  const portfolio = {
    totalClients: clientAccess.length,
    avgHealthScore: Math.round(clientScores.reduce((s, c) => s + c.healthScore, 0) / clientScores.length),
    totalSavingsDelivered: clientScores.reduce((s, c) => s + c.totalSavings, 0),
    totalMonthlySavings: clientScores.reduce((s, c) => s + c.monthlySavings, 0),
    clientsAtRisk: clientScores.filter(c => c.healthScore < 60).length,
    clientsHealthy: clientScores.filter(c => c.healthScore >= 80).length,
  };

  return NextResponse.json({ portfolio, clients: clientScores.sort((a, b) => a.healthScore - b.healthScore) });
}
