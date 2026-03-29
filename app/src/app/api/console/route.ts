import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.organizationId) return NextResponse.json({ error: 'Consultants only' }, { status: 403 });

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { id: true, name: true, slug: true, plan: true },
  });

  const clients = await prisma.client.findMany({
    where: { organizationId: user.organizationId, isActive: true },
    include: {
      _count: {
        select: {
          energySources: true,
          consumptionEntries: true,
          trainingPrograms: true,
          audits: true,
          capas: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  // For each client, calculate a simple compliance score and total cost
  const clientSummaries = await Promise.all(
    clients.map(async (client) => {
      const [closedCapas, totalCapas, openFindings, totalCost] = await Promise.all([
        prisma.cAPA.count({ where: { clientId: client.id, status: 'CLOSED' } }),
        prisma.cAPA.count({ where: { clientId: client.id } }),
        prisma.auditFinding.count({ where: { status: { not: 'CLOSED' }, audit: { clientId: client.id } } }),
        prisma.consumptionEntry.aggregate({ where: { clientId: client.id, cost: { not: null } }, _sum: { cost: true } }),
      ]);

      const capaRate = totalCapas > 0 ? Math.round((closedCapas / totalCapas) * 100) : 100;
      const score = Math.min(100, Math.round(
        (client._count.energySources > 0 ? 20 : 0) +
        (client._count.consumptionEntries > 10 ? 25 : client._count.consumptionEntries > 0 ? 10 : 0) +
        (client._count.trainingPrograms > 0 ? 15 : 0) +
        (client._count.audits > 0 ? 15 : 0) +
        (capaRate * 0.25)
      ));

      return {
        id: client.id,
        name: client.name,
        slug: client.slug,
        industry: client.industry,
        accessMode: client.accessMode,
        enabledAddons: client.enabledAddons,
        stats: client._count,
        complianceScore: score,
        capaClosureRate: capaRate,
        openFindings,
        totalEnergyCost: totalCost._sum.cost || 0,
      };
    })
  );

  return NextResponse.json({ organization: org, clients: clientSummaries });
}
