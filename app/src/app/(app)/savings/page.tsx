'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, IndianRupee, Clock, CheckCircle2, PlusCircle, Zap, Leaf, UserCheck } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';

interface SavingsEntry {
  month: number;
  year: number;
  savingsAmount: number;
  kwhSaved: number | null;
}

interface SavingsMeasure {
  id: string;
  name: string;
  description: string | null;
  category: string;
  investmentCost: number;
  implementationDate: string;
  status: string;
  estimatedMonthlySavings: number | null;
  actualMonthlySavings: number | null;
  estimatedKwhSavings: number | null;
  actualKwhSavings: number | null;
  paybackMonths: number | null;
  cumulativeSavings: number | null;
  notes: string | null;
  energySource: { name: string } | null;
  createdBy: { name: string };
  entries: SavingsEntry[];
}

interface ConsultantROI {
  consultantName: string;
  monthlyFee: number;
  monthsEngaged: number;
  totalFeesPaid: number;
  totalSavingsDelivered: number;
  savingsMultiple: number;
  netBenefit: number;
  monthlySavingsVsFee: number;
}

interface SavingsData {
  measures: SavingsMeasure[];
  summary: {
    totalInvestment: number;
    totalMonthlySavings: number;
    totalCumulativeSavings: number;
    implementedCount: number;
    verifiedCount: number;
    totalMeasures: number;
    projectedAnnualSavings: number;
  };
  trend: { month: string; savings: number; kwhSaved: number }[];
  consultantROI: ConsultantROI | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  SOLAR: 'Solar', VFD: 'VFD', LED: 'LED', POWER_FACTOR: 'Power Factor',
  COMPRESSED_AIR: 'Compressed Air', MOTOR: 'Motor', TRANSFORMER: 'Transformer',
  HVAC: 'HVAC', PROCESS: 'Process', OTHER: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'yellow', IMPLEMENTED: 'blue', VERIFIED: 'green',
};

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

export default function SavingsPage() {
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'VFD', investmentCost: '', implementationDate: '', estimatedMonthlySavings: '', estimatedKwhSavings: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch('/api/savings').then(r => r.json()).then(setData).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        investmentCost: parseFloat(form.investmentCost),
        estimatedMonthlySavings: form.estimatedMonthlySavings ? parseFloat(form.estimatedMonthlySavings) : null,
        estimatedKwhSavings: form.estimatedKwhSavings ? parseFloat(form.estimatedKwhSavings) : null,
      }),
    });
    if (res.ok) { setShowForm(false); setForm({ name: '', category: 'VFD', investmentCost: '', implementationDate: '', estimatedMonthlySavings: '', estimatedKwhSavings: '', notes: '' }); fetchData(); }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!data) return <div className="text-red-600">Failed to load savings data</div>;

  const { summary, measures, trend } = data;
  const maxTrend = Math.max(...trend.map(t => t.savings), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Tracker"
        subtitle="Measure and prove the financial impact of energy improvements"
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle className="h-4 w-4" /> Add Measure
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Cumulative Savings</p>
              <p className="text-xl font-bold text-green-600">{fmt(summary.totalCumulativeSavings)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><IndianRupee className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Monthly Savings</p>
              <p className="text-xl font-bold text-blue-600">{fmt(summary.totalMonthlySavings)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Clock className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Total Investment</p>
              <p className="text-xl font-bold">{fmt(summary.totalInvestment)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><Leaf className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Projected Annual</p>
              <p className="text-xl font-bold text-orange-600">{fmt(summary.projectedAnnualSavings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings vs Investment Bar */}
      {summary.totalInvestment > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Savings vs. Investment</h3>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Investment: {fmt(summary.totalInvestment)}</p>
              <div className="h-6 bg-red-100 rounded-full overflow-hidden">
                <div className="h-6 bg-red-400 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Savings to date: {fmt(summary.totalCumulativeSavings)}</p>
              <div className="h-6 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-6 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (summary.totalCumulativeSavings / summary.totalInvestment) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {summary.totalCumulativeSavings >= summary.totalInvestment
              ? <span className="text-green-600 font-medium">Investment recovered! Net gain: {fmt(summary.totalCumulativeSavings - summary.totalInvestment)}</span>
              : <span>Remaining to recover: {fmt(summary.totalInvestment - summary.totalCumulativeSavings)}</span>
            }
          </p>
        </div>
      )}

      {/* Savings by Category */}
      {measures.length > 0 && (() => {
        const cats: Record<string, { investment: number; savings: number; count: number }> = {};
        measures.forEach(m => {
          const cat = CATEGORY_LABELS[m.category] || m.category;
          if (!cats[cat]) cats[cat] = { investment: 0, savings: 0, count: 0 };
          cats[cat].investment += m.investmentCost;
          cats[cat].savings += m.cumulativeSavings || 0;
          cats[cat].count++;
        });
        const entries = Object.entries(cats).sort((a, b) => b[1].savings - a[1].savings);
        const maxSavings = Math.max(...entries.map(([, v]) => v.savings), 1);

        return (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-4">Savings by Category</h3>
            <div className="space-y-3">
              {entries.map(([cat, data]) => (
                <div key={cat} className="flex items-center gap-4">
                  <span className="text-sm w-28 truncate font-medium">{cat}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-6 bg-green-500 rounded-full" style={{ width: `${(data.savings / maxSavings) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-green-600 w-20 text-right">{fmt(data.savings)}</span>
                  <span className="text-xs text-gray-400 w-16 text-right">{data.count} measures</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Consultant Fee vs Savings (ROI Proof) */}
      {data.consultantROI && (
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-700">Consultant ROI Proof</h3>
            {data.consultantROI.consultantName && (
              <span className="text-xs px-2 py-0.5 bg-green-100 rounded-full text-green-700">{data.consultantROI.consultantName}</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Monthly Fee</p>
              <p className="text-lg font-bold">{fmt(data.consultantROI.monthlyFee)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Fees Paid ({data.consultantROI.monthsEngaged} months)</p>
              <p className="text-lg font-bold">{fmt(data.consultantROI.totalFeesPaid)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600">Savings Delivered</p>
              <p className="text-lg font-bold text-green-700">{fmt(data.consultantROI.totalSavingsDelivered)}</p>
            </div>
            <div className={`rounded-lg p-3 ${data.consultantROI.netBenefit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-gray-500">Net Benefit</p>
              <p className={`text-lg font-bold ${data.consultantROI.netBenefit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{data.consultantROI.netBenefit >= 0 ? '+' : ''}{fmt(data.consultantROI.netBenefit)}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Savings Multiple:</span>
              <span className={`text-xl font-bold ${data.consultantROI.savingsMultiple >= 1 ? 'text-green-600' : 'text-orange-600'}`}>{data.consultantROI.savingsMultiple}x</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Monthly savings per ₹ of fee:</span>
              <span className={`text-xl font-bold ${data.consultantROI.monthlySavingsVsFee >= 1 ? 'text-green-600' : 'text-orange-600'}`}>{data.consultantROI.monthlySavingsVsFee}x</span>
            </div>
          </div>
          {data.consultantROI.savingsMultiple >= 1 && (
            <p className="text-sm text-green-600 font-medium mt-3">Consultant engagement has already paid for itself {data.consultantROI.savingsMultiple}x over.</p>
          )}
        </div>
      )}

      {/* Monthly Savings Trend */}
      {trend.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Monthly Savings Trend</h3>
          <div className="flex items-end gap-1 h-40">
            {trend.map(t => (
              <div key={t.month} className="flex-1 flex flex-col items-center">
                <span className="text-[10px] text-gray-500 mb-1">{fmt(t.savings)}</span>
                <div
                  className="w-full bg-green-500 rounded-t transition-all duration-300 min-h-[4px]"
                  style={{ height: `${(t.savings / maxTrend) * 100}%` }}
                />
                <span className="text-[10px] text-gray-400 mt-1">{t.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measures List */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">Improvement Measures ({measures.length})</h3>
        <div className="space-y-3">
          {measures.map(m => (
            <div key={m.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span className="font-medium text-sm">{m.name}</span>
                    <StatusBadge label={m.status} color={STATUS_COLORS[m.status] || 'gray'} />
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{CATEGORY_LABELS[m.category] || m.category}</span>
                  </div>
                  {m.description && <p className="text-xs text-gray-500 mt-1">{m.description}</p>}
                  {m.energySource && <p className="text-xs text-gray-400 mt-1">Source: {m.energySource.name}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{fmt(m.investmentCost)}</p>
                  <p className="text-xs text-gray-400">invested</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-400">Est. Monthly</p>
                  <p className="text-sm font-medium">{m.estimatedMonthlySavings ? fmt(m.estimatedMonthlySavings) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Actual Monthly</p>
                  <p className="text-sm font-medium text-green-600">{m.actualMonthlySavings ? fmt(m.actualMonthlySavings) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Payback</p>
                  <p className="text-sm font-medium">{m.paybackMonths ? `${m.paybackMonths} months` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Saved</p>
                  <p className="text-sm font-medium text-green-600">{m.cumulativeSavings ? fmt(m.cumulativeSavings) : '—'}</p>
                </div>
              </div>

              {/* Mini savings chart */}
              {m.entries.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-400 mb-2">Monthly Savings ({m.entries.length} months recorded)</p>
                  <div className="flex items-end gap-1 h-12">
                    {m.entries.map((e, i) => {
                      const max = Math.max(...m.entries.map(x => x.savingsAmount));
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-green-400 rounded-t min-h-[2px]"
                            style={{ height: `${(e.savingsAmount / max) * 100}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Measure Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Add Improvement Measure</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" placeholder="e.g., VFD on CNC Machine #3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Investment Cost (₹) *</label>
                  <input required type="number" value={form.investmentCost} onChange={e => setForm(f => ({ ...f, investmentCost: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Implementation Date *</label>
                  <input required type="date" value={form.implementationDate} onChange={e => setForm(f => ({ ...f, implementationDate: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Est. Monthly Savings (₹)</label>
                  <input type="number" value={form.estimatedMonthlySavings} onChange={e => setForm(f => ({ ...f, estimatedMonthlySavings: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2 h-16 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Add Measure'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
