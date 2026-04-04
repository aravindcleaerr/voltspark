'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Wind, Plus, Trash2 } from 'lucide-react';

interface Compressor {
  id: string;
  name: string;
  make: string | null;
  model: string | null;
  type: string;
  ratedPowerKW: number | null;
  ratedFlowM3Min: number | null;
  ratedPressureBar: number | null;
  isVSD: boolean;
  location: string | null;
  meter: { id: string; name: string } | null;
}

const COMPRESSOR_MAKES = ['ATLAS_COPCO', 'INGERSOLL_RAND', 'KAESER', 'ELGI', 'CHICAGO_PNEUMATIC', 'OTHER'];
const COMPRESSOR_TYPES = ['SCREW', 'RECIPROCATING', 'CENTRIFUGAL', 'SCROLL'];

export default function CompressorsPage() {
  const [compressors, setCompressors] = useState<Compressor[]>([]);
  const [meters, setMeters] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', make: 'ELGI', model: '', type: 'SCREW', ratedPowerKW: '', ratedFlowM3Min: '', ratedPressureBar: '7', isVSD: false, location: '', meterId: '' });

  const fetchData = () => {
    Promise.all([
      fetch('/api/ca/compressors').then(r => r.json()),
      fetch('/api/iot/meters').then(r => r.ok ? r.json() : []),
    ]).then(([c, m]) => { setCompressors(Array.isArray(c) ? c : []); setMeters(Array.isArray(m) ? m : []); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/ca/compressors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); setForm({ name: '', make: 'ELGI', model: '', type: 'SCREW', ratedPowerKW: '', ratedFlowM3Min: '', ratedPressureBar: '7', isVSD: false, location: '', meterId: '' }); fetchData(); }
    setSaving(false);
  };

  const deleteCompressor = async (id: string) => {
    if (!confirm('Deactivate this compressor?')) return;
    await fetch(`/api/ca/compressors/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;

  return (
    <div>
      <PageHeader title="Compressors" subtitle="Manage compressed air equipment" action={<button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Compressor</button>} />

      {showForm && (
        <form onSubmit={handleSubmit} className="card border-2 border-brand-200 mb-6">
          <h3 className="font-semibold mb-4">Add Compressor</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><label className="label-text">Name *</label><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Compressor 1 — Atlas Copco GA75" required /></div>
            <div><label className="label-text">Make</label><select className="input-field" value={form.make} onChange={e => setForm(p => ({ ...p, make: e.target.value }))}>{COMPRESSOR_MAKES.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}</select></div>
            <div><label className="label-text">Model</label><input className="input-field" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="e.g. GA75 VSD+" /></div>
            <div><label className="label-text">Type</label><select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>{COMPRESSOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="label-text">Rated Power (kW)</label><input className="input-field" type="number" value={form.ratedPowerKW} onChange={e => setForm(p => ({ ...p, ratedPowerKW: e.target.value }))} placeholder="e.g. 75" /></div>
            <div><label className="label-text">Rated Flow (m³/min)</label><input className="input-field" type="number" step="0.1" value={form.ratedFlowM3Min} onChange={e => setForm(p => ({ ...p, ratedFlowM3Min: e.target.value }))} placeholder="e.g. 12.5" /></div>
            <div><label className="label-text">Rated Pressure (bar)</label><input className="input-field" type="number" step="0.1" value={form.ratedPressureBar} onChange={e => setForm(p => ({ ...p, ratedPressureBar: e.target.value }))} /></div>
            <div><label className="label-text">Link to IoT Meter</label><select className="input-field" value={form.meterId} onChange={e => setForm(p => ({ ...p, meterId: e.target.value }))}><option value="">None</option>{meters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div><label className="label-text">Location</label><input className="input-field" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Compressor Room" /></div>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" checked={form.isVSD} onChange={e => setForm(p => ({ ...p, isVSD: e.target.checked }))} className="rounded" /> Variable Speed Drive (VSD)</label>
          <button type="submit" disabled={saving || !form.name} className="btn-primary mt-4">{saving ? 'Adding...' : 'Add Compressor'}</button>
        </form>
      )}

      {compressors.length === 0 ? (
        <div className="card p-12 text-center">
          <Wind className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No compressors yet</h3>
          <p className="text-gray-500 mt-1">Add your first compressor to start tracking efficiency</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Make / Model</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4 text-right">Power (kW)</th>
                <th className="pb-3 pr-4 text-right">Flow (m³/min)</th>
                <th className="pb-3 pr-4">IoT Meter</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {compressors.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{c.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{c.make?.replace(/_/g, ' ')} {c.model}</td>
                  <td className="py-3 pr-4">{c.type}{c.isVSD ? ' (VSD)' : ''}</td>
                  <td className="py-3 pr-4 text-right font-mono">{c.ratedPowerKW ?? '—'}</td>
                  <td className="py-3 pr-4 text-right font-mono">{c.ratedFlowM3Min ?? '—'}</td>
                  <td className="py-3 pr-4 text-gray-500">{c.meter?.name || '—'}</td>
                  <td className="py-3"><button onClick={() => deleteCompressor(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
