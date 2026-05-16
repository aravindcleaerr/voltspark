'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, Plus, Cpu, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

interface Template {
  key: string;
  name: string;
  category: string;
  cycleStructure: string;
  recommendedMeterTier: string;
  ratedPowerMinKw: number | null;
  ratedPowerMaxKw: number | null;
  criticalityDefault: string;
  primaryWasteMode: string | null;
}

interface EnergySource {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  templateKey: string;
  assetCategory: string;
  criticality: string;
  ratedPowerKw: number | null;
  reconcileStatus: string;
  isActive: boolean;
  energySource: { id: string; name: string } | null;
}

const CRIT_COLOR: Record<string, string> = {
  critical: 'red', important: 'orange', standard: 'blue', 'non-critical': 'gray',
};
const RECONCILE: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  OK: { color: 'green', label: 'Verified', icon: CheckCircle2 },
  DRIFT: { color: 'orange', label: 'Drift detected', icon: AlertTriangle },
  UNVERIFIED: { color: 'gray', label: 'Unverified', icon: HelpCircle },
};

export default function AssetsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sources, setSources] = useState<EnergySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    templateKey: '', name: '', energySourceId: '',
    manufacturer: '', model: '', yearInstalled: '', ratedPowerKw: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/assets').then(r => r.json()),
      fetch('/api/asset-templates?bundle=MANUFACTURING').then(r => r.json()),
      fetch('/api/energy-sources').then(r => r.json()),
    ]).then(([p, t, s]) => {
      setProfiles(Array.isArray(p) ? p : []);
      setTemplates(Array.isArray(t) ? t : []);
      setSources(Array.isArray(s) ? s : []);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const selectedTemplate = templates.find(t => t.key === form.templateKey);

  const submit = async () => {
    setSaving(true);
    setError('');
    const body: Record<string, unknown> = { templateKey: form.templateKey, name: form.name.trim() };
    if (form.energySourceId) body.energySourceId = form.energySourceId;
    if (form.manufacturer) body.manufacturer = form.manufacturer.trim();
    if (form.model) body.model = form.model.trim();
    if (form.yearInstalled) body.yearInstalled = Number(form.yearInstalled);
    if (form.ratedPowerKw) body.ratedPowerKw = Number(form.ratedPowerKw);

    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      router.push(`/assets/${created.id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not create asset');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  const drifting = profiles.filter(p => p.reconcileStatus === 'DRIFT').length;
  const verified = profiles.filter(p => p.reconcileStatus === 'OK').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        subtitle="The Asset Context Profile for each machine — what the meter is looking at, how it should run, and what failure costs. Every smart alert and report reads from here."
        action={
          <button onClick={() => { setShowNew(!showNew); setError(''); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> {showNew ? 'Cancel' : 'Add Asset'}
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card"><p className="text-2xl font-bold">{profiles.length}</p><p className="text-xs text-gray-500">Asset profiles</p></div>
        <div className="card"><p className="text-2xl font-bold text-green-600">{verified}</p><p className="text-xs text-gray-500">Verified context</p></div>
        <div className="card"><p className="text-2xl font-bold text-orange-600">{drifting}</p><p className="text-xs text-gray-500">Drift detected</p></div>
        <div className="card"><p className="text-2xl font-bold">{templates.length}</p><p className="text-xs text-gray-500">Library templates</p></div>
      </div>

      {showNew && (
        <div className="card border-2 border-brand-200 bg-brand-50 space-y-3">
          <h3 className="font-semibold">Onboard an asset</h3>
          <p className="text-xs text-gray-500 -mt-1">
            Pick the closest equipment type — the profile is pre-filled with that machine&apos;s design-intent defaults, then you tune it.
          </p>
          {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text">Equipment type *</label>
              <select className="input-field" value={form.templateKey} onChange={e => setForm({ ...form, templateKey: e.target.value })}>
                <option value="">— select from the library —</option>
                {templates.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Asset name *</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wire-cut EDM #1" />
            </div>
            <div>
              <label className="label-text">Meter / energy source</label>
              <select className="input-field" value={form.energySourceId} onChange={e => setForm({ ...form, energySourceId: e.target.value })}>
                <option value="">— not linked yet —</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Rated power (kW)</label>
              <input className="input-field" type="number" step="any" value={form.ratedPowerKw} onChange={e => setForm({ ...form, ratedPowerKw: e.target.value })}
                placeholder={selectedTemplate?.ratedPowerMinKw != null ? `library: ${selectedTemplate.ratedPowerMinKw}–${selectedTemplate.ratedPowerMaxKw} kW` : 'optional'} />
            </div>
            <div>
              <label className="label-text">Manufacturer</label>
              <input className="input-field" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} placeholder="e.g. BFW, Haas" />
            </div>
            <div>
              <label className="label-text">Model</label>
              <input className="input-field" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Year installed</label>
              <input className="input-field" type="number" value={form.yearInstalled} onChange={e => setForm({ ...form, yearInstalled: e.target.value })} placeholder="optional" />
            </div>
          </div>
          {selectedTemplate && (
            <div className="bg-white border border-brand-200 rounded-lg p-3 text-xs space-y-1">
              <p className="font-medium text-gray-700">{selectedTemplate.name} — design-intent defaults</p>
              <p className="text-gray-500">
                {selectedTemplate.cycleStructure} cycle · recommended meter tier: <span className="font-medium">{selectedTemplate.recommendedMeterTier}</span> · default criticality: {selectedTemplate.criticalityDefault}
              </p>
              {selectedTemplate.primaryWasteMode && <p className="text-gray-500">Primary waste mode: {selectedTemplate.primaryWasteMode}</p>}
            </div>
          )}
          <button onClick={submit} disabled={saving || !form.templateKey || !form.name.trim()} className="btn-primary text-sm">
            {saving ? 'Creating…' : 'Create asset profile'}
          </button>
        </div>
      )}

      {profiles.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No asset profiles yet"
          description="Add your machines to give every meter reading context. The profile carries design intent, the operating envelope, and what failure costs — so alerts and reports speak in ₹, not kWh."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 border-b">
              <tr>
                <th className="text-left py-2 px-3 font-medium">Asset</th>
                <th className="text-left py-2 px-3 font-medium">Type</th>
                <th className="text-left py-2 px-3 font-medium">Criticality</th>
                <th className="text-left py-2 px-3 font-medium">Meter</th>
                <th className="text-right py-2 px-3 font-medium">Rated kW</th>
                <th className="text-left py-2 px-3 font-medium">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles.map(p => {
                const rec = RECONCILE[p.reconcileStatus] ?? RECONCILE.UNVERIFIED;
                const RecIcon = rec.icon;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/assets/${p.id}`)}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-brand-500 flex-shrink-0" />
                        <span className="font-medium">{p.name}</span>
                        {!p.isActive && <span className="text-xs text-gray-400">(inactive)</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600">{p.templateKey}</td>
                    <td className="py-3 px-3"><StatusBadge label={p.criticality} color={CRIT_COLOR[p.criticality] ?? 'gray'} /></td>
                    <td className="py-3 px-3 text-xs text-gray-600">
                      {p.energySource ? (
                        <span className="inline-flex items-center gap-1"><Cpu className="h-3 w-3 text-gray-400" />{p.energySource.name}</span>
                      ) : (
                        <span className="text-gray-400">not linked</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-gray-600">{p.ratedPowerKw != null ? p.ratedPowerKw : '—'}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${rec.color === 'green' ? 'text-green-600' : rec.color === 'orange' ? 'text-orange-600' : 'text-gray-400'}`}>
                        <RecIcon className="h-3 w-3" /> {rec.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="card bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Boxes className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-purple-900">Why asset profiles matter</p>
            <p className="text-purple-700 mt-1">
              A meter only knows kWh. The Asset Context Profile tells VoltSpark what the meter is looking at — the machine, how it&apos;s
              supposed to run, and what a failure costs. Alerts then say &ldquo;this violates how the machine should run, here is the ₹ cost&rdquo;
              instead of just &ldquo;this is unusual.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
