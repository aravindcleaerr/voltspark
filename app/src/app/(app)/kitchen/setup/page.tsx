'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

interface DiscomTemplate {
  id: string;
  code: string;
  discomName: string;
  state: string;
  category: string;
  tariffRatePerKwh: number;
  demandChargePerKVA: number | null;
  pfTarget: number;
  pfPenaltyRatePercent: number | null;
  pfIncentiveRatePercent: number | null;
  mdPenaltyMultiplier: number;
  todSlabsJson: string | null;
}

interface Zone {
  name: string;
  zoneType: string;
  meterId: string;
  priorityTier: number;
  maxLoadKW: string;
}

const ZONE_TYPES = ['BURNER', 'TAWA', 'FRYER', 'STOCK_POT', 'WARMER', 'UTILITY', 'CNC', 'COMPRESSOR', 'OTHER'];

export default function KitchenSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<DiscomTemplate[]>([]);
  const [existingKitchen, setExistingKitchen] = useState<any>(null);

  // Step 1: DISCOM
  const [discomCode, setDiscomCode] = useState('');
  const [connectionType, setConnectionType] = useState('LT_COMMERCIAL');

  // Step 2: Profile
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contractedDemandKVA, setContractedDemandKVA] = useState('');
  const [tariffRatePerKwh, setTariffRatePerKwh] = useState('');
  const [demandChargePerKVA, setDemandChargePerKVA] = useState('');
  const [mdPenaltyMultiplier, setMdPenaltyMultiplier] = useState('2.0');
  const [pfTarget, setPfTarget] = useState('0.90');
  const [pfPenaltyRatePercent, setPfPenaltyRatePercent] = useState('');
  const [warningThresholdPct, setWarningThresholdPct] = useState('80');
  const [criticalThresholdPct, setCriticalThresholdPct] = useState('92');
  const [billingCycleDay, setBillingCycleDay] = useState('1');
  const [todSlabsJson, setTodSlabsJson] = useState('');

  // Step 3: Zones
  const [zones, setZones] = useState<Zone[]>([{ name: '', zoneType: 'OTHER', meterId: '', priorityTier: 2, maxLoadKW: '' }]);

  // Step 4: API Key
  const [generatedKey, setGeneratedKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/kitchen/discom-templates').then(r => r.json()),
      fetch('/api/kitchen').then(r => r.json()),
    ]).then(([tmpl, kitchen]) => {
      if (Array.isArray(tmpl)) setTemplates(tmpl);
      if (kitchen?.id) setExistingKitchen(kitchen);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const applyTemplate = (code: string) => {
    setDiscomCode(code);
    const tmpl = templates.find(t => t.code === code);
    if (tmpl) {
      setTariffRatePerKwh(tmpl.tariffRatePerKwh?.toString() || '');
      setDemandChargePerKVA(tmpl.demandChargePerKVA?.toString() || '');
      setMdPenaltyMultiplier(tmpl.mdPenaltyMultiplier?.toString() || '2.0');
      setPfTarget(tmpl.pfTarget?.toString() || '0.90');
      setPfPenaltyRatePercent(tmpl.pfPenaltyRatePercent?.toString() || '');
      setTodSlabsJson(tmpl.todSlabsJson || '');
    }
  };

  const addZone = () => setZones([...zones, { name: '', zoneType: 'OTHER', meterId: '', priorityTier: 2, maxLoadKW: '' }]);
  const removeZone = (i: number) => setZones(zones.filter((_, idx) => idx !== i));
  const updateZone = (i: number, field: keyof Zone, value: any) => {
    const updated = [...zones];
    (updated[i] as any)[field] = value;
    setZones(updated);
  };

  const saveKitchen = async () => {
    setSaving(true);
    try {
      // Create kitchen profile
      const kitchenRes = await fetch('/api/kitchen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          discomCode: templates.find(t => t.code === discomCode)?.discomName || discomCode,
          connectionType,
          contractedDemandKVA: parseFloat(contractedDemandKVA),
          tariffRatePerKwh: tariffRatePerKwh ? parseFloat(tariffRatePerKwh) : undefined,
          demandChargePerKVA: demandChargePerKVA ? parseFloat(demandChargePerKVA) : undefined,
          mdPenaltyMultiplier: parseFloat(mdPenaltyMultiplier),
          pfTarget: parseFloat(pfTarget),
          pfPenaltyRatePercent: pfPenaltyRatePercent ? parseFloat(pfPenaltyRatePercent) : undefined,
          warningThresholdPct: parseFloat(warningThresholdPct),
          criticalThresholdPct: parseFloat(criticalThresholdPct),
          billingCycleDay: parseInt(billingCycleDay),
          todSlabsJson,
        }),
      });

      if (!kitchenRes.ok) { setSaving(false); return; }

      // Create zones
      const validZones = zones.filter(z => z.name.trim());
      for (const z of validZones) {
        await fetch('/api/kitchen/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: z.name,
            zoneType: z.zoneType,
            meterId: z.meterId || undefined,
            priorityTier: z.priorityTier,
            maxLoadKW: z.maxLoadKW ? parseFloat(z.maxLoadKW) : undefined,
          }),
        });
      }

      // Generate API key
      const keyRes = await fetch('/api/kitchen/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Default Meter Key' }),
      });

      if (keyRes.ok) {
        const keyData = await keyRes.json();
        setGeneratedKey(keyData.key);
      }

      setStep(4);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-64 bg-gray-200 rounded" /></div>;

  if (existingKitchen) {
    return (
      <div>
        <PageHeader title="Kitchen Setup" subtitle="Kitchen profile already configured" />
        <div className="card p-6 text-center space-y-4">
          <p className="text-gray-600">Kitchen <strong>{existingKitchen.name}</strong> is already set up with {existingKitchen.zones?.length || 0} zones.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/kitchen')} className="btn-primary">Go to Dashboard</button>
            <button onClick={() => router.push('/kitchen/zones')} className="btn-secondary">Manage Zones</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Kitchen Intelligence Setup" subtitle={`Step ${step} of 4`} />

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold">DISCOM & Connection Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">DISCOM Template</label>
              <select value={discomCode} onChange={e => applyTemplate(e.target.value)} className="input-field">
                <option value="">Select DISCOM...</option>
                {templates.map(t => (
                  <option key={t.code} value={t.code}>{t.discomName} — {t.category} ({t.state})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Connection Type</label>
              <select value={connectionType} onChange={e => setConnectionType(e.target.value)} className="input-field">
                <option value="LT_COMMERCIAL">LT Commercial</option>
                <option value="HT">HT (High Tension)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)} disabled={!discomCode} className="btn-primary">Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold">Kitchen Profile & Tariff</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Kitchen Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. Main Kitchen - Koramangala" />
            </div>
            <div>
              <label className="label-text">Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className="input-field" placeholder="Full address" />
            </div>
            <div>
              <label className="label-text">Contracted Demand (kVA) *</label>
              <input type="number" value={contractedDemandKVA} onChange={e => setContractedDemandKVA(e.target.value)} className="input-field" placeholder="e.g. 30" />
            </div>
            <div>
              <label className="label-text">Tariff Rate (₹/kWh)</label>
              <input type="number" step="0.01" value={tariffRatePerKwh} onChange={e => setTariffRatePerKwh(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">Demand Charge (₹/kVA/month)</label>
              <input type="number" value={demandChargePerKVA} onChange={e => setDemandChargePerKVA(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">MD Penalty Multiplier</label>
              <input type="number" step="0.1" value={mdPenaltyMultiplier} onChange={e => setMdPenaltyMultiplier(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">PF Target</label>
              <input type="number" step="0.01" value={pfTarget} onChange={e => setPfTarget(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">PF Penalty Rate (%)</label>
              <input type="number" step="0.1" value={pfPenaltyRatePercent} onChange={e => setPfPenaltyRatePercent(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">Warning Threshold (%)</label>
              <input type="number" value={warningThresholdPct} onChange={e => setWarningThresholdPct(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">Critical Threshold (%)</label>
              <input type="number" value={criticalThresholdPct} onChange={e => setCriticalThresholdPct(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">Billing Cycle Start Day</label>
              <input type="number" min="1" max="28" value={billingCycleDay} onChange={e => setBillingCycleDay(e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={() => setStep(3)} disabled={!name || !contractedDemandKVA} className="btn-primary">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold">Kitchen Zones</h2>
          <p className="text-sm text-gray-500">Define the zones (cooking stations, equipment areas) in your kitchen. Each zone can be mapped to a Titan meter.</p>
          <div className="space-y-3">
            {zones.map((z, i) => (
              <div key={i} className="grid grid-cols-5 gap-3 items-end">
                <div>
                  <label className="label-text text-xs">Zone Name *</label>
                  <input value={z.name} onChange={e => updateZone(i, 'name', e.target.value)} className="input-field" placeholder="e.g. Burner 1" />
                </div>
                <div>
                  <label className="label-text text-xs">Type</label>
                  <select value={z.zoneType} onChange={e => updateZone(i, 'zoneType', e.target.value)} className="input-field">
                    {ZONE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text text-xs">Titan Meter ID</label>
                  <input value={z.meterId} onChange={e => updateZone(i, 'meterId', e.target.value)} className="input-field" placeholder="TITAN-313-XXXX" />
                </div>
                <div>
                  <label className="label-text text-xs">Priority</label>
                  <select value={z.priorityTier} onChange={e => updateZone(i, 'priorityTier', parseInt(e.target.value))} className="input-field">
                    <option value={1}>T1 — Never shed</option>
                    <option value={2}>T2 — Shed if critical</option>
                    <option value={3}>T3 — Shed at warning</option>
                  </select>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="label-text text-xs">Max kW</label>
                    <input type="number" value={z.maxLoadKW} onChange={e => updateZone(i, 'maxLoadKW', e.target.value)} className="input-field" />
                  </div>
                  {zones.length > 1 && (
                    <button onClick={() => removeZone(i)} className="btn-danger text-xs px-2 py-2">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={addZone} className="btn-secondary text-sm">+ Add Zone</button>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
            <button onClick={saveKitchen} disabled={saving || !zones.some(z => z.name.trim())} className="btn-primary">
              {saving ? 'Setting up...' : 'Create Kitchen'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold text-green-700">Kitchen Created Successfully!</h2>

          {generatedKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-yellow-800">API Key — Copy this now! It won&apos;t be shown again.</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-xs font-mono break-all">{generatedKey}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedKey); setKeyCopied(true); }}
                  className="btn-secondary text-xs"
                >
                  {keyCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-500">Use this key in Titan meter HTTP push config:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`curl -X POST https://volt-spark.vercel.app/api/kitchen/meters/TITAN-313-0001/readings \\
  -H "Authorization: Bearer ${generatedKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"timestamp":"2026-03-28T12:00:00+05:30","activePowerKW":8.5,"powerFactor":0.95}'`}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => router.push('/kitchen')} className="btn-primary">Go to Kitchen Dashboard</button>
            <button onClick={() => router.push('/kitchen/zones')} className="btn-secondary">Manage Zones</button>
          </div>
        </div>
      )}
    </div>
  );
}
