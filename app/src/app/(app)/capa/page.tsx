'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Shield, Filter } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CAPA_STATUSES, CAPA_TYPES, CAPA_PRIORITIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function CAPAPage() {
  const [capas, setCapas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetch('/api/capa').then(r => r.json()).then(setCapas).finally(() => setLoading(false));
  }, []);

  const filtered = capas.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    return true;
  });

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="CAPA Management"
        subtitle="Corrective & Preventive Actions (ZED Requirement 5)"
        action={<Link href="/capa/new" className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Raise CAPA</Link>}
      />

      <div className="card flex flex-wrap items-center gap-4">
        <Filter className="h-4 w-4 text-gray-400" />
        <select className="input-field w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {CAPA_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input-field w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {CAPA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} CAPAs</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Shield} title="No CAPAs found" description="Raise a CAPA when corrective or preventive action is needed." action={<Link href="/capa/new" className="btn-primary">Raise CAPA</Link>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">CAPA #</th>
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Priority</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Assigned To</th>
                <th className="pb-3 pr-4">Raised By</th>
                <th className="pb-3">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((capa: any) => {
                const statusInfo = CAPA_STATUSES.find(s => s.value === capa.status);
                const priorityInfo = CAPA_PRIORITIES.find(p => p.value === capa.priority);
                return (
                  <tr key={capa.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs">{capa.capaNumber}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/capa/${capa.id}`} className="font-medium text-brand-600 hover:underline">{capa.title}</Link>
                    </td>
                    <td className="py-3 pr-4"><StatusBadge label={capa.type} color={capa.type === 'CORRECTIVE' ? 'orange' : 'blue'} /></td>
                    <td className="py-3 pr-4"><StatusBadge label={priorityInfo?.label || capa.priority} color={priorityInfo?.color || 'gray'} /></td>
                    <td className="py-3 pr-4"><StatusBadge label={statusInfo?.label || capa.status} color={statusInfo?.color || 'gray'} /></td>
                    <td className="py-3 pr-4">{capa.assignedTo?.name || '—'}</td>
                    <td className="py-3 pr-4 text-gray-500">{capa.raisedBy?.name || '—'}</td>
                    <td className="py-3">{capa.actionDueDate ? formatDate(capa.actionDueDate) : '—'}</td>
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
