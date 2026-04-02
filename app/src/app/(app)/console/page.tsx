'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { Building2, TrendingUp, AlertTriangle, IndianRupee, Plus, Zap, ClipboardCheck, Shield, GraduationCap, ChefHat, Radio } from 'lucide-react';

interface ClientSummary {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  accessMode: string;
  enabledAddons: string;
  complianceScore: number;
  capaClosureRate: number;
  openFindings: number;
  totalEnergyCost: number;
  stats: { energySources: number; consumptionEntries: number; trainingPrograms: number; audits: number; capas: number };
}

interface ConsoleData {
  organization: { name: string; plan: string };
  clients: ClientSummary[];
}

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-semibold w-10 text-right">{score}%</span>
    </div>
  );
}

export default function ConsolePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);

  const orgRole = (session?.user as any)?.orgRole;

  useEffect(() => {
    fetch('/api/console')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const switchToClient = async (client: ClientSummary) => {
    const res = await fetch('/api/auth/switch-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id }),
    });
    if (res.ok) {
      const sessionData = await res.json();
      await update(sessionData);
      router.push('/dashboard');
    }
  };

  const toggleAddon = async (e: React.MouseEvent, client: ClientSummary, addon: string) => {
    e.stopPropagation();
    const addons: string[] = JSON.parse(client.enabledAddons || '[]');
    const enabled = !addons.includes(addon);
    const res = await fetch(`/api/clients/${client.id}/addons`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addon, enabled }),
    });
    if (res.ok) {
      fetch('/api/console').then(r => r.json()).then(setData).catch(() => {});
    }
  };

  const hasAddon = (client: ClientSummary, addon: string) => {
    try { return JSON.parse(client.enabledAddons || '[]').includes(addon); } catch { return false; }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-48 bg-gray-200 rounded-lg" />)}</div></div>;

  if (!data) return <div className="text-center py-12 text-gray-500">Unable to load console. Are you a consultant?</div>;

  const totalCost = data.clients.reduce((sum, c) => sum + c.totalEnergyCost, 0);
  const avgScore = data.clients.length > 0 ? Math.round(data.clients.reduce((sum, c) => sum + c.complianceScore, 0) / data.clients.length) : 0;
  const totalFindings = data.clients.reduce((sum, c) => sum + c.openFindings, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio"
        subtitle={`${data.organization.name} — ${data.clients.length} active client${data.clients.length !== 1 ? 's' : ''}`}
        action={orgRole === 'OWNER' || orgRole === 'ADMIN' ? (
          <Link href="/console/clients/new" className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Client
          </Link>
        ) : undefined}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Building2 className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{data.clients.length}</p><p className="text-xs text-gray-500">Clients</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{avgScore}%</p><p className="text-xs text-gray-500">Avg Compliance</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{totalFindings}</p><p className="text-xs text-gray-500">Open Findings</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><IndianRupee className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{formatCurrency(totalCost)}</p><p className="text-xs text-gray-500">Total Energy Cost</p></div>
          </div>
        </div>
      </div>

      {/* Client cards */}
      {data.clients.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">No clients yet</h3>
          <p className="text-gray-500 mt-1">Add your first client to get started</p>
          <Link href="/console/clients/new" className="btn-primary mt-4 inline-block">Add Client</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.clients.map(client => (
            <button
              key={client.id}
              onClick={() => switchToClient(client)}
              className="card text-left hover:shadow-md hover:border-brand-200 transition-all border border-transparent"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  {client.industry && <p className="text-xs text-gray-500">{client.industry}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                  {client.accessMode === 'CONSULTANT_MANAGED' ? 'Managed' : client.accessMode === 'COLLABORATIVE' ? 'Collaborative' : 'Self-service'}
                </span>
              </div>

              <ScoreBar score={client.complianceScore} />

              <div className="grid grid-cols-4 gap-2 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1"><Zap className="h-3 w-3" />{client.stats.energySources}</div>
                <div className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{client.stats.trainingPrograms}</div>
                <div className="flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />{client.stats.audits}</div>
                <div className="flex items-center gap-1"><Shield className="h-3 w-3" />{client.stats.capas}</div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs">
                <span className="text-gray-500">Energy cost: <strong className="text-gray-700">{formatCurrency(client.totalEnergyCost)}</strong></span>
                {client.openFindings > 0 && (
                  <span className="text-orange-600 font-medium">{client.openFindings} open finding{client.openFindings !== 1 ? 's' : ''}</span>
                )}
              </div>

              {/* Add-ons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
                <span className="text-xs text-gray-400">Add-ons:</span>
                <button
                  onClick={(e) => toggleAddon(e, client, 'KITCHEN')}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                    hasAddon(client, 'KITCHEN')
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  <ChefHat className="h-3 w-3" />
                  Kitchen {hasAddon(client, 'KITCHEN') ? '✓' : ''}
                </button>
                <button
                  onClick={(e) => toggleAddon(e, client, 'IOT_METERING')}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                    hasAddon(client, 'IOT_METERING')
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  <Radio className="h-3 w-3" />
                  IoT Metering {hasAddon(client, 'IOT_METERING') ? '✓' : ''}
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
