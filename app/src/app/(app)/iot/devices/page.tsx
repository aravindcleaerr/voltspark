'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { Cpu, Plus, Wifi, WifiOff, Key, ChevronRight } from 'lucide-react';

interface Gateway {
  id: string;
  name: string;
  serialNumber: string | null;
  gatewayType: string;
  make: string | null;
  protocol: string;
  ipAddress: string | null;
  location: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
  isActive: boolean;
  meters: Array<{ id: string; name: string; meterType: string; isActive: boolean }>;
  apiKeys: Array<{ id: string; name: string; keyPrefix: string; isActive: boolean; lastUsedAt: string | null }>;
}

export default function DevicesPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/iot/gateways')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGateways(data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" />{[1,2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}</div>;

  return (
    <div>
      <PageHeader title="IoT Devices" subtitle="Manage gateways and meters" action={<Link href="/iot/devices/new" className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Device</Link>} />

      {gateways.length === 0 ? (
        <div className="card p-12 text-center">
          <Cpu className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No gateways configured</h3>
          <p className="text-gray-500 mb-6">Add a gateway to start connecting your IoT meters.</p>
          <Link href="/iot/devices/new" className="btn-primary">Add Gateway</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {gateways.map(gw => (
            <Link key={gw.id} href={`/iot/devices/${gw.id}`} className="card p-5 block hover:ring-2 hover:ring-brand-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${gw.isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {gw.isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{gw.name}</div>
                    <div className="text-sm text-gray-500">{gw.gatewayType}{gw.make ? ` · ${gw.make}` : ''}{gw.serialNumber ? ` · S/N: ${gw.serialNumber}` : ''}</div>
                    {gw.location && <div className="text-xs text-gray-400 mt-0.5">{gw.location}</div>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{gw.meters.length} meter{gw.meters.length !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1"><Key className="h-3 w-3" /> {gw.apiKeys.length} key{gw.apiKeys.length !== 1 ? 's' : ''}</span>
                      <span>{gw.protocol}</span>
                      {gw.lastSeenAt && <span>Last seen: {new Date(gw.lastSeenAt).toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              {gw.meters.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {gw.meters.map(m => (
                      <span key={m.id} className="inline-flex items-center px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">{m.name} ({m.meterType})</span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
