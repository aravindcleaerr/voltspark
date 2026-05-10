import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/session';
import PageHeader from '@/components/layout/PageHeader';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

function pct(n: number) { return `${(n * 100).toFixed(1)}%`; }

export default async function ProductionOverviewPage() {
  const result = await requireClient();
  if ('error' in result) redirect('/login');

  const records = await prisma.productionRecord.findMany({
    where: { clientId: result.clientId },
    orderBy: [{ shiftDate: 'desc' }, { shiftNumber: 'desc' }],
    take: 60,
  });

  const totalProduced = records.reduce((s, r) => s + r.unitsProduced, 0);
  const totalRejected = records.reduce((s, r) => s + r.unitsRejected, 0);
  const avgOee = records.length ? records.reduce((s, r) => s + r.oee, 0) / records.length : 0;
  const avgFpy = records.length ? records.reduce((s, r) => s + r.fpy, 0) / records.length : 0;
  const avgPpm = records.length ? Math.round(records.reduce((s, r) => s + r.ppmDefects, 0) / records.length) : 0;

  return (
    <div>
      <PageHeader
        title="Production Overview"
        subtitle={`Last ${records.length} shifts — line ${records[0]?.lineId || 'LINE-01'}`}
      />
      {records.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">No production records yet for this client.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="card"><p className="text-xs text-gray-500">Units Produced</p><p className="text-2xl font-bold">{totalProduced.toLocaleString()}</p></div>
            <div className="card"><p className="text-xs text-gray-500">Units Rejected</p><p className="text-2xl font-bold text-orange-600">{totalRejected.toLocaleString()}</p></div>
            <div className="card"><p className="text-xs text-gray-500">Avg OEE</p><p className="text-2xl font-bold">{pct(avgOee)}</p></div>
            <div className="card"><p className="text-xs text-gray-500">Avg FPY</p><p className="text-2xl font-bold">{pct(avgFpy)}</p></div>
            <div className="card"><p className="text-xs text-gray-500">Avg PPM</p><p className={`text-2xl font-bold ${avgPpm > 100 ? 'text-red-600' : ''}`}>{avgPpm.toLocaleString()}</p></div>
          </div>

          <div className="card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Shift</th>
                  <th className="px-3 py-2 text-right">Planned</th>
                  <th className="px-3 py-2 text-right">Produced</th>
                  <th className="px-3 py-2 text-right">Rejected</th>
                  <th className="px-3 py-2 text-right">OEE</th>
                  <th className="px-3 py-2 text-right">FPY</th>
                  <th className="px-3 py-2 text-right">PPM</th>
                  <th className="px-3 py-2 text-right">Cycle (s)</th>
                  <th className="px-3 py-2 text-right">Downtime</th>
                  <th className="px-3 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{r.shiftDate.toISOString().slice(0, 10)}</td>
                    <td className="px-3 py-2">S{r.shiftNumber}</td>
                    <td className="px-3 py-2 text-right">{r.unitsPlanned}</td>
                    <td className="px-3 py-2 text-right font-medium">{r.unitsProduced}</td>
                    <td className={`px-3 py-2 text-right ${r.unitsRejected > 20 ? 'text-orange-600 font-medium' : ''}`}>{r.unitsRejected}</td>
                    <td className="px-3 py-2 text-right">{pct(r.oee)}</td>
                    <td className="px-3 py-2 text-right">{pct(r.fpy)}</td>
                    <td className={`px-3 py-2 text-right ${r.ppmDefects > 100 ? 'text-red-600 font-bold' : ''}`}>{r.ppmDefects.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{r.cycleTimeAvgSeconds.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{r.downtimeMinutesPlanned + r.downtimeMinutesUnplanned}m</td>
                    <td className="px-3 py-2 text-xs text-gray-500 max-w-[20ch] truncate">{r.notes || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
