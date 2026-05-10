import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import PageHeader from '@/components/layout/PageHeader';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
};

export default async function ProcessExcursionsPage() {
  const result = await requireClient();
  if ('error' in result) redirect('/login');

  const excursions = await prisma.processExcursion.findMany({
    where: { clientId: result.clientId },
    orderBy: { detectedAt: 'desc' },
    take: 200,
  });

  // Per-excursion linked defect count
  const ids = excursions.map(e => e.id);
  const linkedCounts = ids.length > 0
    ? await prisma.defectEvent.groupBy({
        by: ['linkedReflowExcursionId'],
        where: { linkedReflowExcursionId: { in: ids } },
        _count: { _all: true },
      })
    : [];
  const linkedMap: Record<string, number> = {};
  for (const r of linkedCounts) {
    if (r.linkedReflowExcursionId) linkedMap[r.linkedReflowExcursionId] = r._count._all;
  }

  const criticalCount = excursions.filter(e => e.severity === 'critical').length;

  return (
    <div>
      <PageHeader
        title="Process Excursions"
        subtitle={`Latest ${excursions.length} excursions — ${criticalCount} critical`}
      />
      {excursions.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">No process excursions recorded.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-3 py-2">Detected At</th>
                <th className="px-3 py-2">Machine</th>
                <th className="px-3 py-2">Parameter</th>
                <th className="px-3 py-2 text-right">Expected</th>
                <th className="px-3 py-2 text-right">Observed</th>
                <th className="px-3 py-2 text-right">Δ</th>
                <th className="px-3 py-2 text-right">Duration</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2 text-right">Linked Defects</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {excursions.map(e => {
                const delta = e.observedValue - e.expectedValue;
                const linked = linkedMap[e.id] || 0;
                return (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{e.detectedAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                    <td className="px-3 py-2 font-medium">{e.machineId}</td>
                    <td className="px-3 py-2">{e.parameter}</td>
                    <td className="px-3 py-2 text-right">{e.expectedValue.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-medium">{e.observedValue.toFixed(2)}</td>
                    <td className={`px-3 py-2 text-right ${Math.abs(delta) > 5 ? 'text-red-600 font-bold' : ''}`}>{delta > 0 ? '+' : ''}{delta.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{e.durationSeconds}s</td>
                    <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${SEVERITY_COLOR[e.severity] || ''}`}>{e.severity}</span></td>
                    <td className={`px-3 py-2 text-right ${linked > 0 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>{linked}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 max-w-[28ch] truncate">{e.notes || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
