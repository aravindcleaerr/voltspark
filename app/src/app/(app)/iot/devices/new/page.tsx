'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { IOT_GATEWAY_TYPES, IOT_PROTOCOLS, IOT_METER_MAKES, IOT_METER_TYPES } from '@/lib/constants';
import { Copy, Check, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

interface EnergySource { id: string; name: string; type: string }

export default function NewDevicePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [energySources, setEnergySources] = useState<EnergySource[]>([]);

  // Gateway form
  const [gateway, setGateway] = useState({ name: '', serialNumber: '', gatewayType: 'PAS600', make: '', location: '', protocol: 'MQTT_WEBHOOK', mqttBrokerUrl: '', mqttTopicPrefix: '', pushIntervalSeconds: 60 });
  const [gatewayId, setGatewayId] = useState('');

  // Meters form
  const [meters, setMeters] = useState<Array<{ name: string; meterSerial: string; modbusAddress: string; make: string; model: string; meterType: string; energySourceId: string; ctRatio: string; panelName: string; location: string }>>([]);

  // API key
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/energy-sources').then(r => r.json()).then(data => { if (Array.isArray(data)) setEnergySources(data); }).catch(() => {});
  }, []);

  const createGateway = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/iot/gateways', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...gateway, pushIntervalSeconds: parseInt(String(gateway.pushIntervalSeconds)) || 60 }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create gateway'); }
      const data = await res.json();
      setGatewayId(data.id);
      setStep(2);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const addMeterRow = () => setMeters([...meters, { name: '', meterSerial: '', modbusAddress: '', make: 'SCHNEIDER', model: '', meterType: 'SUBMETER', energySourceId: '', ctRatio: '', panelName: '', location: '' }]);

  const createMeters = async () => {
    if (meters.length === 0) { setStep(3); return; }
    setSaving(true);
    setError('');
    try {
      for (const m of meters) {
        const res = await fetch('/api/iot/meters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gatewayId,
            name: m.name,
            meterSerial: m.meterSerial || undefined,
            modbusAddress: m.modbusAddress ? parseInt(m.modbusAddress) : undefined,
            make: m.make || undefined,
            model: m.model || undefined,
            meterType: m.meterType,
            energySourceId: m.energySourceId || undefined,
            ctRatio: m.ctRatio ? parseFloat(m.ctRatio) : undefined,
            panelName: m.panelName || undefined,
            location: m.location || undefined,
          }),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || `Failed to create meter: ${m.name}`); }
      }
      setStep(3);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const generateKey = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/iot/gateways/${gatewayId}/api-keys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${gateway.name} Key` }) });
      if (!res.ok) throw new Error('Failed to generate key');
      const data = await res.json();
      setApiKey(data.fullKey);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Add IoT Device" subtitle={`Step ${step} of 3`} />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Gateway', 'Meters', 'API Key'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className={`w-8 h-0.5 ${i < step ? 'bg-brand-500' : 'bg-gray-200'}`} />}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${i + 1 === step ? 'bg-brand-100 text-brand-700' : i + 1 < step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className="w-4 h-4 rounded-full bg-current text-white flex items-center justify-center text-[10px]" style={{ backgroundColor: 'currentColor' }}><span className="text-white">{i + 1 < step ? '✓' : i + 1}</span></span>
              {label}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* Step 1: Gateway */}
      {step === 1 && (
        <div className="card p-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-text">Gateway Name *</label><input className="input-field" value={gateway.name} onChange={e => setGateway({ ...gateway, name: e.target.value })} placeholder="e.g. Main Panel Gateway" /></div>
            <div><label className="label-text">Serial Number</label><input className="input-field" value={gateway.serialNumber} onChange={e => setGateway({ ...gateway, serialNumber: e.target.value })} placeholder="e.g. PAS600-SN-001" /></div>
            <div><label className="label-text">Type</label><select className="input-field" value={gateway.gatewayType} onChange={e => setGateway({ ...gateway, gatewayType: e.target.value })}>{IOT_GATEWAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className="label-text">Make</label><input className="input-field" value={gateway.make} onChange={e => setGateway({ ...gateway, make: e.target.value })} placeholder="e.g. Schneider" /></div>
            <div><label className="label-text">Location</label><input className="input-field" value={gateway.location} onChange={e => setGateway({ ...gateway, location: e.target.value })} placeholder="e.g. Main LT panel room" /></div>
            <div><label className="label-text">Protocol</label><select className="input-field" value={gateway.protocol} onChange={e => setGateway({ ...gateway, protocol: e.target.value })}>{IOT_PROTOCOLS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
          </div>
          {(gateway.protocol === 'MQTT_WEBHOOK' || gateway.protocol === 'MQTT_DIRECT') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div><label className="label-text">MQTT Broker URL</label><input className="input-field" value={gateway.mqttBrokerUrl} onChange={e => setGateway({ ...gateway, mqttBrokerUrl: e.target.value })} placeholder="mqtts://broker.hivemq.com:8883" /></div>
              <div><label className="label-text">MQTT Topic Prefix</label><input className="input-field" value={gateway.mqttTopicPrefix} onChange={e => setGateway({ ...gateway, mqttTopicPrefix: e.target.value })} placeholder="voltspark/site1" /></div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <button onClick={createGateway} disabled={!gateway.name || saving} className="btn-primary flex items-center gap-2">{saving ? 'Creating...' : 'Next: Add Meters'} <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Step 2: Meters */}
      {step === 2 && (
        <div className="space-y-4 max-w-4xl">
          {meters.map((m, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Meter {i + 1}</span>
                <button onClick={() => setMeters(meters.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="label-text">Name *</label><input className="input-field" value={m.name} onChange={e => { const u = [...meters]; u[i].name = e.target.value; setMeters(u); }} placeholder="e.g. Incomer Meter" /></div>
                <div><label className="label-text">Serial</label><input className="input-field" value={m.meterSerial} onChange={e => { const u = [...meters]; u[i].meterSerial = e.target.value; setMeters(u); }} /></div>
                <div><label className="label-text">Modbus Address</label><input className="input-field" type="number" min="1" max="247" value={m.modbusAddress} onChange={e => { const u = [...meters]; u[i].modbusAddress = e.target.value; setMeters(u); }} /></div>
                <div><label className="label-text">Make</label><select className="input-field" value={m.make} onChange={e => { const u = [...meters]; u[i].make = e.target.value; setMeters(u); }}>{IOT_METER_MAKES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="label-text">Model</label><input className="input-field" value={m.model} onChange={e => { const u = [...meters]; u[i].model = e.target.value; setMeters(u); }} placeholder="e.g. EM6400NG+" /></div>
                <div><label className="label-text">Type</label><select className="input-field" value={m.meterType} onChange={e => { const u = [...meters]; u[i].meterType = e.target.value; setMeters(u); }}>{IOT_METER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="label-text">Link to Energy Source</label><select className="input-field" value={m.energySourceId} onChange={e => { const u = [...meters]; u[i].energySourceId = e.target.value; setMeters(u); }}><option value="">None</option>{energySources.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}</select></div>
                <div><label className="label-text">CT Ratio</label><input className="input-field" value={m.ctRatio} onChange={e => { const u = [...meters]; u[i].ctRatio = e.target.value; setMeters(u); }} placeholder="e.g. 200" /></div>
                <div><label className="label-text">Panel</label><input className="input-field" value={m.panelName} onChange={e => { const u = [...meters]; u[i].panelName = e.target.value; setMeters(u); }} placeholder="e.g. Main LT Panel" /></div>
              </div>
            </div>
          ))}
          <button onClick={addMeterRow} className="btn-secondary flex items-center gap-2 w-full justify-center"><Plus className="h-4 w-4" /> Add Meter</button>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back</button>
            <button onClick={createMeters} disabled={saving} className="btn-primary flex items-center gap-2">{saving ? 'Saving...' : meters.length > 0 ? 'Next: API Key' : 'Skip to API Key'} <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Step 3: API Key */}
      {step === 3 && (
        <div className="card p-6 max-w-2xl space-y-4">
          <h3 className="text-lg font-semibold">Generate API Key</h3>
          <p className="text-sm text-gray-500">Your gateway needs an API key to push data to VoltSpark. Generate one below and configure it on your gateway.</p>
          {!apiKey ? (
            <button onClick={generateKey} disabled={saving} className="btn-primary">{saving ? 'Generating...' : 'Generate API Key'}</button>
          ) : (
            <div>
              <label className="label-text">Your API Key (copy now — it won&apos;t be shown again)</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm font-mono break-all">{apiKey}</code>
                <button onClick={copyKey} className="btn-secondary p-2">{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}</button>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <div className="font-semibold text-blue-800 mb-2">Gateway Configuration</div>
                <div className="text-blue-700 space-y-1">
                  <div>Endpoint: <code className="bg-blue-100 px-1 rounded">POST /api/iot/ingest</code></div>
                  <div>Header: <code className="bg-blue-100 px-1 rounded">Authorization: Bearer {apiKey.slice(0, 16)}...</code></div>
                  <div>Format: JSON batch — see documentation</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between pt-4 border-t">
            <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back</button>
            <button onClick={() => router.push('/iot/devices')} className="btn-primary">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
