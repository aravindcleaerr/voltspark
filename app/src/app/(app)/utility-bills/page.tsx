'use client';

import { useEffect, useState } from 'react';
import { Receipt, AlertTriangle, TrendingDown, Zap, Gauge, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

interface Bill {
  id: string;
  month: number;
  year: number;
  provider: string | null;
  tariffCategory: string | null;
  unitsConsumed: number;
  demandKVA: number | null;
  powerFactor: number | null;
  energyCharges: number | null;
  demandCharges: number | null;
  pfPenalty: number | null;
  pfIncentive: number | null;
  fuelSurcharge: number | null;
  electricityDuty: number | null;
  otherCharges: number | null;
  totalAmount: number;
  hasPfPenalty: boolean;
  hasDemandOvershoot: boolean;
  hasAnomaly: boolean;
  anomalyNote: string | null;
  isEstimated: boolean;
  notes: string | null;
  enteredBy: { name: string } | null;
}

interface Summary {
  totalBills: number;
  totalAmount: number;
  totalPfPenalty: number;
  avgPowerFactor: number;
  monthsWithPenalty: number;
  monthsWithOvershoot: number;
  anomalyMonths: number;
  contractDemand: number | null;
  pfTarget: number | null;
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function UtilityBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    provider: 'BESCOM', tariffCategory: 'LT_INDUSTRIAL',
    unitsConsumed: '', demandKVA: '', powerFactor: '',
    energyCharges: '', demandCharges: '', pfPenalty: '', pfIncentive: '',
    fuelSurcharge: '', electricityDuty: '', otherCharges: '', totalAmount: '',
    meterReadingStart: '', meterReadingEnd: '', isEstimated: false, notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch('/api/utility-bills')
      .then(r => r.json())
      .then(data => { setBills(data.bills); setSummary(data.summary); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      month: form.month, year: form.year,
      provider: form.provider, tariffCategory: form.tariffCategory,
      unitsConsumed: Number(form.unitsConsumed) || 0,
      demandKVA: Number(form.demandKVA) || undefined,
      powerFactor: Number(form.powerFactor) || undefined,
      energyCharges: Number(form.energyCharges) || undefined,
      demandCharges: Number(form.demandCharges) || undefined,
      pfPenalty: Number(form.pfPenalty) || undefined,
      pfIncentive: Number(form.pfIncentive) || undefined,
      fuelSurcharge: Number(form.fuelSurcharge) || undefined,
      electricityDuty: Number(form.electricityDuty) || undefined,
      otherCharges: Number(form.otherCharges) || undefined,
      totalAmount: Number(form.totalAmount) || 0,
      meterReadingStart: Number(form.meterReadingStart) || undefined,
      meterReadingEnd: Number(form.meterReadingEnd) || undefined,
      isEstimated: form.isEstimated,
      notes: form.notes || undefined,
    };

    const res = await fetch('/api/utility-bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowForm(false);
      setForm(prev => ({ ...prev, unitsConsumed: '', demandKVA: '', powerFactor: '', energyCharges: '', demandCharges: '', pfPenalty: '', pfIncentive: '', fuelSurcharge: '', electricityDuty: '', otherCharges: '', totalAmount: '', meterReadingStart: '', meterReadingEnd: '', isEstimated: false, notes: '' }));
      fetchData();
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utility Bills"
        subtitle="Bill analysis, PF penalty tracking & cost breakdown"
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Bill
          </button>
        }
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="card text-center">
            <Receipt className="h-6 w-6 text-brand-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</p>
            <p className="text-xs text-gray-500">Total ({summary.totalBills} months)</p>
          </div>
          <div className="card text-center">
            <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalPfPenalty)}</p>
            <p className="text-xs text-gray-500">PF Penalties ({summary.monthsWithPenalty} months)</p>
          </div>
          <div className="card text-center">
            <Gauge className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{summary.avgPowerFactor}</p>
            <p className="text-xs text-gray-500">Avg Power Factor{summary.pfTarget ? ` (Target: ${summary.pfTarget})` : ''}</p>
          </div>
          <div className="card text-center">
            <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{summary.monthsWithOvershoot}</p>
            <p className="text-xs text-gray-500">Demand Overshoot{summary.contractDemand ? ` (>${summary.contractDemand} kVA)` : ''}</p>
          </div>
        </div>
      )}

      {/* Add Bill Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card border-2 border-brand-200">
          <h3 className="font-semibold mb-4">Add Utility Bill</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Month</label>
              <select value={form.month} onChange={e => setForm(p => ({ ...p, month: Number(e.target.value) }))} className="input">
                {MONTH_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))} className="input" />
            </div>
            <div>
              <label className="label">Provider</label>
              <input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Tariff Category</label>
              <input value={form.tariffCategory} onChange={e => setForm(p => ({ ...p, tariffCategory: e.target.value }))} className="input" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            <div>
              <label className="label">Units Consumed (kWh) *</label>
              <input type="number" value={form.unitsConsumed} onChange={e => setForm(p => ({ ...p, unitsConsumed: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">Demand (kVA)</label>
              <input type="number" value={form.demandKVA} onChange={e => setForm(p => ({ ...p, demandKVA: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Power Factor</label>
              <input type="number" step="0.01" value={form.powerFactor} onChange={e => setForm(p => ({ ...p, powerFactor: e.target.value }))} className="input" placeholder="0.85-1.00" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4 mt-4">
            <div>
              <label className="label">Energy Charges</label>
              <input type="number" value={form.energyCharges} onChange={e => setForm(p => ({ ...p, energyCharges: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Demand Charges</label>
              <input type="number" value={form.demandCharges} onChange={e => setForm(p => ({ ...p, demandCharges: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">PF Penalty</label>
              <input type="number" value={form.pfPenalty} onChange={e => setForm(p => ({ ...p, pfPenalty: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">PF Incentive</label>
              <input type="number" value={form.pfIncentive} onChange={e => setForm(p => ({ ...p, pfIncentive: e.target.value }))} className="input" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4 mt-4">
            <div>
              <label className="label">Fuel Surcharge</label>
              <input type="number" value={form.fuelSurcharge} onChange={e => setForm(p => ({ ...p, fuelSurcharge: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Electricity Duty</label>
              <input type="number" value={form.electricityDuty} onChange={e => setForm(p => ({ ...p, electricityDuty: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Other Charges</label>
              <input type="number" value={form.otherCharges} onChange={e => setForm(p => ({ ...p, otherCharges: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Total Amount *</label>
              <input type="number" value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))} className="input" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4 mt-4">
            <div>
              <label className="label">Meter Start</label>
              <input type="number" value={form.meterReadingStart} onChange={e => setForm(p => ({ ...p, meterReadingStart: e.target.value }))} className="input" placeholder="Start reading" />
            </div>
            <div>
              <label className="label">Meter End</label>
              <input type="number" value={form.meterReadingEnd} onChange={e => setForm(p => ({ ...p, meterReadingEnd: e.target.value }))} className="input" placeholder="End reading" />
            </div>
            <div>
              <label className="label">Notes</label>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input" placeholder="Optional notes" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isEstimated} onChange={e => setForm(p => ({ ...p, isEstimated: e.target.checked }))} className="rounded" />
                Estimated Bill
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Bill'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Bills Table */}
      {bills.length === 0 ? (
        <EmptyState icon={Receipt} title="No utility bills" description="Add your first utility bill to start tracking costs." action={<button onClick={() => setShowForm(true)} className="btn-primary">Add Bill</button>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Month</th>
                <th className="pb-3 pr-4 text-right">Units (kWh)</th>
                <th className="pb-3 pr-4 text-right">Demand (kVA)</th>
                <th className="pb-3 pr-4 text-right">Power Factor</th>
                <th className="pb-3 pr-4 text-right">PF Penalty</th>
                <th className="pb-3 pr-4 text-right">Total Amount</th>
                <th className="pb-3 pr-4 text-right">Rate/kWh</th>
                <th className="pb-3">Flags</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const ratePerKwh = bill.unitsConsumed > 0 ? (bill.totalAmount / bill.unitsConsumed).toFixed(2) : '—';
                return (
                  <tr key={bill.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{MONTH_NAMES[bill.month]} {bill.year}</td>
                    <td className="py-3 pr-4 text-right">{bill.unitsConsumed.toLocaleString('en-IN')}</td>
                    <td className="py-3 pr-4 text-right">{bill.demandKVA || '—'}</td>
                    <td className="py-3 pr-4 text-right">
                      {bill.powerFactor ? (
                        <span className={bill.powerFactor < 0.9 ? 'text-red-600 font-medium' : ''}>{bill.powerFactor}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {bill.pfPenalty ? <span className="text-red-600 font-medium">{formatCurrency(bill.pfPenalty)}</span> : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right font-medium">{formatCurrency(bill.totalAmount)}</td>
                    <td className="py-3 pr-4 text-right text-gray-500">{ratePerKwh}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {bill.hasPfPenalty && <StatusBadge label="PF" color="red" />}
                        {bill.hasDemandOvershoot && <StatusBadge label="Demand" color="orange" />}
                        {bill.hasAnomaly && <StatusBadge label="Anomaly" color="yellow" />}
                        {bill.isEstimated && <StatusBadge label="Est." color="gray" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cost Trend (simple bar chart) */}
      {bills.length > 1 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Monthly Cost Trend</h3>
          <div className="flex items-end gap-1 h-48">
            {[...bills].reverse().map((bill) => {
              const maxAmount = Math.max(...bills.map(b => b.totalAmount));
              const height = maxAmount > 0 ? (bill.totalAmount / maxAmount) * 100 : 0;
              return (
                <div key={bill.id} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(bill.totalAmount)}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all ${bill.hasPfPenalty ? 'bg-red-400' : 'bg-brand-500'}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">{MONTH_NAMES[bill.month]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
