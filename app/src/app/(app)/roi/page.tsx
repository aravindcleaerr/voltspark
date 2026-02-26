'use client';

import { useEffect, useState } from 'react';
import { Calculator, IndianRupee, Clock, TrendingUp, Leaf, PlusCircle, ChevronDown, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';

interface ROICalc {
  id: string;
  name: string;
  templateType: string;
  inputs: string;
  investmentCost: number;
  subsidyAmount: number | null;
  netInvestment: number;
  monthlySavings: number;
  annualSavings: number;
  paybackMonths: number;
  fiveYearSavings: number | null;
  tenYearSavings: number | null;
  lifetimeSavings: number | null;
  irr: number | null;
  npv: number | null;
  co2ReductionKg: number | null;
  status: string;
  createdBy: { name: string };
  createdAt: string;
}

interface TemplateField {
  key: string;
  label: string;
  unit: string;
  defaultValue?: number;
}

interface Template {
  label: string;
  fields: TemplateField[];
}

const TEMPLATE_LABELS: Record<string, string> = {
  SOLAR: 'Solar Rooftop', VFD: 'VFD Installation', LED: 'LED Retrofit',
  POWER_FACTOR: 'Power Factor', COMPRESSED_AIR: 'Compressed Air', MOTOR: 'IE3 Motor', TRANSFORMER: 'Transformer',
};

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

export default function ROIPage() {
  const [calcs, setCalcs] = useState<ROICalc[]>([]);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [loading, setLoading] = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [calcName, setCalcName] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalProposedInvestment: 0, totalProposedSavings: 0, totalSubsidies: 0, avgPayback: 0, count: 0 });

  const fetchData = () => {
    Promise.all([
      fetch('/api/roi').then(r => r.json()),
      fetch('/api/roi/templates').then(r => r.json()),
    ]).then(([roiData, tmpl]) => {
      setCalcs(roiData.calculations);
      setSummary(roiData.summary);
      setTemplates(tmpl);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleTemplateSelect = (type: string) => {
    setSelectedTemplate(type);
    setResult(null);
    const t = templates[type];
    if (t) {
      const defaults: Record<string, string> = {};
      for (const f of t.fields) {
        if (f.defaultValue !== undefined) defaults[f.key] = String(f.defaultValue);
      }
      setInputs(defaults);
    }
  };

  const handleCalculate = async () => {
    const numInputs: Record<string, number> = {};
    for (const [k, v] of Object.entries(inputs)) {
      if (v) numInputs[k] = parseFloat(v);
    }
    const res = await fetch('/api/roi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calculate: true, templateType: selectedTemplate, inputs: numInputs }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data.outputs);
    }
  };

  const handleSave = async () => {
    if (!calcName || !result) return;
    setSaving(true);
    const numInputs: Record<string, number> = {};
    for (const [k, v] of Object.entries(inputs)) {
      if (v) numInputs[k] = parseFloat(v);
    }
    const res = await fetch('/api/roi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: calcName, templateType: selectedTemplate, inputs: numInputs }),
    });
    if (res.ok) {
      setShowCalc(false);
      setResult(null);
      setCalcName('');
      setSelectedTemplate('');
      fetchData();
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ROI Calculator"
        subtitle="Pre-investment analysis for proposed energy improvements"
        action={
          <button onClick={() => setShowCalc(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Calculator className="h-4 w-4" /> New Calculation
          </button>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><IndianRupee className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Proposed Investment</p><p className="text-xl font-bold">{fmt(summary.totalProposedInvestment)}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Projected Annual Savings</p><p className="text-xl font-bold text-green-600">{fmt(summary.totalProposedSavings)}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Clock className="h-5 w-5 text-purple-600" /></div><div><p className="text-xs text-gray-500">Avg. Payback Period</p><p className="text-xl font-bold">{summary.avgPayback} months</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Leaf className="h-5 w-5 text-orange-600" /></div><div><p className="text-xs text-gray-500">Total Subsidies</p><p className="text-xl font-bold text-orange-600">{fmt(summary.totalSubsidies)}</p></div></div></div>
      </div>

      {/* Saved Calculations */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">Saved Calculations ({calcs.length})</h3>
        <div className="space-y-2">
          {calcs.map(c => {
            const isExp = expanded === c.id;
            return (
              <div key={c.id} className="border rounded-lg overflow-hidden">
                <button onClick={() => setExpanded(isExp ? null : c.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                  {isExp ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <Calculator className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{TEMPLATE_LABELS[c.templateType] || c.templateType}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{fmt(c.annualSavings)}/yr</span>
                  <StatusBadge label={c.status} color={c.status === 'APPROVED' ? 'green' : c.status === 'SHARED' ? 'blue' : 'gray'} />
                </button>
                {isExp && (
                  <div className="px-4 pb-4 pt-1 border-t bg-gray-50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-xs text-gray-400">Investment</p><p className="font-medium">{fmt(c.investmentCost)}</p></div>
                      {c.subsidyAmount ? <div><p className="text-xs text-gray-400">Subsidy</p><p className="font-medium text-orange-600">- {fmt(c.subsidyAmount)}</p></div> : null}
                      <div><p className="text-xs text-gray-400">Net Investment</p><p className="font-medium">{fmt(c.netInvestment)}</p></div>
                      <div><p className="text-xs text-gray-400">Monthly Savings</p><p className="font-medium text-green-600">{fmt(c.monthlySavings)}</p></div>
                      <div><p className="text-xs text-gray-400">Payback</p><p className="font-medium">{c.paybackMonths} months</p></div>
                      <div><p className="text-xs text-gray-400">5-Year Savings</p><p className="font-medium">{c.fiveYearSavings ? fmt(c.fiveYearSavings) : '—'}</p></div>
                      <div><p className="text-xs text-gray-400">10-Year Savings</p><p className="font-medium">{c.tenYearSavings ? fmt(c.tenYearSavings) : '—'}</p></div>
                      {c.irr && <div><p className="text-xs text-gray-400">IRR</p><p className="font-medium">{c.irr}%</p></div>}
                      {c.npv && <div><p className="text-xs text-gray-400">NPV</p><p className="font-medium">{fmt(c.npv)}</p></div>}
                      {c.co2ReductionKg ? <div><p className="text-xs text-gray-400">CO₂ Reduction</p><p className="font-medium text-green-600">{(c.co2ReductionKg / 1000).toFixed(1)} tonnes/yr</p></div> : null}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">By {c.createdBy.name}</p>
                  </div>
                )}
              </div>
            );
          })}
          {calcs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No ROI calculations yet. Click "New Calculation" to get started.</p>}
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8" onClick={() => setShowCalc(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">ROI Calculator</h3>

            {/* Template selection */}
            {!selectedTemplate ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(templates).map(([key, t]) => (
                  <button key={key} onClick={() => handleTemplateSelect(key)} className="border rounded-lg p-4 text-left hover:bg-brand-50 hover:border-brand-300 transition-colors">
                    <p className="font-medium text-sm">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{t.fields.length} parameters</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => { setSelectedTemplate(''); setResult(null); }} className="text-xs text-brand-600 hover:underline">← Change template</button>
                  <span className="text-sm font-medium">{templates[selectedTemplate]?.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {templates[selectedTemplate]?.fields.map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-gray-500">{f.label} {f.unit && <span className="text-gray-400">({f.unit})</span>}</label>
                      <input
                        type="number"
                        step="any"
                        value={inputs[f.key] || ''}
                        onChange={e => setInputs(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="mt-1 w-full text-sm border rounded-lg px-3 py-2"
                        placeholder={f.defaultValue !== undefined ? String(f.defaultValue) : ''}
                      />
                    </div>
                  ))}
                </div>

                <button onClick={handleCalculate} className="btn-primary text-sm w-full">Calculate ROI</button>

                {/* Results */}
                {result && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-sm mb-3 text-green-700">Results</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Investment</p><p className="font-bold">{fmt(result.investmentCost)}</p></div>
                      {result.subsidyAmount ? <div className="bg-orange-50 rounded-lg p-3"><p className="text-xs text-gray-400">Subsidy</p><p className="font-bold text-orange-600">- {fmt(result.subsidyAmount)}</p></div> : null}
                      <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-gray-400">Net Investment</p><p className="font-bold">{fmt(result.netInvestment)}</p></div>
                      <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-gray-400">Monthly Savings</p><p className="font-bold text-green-600">{fmt(result.monthlySavings)}</p></div>
                      <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-gray-400">Annual Savings</p><p className="font-bold text-green-600">{fmt(result.annualSavings)}</p></div>
                      <div className="bg-purple-50 rounded-lg p-3"><p className="text-xs text-gray-400">Payback</p><p className="font-bold">{result.paybackMonths} months</p></div>
                      {result.fiveYearSavings ? <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">5-Year Savings</p><p className="font-bold">{fmt(result.fiveYearSavings)}</p></div> : null}
                      {result.irr ? <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">IRR</p><p className="font-bold">{result.irr}%</p></div> : null}
                      {result.co2ReductionKg ? <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-gray-400">CO₂ Reduction</p><p className="font-bold text-green-600">{(result.co2ReductionKg / 1000).toFixed(1)} t/yr</p></div> : null}
                    </div>

                    {/* Save */}
                    <div className="mt-4 flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">Name this calculation</label>
                        <input value={calcName} onChange={e => setCalcName(e.target.value)} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" placeholder="e.g., Solar 25kW Rooftop" />
                      </div>
                      <button onClick={handleSave} disabled={saving || !calcName} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={() => setShowCalc(false)} className="text-sm px-4 py-2 rounded-lg border hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
