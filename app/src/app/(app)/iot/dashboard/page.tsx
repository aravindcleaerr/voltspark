'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { Radio, Cpu, AlertTriangle, Zap, Gauge, Activity } from 'lucide-react';

interface DashboardData {
  summary: {
    totalActivePowerKW: number;
    totalApparentPowerKVA: number;
    avgPowerFactor: number | null;
    contractedDemandKVA: number | null;
    demandPct: number | null;
    demandStatus: string;
    onlineMeters: number;
    offlineMeters: number;
    totalMeters: number;
  };
  gateways: Array<{ id: string; name: string; gatewayType: string; isOnline: boolean; lastSeenAt: string | null }>;
  meters: Array<{
    meter: { id: string; name: string; meterType: string; make: string | null; model: string | null; panelName: string | null; location: string | null; gateway: { name: string; isOnline: boolean } };
    latest: { activePowerKW: number; apparentPowerKVA: number | null; powerFactor: number | null; voltageR: number | null; voltageY: number | null; voltageB: number | null; currentR: number | null; frequencyHz: number | null; energyKwh: number | null; timestamp: string } | null;
    isReceiving: boolean;
  }>;
  recentAlerts: Array<{ id: string; type: string; severity: string; message: string; createdAt: string; meter: { name: string } | null }>;
}

export default function IoTDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    fetch('/api/iot/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg" />)}</div></div>;

  if (!data || data.summary.totalMeters === 0) {
    return (
      <div>
        <PageHeader title="IoT Dashboard" subtitle="Real-time metering overview" />
        <div className="card p-12 text-center">
          <Radio className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No IoT devices configured</h3>
          <p className="text-gray-500 mb-6">Add gateways and meters to start monitoring your energy in real-time.</p>
          <Link href="/iot/devices/new" className="btn-primary">Add Your First Device</Link>
        </div>
      </div>
    );
  }

  const { summary } = data;
  const demandColor = summary.demandStatus === 'CRITICAL' ? 'text-red-600' : summary.demandStatus === 'WARNING' ? 'text-amber-600' : 'text-green-600';

  return (
    <div>
      <PageHeader title="IoT Dashboard" subtitle="Real-time metering overview" action={<Link href="/iot/devices" className="btn-secondary text-sm">Manage Devices</Link>} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Zap className="h-4 w-4" /> Total Load</div>
          <div className="text-2xl font-bold">{summary.totalActivePowerKW.toFixed(1)} <span className="text-sm font-normal text-gray-500">kW</span></div>
          {summary.totalApparentPowerKVA > 0 && <div className="text-xs text-gray-400">{summary.totalApparentPowerKVA.toFixed(1)} kVA</div>}
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Gauge className="h-4 w-4" /> Demand</div>
          {summary.demandPct !== null ? (
            <>
              <div className={`text-2xl font-bold ${demandColor}`}>{summary.demandPct.toFixed(0)}%</div>
              <div className="text-xs text-gray-400">of {summary.contractedDemandKVA} kVA contracted</div>
            </>
          ) : (
            <div className="text-sm text-gray-400">No contract demand set</div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Activity className="h-4 w-4" /> Power Factor</div>
          <div className={`text-2xl font-bold ${summary.avgPowerFactor && summary.avgPowerFactor < 0.9 ? 'text-amber-600' : 'text-green-600'}`}>
            {summary.avgPowerFactor ? summary.avgPowerFactor.toFixed(3) : '—'}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Cpu className="h-4 w-4" /> Meters</div>
          <div className="text-2xl font-bold">{summary.onlineMeters}<span className="text-sm font-normal text-gray-500">/{summary.totalMeters}</span></div>
          <div className="text-xs text-gray-400">{summary.onlineMeters} online, {summary.offlineMeters} offline</div>
        </div>
      </div>

      {/* Meter cards */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Meter Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {data.meters.map(({ meter, latest, isReceiving }) => (
          <Link key={meter.id} href={`/iot/meters/${meter.id}`} className="card p-4 hover:ring-2 hover:ring-brand-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{meter.name}</div>
                <div className="text-xs text-gray-500">{meter.make} {meter.model} · {meter.meterType}</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isReceiving ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isReceiving ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isReceiving ? 'Live' : 'Offline'}
              </span>
            </div>
            {latest ? (
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-500 text-xs">Power</span><div className="font-semibold">{latest.activePowerKW.toFixed(1)} kW</div></div>
                <div><span className="text-gray-500 text-xs">PF</span><div className="font-semibold">{latest.powerFactor?.toFixed(3) ?? '—'}</div></div>
                <div><span className="text-gray-500 text-xs">Voltage</span><div className="font-semibold">{latest.voltageR?.toFixed(0) ?? '—'} V</div></div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">No readings yet</div>
            )}
            {meter.panelName && <div className="text-xs text-gray-400 mt-2">{meter.panelName}{meter.location ? ` · ${meter.location}` : ''}</div>}
          </Link>
        ))}
      </div>

      {/* Recent alerts */}
      {data.recentAlerts.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Alerts (24h)</h3>
          <div className="card divide-y">
            {data.recentAlerts.slice(0, 10).map(alert => (
              <div key={alert.id} className="px-4 py-3 flex items-start gap-3">
                <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                  <div className="text-xs text-gray-500">{alert.meter?.name} · {new Date(alert.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{alert.type.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
