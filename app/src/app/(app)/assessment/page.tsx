'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Building2, Zap, IndianRupee, Calendar, CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { ENERGY_TYPES, INDUSTRY_TYPES } from '@/lib/constants';

interface EnergySource {
  id: string;
  name: string;
  type: string;
  unit: string;
  location: string | null;
  meterNumber: string | null;
  costPerUnit: number | null;
}

const STEPS = ['Company Profile', 'Energy Sources', 'Tariff Config', 'Baseline Period', 'Review'];

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Company
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Energy sources
  const [sources, setSources] = useState<EnergySource[]>([]);
  const [newSource, setNewSource] = useState({ name: '', type: 'ELECTRICITY', unit: 'kWh', location: '', meterNumber: '', costPerUnit: '' });

  // Tariffs
  const [gridTariff, setGridTariff] = useState('');
  const [solarTariff, setSolarTariff] = useState('');
  const [dgTariff, setDgTariff] = useState('');
  const [contractDemand, setContractDemand] = useState('');
  const [pfTarget, setPfTarget] = useState('0.95');

  // Baseline
  const [baselineYear, setBaselineYear] = useState('');
  const [baselineMonth, setBaselineMonth] = useState('');

  useEffect(() => {
    fetch('/api/assessment').then(r => r.json()).then(data => {
      if (data.client) {
        setCompanyName(data.client.name || '');
        setIndustry(data.client.industry || '');
        setEmployeeCount(data.client.employeeCount?.toString() || '');
        setAddress(data.client.address || '');
        setGridTariff(data.client.gridTariffRate?.toString() || '');
        setSolarTariff(data.client.solarTariffRate?.toString() || '');
        setDgTariff(data.client.dgTariffRate?.toString() || '');
        setContractDemand(data.client.contractDemand?.toString() || '');
        setPfTarget(data.client.powerFactorTarget?.toString() || '0.95');
        setBaselineYear(data.client.baselineYear?.toString() || '');
        setBaselineMonth(data.client.baselineMonth?.toString() || '');
      }
      setSources(data.energySources || []);
      setIsComplete(data.isComplete);
    }).finally(() => setLoading(false));
  }, []);

  const saveStep = async (stepName: string, data: Record<string, string>) => {
    setSaving(true);
    await fetch('/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: stepName, data }),
    });
    setSaving(false);
  };

  const handleNext = async () => {
    if (step === 0) await saveStep('company', { industry, employeeCount, address });
    if (step === 2) await saveStep('tariffs', { gridTariffRate: gridTariff, solarTariffRate: solarTariff, dgTariffRate: dgTariff, contractDemand, powerFactorTarget: pfTarget });
    if (step === 3) await saveStep('baseline', { baselineYear, baselineMonth });
    if (step === 4) {
      await saveStep('complete', {});
      router.push('/dashboard');
      return;
    }
    setStep(s => s + 1);
  };

  const addSource = async () => {
    if (!newSource.name) return;
    setSaving(true);
    const res = await fetch('/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'energy-source', data: newSource }),
    });
    const created = await res.json();
    setSources(prev => [...prev, created]);
    setNewSource({ name: '', type: 'ELECTRICITY', unit: 'kWh', location: '', meterNumber: '', costPerUnit: '' });
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Baseline Assessment" subtitle="Set up your energy management baseline" />

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-full transition-colors ${
                i === step ? 'bg-brand-600 text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px]">{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold"><Building2 className="h-5 w-5 text-blue-600" /> Company Profile</h3>
            <p className="text-sm text-gray-500">Basic information about your facility. This helps match government schemes and benchmark performance.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                <input value={companyName} disabled className="input bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Industry Type</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className="input">
                  <option value="">Select industry...</option>
                  {INDUSTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee Count</label>
                <input type="number" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} className="input" placeholder="e.g., 150" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="input" placeholder="Full address including state" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold"><Zap className="h-5 w-5 text-yellow-600" /> Energy Sources</h3>
            <p className="text-sm text-gray-500">Add all energy sources used at your facility. You can add more later.</p>

            {sources.length > 0 && (
              <div className="space-y-2">
                {sources.map(s => (
                  <div key={s.id} className="flex items-center justify-between border rounded-lg px-4 py-2">
                    <div>
                      <span className="font-medium text-sm">{s.name}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{ENERGY_TYPES.find(t => t.value === s.type)?.label || s.type}</span>
                      <span className="ml-2 text-xs text-gray-400">{s.unit}</span>
                    </div>
                    {s.location && <span className="text-xs text-gray-400">{s.location}</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Add Energy Source</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input value={newSource.name} onChange={e => setNewSource(p => ({ ...p, name: e.target.value }))} placeholder="Name (e.g., Grid Power)" className="input" />
                <select value={newSource.type} onChange={e => { const t = ENERGY_TYPES.find(et => et.value === e.target.value); setNewSource(p => ({ ...p, type: e.target.value, unit: t?.defaultUnit || p.unit })); }} className="input">
                  {ENERGY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input value={newSource.unit} onChange={e => setNewSource(p => ({ ...p, unit: e.target.value }))} placeholder="Unit" className="input" />
                <input value={newSource.location} onChange={e => setNewSource(p => ({ ...p, location: e.target.value }))} placeholder="Location (optional)" className="input" />
                <input value={newSource.meterNumber} onChange={e => setNewSource(p => ({ ...p, meterNumber: e.target.value }))} placeholder="Meter # (optional)" className="input" />
                <input type="number" step="0.01" value={newSource.costPerUnit} onChange={e => setNewSource(p => ({ ...p, costPerUnit: e.target.value }))} placeholder="Cost/unit (₹)" className="input" />
              </div>
              <button onClick={addSource} disabled={!newSource.name || saving} className="btn-primary text-xs mt-3">
                <PlusCircle className="h-3.5 w-3.5 inline mr-1" /> Add Source
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold"><IndianRupee className="h-5 w-5 text-green-600" /> Tariff Configuration</h3>
            <p className="text-sm text-gray-500">Default tariff rates for cost calculations. Individual energy sources can override these.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Grid Tariff Rate (₹/kWh)</label>
                <input type="number" step="0.01" value={gridTariff} onChange={e => setGridTariff(e.target.value)} className="input" placeholder="e.g., 8.50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Solar Tariff Rate (₹/kWh)</label>
                <input type="number" step="0.01" value={solarTariff} onChange={e => setSolarTariff(e.target.value)} className="input" placeholder="e.g., 3.50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">DG Tariff Rate (₹/kWh)</label>
                <input type="number" step="0.01" value={dgTariff} onChange={e => setDgTariff(e.target.value)} className="input" placeholder="e.g., 18.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contract Demand (kVA)</label>
                <input type="number" value={contractDemand} onChange={e => setContractDemand(e.target.value)} className="input" placeholder="e.g., 500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Power Factor Target</label>
                <input type="number" step="0.01" min="0" max="1" value={pfTarget} onChange={e => setPfTarget(e.target.value)} className="input" placeholder="e.g., 0.95" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold"><Calendar className="h-5 w-5 text-purple-600" /> Baseline Period</h3>
            <p className="text-sm text-gray-500">Select the reference period for energy performance comparison. All targets and savings will be measured against this baseline.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baseline Year</label>
                <select value={baselineYear} onChange={e => setBaselineYear(e.target.value)} className="input">
                  <option value="">Select year...</option>
                  {[...Array(5)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baseline Month</label>
                <select value={baselineMonth} onChange={e => setBaselineMonth(e.target.value)} className="input">
                  <option value="">Select month...</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold"><ClipboardCheck className="h-5 w-5 text-brand-600" /> Review & Complete</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-xs font-medium text-gray-400 mb-2">Company</p>
                <p className="font-medium">{companyName}</p>
                <p className="text-sm text-gray-600">{INDUSTRY_TYPES.find(t => t.value === industry)?.label || industry || 'Not set'}</p>
                <p className="text-sm text-gray-600">{employeeCount ? `${employeeCount} employees` : 'Not set'}</p>
                {address && <p className="text-xs text-gray-400 mt-1">{address}</p>}
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs font-medium text-gray-400 mb-2">Tariffs</p>
                <div className="space-y-1 text-sm">
                  {gridTariff && <p>Grid: ₹{gridTariff}/kWh</p>}
                  {solarTariff && <p>Solar: ₹{solarTariff}/kWh</p>}
                  {dgTariff && <p>DG: ₹{dgTariff}/kWh</p>}
                  {contractDemand && <p>Contract Demand: {contractDemand} kVA</p>}
                  <p>PF Target: {pfTarget}</p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs font-medium text-gray-400 mb-2">Energy Sources ({sources.length})</p>
                {sources.map(s => (
                  <p key={s.id} className="text-sm">{s.name} — {s.unit}</p>
                ))}
                {sources.length === 0 && <p className="text-sm text-gray-400">No sources added</p>}
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs font-medium text-gray-400 mb-2">Baseline</p>
                {baselineYear && baselineMonth ? (
                  <p className="text-sm font-medium">
                    {['','January','February','March','April','May','June','July','August','September','October','November','December'][parseInt(baselineMonth)]} {baselineYear}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Not set</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 mt-6 border-t">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="btn-secondary text-sm">Back</button>
          <button onClick={handleNext} disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving...' : step === 4 ? 'Complete Assessment' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
