'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Snapshot {
  id: string;
  date: string;
  complianceScore: number | null;
  voltageAvgMean: number | null;
  thdVoltageMean: number | null;
  thdCurrentMean: number | null;
  pfMean: number | null;
  freqMean: number | null;
  voltageSagCount: number;
  voltageSwellCount: number;
  meter: { id: string; name: string };
}

export default function PQTrendsPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [meters, setMeters] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedMeter, setSelectedMeter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ days: String(days) });
    if (selectedMeter) params.set('meterId', selectedMeter);
    fetch(`/api/pq/trends?${params}`)
      .then(r => r.json())
      .then((data: Snapshot[]) => {
        setSnapshots(data);
        const uniqueMeters = Array.from(new Map(data.map(s => [s.meter.id, s.meter])).values());
        if (meters.length === 0) setMeters(uniqueMeters);
      })
      .finally(() => setLoading(false));
  }, [days, selectedMeter]);

  const chartData = snapshots.map(s => ({
    date: new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    'PQ Score': s.complianceScore,
    'THD V (%)': s.thdVoltageMean ? Number(s.thdVoltageMean.toFixed(1)) : null,
    'THD I (%)': s.thdCurrentMean ? Number(s.thdCurrentMean.toFixed(1)) : null,
    'PF': s.pfMean ? Number((s.pfMean * 100).toFixed(1)) : null,
    'Voltage (V)': s.voltageAvgMean ? Number(s.voltageAvgMean.toFixed(0)) : null,
    'Sags': s.voltageSagCount,
    'Swells': s.voltageSwellCount,
  }));

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;

  return (
    <div>
      <PageHeader title="PQ Trends" subtitle="Historical power quality analysis" />

      <div className="flex items-center gap-3 mb-4">
        <select className="input-field w-auto text-sm" value={selectedMeter} onChange={e => setSelectedMeter(e.target.value)}>
          <option value="">All Meters</option>
          {meters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {[7, 14, 30, 60].map(d => (
          <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 rounded text-sm ${d === days ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d}d</button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="card p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No trend data</h3>
          <p className="text-gray-500">Run PQ analysis from the dashboard to generate trend data.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Compliance Score</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="PQ Score" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">THD Voltage & Current (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="THD V (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="THD I (%)" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Power Factor (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="PF" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Average Voltage (V)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Voltage (V)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Voltage Events (Sags & Swells)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Sags" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Swells" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
