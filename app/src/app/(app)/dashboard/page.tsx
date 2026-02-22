'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Zap, Target, GraduationCap, ClipboardCheck, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface DashboardData {
  complianceScore: { overall: number; sources: number; targets: number; dataCurrency: number; training: number; audits: number; capa: number };
  stats: { energySources: number; activeTargets: number; recentEntries: number; deviations: number; trainingPrograms: number; completedTraining: number; audits: number; openFindings: number; totalCapas: number; closedCapas: number };
  deviationAlerts: any[];
  recentConsumption: any[];
}

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
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

      {/* Deviation Alerts */}
      {deviationAlerts.length > 0 && (
        <div className="card border-l-4 border-l-red-500">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" /> Recent Deviation Alerts
          </h3>
          <div className="space-y-2">
            {deviationAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between text-sm bg-red-50 rounded px-3 py-2">
                <span><strong>{alert.energySource.name}</strong> — {alert.deviationNote}</span>
                <span className="text-gray-500">{new Date(alert.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
