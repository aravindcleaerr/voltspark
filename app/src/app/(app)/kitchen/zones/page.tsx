'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';

const ZONE_TYPES = ['BURNER', 'TAWA', 'FRYER', 'STOCK_POT', 'WARMER', 'UTILITY', 'CNC', 'COMPRESSOR', 'OTHER'];

interface Zone {
  id: string;
  name: string;
  zoneType: string;
  meterId: string | null;
  titanDoChannel: number | null;
  priorityTier: number;
  maxLoadKW: number | null;
  haccpEnabled: boolean;
  isActive: boolean;
  sortOrder: number;
}

export default function KitchenZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', zoneType: 'OTHER', meterId: '', priorityTier: 2, maxLoadKW: '', haccpEnabled: false });

  const fetchZones = () => {
    fetch('/api/kitchen/zones').then(r => r.json()).then(d => { if (Array.isArray(d)) setZones(d); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchZones(); }, []);

  const saveNew = async () => {
    const res = await fetch('/api/kitchen/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, maxLoadKW: form.maxLoadKW ? parseFloat(form.maxLoadKW) : undefined, meterId: form.meterId || undefined }),
    });
    if (res.ok) { setShowAdd(false); setForm({ name: '', zoneType: 'OTHER', meterId: '', priorityTier: 2, maxLoadKW: '', haccpEnabled: false }); fetchZones(); }
  };

  const updateZone = async (id: string, updates: Partial<Zone>) => {
    await fetch(`/api/kitchen/zones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    setEditing(null);
    fetchZones();
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    await fetch(`/api/kitchen/zones/${id}`, { method: 'DELETE' });
    fetchZones();
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded" /></div>;

  return (
    <div>
      <PageHeader
        title="Kitchen Zones"
        subtitle={`${zones.length} zones configured`}
        action={<button onClick={() => setShowAdd(true)} className="btn-primary text-sm">+ Add Zone</button>}
      />

      {showAdd && (
        <div className="card p-4 mb-4 border-l-4 border-l-brand-500">
          <h3 className="font-semibold mb-3">New Zone</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Zone name *" />
            <select value={form.zoneType} onChange={e => setForm({ ...form, zoneType: e.target.value })} className="input-field">
              {ZONE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
            <input value={form.meterId} onChange={e => setForm({ ...form, meterId: e.target.value })} className="input-field" placeholder="Titan Meter ID" />
            <select value={form.priorityTier} onChange={e => setForm({ ...form, priorityTier: parseInt(e.target.value) })} className="input-field">
              <option value={1}>T1 — Never shed</option>
              <option value={2}>T2 — Shed if critical</option>
              <option value={3}>T3 — Shed at warning</option>
            </select>
            <input type="number" value={form.maxLoadKW} onChange={e => setForm({ ...form, maxLoadKW: e.target.value })} className="input-field" placeholder="Max kW" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.haccpEnabled} onChange={e => setForm({ ...form, haccpEnabled: e.target.checked })} />
              HACCP Monitoring
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={saveNew} disabled={!form.name.trim()} className="btn-primary text-sm">Save</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Zone</th>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold">Meter ID</th>
              <th className="text-center px-4 py-3 font-semibold">Priority</th>
              <th className="text-right px-4 py-3 font-semibold">Max kW</th>
              <th className="text-center px-4 py-3 font-semibold">HACCP</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {zones.map((z) => (
              <tr key={z.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{z.name}</td>
                <td className="px-4 py-3 text-gray-500">{z.zoneType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 font-mono text-xs">{z.meterId || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    z.priorityTier === 1 ? 'bg-red-100 text-red-700' :
                    z.priorityTier === 3 ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>T{z.priorityTier}</span>
                </td>
                <td className="px-4 py-3 text-right">{z.maxLoadKW ? `${z.maxLoadKW} kW` : '—'}</td>
                <td className="px-4 py-3 text-center">{z.haccpEnabled ? '✓' : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deleteZone(z.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {zones.length === 0 && <p className="text-center text-gray-400 py-8">No zones configured</p>}
      </div>
    </div>
  );
}
