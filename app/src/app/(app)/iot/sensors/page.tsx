'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Thermometer, Droplets, Wind, Activity, Gauge, Sparkles, Plus, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

interface Sensor {
  id: string;
  name: string;
  sensorType: string;
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  criticalDelta: number | null;
  location: string | null;
  assetName: string | null;
  isActive: boolean;
  gateway: { name: string };
  _count: { readings: number; alerts: number };
}

interface Gateway { id: string; name: string }

const SENSOR_TYPE_ICONS: Record<string, typeof Thermometer> = {
  TEMPERATURE: Thermometer,
  HUMIDITY: Droplets,
  CO2: Wind,
  AIR_QUALITY: Sparkles,
  VIBRATION: Activity,
  PRESSURE: Gauge,
  OTHER: Sparkles,
};

const TYPE_DEFAULTS: Record<string, { unit: string; min?: number; max?: number; delta?: number }> = {
  TEMPERATURE: { unit: '°C', max: 8 },
  HUMIDITY: { unit: '%RH', min: 30, max: 70 },
  CO2: { unit: 'ppm', max: 1000 },
  AIR_QUALITY: { unit: 'AQI', max: 100 },
  VIBRATION: { unit: 'mm/s', max: 4.5 },
  PRESSURE: { unit: 'bar', max: 10 },
  OTHER: { unit: '' },
};

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gatewayId: '',
    name: '',
    sensorSerial: '',
    sensorType: 'TEMPERATURE',
    unit: '°C',
    minValue: '',
    maxValue: '8',
    criticalDelta: '',
    location: '',
    assetName: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/iot/sensors').then(r => r.json()),
      fetch('/api/iot/gateways').then(r => r.json()),
    ]).then(([s, g]) => {
      setSensors(Array.isArray(s) ? s : []);
      setGateways(Array.isArray(g) ? g : (g.gateways || []));
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onTypeChange = (type: string) => {
    const d = TYPE_DEFAULTS[type] ?? TYPE_DEFAULTS.OTHER;
    setForm(f => ({
      ...f,
      sensorType: type,
      unit: d.unit,
      minValue: d.min !== undefined ? String(d.min) : '',
      maxValue: d.max !== undefined ? String(d.max) : '',
    }));
  };

  const submit = async () => {
    setSaving(true);
    const body: Record<string, unknown> = {
      gatewayId: form.gatewayId,
      name: form.name,
      sensorType: form.sensorType,
      unit: form.unit,
    };
    if (form.sensorSerial) body.sensorSerial = form.sensorSerial;
    if (form.minValue !== '') body.minValue = Number(form.minValue);
    if (form.maxValue !== '') body.maxValue = Number(form.maxValue);
    if (form.criticalDelta !== '') body.criticalDelta = Number(form.criticalDelta);
    if (form.location) body.location = form.location;
    if (form.assetName) body.assetName = form.assetName;

    const res = await fetch('/api/iot/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowNew(false);
      setForm({ ...form, name: '', sensorSerial: '', location: '', assetName: '' });
      load();
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  const totalReadings = sensors.reduce((sum, s) => sum + s._count.readings, 0);
  const totalAlerts = sensors.reduce((sum, s) => sum + s._count.alerts, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environmental Sensors"
        subtitle="Temperature, humidity, CO₂, vibration, pressure — non-electrical instrumentation. Breaches feed the same Incident → CAPA pipeline."
        action={
          <button onClick={() => setShowNew(!showNew)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> {showNew ? 'Cancel' : 'Add Sensor'}
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="card"><p className="text-2xl font-bold">{sensors.length}</p><p className="text-xs text-gray-500">Sensors</p></div>
        <div className="card"><p className="text-2xl font-bold">{totalReadings.toLocaleString()}</p><p className="text-xs text-gray-500">Readings stored</p></div>
        <div className="card"><p className="text-2xl font-bold text-orange-600">{totalAlerts}</p><p className="text-xs text-gray-500">Breach alerts</p></div>
      </div>

      {showNew && (
        <div className="card border-2 border-brand-200 bg-brand-50 space-y-3">
          <h3 className="font-semibold">New Sensor</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text">Gateway *</label>
              <select className="input-field" value={form.gatewayId} onChange={e => setForm({ ...form, gatewayId: e.target.value })}>
                <option value="">— select —</option>
                {gateways.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Sensor type *</label>
              <select className="input-field" value={form.sensorType} onChange={e => onTypeChange(e.target.value)}>
                <option value="TEMPERATURE">Temperature</option>
                <option value="HUMIDITY">Humidity</option>
                <option value="CO2">CO₂</option>
                <option value="AIR_QUALITY">Air Quality</option>
                <option value="VIBRATION">Vibration</option>
                <option value="PRESSURE">Pressure</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="label-text">Name *</label>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cold Room A — Temperature" />
            </div>
            <div>
              <label className="label-text">Unit *</label>
              <input className="input-field" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Min value (low threshold)</label>
              <input className="input-field" type="number" step="any" value={form.minValue} onChange={e => setForm({ ...form, minValue: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Max value (high threshold)</label>
              <input className="input-field" type="number" step="any" value={form.maxValue} onChange={e => setForm({ ...form, maxValue: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Critical delta (escalates to CRITICAL)</label>
              <input className="input-field" type="number" step="any" value={form.criticalDelta} onChange={e => setForm({ ...form, criticalDelta: e.target.value })} placeholder="e.g. 2 (so 8°C threshold + 2 = 10°C is critical)" />
            </div>
            <div>
              <label className="label-text">Sensor serial</label>
              <input className="input-field" value={form.sensorSerial} onChange={e => setForm({ ...form, sensorSerial: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Asset name</label>
              <input className="input-field" value={form.assetName} onChange={e => setForm({ ...form, assetName: e.target.value })} placeholder="e.g. Cold Room A" />
            </div>
            <div>
              <label className="label-text">Location</label>
              <input className="input-field" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Ground floor — production" />
            </div>
          </div>
          <button onClick={submit} disabled={saving || !form.gatewayId || !form.name} className="btn-primary text-sm">
            {saving ? 'Saving…' : 'Create sensor'}
          </button>
        </div>
      )}

      {sensors.length === 0 ? (
        <EmptyState
          icon={Thermometer}
          title="No sensors yet"
          description="Add temperature, humidity, CO₂, or vibration sensors to your gateway. Threshold breaches automatically create incidents — the same way meter alerts do."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 border-b">
              <tr>
                <th className="text-left py-2 px-3 font-medium">Sensor</th>
                <th className="text-left py-2 px-3 font-medium">Type</th>
                <th className="text-left py-2 px-3 font-medium">Asset / Location</th>
                <th className="text-left py-2 px-3 font-medium">Thresholds</th>
                <th className="text-left py-2 px-3 font-medium">Gateway</th>
                <th className="text-right py-2 px-3 font-medium">Readings</th>
                <th className="text-right py-2 px-3 font-medium">Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sensors.map(s => {
                const Icon = SENSOR_TYPE_ICONS[s.sensorType] ?? Sparkles;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-brand-500" />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3"><StatusBadge label={s.sensorType.replace('_', ' ')} color="blue" /></td>
                    <td className="py-3 px-3 text-xs text-gray-600">
                      {s.assetName && <p>{s.assetName}</p>}
                      {s.location && <p className="text-gray-400">{s.location}</p>}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600">
                      {s.minValue !== null && <span>≥{s.minValue}</span>}
                      {s.minValue !== null && s.maxValue !== null && <span> · </span>}
                      {s.maxValue !== null && <span>≤{s.maxValue}</span>}
                      <span className="text-gray-400"> {s.unit}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-600">{s.gateway.name}</td>
                    <td className="py-3 px-3 text-right text-xs text-gray-600">{s._count.readings.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      {s._count.alerts > 0 ? (
                        <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          {s._count.alerts}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="card bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-purple-900">Sensor breaches close the compliance loop too</p>
            <p className="text-purple-700 mt-1">
              When a sensor crosses its threshold (e.g. cold-room temp &gt; 8°C, vibration past trip point), VoltSpark creates an Incident and — for
              critical breaches — an auto-CAPA, linked to the relevant compliance framework requirement. Same pipeline as electrical meter alerts.
            </p>
            <Link href="/safety/incidents?filter=AUTO" className="inline-block mt-2 text-xs text-purple-900 hover:underline font-medium">
              View auto-generated incidents →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
