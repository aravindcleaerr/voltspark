import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import PageHeader from '@/components/layout/PageHeader';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const SEVERITY_COLOR: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-yellow-50 text-yellow-700',
};

const ACTION_COLOR: Record<string, string> = {
  scrap: 'bg-red-50 text-red-600',
  rework: 'bg-blue-50 text-blue-600',
  accept_with_deviation: 'bg-gray-100 text-gray-600',
};

export default async function DefectsLogPage({
  searchParams,
}: {
  searchParams: { excursionId?: string };
}) {
  const result = await requireClient();
  if ('error' in result) redirect('/login');

  const excursionId = searchParams?.excursionId;

  const events = await prisma.defectEvent.findMany({
    where: {
      clientId: result.clientId,
      ...(excursionId ? { linkedReflowExcursionId: excursionId } : {}),
    },
    orderBy: { detectedAt: 'desc' },
    take: 500,
  });

  // Last-30-day machine bad-actor analysis (only when not filtered)
  const machinePpm: { machine: string; defects: number; ppm: number }[] = [];
  if (!excursionId) {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const recent = await prisma.defectEvent.findMany({
      where: { clientId: result.clientId, detectedAt: { gte: since } },
      select: { detectedAtMachine: true, productionRecordId: true },
    });
    const recentByMachine: Record<string, number> = {};
    const shiftIds = new Set<string>();
    for (const e of recent) {
      recentByMachine[e.detectedAtMachine] = (recentByMachine[e.detectedAtMachine] || 0) + 1;
      shiftIds.add(e.productionRecordId);
    }
    const shiftRecords = await prisma.productionRecord.findMany({
      where: { id: { in: Array.from(shiftIds) } },
      select: { unitsProduced: true },
    });
    const totalUnits30d = shiftRecords.reduce((s, r) => s + r.unitsProduced, 0);
    machinePpm.push(
      ...Object.entries(recentByMachine)
        .map(([machine, defects]) => ({
          machine,
          defects,
          ppm: totalUnits30d > 0 ? Math.round((defects / totalUnits30d) * 1_000_000) : 0,
        }))
        .sort((a, b) => b.ppm - a.ppm)
    );
  }

  return (
    <div>
      <PageHeader
        title="Defects Log"
        subtitle={
          excursionId
            ? `${events.length} defects linked to excursion ${excursionId.slice(0, 10)}…`
            : `Latest ${events.length} events`
        }
      />

      {excursionId && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-sm text-purple-800 dark:text-purple-300">
          <span className="font-medium">Filtered:</span> showing defects linked to excursion <code className="font-mono text-xs bg-purple-100 dark:bg-purple-800 px-1.5 py-0.5 rounded">{excursionId.slice(0, 16)}…</code>
          <Link href="/q-apps/defects" className="ml-auto text-purple-600 hover:underline font-medium text-xs">Clear filter →</Link>
        </div>
      )}

      {!excursionId && machinePpm.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {machinePpm.slice(0, 3).map(m => (
            <div key={m.machine} className={`card ${m.ppm > 100 ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`}>
              <p className="text-xs text-gray-500">{m.machine} (30d)</p>
              <p className={`text-2xl font-bold ${m.ppm > 100 ? 'text-red-700' : ''}`}>{m.ppm.toLocaleString()} <span className="text-xs font-normal text-gray-500">PPM</span></p>
              <p className="text-xs text-gray-500">{m.defects.toLocaleString()} defects</p>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">No defect events.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-3 py-2">Detected At</th>
                <th className="px-3 py-2">Machine</th>
                <th className="px-3 py-2">Board Serial</th>
                <th className="px-3 py-2">Defect Type</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Suspected Root Cause</th>
                <th className="px-3 py-2">Linked Excursion</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{e.detectedAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                  <td className="px-3 py-2 font-medium">{e.detectedAtMachine}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.boardSerial}</td>
                  <td className="px-3 py-2">{e.defectType}</td>
                  <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${SEVERITY_COLOR[e.severity] || ''}`}>{e.severity}</span></td>
                  <td className="px-3 py-2 font-mono text-xs">{e.componentRef || '—'}</td>
                  <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${ACTION_COLOR[e.actionTaken] || ''}`}>{e.actionTaken}</span></td>
                  <td className="px-3 py-2 text-xs text-gray-600">{e.rootCauseSuspect || '—'}</td>
                  <td className="px-3 py-2 text-xs">
                    {e.linkedReflowExcursionId
                      ? <Link href={`/q-apps/excursions`} className="text-purple-600 font-mono hover:underline">{e.linkedReflowExcursionId.slice(0, 10)}…</Link>
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
