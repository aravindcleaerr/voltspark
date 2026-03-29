'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { Wifi, WifiOff, Key, Plus, Trash2, Copy, Check, ArrowLeft } from 'lucide-react';

interface Gateway {
  id: string;
  name: string;
  serialNumber: string | null;
  gatewayType: string;
  make: string | null;
  protocol: string;
  ipAddress: string | null;
  location: string | null;
  mqttBrokerUrl: string | null;
  mqttTopicPrefix: string | null;
  pushIntervalSeconds: number;
  isOnline: boolean;
  lastSeenAt: string | null;
  meters: Array<{ id: string; name: string; meterSerial: string | null; modbusAddress: number | null; make: string | null; model: string | null; meterType: string; isActive: boolean }>;
  apiKeys: Array<{ id: string; name: string; keyPrefix: string; isActive: boolean; lastUsedAt: string | null; createdAt: string }>;
}

export default function GatewayDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchGateway = () => {
    fetch(`/api/iot/gateways/${id}`).then(r => r.json()).then(setGateway).finally(() => setLoading(false));
  };

  useEffect(() => { fetchGateway(); }, [id]);

  const generateKey = async () => {
    setGenerating(true);
    const res = await fetch(`/api/iot/gateways/${id}/api-keys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `Key ${(gateway?.apiKeys.length || 0) + 1}` }) });
    if (res.ok) { const data = await res.json(); setNewKey(data.fullKey); fetchGateway(); }
    setGenerating(false);
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('Revoke this API key? The gateway will no longer be able to push data with it.')) return;
    await fetch(`/api/iot/gateways/${id}/api-keys/${keyId}`, { method: 'DELETE' });
    fetchGateway();
  };

  const deleteGateway = async () => {
    if (!confirm('Deactivate this gateway and all its meters?')) return;
    await fetch(`/api/iot/gateways/${id}`, { method: 'DELETE' });
    router.push('/iot/devices');
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;
  if (!gateway) return <div className="card p-8 text-center text-gray-500">Gateway not found</div>;

  return (
    <div>
      <PageHeader
        title={gateway.name}
        subtitle={`${gateway.gatewayType}${gateway.make ? ` · ${gateway.make}` : ''}${gateway.serialNumber ? ` · S/N: ${gateway.serialNumber}` : ''}`}
        action={<Link href="/iot/devices" className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> All Devices</Link>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gateway info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              {gateway.isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-gray-400" />}
              Status: {gateway.isOnline ? 'Online' : 'Offline'}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Protocol:</span> <span className="font-medium">{gateway.protocol}</span></div>
              <div><span className="text-gray-500">Push Interval:</span> <span className="font-medium">{gateway.pushIntervalSeconds}s</span></div>
              {gateway.ipAddress && <div><span className="text-gray-500">IP:</span> <span className="font-medium">{gateway.ipAddress}</span></div>}
              {gateway.location && <div><span className="text-gray-500">Location:</span> <span className="font-medium">{gateway.location}</span></div>}
              {gateway.mqttBrokerUrl && <div className="col-span-2"><span className="text-gray-500">MQTT Broker:</span> <span className="font-medium font-mono text-xs">{gateway.mqttBrokerUrl}</span></div>}
              {gateway.mqttTopicPrefix && <div className="col-span-2"><span className="text-gray-500">Topic Prefix:</span> <span className="font-medium font-mono text-xs">{gateway.mqttTopicPrefix}</span></div>}
              {gateway.lastSeenAt && <div className="col-span-2"><span className="text-gray-500">Last Seen:</span> <span className="font-medium">{new Date(gateway.lastSeenAt).toLocaleString('en-IN')}</span></div>}
            </div>
          </div>

          {/* Meters */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Meters ({gateway.meters.length})</h3>
            </div>
            {gateway.meters.length === 0 ? (
              <p className="text-sm text-gray-500">No meters connected to this gateway.</p>
            ) : (
              <div className="divide-y">
                {gateway.meters.map(m => (
                  <Link key={m.id} href={`/iot/meters/${m.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-5 px-5 transition-colors">
                    <div>
                      <div className="font-medium text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.make} {m.model} · {m.meterType}{m.modbusAddress ? ` · Addr: ${m.modbusAddress}` : ''}{m.meterSerial ? ` · S/N: ${m.meterSerial}` : ''}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Keys sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Key className="h-4 w-4" /> API Keys</h3>
              <button onClick={generateKey} disabled={generating} className="btn-secondary text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> New</button>
            </div>
            {newKey && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="text-xs font-semibold text-green-800 mb-1">New Key (copy now!)</div>
                <div className="flex items-center gap-1">
                  <code className="text-xs font-mono break-all flex-1">{newKey}</code>
                  <button onClick={() => { navigator.clipboard.writeText(newKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1">{copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}</button>
                </div>
              </div>
            )}
            {gateway.apiKeys.length === 0 ? (
              <p className="text-sm text-gray-500">No active API keys.</p>
            ) : (
              <div className="space-y-2">
                {gateway.apiKeys.map(k => (
                  <div key={k.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">{k.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{k.keyPrefix}...</div>
                      {k.lastUsedAt && <div className="text-xs text-gray-400">Used: {new Date(k.lastUsedAt).toLocaleDateString('en-IN')}</div>}
                    </div>
                    {k.isActive && (
                      <button onClick={() => revokeKey(k.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={deleteGateway} className="btn-danger w-full text-sm">Deactivate Gateway</button>
        </div>
      </div>
    </div>
  );
}
