'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Plus, MapPin, Gauge } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ENERGY_TYPES } from '@/lib/constants';

export default function EnergySourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/energy-sources')
      .then(r => r.json())
      .then(setSources)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-lg" />)}</div></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Sources"
        subtitle="Manage identified energy sources (Compliance Requirement 1)"
        action={<Link href="/energy-sources/new" className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Source</Link>}
      />

      {sources.length === 0 ? (
        <EmptyState icon={Zap} title="No energy sources" description="Start by adding your energy sources." action={<Link href="/energy-sources/new" className="btn-primary">Add Energy Source</Link>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((source) => {
            const typeLabel = ENERGY_TYPES.find(t => t.value === source.type)?.label || source.type;
            return (
              <Link key={source.id} href={`/energy-sources/${source.id}`} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 rounded-lg"><Zap className="h-5 w-5 text-yellow-600" /></div>
                    <div>
                      <h3 className="font-semibold">{source.name}</h3>
                      <p className="text-xs text-gray-500">{typeLabel}</p>
                    </div>
                  </div>
                  <StatusBadge label={source.isActive ? 'Active' : 'Inactive'} color={source.isActive ? 'green' : 'gray'} />
                </div>
                {source.description && <p className="text-sm text-gray-600 mb-3">{source.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {source.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{source.location}</span>}
                  {source.meterNumber && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />Meter: {source.meterNumber}</span>}
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  Unit: <strong>{source.unit}</strong> | Targets: <strong>{source.targets?.length || 0}</strong>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
