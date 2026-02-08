'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Shield, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { AUDIT_STATUSES, AUDIT_TYPES, FINDING_CATEGORIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [findingForm, setFindingForm] = useState({ category: 'OBSERVATION', area: '', description: '', evidence: '', recommendation: '', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadAudit = () => {
    fetch(`/api/audits/${params.id}`).then(r => r.json()).then(setAudit).finally(() => setLoading(false));
  };

  useEffect(() => { loadAudit(); }, [params.id]);

  const addFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/audits/findings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...findingForm, auditId: params.id, dueDate: findingForm.dueDate || undefined }) });
      if (res.ok) { setShowFindingForm(false); setFindingForm({ category: 'OBSERVATION', area: '', description: '', evidence: '', recommendation: '', dueDate: '' }); loadAudit(); }
    } finally { setSaving(false); }
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await fetch(`/api/audits/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadAudit();
    setUpdating(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;
  if (!audit) return <div className="text-red-600">Audit not found</div>;

  const statusInfo = AUDIT_STATUSES.find(s => s.value === audit.status);
  const typeLabel = AUDIT_TYPES.find(t => t.value === audit.type)?.label || audit.type;

  return (
    <div className="space-y-6">
      <PageHeader title={audit.title} subtitle={`${typeLabel} Audit`} action={
        <div className="flex gap-2">
          {audit.status === 'PLANNED' && <button onClick={() => updateStatus('IN_PROGRESS')} className="btn-primary" disabled={updating}>Start Audit</button>}
          {audit.status === 'IN_PROGRESS' && <button onClick={() => updateStatus('COMPLETED')} className="btn-primary" disabled={updating}>Complete Audit</button>}
          {audit.status === 'COMPLETED' && <button onClick={() => updateStatus('CLOSED')} className="btn-secondary" disabled={updating}>Close Audit</button>}
        </div>
      } />

      <Link href="/audits" className="text-sm text-brand-600 hover:underline flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to audits</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Audit Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><StatusBadge label={statusInfo?.label || audit.status} color={statusInfo?.color || 'gray'} /></dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd>{typeLabel}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Date</dt><dd>{formatDate(audit.auditDate)}</dd></div>
            {audit.leadAuditor && <div className="flex justify-between"><dt className="text-gray-500">Lead Auditor</dt><dd>{audit.leadAuditor.name}</dd></div>}
            {audit.externalAuditor && <div className="flex justify-between"><dt className="text-gray-500">External Auditor</dt><dd>{audit.externalAuditor}</dd></div>}
            {audit.nextAuditDate && <div className="flex justify-between"><dt className="text-gray-500">Next Audit</dt><dd>{formatDate(audit.nextAuditDate)}</dd></div>}
          </dl>
          {audit.scope && <div className="mt-4 pt-4 border-t"><p className="text-xs text-gray-500 mb-1">Scope</p><p className="text-sm">{audit.scope}</p></div>}
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Findings ({audit.findings?.length || 0})</h3>
            <button onClick={() => setShowFindingForm(!showFindingForm)} className="btn-secondary flex items-center gap-1 text-sm"><Plus className="h-3 w-3" /> Add Finding</button>
          </div>

          {showFindingForm && (
            <form onSubmit={addFinding} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text text-xs">Category *</label>
                  <select className="input-field py-1.5 text-sm" value={findingForm.category} onChange={e => setFindingForm(f => ({ ...f, category: e.target.value }))}>
                    {FINDING_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text text-xs">Area</label>
                  <input className="input-field py-1.5 text-sm" value={findingForm.area} onChange={e => setFindingForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g., CNC Machine Shop" />
                </div>
              </div>
              <div>
                <label className="label-text text-xs">Description *</label>
                <textarea className="input-field py-1.5 text-sm" rows={2} value={findingForm.description} onChange={e => setFindingForm(f => ({ ...f, description: e.target.value }))} required placeholder="Describe the finding" />
              </div>
              <div>
                <label className="label-text text-xs">Recommendation</label>
                <input className="input-field py-1.5 text-sm" value={findingForm.recommendation} onChange={e => setFindingForm(f => ({ ...f, recommendation: e.target.value }))} placeholder="Recommended corrective action" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text text-xs">Due Date</label>
                  <input type="date" className="input-field py-1.5 text-sm" value={findingForm.dueDate} onChange={e => setFindingForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="btn-primary text-sm" disabled={saving}>{saving ? 'Adding...' : 'Add Finding'}</button>
                  <button type="button" className="btn-secondary text-sm" onClick={() => setShowFindingForm(false)}>Cancel</button>
                </div>
              </div>
            </form>
          )}

          {audit.findings?.length === 0 ? (
            <p className="text-sm text-gray-500">No findings recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {audit.findings.map((finding: any) => {
                const catInfo = FINDING_CATEGORIES.find(c => c.value === finding.category);
                return (
                  <div key={finding.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge label={catInfo?.label || finding.category} color={catInfo?.color || 'gray'} />
                        <span className="text-xs text-gray-500">#{finding.findingNumber}</span>
                        {finding.area && <span className="text-xs text-gray-400">| {finding.area}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge label={finding.status} color={finding.status === 'CLOSED' ? 'green' : finding.status === 'IN_PROGRESS' ? 'yellow' : 'red'} />
                        {finding.capaId && <Link href={`/capa/${finding.capaId}`} className="text-xs text-brand-600 hover:underline flex items-center gap-1"><Shield className="h-3 w-3" />CAPA</Link>}
                      </div>
                    </div>
                    <p className="text-sm">{finding.description}</p>
                    {finding.recommendation && <p className="text-xs text-gray-500 mt-1">Recommendation: {finding.recommendation}</p>}
                    {finding.dueDate && <p className="text-xs text-gray-400 mt-1">Due: {formatDate(finding.dueDate)}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
