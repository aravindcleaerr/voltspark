'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { Wind, Zap, AlertTriangle, TrendingDown, Plus, Gauge } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompressorData {
  compressor: { id: string; name: string; make: string | null; model: string | null; type: string; ratedPowerKW: number | null; ratedFlowM3Min: number | null; isVSD: boolean };
  stats: { totalKwh: number; totalM3: number; totalRunHours: number; avgSpecificEnergy: number | null; avgLoadPct: number | null; anomalyCount: number; estAnnualCost: number; leakCostMonthly: number; readingCount: number };
  trend: Array<{ date: string; specificEnergy: number | null; loadPercent: number | null; energyKwh: number }>;
}

interface DashboardData {
  summary: { totalMonthlyKwh: number; totalMonthlyM3: number; overallSE: number | null; totalLeakCost: number; totalAnomalies: number; compressorCount: number };
  compressors: CompressorData[];
}

function fmt(n: number): string { return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n).toLocaleString('en-IN')}`; }

export default function CADashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    fetch('/api/ca/dashboard').then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg" />)}</div></div>;

  if (!data || data.summary.compressorCount === 0) {
    return (
      <div>
        <PageHeader title="Manufacturing Intelligence" subtitle="Compressed air efficiency, machine energy profiles and leak detection" />
        <div className="card p-12 text-center">
          <Wind className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No compressors configured</h3>
          <p className="text-gray-500 mb-6">Add your compressors to start tracking specific energy and detecting leaks.</p>
          <Link href="/ca/compressors" className="btn-primary">Add Compressor</Link>
        </div>
      </div>
    );
  }

  const { summary } = data;
  const seColor = summary.overallSE && summary.overallSE > 0.15 ? 'text-red-600' : summary.overallSE && summary.overallSE > 0.12 ? 'text-amber-600' : 'text-green-600';

  return (
    <div>
      <PageHeader title="Manufacturing Intelligence" subtitle="Compressor specific energy, load factor & leak detection" action={<Link href="/ca/compressors" className="btn-secondary text-sm">Manage Compressors</Link>} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Zap className="h-3.5 w-3.5" /> Monthly Energy</div>
          <div className="text-2xl font-bold">{Math.round(summary.totalMonthlyKwh).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">kWh</span></div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Wind className="h-3.5 w-3.5" /> Air Produced</div>
          <div className="text-2xl font-bold">{Math.round(summary.totalMonthlyM3).toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">m³</span></div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Gauge className="h-3.5 w-3.5" /> Specific Energy</div>
          <div className={`text-2xl font-bold ${seColor}`}>{summary.overallSE?.toFixed(3) ?? '—'} <span className="text-sm font-normal text-gray-500">kWh/m³</span></div>
          <div className="text-xs text-gray-400">Benchmark: 0.10-0.12</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><TrendingDown className="h-3.5 w-3.5 text-red-500" /> Est. Leak Cost</div>
          <div className="text-2xl font-bold text-red-600">{fmt(summary.totalLeakCost)}<span className="text-sm font-normal text-gray-500">/mo</span></div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><AlertTriangle className="h-3.5 w-3.5" /> Anomalies</div>
          <div className="text-2xl font-bold">{summary.totalAnomalies}</div>
          <div className="text-xs text-gray-400">Last 30 days</div>
        </div>
      </div>

      {/* Per-compressor cards */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Compressors ({summary.compressorCount})</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {data.compressors.map(({ compressor, stats, trend }) => (
          <div key={compressor.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{compressor.name}</div>
                <div className="text-xs text-gray-500">{compressor.make} {compressor.model} · {compressor.type}{compressor.isVSD ? ' · VSD' : ''}</div>
              </div>
              {stats.avgSpecificEnergy !== null && (
                <div className={`text-lg font-bold ${stats.avgSpecificEnergy > 0.15 ? 'text-red-600' : stats.avgSpecificEnergy > 0.12 ? 'text-amber-600' : 'text-green-600'}`}>
                  {stats.avgSpecificEnergy.toFixed(3)} <span className="text-xs font-normal text-gray-500">kWh/m³</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm mb-3">
              <div><span className="text-gray-500 text-xs">Energy</span><div className="font-semibold">{Math.round(stats.totalKwh)} kWh</div></div>
              <div><span className="text-gray-500 text-xs">Air</span><div className="font-semibold">{Math.round(stats.totalM3)} m³</div></div>
              <div><span className="text-gray-500 text-xs">Load</span><div className={`font-semibold ${stats.avgLoadPct !== null && stats.avgLoadPct < 50 ? 'text-amber-600' : ''}`}>{stats.avgLoadPct?.toFixed(0) ?? '—'}%</div></div>
              <div><span className="text-gray-500 text-xs">Run Hours</span><div className="font-semibold">{Math.round(stats.totalRunHours)}</div></div>
            </div>
            {stats.leakCostMonthly > 0 && (
              <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mb-3">Est. leak waste: {fmt(stats.leakCostMonthly)}/month</div>
            )}
            {trend.length > 2 && (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={trend.map(t => ({ date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), SE: t.specificEnergy ? Number(t.specificEnergy.toFixed(3)) : null }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="SE" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
