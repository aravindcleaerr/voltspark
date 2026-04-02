'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, BarChart3, AlertTriangle, Filter, Radio, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

export default function ConsumptionPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('');
  const [deviationFilter, setDeviationFilter] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ created: number; skipped: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/consumption').then(r => r.json()),
      fetch('/api/energy-sources').then(r => r.json()),
    ]).then(([e, s]) => { setEntries(e); setSources(s); }).finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(e => {
    if (sourceFilter && e.energySourceId !== sourceFilter) return false;
    if (deviationFilter === 'yes' && !e.hasDeviation) return false;
    if (deviationFilter === 'no' && e.hasDeviation) return false;
    return true;
  });

  const syncIoTData = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/iot/aggregate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: 7 }) });
      if (res.ok) {
        const data = await res.json();
        setSyncResult({ created: data.created, skipped: data.skipped });
        // Refresh entries
        const entries = await fetch('/api/consumption').then(r => r.json());
        setEntries(entries);
      }
    } catch {}
    setSyncing(false);
  };

  const isIoTEntry = (entry: any) => entry.notes?.startsWith('IOT_AUTO');

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consumption Log"
        subtitle="Monitor energy consumption and deviations (Compliance Requirement 2)"
        action={
          <div className="flex items-center gap-2">
            <button onClick={syncIoTData} disabled={syncing} className="btn-secondary flex items-center gap-2 text-sm"><RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} /> Sync IoT</button>
            <Link href="/consumption/new" className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Record Entry</Link>
          </div>
        }
      />

      {/* Sync result */}
      {syncResult && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
          <span>IoT sync complete: {syncResult.created} entries created, {syncResult.skipped} skipped</span>
          <button onClick={() => setSyncResult(null)} className="text-green-500 hover:text-green-700">&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-4">
        <Filter className="h-4 w-4 text-gray-400" />
        <select className="input-field w-auto" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="">All Sources</option>
          {sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="input-field w-auto" value={deviationFilter} onChange={e => setDeviationFilter(e.target.value)}>
          <option value="">All Entries</option>
          <option value="yes">Deviations Only</option>
          <option value="no">No Deviations</option>
        </select>
        <span className="text-sm text-gray-500">{filtered.length} entries</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BarChart3} title="No consumption entries" description="Start recording daily consumption." action={<Link href="/consumption/new" className="btn-primary">Record Entry</Link>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3 pr-4 text-right">Value</th>
                <th className="pb-3 pr-4">Shift</th>
                <th className="pb-3 pr-4">Deviation</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry: any) => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4">{formatDate(entry.date)}</td>
                  <td className="py-3 pr-4 font-medium">
                    <span className="flex items-center gap-1.5">
                      {entry.energySource?.name || 'Unknown'}
                      {isIoTEntry(entry) && <span title="IoT Auto"><Radio className="h-3 w-3 text-brand-500" /></span>}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono">{entry.value} {entry.unit}</td>
                  <td className="py-3 pr-4">{entry.shift || '—'}</td>
                  <td className="py-3 pr-4">
                    {entry.hasDeviation ? (
                      <StatusBadge
                        label={`${entry.deviationPercent?.toFixed(1)}%`}
                        color={entry.deviationSeverity === 'CRITICAL' ? 'red' : 'yellow'}
                      />
                    ) : (
                      <span className="text-green-600 text-xs">OK</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-500 text-xs max-w-[200px] truncate">{entry.deviationNote || entry.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
