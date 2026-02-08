'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Target, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TargetsPage() {
  const [targets, setTargets] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/targets').then(r => r.json()),
      fetch('/api/energy-sources').then(r => r.json()),
    ]).then(([t, s]) => { setTargets(t); setSources(s); }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this target?')) return;
    await fetch(`/api/targets/${id}`, { method: 'DELETE' });
    setTargets(targets.filter(t => t.id !== id));
  };

  const filtered = sourceFilter ? targets.filter(t => t.energySourceId === sourceFilter) : targets;

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Targets"
        subtitle="Track targets vs actual consumption (ZED Requirement 1)"
        action={<Link href="/targets/new" className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Set Target</Link>}
      />

      <div className="flex items-center gap-4">
        <select className="input-field w-auto" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="">All Sources</option>
          {sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Target} title="No targets set" description="Define energy reduction targets." action={<Link href="/targets/new" className="btn-primary">Set Target</Link>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((target: any) => {
            const progress = target.targetValue > 0 && target.actualValue !== null ? (target.actualValue / target.targetValue) * 100 : 0;
            const overTarget = progress > 100;
            return (
              <div key={target.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{target.energySource?.name || 'Unknown'}</h3>
                    <p className="text-xs text-gray-500">{target.period} ({target.periodType})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={target.isActive ? 'Active' : 'Closed'} color={target.isActive ? 'green' : 'gray'} />
                    <button onClick={() => handleDelete(target.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div><span className="text-gray-500 block text-xs">Target</span><strong>{target.targetValue} {target.unit}</strong></div>
                  <div><span className="text-gray-500 block text-xs">Actual</span><strong>{target.actualValue ?? '—'} {target.unit}</strong></div>
                  <div><span className="text-gray-500 block text-xs">Baseline</span><strong>{target.baselineValue ?? '—'} {target.unit}</strong></div>
                </div>

                {target.actualValue !== null && target.targetValue > 0 && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${overTarget ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>
                    <p className={`text-xs mt-1 ${overTarget ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {progress.toFixed(0)}% {overTarget ? '— Over target!' : 'of target consumed'}
                    </p>
                  </div>
                )}

                {target.reductionPercent && (
                  <p className="text-xs text-blue-600 mt-2">Target reduction: {target.reductionPercent}% from baseline</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
