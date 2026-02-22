import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'energy-register';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  switch (type) {
    case 'energy-register': {
      const sources = await prisma.energySource.findMany({
        where: { clientId, isActive: true },
        include: { targets: { where: { isActive: true } }, _count: { select: { consumptionEntries: true } } },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ type, title: 'Energy Source Register', data: sources });
    }
    case 'consumption-summary': {
      const entries = await prisma.consumptionEntry.findMany({
        where: { clientId, ...(from || to ? { date: dateFilter } : {}) },
        include: { energySource: { select: { name: true, type: true, unit: true } } },
        orderBy: { date: 'desc' },
      });
      const grouped: Record<string, { source: string; type: string; unit: string; total: number; count: number; deviations: number; totalCost: number }> = {};
      for (const e of entries) {
        const key = e.energySourceId;
        if (!grouped[key]) grouped[key] = { source: e.energySource.name, type: e.energySource.type, unit: e.energySource.unit, total: 0, count: 0, deviations: 0, totalCost: 0 };
        grouped[key].total += e.value;
        grouped[key].count++;
        if (e.hasDeviation) grouped[key].deviations++;
        grouped[key].totalCost += e.cost || 0;
      }
      return NextResponse.json({ type, title: 'Consumption Summary Report', data: Object.values(grouped), entries });
    }
    case 'training-compliance': {
      const programs = await prisma.trainingProgram.findMany({
        where: { clientId },
        include: { attendance: { include: { user: { select: { name: true, department: true } } } }, _count: { select: { attendance: true } } },
        orderBy: { scheduledDate: 'desc' },
      });
      const totalUsers = await prisma.clientAccess.count({ where: { clientId } });
      return NextResponse.json({ type, title: 'Training Compliance Report', data: programs, totalEmployees: totalUsers });
    }
    case 'audit-summary': {
      const audits = await prisma.audit.findMany({
        where: { clientId },
        include: { findings: true, leadAuditor: { select: { name: true } }, _count: { select: { findings: true } } },
        orderBy: { auditDate: 'desc' },
      });
      return NextResponse.json({ type, title: 'Audit Summary Report', data: audits });
    }
    case 'capa-summary': {
      const capas = await prisma.cAPA.findMany({
        where: { clientId },
        include: { raisedBy: { select: { name: true } }, assignedTo: { select: { name: true } }, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ type, title: 'CAPA Summary Report', data: capas });
    }
    case 'compliance-overview': {
      const [sources, targets, entries, programs, attendance, audits, findings, capas] = await Promise.all([
        prisma.energySource.count({ where: { clientId, isActive: true } }),
        prisma.energyTarget.count({ where: { isActive: true, energySource: { clientId } } }),
        prisma.consumptionEntry.count({ where: { clientId } }),
        prisma.trainingProgram.count({ where: { clientId } }),
        prisma.trainingAttendance.count({ where: { attended: true, trainingProgram: { clientId } } }),
        prisma.audit.count({ where: { clientId } }),
        prisma.auditFinding.count({ where: { status: { not: 'CLOSED' }, audit: { clientId } } }),
        prisma.cAPA.findMany({ where: { clientId }, select: { status: true } }),
      ]);
      const closedCapas = capas.filter(c => c.status === 'CLOSED').length;
      return NextResponse.json({
        type, title: 'Compliance Overview',
        data: { energySources: sources, activeTargets: targets, consumptionEntries: entries, trainingPrograms: programs, attendedTraining: attendance, totalAudits: audits, openFindings: findings, totalCapas: capas.length, closedCapas, capaClosureRate: capas.length > 0 ? Math.round((closedCapas / capas.length) * 100) : 100 },
      });
    }
    default:
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  }
}
