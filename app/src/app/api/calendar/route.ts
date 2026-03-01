import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/**
 * Compliance calendar — aggregates all time-sensitive items:
 * certifications, audits, training, inspections, CAPA deadlines
 */
export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId } = result;

  const [certifications, audits, trainings, capas, inspections, schedules] = await Promise.all([
    prisma.certification.findMany({
      where: { clientId },
      select: { id: true, name: true, category: true, expiryDate: true, status: true, issuingBody: true, renewalFrequency: true },
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.audit.findMany({
      where: { clientId },
      select: { id: true, title: true, auditDate: true, nextAuditDate: true, status: true, type: true },
      orderBy: { auditDate: 'desc' },
    }),
    prisma.trainingProgram.findMany({
      where: { clientId, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
      select: { id: true, title: true, scheduledDate: true, status: true, type: true },
      orderBy: { scheduledDate: 'asc' },
    }),
    prisma.cAPA.findMany({
      where: { clientId, status: { not: 'CLOSED' } },
      select: { id: true, capaNumber: true, title: true, actionDueDate: true, status: true, priority: true },
      orderBy: { actionDueDate: 'asc' },
    }),
    prisma.inspection.findMany({
      where: { clientId, status: { not: 'COMPLETED' } },
      select: { id: true, inspectionDate: true, status: true, location: true, template: { select: { name: true } } },
      orderBy: { inspectionDate: 'asc' },
    }),
    prisma.recurringSchedule.findMany({
      where: { clientId, isActive: true },
      include: { assignedTo: { select: { name: true } } },
    }),
  ]);

  const now = new Date();

  // Build calendar events
  const events: {
    id: string;
    type: string;
    title: string;
    date: string;
    status: string;
    urgency: 'overdue' | 'urgent' | 'upcoming' | 'future';
    module: string;
    href: string;
  }[] = [];

  // Certification expiry events
  for (const cert of certifications) {
    if (!cert.expiryDate) continue;
    const expiry = new Date(cert.expiryDate);
    const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let urgency: 'overdue' | 'urgent' | 'upcoming' | 'future' = 'future';
    if (daysUntil < 0) urgency = 'overdue';
    else if (daysUntil <= 15) urgency = 'urgent';
    else if (daysUntil <= 60) urgency = 'upcoming';

    events.push({
      id: cert.id,
      type: 'CERTIFICATION_EXPIRY',
      title: `${cert.name} — ${cert.issuingBody}`,
      date: expiry.toISOString(),
      status: cert.status,
      urgency,
      module: 'certifications',
      href: '/safety/certifications',
    });
  }

  // Next audit dates
  for (const audit of audits) {
    if (audit.nextAuditDate) {
      const auditDate = new Date(audit.nextAuditDate);
      const daysUntil = Math.floor((auditDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let urgency: 'overdue' | 'urgent' | 'upcoming' | 'future' = 'future';
      if (daysUntil < 0) urgency = 'overdue';
      else if (daysUntil <= 14) urgency = 'urgent';
      else if (daysUntil <= 45) urgency = 'upcoming';

      events.push({
        id: audit.id + '-next',
        type: 'AUDIT_DUE',
        title: `Next audit: ${audit.title}`,
        date: audit.nextAuditDate.toISOString(),
        status: audit.status,
        urgency,
        module: 'audits',
        href: `/audits/${audit.id}`,
      });
    }
  }

  // Scheduled training
  for (const t of trainings) {
    const tDate = new Date(t.scheduledDate);
    const daysUntil = Math.floor((tDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let urgency: 'overdue' | 'urgent' | 'upcoming' | 'future' = 'future';
    if (daysUntil < 0) urgency = 'overdue';
    else if (daysUntil <= 7) urgency = 'urgent';
    else if (daysUntil <= 30) urgency = 'upcoming';

    events.push({
      id: t.id,
      type: 'TRAINING_SCHEDULED',
      title: t.title,
      date: t.scheduledDate.toISOString(),
      status: t.status,
      urgency,
      module: 'training',
      href: `/training/${t.id}`,
    });
  }

  // CAPA deadlines
  for (const capa of capas) {
    if (capa.actionDueDate) {
      const dueDate = new Date(capa.actionDueDate);
      const daysUntil = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let urgency: 'overdue' | 'urgent' | 'upcoming' | 'future' = 'future';
      if (daysUntil < 0) urgency = 'overdue';
      else if (daysUntil <= 7) urgency = 'urgent';
      else if (daysUntil <= 30) urgency = 'upcoming';

      events.push({
        id: capa.id,
        type: 'CAPA_DUE',
        title: `${capa.capaNumber}: ${capa.title}`,
        date: capa.actionDueDate.toISOString(),
        status: capa.status,
        urgency,
        module: 'capa',
        href: `/capa/${capa.id}`,
      });
    }
  }

  // Pending inspections
  for (const insp of inspections) {
    const iDate = new Date(insp.inspectionDate);
    const daysUntil = Math.floor((iDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let urgency: 'overdue' | 'urgent' | 'upcoming' | 'future' = 'future';
    if (daysUntil < 0) urgency = 'overdue';
    else if (daysUntil <= 7) urgency = 'urgent';
    else if (daysUntil <= 30) urgency = 'upcoming';

    events.push({
      id: insp.id,
      type: 'INSPECTION_DUE',
      title: `${insp.template?.name || 'Inspection'}${insp.location ? ` — ${insp.location}` : ''}`,
      date: insp.inspectionDate.toISOString(),
      status: insp.status,
      urgency,
      module: 'inspections',
      href: '/safety',
    });
  }

  // Generate future occurrences from recurring schedules (next 90 days)
  const horizon = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  for (const sched of schedules) {
    const start = new Date(sched.startDate);
    const end = sched.endDate ? new Date(sched.endDate) : horizon;
    const limit = end < horizon ? end : horizon;

    // Generate occurrences from startDate forward
    const occurrences: Date[] = [];
    let cursor = new Date(start);

    const addMonths = (d: Date, n: number) => {
      const r = new Date(d);
      r.setMonth(r.getMonth() + n);
      if (sched.dayOfMonth) r.setDate(Math.min(sched.dayOfMonth, 28));
      return r;
    };

    for (let i = 0; i < 52 && cursor <= limit; i++) {
      if (cursor >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        occurrences.push(new Date(cursor));
      }
      switch (sched.frequency) {
        case 'DAILY': cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000); break;
        case 'WEEKLY': cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000); break;
        case 'BIWEEKLY': cursor = new Date(cursor.getTime() + 14 * 24 * 60 * 60 * 1000); break;
        case 'MONTHLY': cursor = addMonths(cursor, 1); break;
        case 'QUARTERLY': cursor = addMonths(cursor, 3); break;
        case 'BIANNUAL': cursor = addMonths(cursor, 6); break;
        case 'ANNUAL': cursor = addMonths(cursor, 12); break;
        default: cursor = addMonths(cursor, 1);
      }
    }

    for (const occ of occurrences) {
      const daysUntil = Math.floor((occ.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let urgency: 'overdue' | 'urgent' | 'upcoming' | 'future' = 'future';
      if (daysUntil < 0) urgency = 'overdue';
      else if (daysUntil <= sched.reminderDays) urgency = 'urgent';
      else if (daysUntil <= 30) urgency = 'upcoming';

      events.push({
        id: `${sched.id}-${occ.toISOString().slice(0, 10)}`,
        type: `SCHEDULE_${sched.category}`,
        title: `${sched.title}${sched.assignedTo ? ` — ${sched.assignedTo.name}` : ''}`,
        date: occ.toISOString(),
        status: daysUntil < 0 ? 'OVERDUE' : 'SCHEDULED',
        urgency,
        module: 'schedules',
        href: '/calendar',
      });
    }
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const overdue = events.filter(e => e.urgency === 'overdue').length;
  const urgent = events.filter(e => e.urgency === 'urgent').length;

  return NextResponse.json({
    events,
    summary: {
      total: events.length,
      overdue,
      urgent,
      upcoming: events.filter(e => e.urgency === 'upcoming').length,
    },
  });
}
