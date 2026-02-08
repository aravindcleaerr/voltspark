'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { AUDIT_TYPES } from '@/lib/constants';

export default function NewAuditPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', type: 'INTERNAL', auditDate: '', leadAuditorId: '', externalAuditor: '', scope: '', nextAuditDate: '' });

  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, leadAuditorId: form.leadAuditorId || undefined, nextAuditDate: form.nextAuditDate || undefined };
      const res = await fetch('/api/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to schedule audit');
      router.push('/audits');
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Schedule Audit" subtitle="Plan a new energy audit" />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label-text">Audit Title *</label>
          <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g., Q1 2026 Internal Energy Audit" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Type *</label>
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {AUDIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Audit Date *</label>
            <input type="date" className="input-field" value={form.auditDate} onChange={e => setForm(f => ({ ...f, auditDate: e.target.value }))} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Lead Auditor (Internal)</label>
            <select className="input-field" value={form.leadAuditorId} onChange={e => setForm(f => ({ ...f, leadAuditorId: e.target.value }))}>
              <option value="">Select auditor</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">External Auditor</label>
            <input className="input-field" value={form.externalAuditor} onChange={e => setForm(f => ({ ...f, externalAuditor: e.target.value }))} placeholder="External auditor name" />
          </div>
        </div>
        <div>
          <label className="label-text">Scope</label>
          <textarea className="input-field" rows={3} value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} placeholder="Audit scope and areas to cover" />
        </div>
        <div>
          <label className="label-text">Next Audit Date</label>
          <input type="date" className="input-field" value={form.nextAuditDate} onChange={e => setForm(f => ({ ...f, nextAuditDate: e.target.value }))} />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Schedule Audit'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
