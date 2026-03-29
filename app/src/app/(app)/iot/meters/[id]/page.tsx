'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { ArrowLeft, Zap, Activity, Gauge, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Meter {
  id: string;
  name: string;
  meterSerial: string | null;
  modbusAddress: number | null;
  make: string | null;
  model: string | null;
  meterType: string;
  ctRatio: number | null;
  panelName: string | null;
  circuitName: string | null;
  location: string | null;
  gateway: { id: string; name: string; isOnline: boolean; lastSeenAt: string | null; gatewayType: string };
  energySource: { id: string; name: string; type: string } | null;
}

interface Reading {
  id: string;
  timestamp: string;
  activePowerKW: number;
  apparentPowerKVA: number | null;
  powerFactor: number | null;
  voltageR: number | null;
  voltageY: number | null;
  voltageB: number | null;
  currentR: number | null;
  frequencyHz: number | null;
  energyKwh: number | null;
  demandKVA: number | null;
  thdVoltage: number | null;
  thdCurrent: number | null;
}

export default function MeterDetailPage() {
  const { id } = useParams();
  const [meter, setMeter] = useState<Meter | null>(null);
  const [latest, setLatest] = useState<Reading | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchData = useCallback(() => {
    const from = new Date();
    if (timeRange === '1h') from.setHours(from.getHours() - 1);
    else if (timeRange === '6h') from.setHours(from.getHours() - 6);
    else if (timeRange === '24h') from.setDate(from.getDate() - 1);
    else from.setDate(from.getDate() - 7);

    Promise.all([
      fetch(`/api/iot/meters/${id}`).then(r => r.json()),
      fetch(`/api/iot/meters/${id}/latest`).then(r => r.ok ? r.json() : null),
      fetch(`/api/iot/meters/${id}/readings?from=${from.toISOString()}&limit=500`).then(r => r.json()),
    ]).then(([m, l, r]) => {
      setMeter(m);
      setLatest(l);
      setReadings(Array.isArray(r) ? r.reverse() : []);
    }).finally(() => setLoading(false));
  }, [id, timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;
  if (!meter) return <div className="card p-8 text-center text-gray-500">Meter not found</div>;

  const chartData = readings.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    kW: r.activePowerKW,
    PF: r.powerFactor ? r.powerFactor * 100 : null,
    'V (R)': r.voltageR,
  }));

  return (
    <div>
      <PageHeader
        title={meter.name}
        subtitle={`${meter.make || ''} ${meter.model || ''} · ${meter.meterType}${meter.panelName ? ` · ${meter.panelName}` : ''}`}
        action={<Link href={`/iot/devices/${meter.gateway.id}`} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> {meter.gateway.name}</Link>}
      />

      {/* Latest reading cards */}
      {latest ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="card p-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Zap className="h-3 w-3" /> Power</div>
            <div className="text-xl font-bold">{latest.activePowerKW.toFixed(1)}<span className="text-xs font-normal text-gray-500 ml-1">kW</span></div>
          </div>
          <div className="card p-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Activity className="h-3 w-3" /> PF</div>
            <div className={`text-xl font-bold ${latest.powerFactor && latest.powerFactor < 0.9 ? 'text-amber-600' : ''}`}>{latest.powerFactor?.toFixed(3) ?? '—'}</div>
          </div>
          <div className="card p-3">
            <div className="text-xs text-gray-500 mb-1">Voltage (R/Y/B)</div>
            <div className="text-sm font-bold">{latest.voltageR?.toFixed(0) ?? '—'} / {latest.voltageY?.toFixed(0) ?? '—'} / {latest.voltageB?.toFixed(0) ?? '—'}<span className="text-xs font-normal text-gray-500 ml-1">V</span></div>
          </div>
          <div className="card p-3">
            <div className="text-xs text-gray-500 mb-1">Current (R)</div>
            <div className="text-xl font-bold">{latest.currentR?.toFixed(1) ?? '—'}<span className="text-xs font-normal text-gray-500 ml-1">A</span></div>
          </div>
          <div className="card p-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Gauge className="h-3 w-3" /> Energy</div>
            <div className="text-xl font-bold">{latest.energyKwh ? (latest.energyKwh / 1000).toFixed(1) : '—'}<span className="text-xs font-normal text-gray-500 ml-1">MWh</span></div>
          </div>
          <div className="card p-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Thermometer className="h-3 w-3" /> Freq</div>
            <div className="text-xl font-bold">{latest.frequencyHz?.toFixed(2) ?? '—'}<span className="text-xs font-normal text-gray-500 ml-1">Hz</span></div>
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center text-gray-500 mb-6">No readings received yet from this meter.</div>
      )}

      {/* Time range selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Range:</span>
        {['1h', '6h', '24h', '7d'].map(r => (
          <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 rounded text-sm ${r === timeRange ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{r}</button>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="space-y-6">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Power (kW)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="kW" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Power Factor (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="PF" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Voltage R-phase (V)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="V (R)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center text-gray-500">No readings in selected time range.</div>
      )}

      {/* Meter details */}
      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Meter Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {meter.meterSerial && <div><span className="text-gray-500">Serial:</span> <span className="font-medium">{meter.meterSerial}</span></div>}
          {meter.modbusAddress && <div><span className="text-gray-500">Modbus Addr:</span> <span className="font-medium">{meter.modbusAddress}</span></div>}
          {meter.ctRatio && <div><span className="text-gray-500">CT Ratio:</span> <span className="font-medium">{meter.ctRatio}/5A</span></div>}
          {meter.circuitName && <div><span className="text-gray-500">Circuit:</span> <span className="font-medium">{meter.circuitName}</span></div>}
          {meter.location && <div><span className="text-gray-500">Location:</span> <span className="font-medium">{meter.location}</span></div>}
          {meter.energySource && <div><span className="text-gray-500">Energy Source:</span> <Link href="/energy-sources" className="font-medium text-brand-600 hover:underline">{meter.energySource.name}</Link></div>}
          <div><span className="text-gray-500">Gateway:</span> <span className="font-medium">{meter.gateway.name} ({meter.gateway.gatewayType})</span></div>
          <div><span className="text-gray-500">Last Updated:</span> <span className="font-medium">{latest ? new Date(latest.timestamp).toLocaleString('en-IN') : 'Never'}</span></div>
        </div>
      </div>
    </div>
  );
}
