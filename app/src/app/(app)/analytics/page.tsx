'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Heart, AlertTriangle, IndianRupee, Users, Shield, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface ClientScore {
  clientId: string;
  clientName: string;
  industry: string | null;
  employeeCount: number | null;
  healthScore: number;
  compliance: number;
  capaClosureRate: number;
  openIncidents: number;
  expiringSoonCerts: number;
  totalInvestment: number;
  totalSavings: number;
  monthlySavings: number;
  avgMonthlyBill: number;
  frameworkCount: number;
}

interface Portfolio {
  totalClients: number;
  avgHealthScore: number;
  totalSavingsDelivered: number;
  totalMonthlySavings: number;
  clientsAtRisk: number;
  clientsHealthy: number;
}

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-3 ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{score}%</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [clients, setClients] = useState<ClientScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(data => { setPortfolio(data.portfolio); setClients(data.clients); })
      .catch(() => setError('Could not load analytics. You may not have access to multiple clients.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (error) return <div className="card text-center py-12"><p className="text-gray-500">{error}</p></div>;
  if (!portfolio) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio Analytics" subtitle="Cross-client insights for your consulting practice" />

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Total Clients</p><p className="text-xl font-bold">{portfolio.totalClients}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Heart className="h-5 w-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Avg Health Score</p><p className="text-xl font-bold">{portfolio.avgHealthScore}%</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><IndianRupee className="h-5 w-5 text-purple-600" /></div><div><p className="text-xs text-gray-500">Total Savings Delivered</p><p className="text-xl font-bold text-green-600">{fmt(portfolio.totalSavingsDelivered)}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><p className="text-xs text-gray-500">Clients at Risk</p><p className="text-xl font-bold text-red-600">{portfolio.clientsAtRisk}</p></div></div></div>
      </div>

      {/* Client Health Ranking */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand-600" /> Client Health Ranking
        </h3>
        <div className="space-y-4">
          {clients.map(c => (
            <div key={c.clientId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">{c.clientName}</span>
                  {c.industry && <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{c.industry}</span>}
                  {c.employeeCount && <span className="ml-2 text-xs text-gray-400">{c.employeeCount} employees</span>}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {c.openIncidents > 0 && <span className="text-red-600 font-medium">{c.openIncidents} open incidents</span>}
                  {c.expiringSoonCerts > 0 && <span className="text-yellow-600 font-medium">{c.expiringSoonCerts} certs expiring</span>}
                </div>
              </div>
              <HealthBar score={c.healthScore} />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 pt-3 border-t text-sm">
                <div>
                  <p className="text-xs text-gray-400">Compliance</p>
                  <p className="font-medium">{c.compliance}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">CAPA Closure</p>
                  <p className="font-medium">{c.capaClosureRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Monthly Savings</p>
                  <p className="font-medium text-green-600">{fmt(c.monthlySavings)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Savings</p>
                  <p className="font-medium text-green-600">{fmt(c.totalSavings)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Bill</p>
                  <p className="font-medium">{fmt(c.avgMonthlyBill)}/mo</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
