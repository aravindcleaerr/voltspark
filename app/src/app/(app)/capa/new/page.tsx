'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { CAPA_TYPES, CAPA_SOURCES, CAPA_PRIORITIES } from '@/lib/constants';

export default function NewCAPAPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ type: 'CORRECTIVE', source: 'INTERNAL', sourceReference: '', title: '', description: '', assignedToId: '', priority: 'MEDIUM', actionDueDate: '' });

  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, assignedToId: form.assignedToId || undefined, actionDueDate: form.actionDueDate || undefined };
      const res = await fetch('/api/capa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create CAPA');
      const data = await res.json();
      router.push(`/capa/${data.id}`);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Raise CAPA" subtitle="Create a new Corrective/Preventive Action" />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label-text">Title *</label>
          <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Brief description of the issue" />
        </div>
        <div>
          <label className="label-text">Description *</label>
          <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Detailed description of the problem or concern" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Type *</label>
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {CAPA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Source *</label>
            <select className="input-field" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {CAPA_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Priority *</label>
            <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {CAPA_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Source Reference</label>
            <input className="input-field" value={form.sourceReference} onChange={e => setForm(f => ({ ...f, sourceReference: e.target.value }))} placeholder="e.g., Audit finding #, deviation date" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Assigned To</label>
            <select className="input-field" value={form.assignedToId} onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))}>
              <option value="">Unassigned</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Action Due Date</label>
            <input type="date" className="input-field" value={form.actionDueDate} onChange={e => setForm(f => ({ ...f, actionDueDate: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Raise CAPA'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
