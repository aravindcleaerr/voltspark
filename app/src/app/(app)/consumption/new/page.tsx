'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { SHIFTS } from '@/lib/constants';

export default function NewConsumptionEntryPage() {
  const router = useRouter();
  const [sources, setSources] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ energySourceId: '', date: new Date().toISOString().split('T')[0], value: '', unit: '', shift: '', meterReading: '', previousReading: '', notes: '' });
  const [preview, setPreview] = useState<any>(null);

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

  // Simple deviation preview
  useEffect(() => {
    if (!form.energySourceId || !form.value) { setPreview(null); return; }
    const source = sources.find((s: any) => s.id === form.energySourceId);
    if (source?.targets?.length > 0) {
      const target = source.targets[0];
      const dailyTarget = target.targetValue / 30;
      const val = parseFloat(form.value);
      if (dailyTarget > 0 && !isNaN(val)) {
        const deviation = ((val - dailyTarget) / dailyTarget) * 100;
        setPreview({ deviation: deviation.toFixed(1), severity: Math.abs(deviation) > 20 ? 'CRITICAL' : Math.abs(deviation) > 10 ? 'WARNING' : 'OK', dailyTarget: dailyTarget.toFixed(1) });
      }
    }
  }, [form.energySourceId, form.value, sources]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, value: parseFloat(form.value), meterReading: form.meterReading ? parseFloat(form.meterReading) : undefined, previousReading: form.previousReading ? parseFloat(form.previousReading) : undefined };
      const res = await fetch('/api/consumption', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed'); }
      router.push('/consumption');
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Record Consumption" subtitle="Add a new consumption entry" />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Deviation Preview */}
      {preview && preview.severity !== 'OK' && (
        <div className={`border rounded-lg p-4 flex items-start gap-3 ${preview.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${preview.severity === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'}`} />
          <div>
            <p className="font-medium text-sm">{preview.severity} Deviation Detected</p>
            <p className="text-xs text-gray-600">This value deviates {preview.deviation}% from the daily target ({preview.dailyTarget} {form.unit}/day)</p>
          </div>
        </div>
      )}
      {preview && preview.severity === 'OK' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-700">Within target range ({preview.deviation}% deviation)</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Energy Source *</label>
            <select className="input-field" value={form.energySourceId} onChange={e => handleSourceChange(e.target.value)} required>
              <option value="">Select source</option>
              {sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Date *</label>
            <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-text">Consumption Value *</label>
            <input type="number" step="0.01" className="input-field" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required placeholder="0.00" />
          </div>
          <div>
            <label className="label-text">Unit</label>
            <input className="input-field bg-gray-50" value={form.unit} readOnly />
          </div>
          <div>
            <label className="label-text">Shift</label>
            <select className="input-field" value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
              <option value="">No shift</option>
              {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Meter Reading</label>
            <input type="number" step="0.01" className="input-field" value={form.meterReading} onChange={e => setForm(f => ({ ...f, meterReading: e.target.value }))} placeholder="Current reading" />
          </div>
          <div>
            <label className="label-text">Previous Reading</label>
            <input type="number" step="0.01" className="input-field" value={form.previousReading} onChange={e => setForm(f => ({ ...f, previousReading: e.target.value }))} placeholder="Previous reading" />
          </div>
        </div>
        <div>
          <label className="label-text">Notes</label>
          <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Record Entry'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
