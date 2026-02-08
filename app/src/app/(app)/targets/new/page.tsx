'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { PERIOD_TYPES } from '@/lib/constants';

export default function NewTargetPage() {
  const router = useRouter();
  const [sources, setSources] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ energySourceId: '', period: '', periodType: 'MONTHLY', targetValue: '', unit: '', baselineValue: '', reductionPercent: '', notes: '' });

  useEffect(() => {
    fetch('/api/energy-sources').then(r => r.json()).then(data => {
      setSources(data);
      if (data.length > 0) setForm(f => ({ ...f, energySourceId: data[0].id, unit: data[0].unit }));
    });
  }, []);

  const handleSourceChange = (id: string) => {
    const source = sources.find((s: any) => s.id === id);
    setForm(f => ({ ...f, energySourceId: id, unit: source?.unit || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, targetValue: parseFloat(form.targetValue), baselineValue: form.baselineValue ? parseFloat(form.baselineValue) : undefined, reductionPercent: form.reductionPercent ? parseFloat(form.reductionPercent) : undefined };
      const res = await fetch('/api/targets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create target');
      router.push('/targets');
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Set Energy Target" subtitle="Define a consumption target for an energy source" />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label-text">Energy Source *</label>
          <select className="input-field" value={form.energySourceId} onChange={e => handleSourceChange(e.target.value)} required>
            <option value="">Select source</option>
            {sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Period *</label>
            <input className="input-field" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} required placeholder="e.g., Jan 2026 or Q1 2026" />
          </div>
          <div>
            <label className="label-text">Period Type *</label>
            <select className="input-field" value={form.periodType} onChange={e => setForm(f => ({ ...f, periodType: e.target.value }))}>
              {PERIOD_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Target Value *</label>
            <input type="number" step="0.01" className="input-field" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} required placeholder="0.00" />
          </div>
          <div>
            <label className="label-text">Unit</label>
            <input className="input-field bg-gray-50" value={form.unit} readOnly />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Baseline Value</label>
            <input type="number" step="0.01" className="input-field" value={form.baselineValue} onChange={e => setForm(f => ({ ...f, baselineValue: e.target.value }))} placeholder="Previous period value" />
          </div>
          <div>
            <label className="label-text">Reduction Target (%)</label>
            <input type="number" step="0.1" className="input-field" value={form.reductionPercent} onChange={e => setForm(f => ({ ...f, reductionPercent: e.target.value }))} placeholder="e.g., 5" />
          </div>
        </div>
        <div>
          <label className="label-text">Notes</label>
          <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Target'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
