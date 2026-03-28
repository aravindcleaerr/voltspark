'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

function DemandGauge({ pct, currentKVA, contractedKVA, status }: { pct: number; currentKVA: number; contractedKVA: number; status: string }) {
  const clampedPct = Math.min(pct, 110);
  const angle = (clampedPct / 110) * 180;
  const color = status === 'CRITICAL' ? '#ef4444' : status === 'WARNING' ? '#f59e0b' : '#22c55e';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-56 h-32">
        {/* Background arc */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
        {/* Value arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * 251.33} 251.33`}
          className="transition-all duration-500"
        />
        {/* Warning marker at 80% */}
        <line x1="100" y1="20" x2="100" y2="28" stroke="#f59e0b" strokeWidth="2" transform={`rotate(${(80/110)*180 - 180}, 100, 100)`} opacity="0.5" />
        {/* Critical marker at 92% */}
        <line x1="100" y1="20" x2="100" y2="28" stroke="#ef4444" strokeWidth="2" transform={`rotate(${(92/110)*180 - 180}, 100, 100)`} opacity="0.5" />
        {/* Center text */}
        <text x="100" y="85" textAnchor="middle" className="text-3xl font-black" fill={color} fontSize="28">{pct}%</text>
        <text x="100" y="105" textAnchor="middle" fill="#6b7280" fontSize="11">{currentKVA} / {contractedKVA} kVA</text>
      </svg>
      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
        status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
        status === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
        'bg-green-100 text-green-700'
      }`}>{status}</span>
    </div>
  );
}

function StatusBadge({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-lg p-3 text-center border ${color}`}>
      <div className="text-xs text-gray-500 font-semibold uppercase">{label}</div>
      <div className="text-xl font-black mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function KitchenDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDashboard = useCallback(() => {
    fetch('/api/kitchen/dashboard')
      .then(r => {
        if (r.status === 404) { router.push('/kitchen/setup'); return null; }
        return r.json();
      })
      .then(d => { if (d) { setData(d); setLastUpdate(new Date()); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded" /></div>;
  if (!data) return null;

  const { kitchen, demand, todCurrentSlab, penaltyForecast, zones, recentEvents } = data;

  const fmtRs = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <PageHeader
        title={kitchen.name || 'Kitchen Dashboard'}
        subtitle={`${kitchen.discomCode} · ${kitchen.connectionType} · Contracted: ${kitchen.contractedDemandKVA} kVA`}
        action={
          <span className="text-xs text-gray-400">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : ''}
          </span>
        }
      />

      {/* Top row: Gauge + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex justify-center md:col-span-1">
          <DemandGauge
            pct={demand.demandPct}
            currentKVA={demand.currentKVA}
            contractedKVA={demand.contractedKVA}
            status={demand.status}
          />
        </div>
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusBadge
            label="Power Factor"
            value={demand.avgPf != null ? demand.avgPf.toFixed(3) : '—'}
            sub={demand.avgPf != null && demand.avgPf < kitchen.pfTarget ? `Below ${kitchen.pfTarget}` : `Target: ${kitchen.pfTarget}`}
            color={demand.avgPf != null && demand.avgPf < kitchen.pfTarget ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}
          />
          <StatusBadge
            label="Current Load"
            value={`${demand.currentKW} kW`}
            sub={`${demand.currentKVA} kVA`}
            color="border-gray-200 bg-white"
          />
          <StatusBadge
            label="ToD Period"
            value={todCurrentSlab?.name || 'Normal'}
            sub={todCurrentSlab ? `×${todCurrentSlab.rateMultiplier}` : ''}
            color={todCurrentSlab?.rateMultiplier > 1.1 ? 'border-red-200 bg-red-50' : todCurrentSlab?.rateMultiplier < 0.95 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}
          />
          <StatusBadge
            label="MD Penalty Forecast"
            value={fmtRs(penaltyForecast.mdPenalty)}
            sub={`Peak: ${penaltyForecast.peakDemandKVA} kVA`}
            color={penaltyForecast.mdPenalty > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}
          />
        </div>
      </div>

      {/* Zone Monitor */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Zone Monitor</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {zones.map((z: any) => (
            <div key={z.id} className={`card p-3 border-l-4 ${
              z.currentKW == null ? 'border-l-gray-300' :
              z.haccpEnabled && z.haccpOk === false ? 'border-l-red-500' :
              z.currentKW > (z.maxLoadKW || 999) * 0.9 ? 'border-l-yellow-500' :
              'border-l-green-500'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm">{z.name}</div>
                  <div className="text-xs text-gray-400">{z.zoneType.replace(/_/g, ' ')}</div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                  z.priorityTier === 1 ? 'bg-red-100 text-red-700' :
                  z.priorityTier === 3 ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>T{z.priorityTier}</span>
              </div>
              <div className="mt-2 text-2xl font-black">
                {z.currentKW != null ? `${z.currentKW.toFixed(1)} kW` : 'Offline'}
              </div>
              {z.haccpEnabled && z.temperature != null && (
                <div className={`text-xs mt-1 ${z.haccpOk ? 'text-green-600' : 'text-red-600 font-bold'}`}>
                  🌡 {z.temperature.toFixed(1)}°C
                </div>
              )}
              {z.currentPF != null && (
                <div className="text-xs text-gray-400 mt-0.5">PF: {z.currentPF.toFixed(3)}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events + Load Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Recent Alerts (24h)</h3>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No alerts today</p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((e: any) => (
                <div key={e.id} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    e.severity === 'CRITICAL' ? 'bg-red-500' : e.severity === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <span className="text-gray-700">{e.message}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(e.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Load Control</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Auto-shedding</span>
              <span className={`text-sm font-bold ${kitchen.autoShedEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                {kitchen.autoShedEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Tier 3 shed at {kitchen.warningThresholdPct || 80}% demand</div>
              <div>Tier 2 shed at {kitchen.criticalThresholdPct || 92}% demand</div>
            </div>
            <button onClick={() => router.push('/kitchen/load-management')} className="btn-secondary text-sm w-full">
              Configure Load Management
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
