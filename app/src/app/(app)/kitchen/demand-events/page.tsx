'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';

interface DemandEventData {
  id: string;
  type: string;
  severity: string;
  demandKVA: number | null;
  thresholdKVA: number | null;
  contractedDemandKVA: number | null;
  pf: number | null;
  message: string;
  zonesAffectedJson: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export default function DemandEventsPage() {
  const [events, setEvents] = useState<DemandEventData[]>([]);
  const [monthStats, setMonthStats] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchEvents = (p: number = 1, type: string = '') => {
    setLoading(true);
    const params = new URLSearchParams({ page: p.toString(), limit: '20' });
    if (type) params.set('type', type);
    fetch(`/api/kitchen/demand-events?${params}`)
      .then(r => r.json())
      .then(d => {
        setEvents(d.events || []);
        setTotal(d.total || 0);
        setMonthStats(d.monthStats || {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(page, typeFilter); }, [page, typeFilter]);

  const severityColor = (s: string) => {
    if (s === 'CRITICAL') return 'bg-red-100 text-red-700';
    if (s === 'WARNING') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  const typeColor = (t: string) => {
    if (t === 'BREACH') return 'bg-red-100 text-red-700';
    if (t === 'CRITICAL') return 'bg-red-50 text-red-600';
    if (t === 'WARNING') return 'bg-yellow-100 text-yellow-700';
    if (t === 'SHED_INITIATED') return 'bg-purple-100 text-purple-700';
    if (t === 'SHED_RELEASED') return 'bg-green-100 text-green-700';
    if (t === 'PF_ALERT') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-600';
  };

  const totalEvents = Object.values(monthStats).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader title="Demand Events" subtitle="Demand warnings, breaches, and load shed actions" />

      {/* Month summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="text-xs text-gray-500 uppercase font-semibold">This Month</div>
          <div className="text-2xl font-black">{totalEvents}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xs text-gray-500 uppercase font-semibold">Warnings</div>
          <div className="text-2xl font-black text-yellow-600">{monthStats.WARNING || 0}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xs text-gray-500 uppercase font-semibold">Critical</div>
          <div className="text-2xl font-black text-red-600">{monthStats.CRITICAL || 0}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xs text-gray-500 uppercase font-semibold">Breaches</div>
          <div className="text-2xl font-black text-red-700">{monthStats.BREACH || 0}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xs text-gray-500 uppercase font-semibold">Load Sheds</div>
          <div className="text-2xl font-black text-purple-600">{monthStats.SHED_INITIATED || 0}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['', 'WARNING', 'CRITICAL', 'BREACH', 'SHED_INITIATED', 'PF_ALERT'].map(t => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`text-xs px-3 py-1.5 rounded-full border ${typeFilter === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {/* Events table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Time</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold">Severity</th>
              <th className="text-left px-4 py-3 font-semibold">Message</th>
              <th className="text-right px-4 py-3 font-semibold">Demand</th>
              <th className="text-right px-4 py-3 font-semibold">PF</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-bold ${typeColor(e.type)}`}>{e.type}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${severityColor(e.severity)}`}>{e.severity}</span></td>
                <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{e.message}</td>
                <td className="px-4 py-3 text-right font-mono">{e.demandKVA ? `${e.demandKVA.toFixed(1)} kVA` : '—'}</td>
                <td className="px-4 py-3 text-right font-mono">{e.pf ? e.pf.toFixed(3) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && !loading && <p className="text-center text-gray-400 py-8">No events found</p>}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-sm">Previous</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(page + 1)} className="btn-secondary text-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
