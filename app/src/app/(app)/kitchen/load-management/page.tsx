'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';

export default function LoadManagementPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [autoShedEnabled, setAutoShedEnabled] = useState(false);
  const [warningThresholdPct, setWarningThresholdPct] = useState(80);
  const [criticalThresholdPct, setCriticalThresholdPct] = useState(92);
  const [shedTier3AtPct, setShedTier3AtPct] = useState(80);
  const [shedTier2AtPct, setShedTier2AtPct] = useState(92);
  const [restoreBelowPct, setRestoreBelowPct] = useState(75);

  useEffect(() => {
    fetch('/api/kitchen/load-management')
      .then(r => r.json())
      .then(d => {
        setConfig(d);
        setAutoShedEnabled(d.autoShedEnabled);
        setWarningThresholdPct(d.warningThresholdPct);
        setCriticalThresholdPct(d.criticalThresholdPct);
        setShedTier3AtPct(d.shedTier3AtPct);
        setShedTier2AtPct(d.shedTier2AtPct);
        setRestoreBelowPct(d.restoreBelowPct);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/kitchen/load-management', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoShedEnabled, warningThresholdPct, criticalThresholdPct, shedTier3AtPct, shedTier2AtPct, restoreBelowPct }),
    });
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded" /></div>;
  if (!config) return null;

  return (
    <div>
      <PageHeader title="Load Management" subtitle={`Contracted Demand: ${config.contractedDemandKVA} kVA`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Config */}
        <div className="card p-6 space-y-5">
          <h3 className="font-bold text-lg">Auto Load Shedding</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={autoShedEnabled} onChange={e => setAutoShedEnabled(e.target.checked)} className="w-5 h-5 accent-brand-600" />
            <span className="font-semibold">Enable automatic load shedding</span>
          </label>

          <div className="space-y-4">
            <div>
              <label className="label-text">Warning Threshold (%)</label>
              <input type="range" min="50" max="100" value={warningThresholdPct} onChange={e => setWarningThresholdPct(parseInt(e.target.value))} className="w-full" />
              <div className="text-sm text-gray-500">Alert at {warningThresholdPct}% ({(config.contractedDemandKVA * warningThresholdPct / 100).toFixed(1)} kVA)</div>
            </div>
            <div>
              <label className="label-text">Critical Threshold (%)</label>
              <input type="range" min="50" max="100" value={criticalThresholdPct} onChange={e => setCriticalThresholdPct(parseInt(e.target.value))} className="w-full" />
              <div className="text-sm text-gray-500">Critical at {criticalThresholdPct}% ({(config.contractedDemandKVA * criticalThresholdPct / 100).toFixed(1)} kVA)</div>
            </div>
            <div>
              <label className="label-text">Shed Tier 3 at (%)</label>
              <input type="range" min="50" max="100" value={shedTier3AtPct} onChange={e => setShedTier3AtPct(parseInt(e.target.value))} className="w-full" />
              <div className="text-sm text-gray-500">Shed T3 zones at {shedTier3AtPct}%</div>
            </div>
            <div>
              <label className="label-text">Shed Tier 2 at (%)</label>
              <input type="range" min="50" max="100" value={shedTier2AtPct} onChange={e => setShedTier2AtPct(parseInt(e.target.value))} className="w-full" />
              <div className="text-sm text-gray-500">Shed T2 zones at {shedTier2AtPct}%</div>
            </div>
            <div>
              <label className="label-text">Restore Below (%)</label>
              <input type="range" min="30" max="100" value={restoreBelowPct} onChange={e => setRestoreBelowPct(parseInt(e.target.value))} className="w-full" />
              <div className="text-sm text-gray-500">Restore zones when demand drops below {restoreBelowPct}%</div>
            </div>
          </div>

          <button onClick={save} disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Configuration'}</button>
        </div>

        {/* Zone Priority Table */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Zone Priorities</h3>
          <div className="space-y-2">
            {[1, 2, 3].map(tier => {
              const tierZones = (config.zones || []).filter((z: any) => z.priorityTier === tier);
              return (
                <div key={tier} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      tier === 1 ? 'bg-red-100 text-red-700' : tier === 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>Tier {tier}</span>
                    <span className="text-xs text-gray-500">
                      {tier === 1 ? 'Never shed — Critical loads' : tier === 2 ? 'Shed if demand is critical' : 'Shed at warning level'}
                    </span>
                  </div>
                  {tierZones.length === 0 ? (
                    <p className="text-xs text-gray-400">No zones in this tier</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tierZones.map((z: any) => (
                        <span key={z.id} className="text-xs bg-gray-50 border rounded px-2 py-1">
                          {z.name} {z.maxLoadKW ? `(${z.maxLoadKW}kW)` : ''} {z.haccpEnabled ? '🌡' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Visual threshold bar */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Demand Thresholds</h4>
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-green-200" style={{ width: `${warningThresholdPct}%` }} />
              <div className="absolute inset-y-0 bg-yellow-200" style={{ left: `${warningThresholdPct}%`, width: `${criticalThresholdPct - warningThresholdPct}%` }} />
              <div className="absolute inset-y-0 bg-red-200" style={{ left: `${criticalThresholdPct}%`, right: 0 }} />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                0% — {warningThresholdPct}% — {criticalThresholdPct}% — 100%
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Normal</span>
              <span>Warning</span>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
