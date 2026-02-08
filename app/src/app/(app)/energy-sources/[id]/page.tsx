'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Zap, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { ENERGY_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function EnergySourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [source, setSource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/energy-sources/${params.id}`)
      .then(r => r.json())
      .then(setSource)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Deactivate this energy source?')) return;
    await fetch(`/api/energy-sources/${params.id}`, { method: 'DELETE' });
    router.push('/energy-sources');
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;
  if (!source) return <div className="text-red-600">Source not found</div>;

  const typeLabel = ENERGY_TYPES.find(t => t.value === source.type)?.label || source.type;

  return (
    <div className="space-y-6">
      <PageHeader
        title={source.name}
        subtitle={typeLabel}
        action={
          <div className="flex gap-2">
            <Link href={`/energy-sources/${params.id}/edit`} className="btn-secondary flex items-center gap-1"><Edit className="h-4 w-4" /> Edit</Link>
            <button onClick={handleDelete} className="btn-danger flex items-center gap-1"><Trash2 className="h-4 w-4" /> Deactivate</button>
          </div>
        }
      />

      <Link href="/energy-sources" className="text-sm text-brand-600 hover:underline flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to sources</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-600" /> Source Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><StatusBadge label={source.isActive ? 'Active' : 'Inactive'} color={source.isActive ? 'green' : 'gray'} /></dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd>{typeLabel}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Unit</dt><dd>{source.unit}</dd></div>
            {source.location && <div className="flex justify-between"><dt className="text-gray-500">Location</dt><dd>{source.location}</dd></div>}
            {source.meterNumber && <div className="flex justify-between"><dt className="text-gray-500">Meter Number</dt><dd>{source.meterNumber}</dd></div>}
            {source.description && <div><dt className="text-gray-500 mb-1">Description</dt><dd>{source.description}</dd></div>}
            <div className="flex justify-between"><dt className="text-gray-500">Created</dt><dd>{formatDate(source.createdAt)}</dd></div>
          </dl>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Active Targets</h3>
          {source.targets?.length > 0 ? (
            <div className="space-y-3">
              {source.targets.map((t: any) => (
                <div key={t.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.period}</span>
                    <StatusBadge label={t.periodType} color="blue" />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span>Target: <strong>{t.targetValue} {t.unit}</strong></span>
                    {t.actualValue !== null && <span>Actual: <strong>{t.actualValue} {t.unit}</strong></span>}
                  </div>
                  {t.targetValue > 0 && t.actualValue !== null && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (t.actualValue / t.targetValue) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{Math.round((t.actualValue / t.targetValue) * 100)}% of target</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active targets. <Link href="/targets/new" className="text-brand-600 hover:underline">Set a target</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}
