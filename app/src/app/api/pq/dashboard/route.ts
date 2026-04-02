import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import { requireAddon } from '@/lib/addons';

export async function GET() {
  const result = await requireClient();
  if ('error' in result) return result.error;
  const addonCheck = await requireAddon(result.clientId, 'POWER_QUALITY');
  if ('error' in addonCheck) return addonCheck.error;

  // Get latest snapshot per meter (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const meters = await prisma.ioTMeter.findMany({
    where: { clientId: result.clientId, isActive: true },
    select: { id: true, name: true, meterType: true, make: true, model: true, panelName: true, ratedVoltage: true },
  });

  const meterSnapshots = await Promise.all(
    meters.map(async (meter) => {
      const snapshots = await prisma.pQSnapshot.findMany({
        where: { meterId: meter.id, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
        take: 7,
      });

      const latest = snapshots[0] || null;
      const avgScore = snapshots.length > 0
        ? Math.round(snapshots.reduce((sum, s) => sum + (s.complianceScore || 0), 0) / snapshots.length)
        : null;

      return { meter, latest, avgScore, snapshotCount: snapshots.length, trend: snapshots.reverse().map(s => ({ date: s.date, score: s.complianceScore })) };
    })
  );

  // Recent PQ events (last 48h)
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recentEvents = await prisma.pQEvent.findMany({
    where: { clientId: result.clientId, createdAt: { gte: twoDaysAgo } },
    include: { meter: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Summary stats
  const eventCounts = await prisma.pQEvent.groupBy({
    by: ['type'],
    where: { clientId: result.clientId, createdAt: { gte: sevenDaysAgo } },
    _count: true,
  });

  const overallScore = meterSnapshots.filter(m => m.avgScore !== null).length > 0
    ? Math.round(meterSnapshots.filter(m => m.avgScore !== null).reduce((sum, m) => sum + (m.avgScore || 0), 0) / meterSnapshots.filter(m => m.avgScore !== null).length)
    : null;

  return NextResponse.json({
    overallScore,
    meters: meterSnapshots,
    recentEvents,
    eventCounts: eventCounts.map(e => ({ type: e.type, count: e._count })),
  });
}
