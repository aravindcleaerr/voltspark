'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Zap, Target, GraduationCap, ClipboardCheck, Shield, AlertTriangle, TrendingUp, IndianRupee, ArrowUpRight, ArrowDownRight, Factory } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/components/layout/PageHeader';

interface DashboardData {
  complianceScore: { overall: number; sources: number; targets: number; dataCurrency: number; training: number; audits: number; capa: number };
  stats: { energySources: number; activeTargets: number; recentEntries: number; deviations: number; trainingPrograms: number; completedTraining: number; audits: number; openFindings: number; totalCapas: number; closedCapas: number };
  deviationAlerts: any[];
  recentConsumption: any[];
  energyCost: { totalRecent: number; predictedNextMonth: number | null; recentBillTrend: { month: string; amount: number }[] };
  clientProfile: { industry: string | null; employeeCount: number | null; name: string };
}

interface TrendMonth {
  month: string;
  label: string;
  cost: number;
  units: number;
  powerFactor: number | null;
  demand: number | null;
  savings: number;
  incidents: number;
  inspections: number;
  inspectionScore: number | null;
}

interface TrendsData {
  monthly: TrendMonth[];
  yoy: { costChange: number | null; unitsChange: number | null; currentCost: number; previousCost: number; currentUnits: number; previousUnits: number };
}

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

// Indian industry benchmarks: monthly cost per employee (₹) and kWh per employee
const INDUSTRY_BENCHMARKS: Record<string, { costPerEmp: number; kwhPerEmp: number; label: string }> = {
  MANUFACTURING: { costPerEmp: 8500, kwhPerEmp: 950, label: 'Manufacturing' },
  AUTOMOTIVE: { costPerEmp: 9500, kwhPerEmp: 1100, label: 'Automotive' },
  TEXTILE: { costPerEmp: 7000, kwhPerEmp: 800, label: 'Textile' },
  PHARMACEUTICAL: { costPerEmp: 6000, kwhPerEmp: 650, label: 'Pharmaceutical' },
  FOOD_PROCESSING: { costPerEmp: 7500, kwhPerEmp: 850, label: 'Food Processing' },
  CHEMICAL: { costPerEmp: 12000, kwhPerEmp: 1400, label: 'Chemical' },
  STEEL: { costPerEmp: 15000, kwhPerEmp: 1800, label: 'Steel & Metal' },
  CEMENT: { costPerEmp: 14000, kwhPerEmp: 1600, label: 'Cement' },
  PAPER: { costPerEmp: 10000, kwhPerEmp: 1200, label: 'Paper & Pulp' },
  IT_SERVICES: { costPerEmp: 2500, kwhPerEmp: 250, label: 'IT / Services' },
  COMMERCIAL: { costPerEmp: 3500, kwhPerEmp: 350, label: 'Commercial' },
  HOSPITAL: { costPerEmp: 5000, kwhPerEmp: 500, label: 'Hospital' },
  EDUCATION: { costPerEmp: 2000, kwhPerEmp: 200, label: 'Education' },
};

function ScoreRing({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{score}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/dashboard/trends').then(r => r.json()),
    ]).then(([dash, trendData]) => {
      setData(dash);
      setTrends(trendData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}</div></div>;
  if (!data) return <div className="text-red-600">Failed to load dashboard</div>;

  const { complianceScore, stats, deviationAlerts } = data;

  const statCards = [
    { label: 'Energy Sources', value: stats.energySources, icon: Zap, href: '/energy-sources', color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Active Targets', value: stats.activeTargets, icon: Target, href: '/targets', color: 'text-blue-600 bg-blue-100' },
    { label: 'Recent Entries', value: stats.recentEntries, icon: BarChart3, href: '/consumption', color: 'text-green-600 bg-green-100' },
    { label: 'Deviations (30d)', value: stats.deviations, icon: AlertTriangle, href: '/consumption', color: 'text-red-600 bg-red-100' },
    { label: 'Training Programs', value: stats.trainingPrograms, icon: GraduationCap, href: '/training', color: 'text-purple-600 bg-purple-100' },
    { label: 'Audits', value: stats.audits, icon: ClipboardCheck, href: '/audits', color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Open Findings', value: stats.openFindings, icon: AlertTriangle, href: '/audits', color: 'text-orange-600 bg-orange-100' },
    { label: 'CAPA Closure', value: `${stats.closedCapas}/${stats.totalCapas}`, icon: Shield, href: '/capa', color: 'text-teal-600 bg-teal-100' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Energy Management Overview" />

      {/* Compliance Score */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold">Compliance Score</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="relative">
            <ScoreRing score={complianceScore.overall} label="Overall" size={120} />
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            <ScoreRing score={complianceScore.sources} label="Sources" />
            <ScoreRing score={complianceScore.targets} label="Targets" />
            <ScoreRing score={complianceScore.dataCurrency} label="Data" />
            <ScoreRing score={complianceScore.training} label="Training" />
            <ScoreRing score={complianceScore.audits} label="Audits" />
            <ScoreRing score={complianceScore.capa} label="CAPA" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Energy Cost Prediction */}
      {data.energyCost && (data.energyCost.predictedNextMonth !== null || data.energyCost.recentBillTrend?.length > 0) && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">Energy Cost Forecast</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.energyCost.predictedNextMonth !== null && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Predicted Next Month Cost</p>
                <p className="text-3xl font-bold text-blue-700">{fmt(data.energyCost.predictedNextMonth)}</p>
                <p className="text-xs text-gray-500 mt-1">Based on linear trend from last {data.energyCost.recentBillTrend?.length || 0} bills</p>
              </div>
            )}
            {data.energyCost.recentBillTrend && data.energyCost.recentBillTrend.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Recent Bill Trend</p>
                <div className="flex items-end gap-1 h-24">
                  {data.energyCost.recentBillTrend.map((b: any) => {
                    const max = Math.max(...data.energyCost.recentBillTrend.map((x: any) => x.amount));
                    return (
                      <div key={b.month} className="flex-1 flex flex-col items-center">
                        <span className="text-[9px] text-gray-500 mb-1">{fmt(b.amount)}</span>
                        <div
                          className="w-full bg-blue-500 rounded-t min-h-[4px]"
                          style={{ height: `${(b.amount / max) * 100}%` }}
                        />
                        <span className="text-[9px] text-gray-400 mt-1">{b.month.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 12-Month Trend Charts */}
      {trends && trends.monthly.some(m => m.cost > 0 || m.units > 0) && (
        <div className="space-y-4">
          {/* YoY Summary */}
          {(trends.yoy.costChange !== null || trends.yoy.unitsChange !== null) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trends.yoy.costChange !== null && (
                <div className="card flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${trends.yoy.costChange <= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {trends.yoy.costChange <= 0 ? <ArrowDownRight className="h-6 w-6 text-green-600" /> : <ArrowUpRight className="h-6 w-6 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cost YoY (6-month)</p>
                    <p className={`text-2xl font-bold ${trends.yoy.costChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trends.yoy.costChange > 0 ? '+' : ''}{trends.yoy.costChange}%
                    </p>
                    <p className="text-xs text-gray-400">{fmt(trends.yoy.previousCost)} → {fmt(trends.yoy.currentCost)}</p>
                  </div>
                </div>
              )}
              {trends.yoy.unitsChange !== null && (
                <div className="card flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${trends.yoy.unitsChange <= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {trends.yoy.unitsChange <= 0 ? <ArrowDownRight className="h-6 w-6 text-green-600" /> : <ArrowUpRight className="h-6 w-6 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Consumption YoY (6-month)</p>
                    <p className={`text-2xl font-bold ${trends.yoy.unitsChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trends.yoy.unitsChange > 0 ? '+' : ''}{trends.yoy.unitsChange}%
                    </p>
                    <p className="text-xs text-gray-400">{Math.round(trends.yoy.previousUnits).toLocaleString('en-IN')} → {Math.round(trends.yoy.currentUnits).toLocaleString('en-IN')} kWh</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cost Trend */}
          {trends.monthly.some(m => m.cost > 0) && (
            <div className="card">
              <h3 className="flex items-center gap-2 font-semibold mb-4"><IndianRupee className="h-4 w-4 text-green-600" /> 12-Month Cost Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.monthly}>
                    <defs>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => Number(v) >= 100000 ? `${(Number(v) / 100000).toFixed(0)}L` : `${(Number(v) / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Cost']} />
                    <Area type="monotone" dataKey="cost" stroke="#2563eb" fill="url(#costGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Consumption + Savings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {trends.monthly.some(m => m.units > 0) && (
              <div className="card">
                <h3 className="flex items-center gap-2 font-semibold mb-4"><Zap className="h-4 w-4 text-yellow-600" /> Consumption (kWh)</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => [`${Math.round(Number(v)).toLocaleString('en-IN')} kWh`, 'Consumption']} />
                      <Bar dataKey="units" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {trends.monthly.some(m => m.savings > 0) && (
              <div className="card">
                <h3 className="flex items-center gap-2 font-semibold mb-4"><TrendingUp className="h-4 w-4 text-green-600" /> Monthly Savings</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => Number(v) >= 100000 ? `${(Number(v) / 100000).toFixed(0)}L` : `${(Number(v) / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Savings']} />
                      <Bar dataKey="savings" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Safety Trends */}
          {trends.monthly.some(m => m.incidents > 0 || m.inspections > 0) && (
            <div className="card">
              <h3 className="flex items-center gap-2 font-semibold mb-4"><Shield className="h-4 w-4 text-orange-600" /> Safety Trends</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    {trends.monthly.some(m => m.incidents > 0) && (
                      <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                    {trends.monthly.some(m => m.inspections > 0) && (
                      <Line type="monotone" dataKey="inspections" name="Inspections" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deviation Alerts */}
      {deviationAlerts.length > 0 && (
        <div className="card border-l-4 border-l-red-500">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" /> Recent Deviation Alerts
          </h3>
          <div className="space-y-2">
            {deviationAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between text-sm bg-red-50 rounded px-3 py-2">
                <span><strong>{alert.energySource?.name ?? 'Unknown Source'}</strong> — {alert.deviationNote}</span>
                <span className="text-gray-500">{new Date(alert.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Benchmark Comparison */}
      {(() => {
        const industry = data.clientProfile?.industry;
        const empCount = data.clientProfile?.employeeCount;
        const bench = industry ? INDUSTRY_BENCHMARKS[industry] : null;
        if (!bench || !empCount || !trends || !trends.monthly.some(m => m.cost > 0)) return null;

        const recentMonths = trends.monthly.filter(m => m.cost > 0);
        const avgMonthlyCost = recentMonths.reduce((s, m) => s + m.cost, 0) / recentMonths.length;
        const avgMonthlyKwh = recentMonths.reduce((s, m) => s + m.units, 0) / recentMonths.length;

        const actualCostPerEmp = Math.round(avgMonthlyCost / empCount);
        const actualKwhPerEmp = Math.round(avgMonthlyKwh / empCount);
        const effectiveRate = avgMonthlyKwh > 0 ? avgMonthlyCost / avgMonthlyKwh : 0;

        const costDiff = bench.costPerEmp > 0 ? Math.round(((actualCostPerEmp - bench.costPerEmp) / bench.costPerEmp) * 100) : 0;
        const kwhDiff = bench.kwhPerEmp > 0 ? Math.round(((actualKwhPerEmp - bench.kwhPerEmp) / bench.kwhPerEmp) * 100) : 0;

        return (
          <div className="card">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Factory className="h-4 w-4 text-indigo-600" /> Industry Benchmark — {bench.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Cost / Employee / Month</p>
                <p className="text-2xl font-bold">{fmt(actualCostPerEmp)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Benchmark: {fmt(bench.costPerEmp)}</span>
                  <span className={`text-xs font-medium ${costDiff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({costDiff > 0 ? '+' : ''}{costDiff}%)
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${costDiff <= 0 ? 'bg-green-500' : costDiff <= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (actualCostPerEmp / (bench.costPerEmp * 1.5)) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">kWh / Employee / Month</p>
                <p className="text-2xl font-bold">{Math.round(actualKwhPerEmp).toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Benchmark: {bench.kwhPerEmp.toLocaleString('en-IN')}</span>
                  <span className={`text-xs font-medium ${kwhDiff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({kwhDiff > 0 ? '+' : ''}{kwhDiff}%)
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${kwhDiff <= 0 ? 'bg-green-500' : kwhDiff <= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (actualKwhPerEmp / (bench.kwhPerEmp * 1.5)) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Effective Rate</p>
                <p className="text-2xl font-bold">₹{effectiveRate.toFixed(2)}/kWh</p>
                <p className="text-xs text-gray-400 mt-1">{empCount} employees</p>
                <p className="text-xs text-gray-400">Avg over {recentMonths.length} months</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Benchmarks are indicative averages for the Indian {bench.label.toLowerCase()} sector. Actual figures vary by location, scale, and equipment.</p>
          </div>
        );
      })()}
    </div>
  );
}
