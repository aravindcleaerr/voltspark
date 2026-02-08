import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
        where: { isActive: true },
        include: { targets: { where: { isActive: true } }, _count: { select: { consumptionEntries: true } } },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ type, title: 'Energy Source Register', data: sources });
    }
    case 'consumption-summary': {
      const entries = await prisma.consumptionEntry.findMany({
        where: from || to ? { date: dateFilter } : {},
        include: { energySource: { select: { name: true, type: true, unit: true } } },
        orderBy: { date: 'desc' },
      });
      // Group by source
      const grouped: Record<string, { source: string; type: string; unit: string; total: number; count: number; deviations: number }> = {};
      for (const e of entries) {
        const key = e.energySourceId;
        if (!grouped[key]) grouped[key] = { source: e.energySource.name, type: e.energySource.type, unit: e.energySource.unit, total: 0, count: 0, deviations: 0 };
        grouped[key].total += e.value;
        grouped[key].count++;
        if (e.hasDeviation) grouped[key].deviations++;
      }
      return NextResponse.json({ type, title: 'Consumption Summary Report', data: Object.values(grouped), entries });
    }
    case 'training-compliance': {
      const programs = await prisma.trainingProgram.findMany({
        include: { attendance: { include: { user: { select: { name: true, department: true } } } }, _count: { select: { attendance: true } } },
        orderBy: { scheduledDate: 'desc' },
      });
      const totalUsers = await prisma.user.count({ where: { isActive: true } });
      return NextResponse.json({ type, title: 'Training Compliance Report', data: programs, totalEmployees: totalUsers });
    }
    case 'audit-summary': {
      const audits = await prisma.audit.findMany({
        include: { findings: true, leadAuditor: { select: { name: true } }, _count: { select: { findings: true } } },
        orderBy: { auditDate: 'desc' },
      });
      return NextResponse.json({ type, title: 'Audit Summary Report', data: audits });
    }
    case 'capa-summary': {
      const capas = await prisma.cAPA.findMany({
        include: { raisedBy: { select: { name: true } }, assignedTo: { select: { name: true } }, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ type, title: 'CAPA Summary Report', data: capas });
    }
    case 'zed-compliance': {
      const [sources, targets, entries, programs, attendance, audits, findings, capas] = await Promise.all([
        prisma.energySource.count({ where: { isActive: true } }),
        prisma.energyTarget.count({ where: { isActive: true } }),
        prisma.consumptionEntry.count(),
        prisma.trainingProgram.count(),
        prisma.trainingAttendance.count({ where: { attended: true } }),
        prisma.audit.count(),
        prisma.auditFinding.count({ where: { status: { not: 'CLOSED' } } }),
        prisma.cAPA.findMany({ select: { status: true } }),
      ]);
      const closedCapas = capas.filter(c => c.status === 'CLOSED').length;
      return NextResponse.json({
        type, title: 'ZED Compliance Overview',
        data: { energySources: sources, activeTargets: targets, consumptionEntries: entries, trainingPrograms: programs, attendedTraining: attendance, totalAudits: audits, openFindings: findings, totalCapas: capas.length, closedCapas, capaClosureRate: capas.length > 0 ? Math.round((closedCapas / capas.length) * 100) : 100 },
      });
    }
    default:
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  }
}
