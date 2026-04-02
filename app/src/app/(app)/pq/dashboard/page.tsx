'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { Activity, Zap, AlertTriangle, TrendingUp, RefreshCw, BarChart3 } from 'lucide-react';

interface MeterPQ {
  meter: { id: string; name: string; meterType: string; make: string | null; model: string | null; panelName: string | null; ratedVoltage: number | null };
  latest: { complianceScore: number | null; voltageAvgMean: number | null; thdVoltageMean: number | null; pfMean: number | null; freqMean: number | null; voltageSagCount: number; voltageSwellCount: number; thdExceedanceCount: number; pfBelowTarget: number; totalReadings: number; date: string } | null;
  avgScore: number | null;
  trend: Array<{ date: string; score: number | null }>;
}

interface DashboardData {
  overallScore: number | null;
  meters: MeterPQ[];
  recentEvents: Array<{ id: string; type: string; severity: string; message: string; createdAt: string; meter: { name: string } }>;
  eventCounts: Array<{ type: string; count: number }>;
}

function ScoreGauge({ score, size = 'lg' }: { score: number | null; size?: 'sm' | 'lg' }) {
  if (score === null) return <span className="text-gray-400 text-sm">No data</span>;
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
  const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-amber-100' : 'bg-red-100';
  return (
    <div className={`inline-flex items-center justify-center rounded-full ${bgColor} ${size === 'lg' ? 'w-20 h-20' : 'w-12 h-12'}`}>
      <span className={`font-bold ${color} ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>{score}</span>
    </div>
  );
}

export default function PQDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = useCallback(() => {
    fetch('/api/pq/dashboard').then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    await fetch('/api/pq/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: 7 }) });
    fetchData();
    setAnalyzing(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg" />)}</div></div>;

  const hasData = data && data.meters.some(m => m.latest);

  return (
    <div>
      <PageHeader title="Power Quality" subtitle="EN 50160 compliance monitoring" action={
        <button onClick={runAnalysis} disabled={analyzing} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} /> {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      } />

      {!hasData ? (
        <div className="card p-12 text-center">
          <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No power quality data yet</h3>
          <p className="text-gray-500 mb-6">Click &quot;Run Analysis&quot; to scan your meter readings for power quality events.</p>
          <button onClick={runAnalysis} disabled={analyzing} className="btn-primary">{analyzing ? 'Analyzing...' : 'Run Analysis'}</button>
        </div>
      ) : (
        <>
          {/* Overall score + summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="card p-4 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500 mb-2">PQ Score</div>
              <ScoreGauge score={data!.overallScore} />
            </div>
            {[
              { label: 'Voltage Events', count: data!.eventCounts.filter(e => e.type.includes('VOLTAGE')).reduce((s, e) => s + e.count, 0), icon: Zap, color: 'text-amber-600' },
              { label: 'THD Events', count: data!.eventCounts.filter(e => e.type.includes('THD')).reduce((s, e) => s + e.count, 0), icon: BarChart3, color: 'text-orange-600' },
              { label: 'PF Events', count: data!.eventCounts.filter(e => e.type.includes('PF')).reduce((s, e) => s + e.count, 0), icon: Activity, color: 'text-blue-600' },
              { label: 'Total Events', count: data!.eventCounts.reduce((s, e) => s + e.count, 0), icon: AlertTriangle, color: 'text-red-600' },
            ].map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="card p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Icon className={`h-3.5 w-3.5 ${color}`} /> {label}</div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-gray-400">Last 7 days</div>
              </div>
            ))}
          </div>

          {/* Per-meter cards */}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Meter Power Quality</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data!.meters.map(({ meter, latest, avgScore }) => (
              <div key={meter.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{meter.name}</div>
                    <div className="text-xs text-gray-500">{meter.make} {meter.model} · {meter.meterType}</div>
                  </div>
                  <ScoreGauge score={avgScore} size="sm" />
                </div>
                {latest ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500 text-xs">Voltage</span><div className="font-semibold">{latest.voltageAvgMean?.toFixed(0) ?? '—'} V</div></div>
                    <div><span className="text-gray-500 text-xs">THD (V)</span><div className={`font-semibold ${(latest.thdVoltageMean || 0) > 8 ? 'text-red-600' : ''}`}>{latest.thdVoltageMean?.toFixed(1) ?? '—'}%</div></div>
                    <div><span className="text-gray-500 text-xs">PF</span><div className={`font-semibold ${(latest.pfMean || 1) < 0.9 ? 'text-amber-600' : ''}`}>{latest.pfMean?.toFixed(3) ?? '—'}</div></div>
                    <div><span className="text-gray-500 text-xs">Freq</span><div className="font-semibold">{latest.freqMean?.toFixed(2) ?? '—'} Hz</div></div>
                    <div className="col-span-2 pt-2 border-t text-xs text-gray-500 flex justify-between">
                      <span>{latest.voltageSagCount} sags, {latest.voltageSwellCount} swells</span>
                      <span>{latest.totalReadings} readings</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No PQ data. Run analysis.</div>
                )}
              </div>
            ))}
          </div>

          {/* Recent events */}
          {data!.recentEvents.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent PQ Events (48h)</h3>
                <Link href="/pq/events" className="text-sm text-brand-600 hover:underline">View all</Link>
              </div>
              <div className="card divide-y">
                {data!.recentEvents.slice(0, 10).map(event => (
                  <div key={event.id} className="px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${event.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{event.message}</div>
                      <div className="text-xs text-gray-500">{event.meter?.name} · {new Date(event.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${event.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{event.type.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
