'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';
import { IndianRupee, TrendingDown, TrendingUp, Zap, BarChart3, Gauge, AlertTriangle, Receipt } from 'lucide-react';

interface CostData {
  tariffs: { gridTariffRate: number | null; solarTariffRate: number | null; dgTariffRate: number | null };
  summary: { totalCost: number; totalUnits: number; avgMonthlyCost: number; monthCount: number; momChange: number | null };
  monthly: { month: string; totalCost: number; totalUnits: number; sources: Record<string, { cost: number; units: number }> }[];
  sourceBreakdown: { name: string; totalCost: number; totalUnits: number }[];
  lastMonth: { month: string; totalCost: number; totalUnits: number } | null;
}

interface BillSummary {
  totalBills: number;
  totalAmount: number;
  totalPfPenalty: number;
  avgPowerFactor: number;
  monthsWithPenalty: number;
  monthsWithOvershoot: number;
  contractDemand: number | null;
  pfTarget: number | null;
}

interface UtilityBill {
  month: number;
  year: number;
  powerFactor: number | null;
  pfPenalty: number | null;
  demandKVA: number | null;
  totalAmount: number;
  hasPfPenalty: boolean;
  hasDemandOvershoot: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export default function EnergyCostsPage() {
  const [data, setData] = useState<CostData | null>(null);
  const [billData, setBillData] = useState<{ bills: UtilityBill[]; summary: BillSummary } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/costs').then(r => r.json()),
      fetch('/api/utility-bills').then(r => r.json()).catch(() => null),
    ]).then(([costData, utilityData]) => {
      setData(costData);
      if (utilityData) setBillData(utilityData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}</div></div>;
  if (!data) return <div className="text-red-600">Failed to load cost data</div>;

  const { summary, monthly, sourceBreakdown, lastMonth } = data;

  // Find max cost for bar chart scaling
  const maxCost = monthly.length > 0 ? Math.max(...monthly.map(m => m.totalCost)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Energy Costs" subtitle="Financial view of energy consumption (₹)" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><IndianRupee className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</p>
              <p className="text-xs text-gray-500">Total ({summary.monthCount} months)</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><BarChart3 className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(summary.avgMonthlyCost)}</p>
              <p className="text-xs text-gray-500">Avg Monthly</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600"><Zap className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{(summary.totalUnits / 1000).toFixed(0)}k</p>
              <p className="text-xs text-gray-500">Total kWh</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${summary.momChange !== null && summary.momChange < 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {summary.momChange !== null && summary.momChange < 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.momChange !== null ? `${summary.momChange > 0 ? '+' : ''}${summary.momChange}%` : '—'}</p>
              <p className="text-xs text-gray-500">vs Prev Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly cost chart (simple bar chart) */}
      <div className="card">
        <h3 className="font-semibold mb-4">Monthly Energy Cost (₹)</h3>
        {monthly.length === 0 ? (
          <p className="text-gray-500 text-sm">No cost data available</p>
        ) : (
          <div className="space-y-2">
            {monthly.slice(-12).map(m => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">{formatMonth(m.month)}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${(m.totalCost / maxCost) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-20 text-right">{formatCurrency(m.totalCost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source breakdown */}
      <div className="card">
        <h3 className="font-semibold mb-4">Cost by Energy Source</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4 text-right">Total Units</th>
                <th className="pb-2 pr-4 text-right">Total Cost (₹)</th>
                <th className="pb-2 text-right">Avg ₹/unit</th>
              </tr>
            </thead>
            <tbody>
              {sourceBreakdown.map(src => (
                <tr key={src.name} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{src.name}</td>
                  <td className="py-2 pr-4 text-right">{src.totalUnits.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right font-medium">{formatCurrency(src.totalCost)}</td>
                  <td className="py-2 text-right text-gray-500">
                    {src.totalUnits > 0 ? `₹${(src.totalCost / src.totalUnits).toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PF & Demand Tracking */}
      {billData && billData.bills.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card text-center">
              <Gauge className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{billData.summary.avgPowerFactor}</p>
              <p className="text-xs text-gray-500 mt-1">
                Avg Power Factor{billData.summary.pfTarget ? ` (Target: ${billData.summary.pfTarget})` : ''}
              </p>
              {billData.summary.avgPowerFactor < (billData.summary.pfTarget || 0.9) && (
                <p className="text-xs text-red-500 mt-1 font-medium">Below target — penalties apply</p>
              )}
            </div>
            <div className="card text-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{formatCurrency(billData.summary.totalPfPenalty)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Total PF Penalties ({billData.summary.monthsWithPenalty} of {billData.summary.totalBills} months)
              </p>
            </div>
            <div className="card text-center">
              <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{billData.summary.monthsWithOvershoot}</p>
              <p className="text-xs text-gray-500 mt-1">
                Demand Overshoot Months{billData.summary.contractDemand ? ` (>${billData.summary.contractDemand} kVA)` : ''}
              </p>
            </div>
          </div>

          {/* PF Trend */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Power Factor Trend</h3>
              <Link href="/utility-bills" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                <Receipt className="h-3 w-3" /> View All Bills
              </Link>
            </div>
            <div className="flex items-end gap-1 h-40">
              {[...billData.bills].reverse().map((bill) => {
                const pf = bill.powerFactor || 0;
                const target = billData.summary.pfTarget || 0.9;
                const height = pf > 0 ? ((pf - 0.7) / 0.3) * 100 : 0; // Scale 0.7-1.0 to 0-100%
                const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return (
                  <div key={`${bill.year}-${bill.month}`} className="flex-1 flex flex-col items-center group relative">
                    <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      PF: {pf}{bill.hasPfPenalty ? ` | Penalty: ₹${bill.pfPenalty}` : ''}
                    </div>
                    <div
                      className={`w-full rounded-t transition-all ${pf < target ? 'bg-red-400' : 'bg-green-400'}`}
                      style={{ height: `${Math.max(5, height)}%` }}
                    />
                    <span className="text-xs text-gray-400 mt-1">{MONTH_NAMES[bill.month]}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded inline-block" /> Above target
              <span className="w-3 h-3 bg-red-400 rounded inline-block ml-2" /> Below target
            </div>
          </div>
        </>
      )}

      {/* Tariff configuration */}
      {data.tariffs && (
        <div className="card">
          <h3 className="font-semibold mb-4">Tariff Configuration</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Grid (EB)</p>
              <p className="font-medium">₹{data.tariffs.gridTariffRate || '—'}/kWh</p>
            </div>
            <div>
              <p className="text-gray-500">Solar</p>
              <p className="font-medium">₹{data.tariffs.solarTariffRate ?? '—'}/kWh</p>
            </div>
            <div>
              <p className="text-gray-500">DG</p>
              <p className="font-medium">₹{data.tariffs.dgTariffRate || '—'}/kWh</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
