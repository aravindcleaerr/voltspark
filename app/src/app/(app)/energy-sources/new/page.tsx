'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { ENERGY_TYPES } from '@/lib/constants';

export default function NewEnergySourcePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', type: 'ELECTRICITY', unit: 'kWh', description: '', location: '', meterNumber: '' });

  const handleTypeChange = (type: string) => {
    const defaultUnit = ENERGY_TYPES.find(t => t.value === type)?.defaultUnit || '';
    setForm(f => ({ ...f, type, unit: defaultUnit }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/energy-sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error?.fieldErrors ? 'Validation failed' : data.error || 'Failed'); }
      router.push('/energy-sources');
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Add Energy Source" subtitle="Register a new energy source" />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label-text">Source Name *</label>
          <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g., Main Grid Supply" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Type *</label>
            <select className="input-field" value={form.type} onChange={e => handleTypeChange(e.target.value)}>
              {ENERGY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Unit *</label>
            <input className="input-field" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} required />
          </div>
        </div>
        <div>
          <label className="label-text">Description</label>
          <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Location</label>
            <input className="input-field" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Main Factory" />
          </div>
          <div>
            <label className="label-text">Meter Number</label>
            <input className="input-field" value={form.meterNumber} onChange={e => setForm(f => ({ ...f, meterNumber: e.target.value }))} placeholder="e.g., EB-001" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Source'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
