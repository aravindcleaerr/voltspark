'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ClipboardCheck, Calendar, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AUDIT_STATUSES, AUDIT_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audits').then(r => r.json()).then(setAudits).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
        subtitle="Internal & external energy audits (Compliance Requirement 4)"
        action={<Link href="/audits/new" className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Schedule Audit</Link>}
      />

      {audits.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No audits" description="Schedule your first energy audit." action={<Link href="/audits/new" className="btn-primary">Schedule Audit</Link>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Lead Auditor</th>
                <th className="pb-3 pr-4 text-center">Findings</th>
                <th className="pb-3">Next Audit</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit: any) => {
                const statusInfo = AUDIT_STATUSES.find(s => s.value === audit.status);
                const typeLabel = AUDIT_TYPES.find(t => t.value === audit.type)?.label || audit.type;
                return (
                  <tr key={audit.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <Link href={`/audits/${audit.id}`} className="font-medium text-brand-600 hover:underline">{audit.title}</Link>
                    </td>
                    <td className="py-3 pr-4"><StatusBadge label={typeLabel} color="blue" /></td>
                    <td className="py-3 pr-4">{formatDate(audit.auditDate)}</td>
                    <td className="py-3 pr-4"><StatusBadge label={statusInfo?.label || audit.status} color={statusInfo?.color || 'gray'} /></td>
                    <td className="py-3 pr-4">{audit.leadAuditor?.name || audit.externalAuditor || '—'}</td>
                    <td className="py-3 pr-4 text-center">
                      {audit._count?.findings > 0 ? (
                        <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-orange-500" />{audit._count.findings}</span>
                      ) : '0'}
                    </td>
                    <td className="py-3 text-gray-500">{audit.nextAuditDate ? formatDate(audit.nextAuditDate) : '—'}</td>
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
