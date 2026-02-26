import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';

/**
 * Notifications API
 * GET — list notifications for current user (most recent first)
 * POST — generate notifications (trigger check)
 * PATCH — mark notifications as read
 */
export async function GET(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

  const where: any = { clientId, userId: user.id };
  if (unreadOnly) where.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({ where: { clientId, userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(request: NextRequest) {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const { clientId, user } = result;

  const body = await request.json();

  // If marking read
  if (body.markRead) {
    if (body.notificationId) {
      await prisma.notification.update({
        where: { id: body.notificationId },
        data: { isRead: true },
      });
    } else if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { clientId, userId: user.id, isRead: false },
        data: { isRead: true },
      });
    }
    return NextResponse.json({ ok: true });
  }

  // Trigger notification generation
  if (body.trigger === 'check') {
    const notifications: { type: string; title: string; message: string; severity: string; actionUrl: string; entityType?: string; entityId?: string }[] = [];
    const now = new Date();

    // 1. Certification expiry (30, 15, 7 days)
    const certs = await prisma.certification.findMany({
      where: { clientId, status: { not: 'EXPIRED' }, expiryDate: { not: null } },
    });
    for (const cert of certs) {
      if (!cert.expiryDate) continue;
      const daysToExpiry = Math.ceil((cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry <= 0) {
        notifications.push({ type: 'CERT_EXPIRY', title: `${cert.name} has expired`, message: `Certificate expired ${Math.abs(daysToExpiry)} days ago. Immediate renewal required.`, severity: 'CRITICAL', actionUrl: '/safety', entityType: 'CERTIFICATION', entityId: cert.id });
      } else if (daysToExpiry <= 7) {
        notifications.push({ type: 'CERT_EXPIRY', title: `${cert.name} expires in ${daysToExpiry} days`, message: `Urgent: certificate expires on ${cert.expiryDate.toISOString().split('T')[0]}.`, severity: 'CRITICAL', actionUrl: '/safety', entityType: 'CERTIFICATION', entityId: cert.id });
      } else if (daysToExpiry <= 15) {
        notifications.push({ type: 'CERT_EXPIRY', title: `${cert.name} expires in ${daysToExpiry} days`, message: `Start renewal process. Expiry: ${cert.expiryDate.toISOString().split('T')[0]}.`, severity: 'WARNING', actionUrl: '/safety', entityType: 'CERTIFICATION', entityId: cert.id });
      } else if (daysToExpiry <= 30) {
        notifications.push({ type: 'CERT_EXPIRY', title: `${cert.name} expires in ${daysToExpiry} days`, message: `Plan renewal. Expiry: ${cert.expiryDate.toISOString().split('T')[0]}.`, severity: 'INFO', actionUrl: '/safety', entityType: 'CERTIFICATION', entityId: cert.id });
      }
    }

    // 2. Overdue CAPAs
    const overdueCAPAs = await prisma.cAPA.findMany({
      where: { clientId, status: { not: 'CLOSED' }, actionDueDate: { lt: now } },
    });
    for (const capa of overdueCAPAs) {
      const daysOverdue = Math.ceil((now.getTime() - (capa.actionDueDate?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24));
      notifications.push({ type: 'CAPA_OVERDUE', title: `CAPA ${capa.capaNumber} is ${daysOverdue} days overdue`, message: `"${capa.title}" — ${capa.priority} priority. Action required immediately.`, severity: capa.priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING', actionUrl: `/capa/${capa.id}`, entityType: 'CAPA', entityId: capa.id });
    }

    // 3. Overdue action items
    const overdueItems = await prisma.actionItem.findMany({
      where: { actionPlan: { clientId }, status: { not: 'DONE' }, dueDate: { lt: now } },
      include: { actionPlan: { select: { title: true } } },
    });
    for (const item of overdueItems) {
      notifications.push({ type: 'ACTION_OVERDUE', title: `Action item overdue: ${item.title}`, message: `From plan "${item.actionPlan.title}". Priority: ${item.priority}.`, severity: 'WARNING', actionUrl: '/action-plans', entityType: 'ACTION_ITEM', entityId: item.id });
    }

    // 4. Bill anomalies (most recent bill)
    const anomalyBills = await prisma.utilityBill.findMany({
      where: { clientId, hasAnomaly: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 1,
    });
    for (const bill of anomalyBills) {
      notifications.push({ type: 'BILL_ANOMALY', title: `Bill anomaly: ${bill.year}-${String(bill.month).padStart(2, '0')}`, message: bill.anomalyNote || 'Unusual billing detected. Please review.', severity: 'WARNING', actionUrl: '/utility-bills', entityType: 'UTILITY_BILL', entityId: bill.id });
    }

    // 5. Open incidents
    const openIncidents = await prisma.incident.findMany({
      where: { clientId, status: { in: ['OPEN', 'INVESTIGATING'] }, severity: { in: ['MAJOR', 'FATAL'] } },
    });
    for (const inc of openIncidents) {
      notifications.push({ type: 'SAFETY_RISK', title: `Unresolved ${inc.severity.toLowerCase()} incident: ${inc.title}`, message: `Reported on ${inc.incidentDate.toISOString().split('T')[0]}. Requires immediate attention.`, severity: 'CRITICAL', actionUrl: '/safety', entityType: 'INCIDENT', entityId: inc.id });
    }

    // Deduplicate: don't create if identical notification (same type+entityId) already exists recently
    const existingRecent = await prisma.notification.findMany({
      where: { clientId, userId: user.id, createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
      select: { type: true, entityId: true },
    });
    const existingSet = new Set(existingRecent.map(n => `${n.type}:${n.entityId}`));

    const toCreate = notifications.filter(n => !existingSet.has(`${n.type}:${n.entityId}`));

    if (toCreate.length > 0) {
      await prisma.notification.createMany({
        data: toCreate.map(n => ({ ...n, clientId, userId: user.id })),
      });
    }

    return NextResponse.json({ generated: toCreate.length, total: notifications.length });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
