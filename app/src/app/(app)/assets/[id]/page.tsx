'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Boxes, ArrowLeft, Save, Trash2, Cpu, Gauge, Target, AlertOctagon,
  CheckCircle2, AlertTriangle, HelpCircle, BookOpen,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { KPI_LABELS, PAIN_CURRENCIES, REPORT_AUDIENCES } from '@/lib/acp';

interface PowerState { state: string; label?: string; expectedKwPctRange: number[] }
interface FailureMode { key: string; label: string; currency?: string; unitCost?: number; costModel?: string }
interface Template {
  key: string; name: string; version: number;
  primaryKpis: string[];
  failureModes: FailureMode[];
  recommendedMeterTier: string;
  cycleStructure: string;
}
interface Profile {
  id: string; name: string; templateKey: string; templateVersion: number;
  assetCategory: string; manufacturer: string | null; model: string | null;
  yearInstalled: number | null; ratedPowerKw: number | null; criticality: string;
  meteringMode: string; unitOfOutput: string | null; painCurrency: string | null;
  notes: string | null; isActive: boolean;
  reconcileStatus: string; reconcileNote: string | null;
  energySource: { id: string; name: string } | null;
  operatingEnvelope: { powerStates?: PowerState[]; pfRange?: number[]; voltageBand?: number[]; runWindow?: { shiftRef?: string; allowedOutsideShift?: boolean } };
  activeKpis: string[];
  failureModes: FailureMode[];
  reportAudiences: string[];
  template: Template | null;
  templateOutdated: boolean;
}
interface EnergySource { id: string; name: string }

const CRIT_COLOR: Record<string, string> = {
  critical: 'red', important: 'orange', standard: 'blue', 'non-critical': 'gray',
};
const RECONCILE: Record<string, { color: string; label: string; icon: typeof CheckCircle2; note: string }> = {
  OK: { color: 'green', label: 'Verified', icon: CheckCircle2, note: 'Live data matches the declared context.' },
  DRIFT: { color: 'orange', label: 'Drift detected', icon: AlertTriangle, note: 'Live data disagrees with what was entered — verify the setup.' },
  UNVERIFIED: { color: 'gray', label: 'Unverified', icon: HelpCircle, note: 'Not yet checked against live data. Reconciliation runs once readings accumulate.' },
};

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sources, setSources] = useState<EnergySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    name: '', manufacturer: '', model: '', yearInstalled: '', ratedPowerKw: '',
    criticality: 'standard', energySourceId: '', meteringMode: 'DEDICATED',
    unitOfOutput: '', painCurrency: 'cost', notes: '', isActive: true,
    activeKpis: [] as string[], reportAudiences: [] as string[],
  });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/assets/${id}`).then(r => (r.ok ? r.json() : null)),
      fetch('/api/energy-sources').then(r => r.json()),
    ]).then(([p, s]) => {
      if (!p) { setNotFound(true); return; }
      setProfile(p);
      setSources(Array.isArray(s) ? s : []);
      setForm({
        name: p.name ?? '',
        manufacturer: p.manufacturer ?? '',
        model: p.model ?? '',
        yearInstalled: p.yearInstalled != null ? String(p.yearInstalled) : '',
        ratedPowerKw: p.ratedPowerKw != null ? String(p.ratedPowerKw) : '',
        criticality: p.criticality ?? 'standard',
        energySourceId: p.energySource?.id ?? '',
        meteringMode: p.meteringMode ?? 'DEDICATED',
        unitOfOutput: p.unitOfOutput ?? '',
        painCurrency: p.painCurrency ?? 'cost',
        notes: p.notes ?? '',
        isActive: p.isActive ?? true,
        activeKpis: Array.isArray(p.activeKpis) ? p.activeKpis : [],
        reportAudiences: Array.isArray(p.reportAudiences) ? p.reportAudiences : [],
      });
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  const toggle = (field: 'activeKpis' | 'reportAudiences', value: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value],
    }));
  };

  const save = async () => {
    setSaving(true);
    const body = {
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim() || null,
      model: form.model.trim() || null,
      yearInstalled: form.yearInstalled ? Number(form.yearInstalled) : null,
      ratedPowerKw: form.ratedPowerKw ? Number(form.ratedPowerKw) : null,
      criticality: form.criticality,
      energySourceId: form.energySourceId || null,
      meteringMode: form.meteringMode,
      unitOfOutput: form.unitOfOutput.trim() || null,
      painCurrency: form.painCurrency,
      notes: form.notes.trim() || null,
      isActive: form.isActive,
      activeKpis: form.activeKpis,
      reportAudiences: form.reportAudiences,
    };
    const res = await fetch(`/api/assets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) load();
  };

  const remove = async () => {
    if (!confirm('Delete this asset profile? This cannot be undone.')) return;
    const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/assets');
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (notFound || !profile) {
    return (
      <div className="space-y-4">
        <Link href="/assets" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back to assets</Link>
        <div className="card text-center py-12 text-gray-500">Asset profile not found.</div>
      </div>
    );
  }

  const rec = RECONCILE[profile.reconcileStatus] ?? RECONCILE.UNVERIFIED;
  const RecIcon = rec.icon;
  const ratedKw = form.ratedPowerKw ? Number(form.ratedPowerKw) : null;
  const powerStates = profile.operatingEnvelope?.powerStates ?? [];
  // KPI candidates = template's recommended set ∪ whatever is already active.
  const kpiCandidates = Array.from(new Set([...(profile.template?.primaryKpis ?? []), ...form.activeKpis]));

  return (
    <div className="space-y-6">
      <Link href="/assets" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back to assets</Link>

      <PageHeader
        title={profile.name}
        subtitle={`${profile.template?.name ?? profile.templateKey} · ${profile.assetCategory}`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={remove} className="btn-secondary flex items-center gap-2 text-sm text-red-600">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button onClick={save} disabled={saving || !form.name.trim()} className="btn-primary flex items-center gap-2 text-sm">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={form.criticality} color={CRIT_COLOR[form.criticality] ?? 'gray'} />
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${rec.color === 'green' ? 'bg-green-100 text-green-700' : rec.color === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
          <RecIcon className="h-3 w-3" /> {rec.label}
        </span>
        {profile.templateOutdated && (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            <BookOpen className="h-3 w-3" /> Library template updated since onboarding
          </span>
        )}
      </div>

      {/* Design intent */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-brand-500" /><h3 className="font-semibold">Design intent</h3></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="label-text">Asset name</label>
            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Manufacturer</label>
            <input className="input-field" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Model</label>
            <input className="input-field" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Year installed</label>
            <input className="input-field" type="number" value={form.yearInstalled} onChange={e => setForm({ ...form, yearInstalled: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Rated power (kW)</label>
            <input className="input-field" type="number" step="any" value={form.ratedPowerKw} onChange={e => setForm({ ...form, ratedPowerKw: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Criticality</label>
            <select className="input-field" value={form.criticality} onChange={e => setForm({ ...form, criticality: e.target.value })}>
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="standard">Standard</option>
              <option value="non-critical">Non-critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Linkage */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-brand-500" /><h3 className="font-semibold">Metering linkage</h3></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label-text">Meter / energy source</label>
            <select className="input-field" value={form.energySourceId} onChange={e => setForm({ ...form, energySourceId: e.target.value })}>
              <option value="">— not linked —</option>
              {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Metering mode</label>
            <select className="input-field" value={form.meteringMode} onChange={e => setForm({ ...form, meteringMode: e.target.value })}>
              <option value="DEDICATED">Dedicated — one meter, this asset only</option>
              <option value="BAY_SHARED">Bay-shared — one meter, several assets</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business context */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2"><Target className="h-4 w-4 text-brand-500" /><h3 className="font-semibold">Business context</h3></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label-text">Unit of output</label>
            <input className="input-field" value={form.unitOfOutput} onChange={e => setForm({ ...form, unitOfOutput: e.target.value })} placeholder="e.g. part, job, batch" />
          </div>
          <div>
            <label className="label-text">Pain currency — what failure costs are measured in</label>
            <select className="input-field" value={form.painCurrency} onChange={e => setForm({ ...form, painCurrency: e.target.value })}>
              {PAIN_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label-text">Active KPIs — what the dashboard leads with for this asset</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {kpiCandidates.length === 0 && <span className="text-xs text-gray-400">No KPIs defined for this template.</span>}
            {kpiCandidates.map(k => {
              const on = form.activeKpis.includes(k);
              return (
                <button key={k} type="button" onClick={() => toggle('activeKpis', k)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${on ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'}`}>
                  {KPI_LABELS[k] ?? k}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label-text">Report audiences — who reports about this asset are shaped for</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {REPORT_AUDIENCES.map(a => {
              const on = form.reportAudiences.includes(a);
              return (
                <button key={a} type="button" onClick={() => toggle('reportAudiences', a)}
                  className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-colors ${on ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'}`}>
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operating envelope — design-intent, read-only for now */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-brand-500" /><h3 className="font-semibold">Operating envelope</h3></div>
        <p className="text-xs text-gray-500 -mt-1">The &ldquo;good&rdquo; band, seeded from the equipment library. The alert engine compares live readings against this.</p>
        {powerStates.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 border-b">
                <tr>
                  <th className="text-left py-1.5 px-2 font-medium">State</th>
                  <th className="text-left py-1.5 px-2 font-medium">Description</th>
                  <th className="text-right py-1.5 px-2 font-medium">Expected power</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {powerStates.map(ps => (
                  <tr key={ps.state}>
                    <td className="py-1.5 px-2 font-medium">{ps.state}</td>
                    <td className="py-1.5 px-2 text-xs text-gray-500">{ps.label ?? '—'}</td>
                    <td className="py-1.5 px-2 text-right text-xs text-gray-600">
                      {ps.expectedKwPctRange?.[0]}–{ps.expectedKwPctRange?.[1]}%
                      {ratedKw != null && (
                        <span className="text-gray-400"> ({Math.round(ratedKw * (ps.expectedKwPctRange?.[0] ?? 0) / 100 * 10) / 10}–{Math.round(ratedKw * (ps.expectedKwPctRange?.[1] ?? 0) / 100 * 10) / 10} kW)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Power factor band</p>
            <p className="font-medium">{profile.operatingEnvelope?.pfRange ? `${profile.operatingEnvelope.pfRange[0]} – ${profile.operatingEnvelope.pfRange[1]}` : '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Voltage band (V)</p>
            <p className="font-medium">{profile.operatingEnvelope?.voltageBand ? `${profile.operatingEnvelope.voltageBand[0]} – ${profile.operatingEnvelope.voltageBand[1]}` : '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Run window</p>
            <p className="font-medium">
              {profile.operatingEnvelope?.runWindow
                ? `Shift ${profile.operatingEnvelope.runWindow.shiftRef ?? '—'}${profile.operatingEnvelope.runWindow.allowedOutsideShift ? ' · off-shift OK' : ''}`
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Failure modes */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2"><AlertOctagon className="h-4 w-4 text-brand-500" /><h3 className="font-semibold">Failure cost model</h3></div>
        <p className="text-xs text-gray-500 -mt-1">How this asset turns physics into ₹/risk — the basis for what an alert says it costs.</p>
        {profile.failureModes.length === 0 ? (
          <p className="text-xs text-gray-400">No failure modes defined for this template.</p>
        ) : (
          <div className="divide-y">
            {profile.failureModes.map(fm => (
              <div key={fm.key} className="py-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{fm.label}</p>
                  <p className="text-xs text-gray-400">{fm.costModel ?? (fm.unitCost != null ? `₹${fm.unitCost.toLocaleString('en-IN')} per occurrence` : '—')}</p>
                </div>
                {fm.currency && <StatusBadge label={fm.currency} color="purple" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reconciliation */}
      <div className={`card ${rec.color === 'orange' ? 'bg-orange-50 border-orange-200' : rec.color === 'green' ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
        <div className="flex items-start gap-3">
          <RecIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${rec.color === 'green' ? 'text-green-600' : rec.color === 'orange' ? 'text-orange-600' : 'text-gray-400'}`} />
          <div className="text-sm">
            <p className="font-medium text-gray-900">Context reconciliation — {rec.label}</p>
            <p className="text-gray-600 mt-0.5">{profile.reconcileNote ?? rec.note}</p>
          </div>
        </div>
      </div>

      {/* Notes + active toggle */}
      <div className="card space-y-3">
        <div>
          <label className="label-text">Notes</label>
          <textarea className="input-field" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Anything else worth recording about this asset…" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
          Asset is active (uncheck if decommissioned)
        </label>
      </div>
    </div>
  );
}
