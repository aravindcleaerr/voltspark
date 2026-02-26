'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';

interface ReadinessRequirement {
  id: string;
  code: string;
  category: string;
  title: string;
  isCritical: boolean;
  weight: number;
  currentStatus: string;
  evidenceModule: string | null;
  evidenceAvailable: boolean;
  evidenceDetail: string;
  autoDetected: boolean;
  isReady: boolean;
  hasEvidence: boolean;
}

interface ActionItem {
  code: string;
  title: string;
  isCritical: boolean;
  reason: string;
  evidenceGap: string | null;
}

interface ReadinessData {
  framework: { code: string; name: string; version: string };
  score: number;
  readinessScore: number;
  totalRequirements: number;
  readyCount: number;
  evidenceCount: number;
  criticalMissing: number;
  requirements: ReadinessRequirement[];
  actionItems: ActionItem[];
}

const MODULE_LINKS: Record<string, { label: string; href: string }> = {
  ENERGY_SOURCE: { label: 'Energy Sources', href: '/energy-sources' },
  CONSUMPTION: { label: 'Consumption & Targets', href: '/consumption' },
  TRAINING: { label: 'Training', href: '/training' },
  AUDIT: { label: 'Audits', href: '/audits' },
  CAPA: { label: 'CAPA', href: '/capa' },
  INSPECTION: { label: 'Safety Inspections', href: '/safety' },
};

export default function ReadinessCheckPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/readiness?clientFrameworkId=${frameworkId}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [frameworkId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!data) return <div className="text-red-600">Failed to load readiness check</div>;

  const readyPct = data.readinessScore;
  const readyColor = readyPct >= 80 ? 'text-green-600' : readyPct >= 60 ? 'text-yellow-600' : 'text-red-600';
  const readyBg = readyPct >= 80 ? 'bg-green-100' : readyPct >= 60 ? 'bg-yellow-100' : 'bg-red-100';
  const readyLabel = readyPct >= 80 ? 'READY' : readyPct >= 60 ? 'ALMOST READY' : 'NOT READY';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pre-Audit Readiness Check"
        subtitle={`${data.framework.name} v${data.framework.version}`}
        breadcrumbs={[
          { label: 'Compliance', href: '/compliance' },
          { label: data.framework.name, href: `/compliance/${frameworkId}` },
          { label: 'Readiness Check' },
        ]}
      />

      {/* Readiness Score */}
      <div className={`card text-center py-8 ${readyBg}`}>
        <p className={`text-6xl font-bold ${readyColor}`}>{readyPct}%</p>
        <p className={`text-lg font-semibold mt-2 ${readyColor}`}>{readyLabel}</p>
        <p className="text-sm text-gray-600 mt-1">
          {data.readyCount} of {data.totalRequirements} requirements met &middot; {data.evidenceCount} with evidence
        </p>
        {data.criticalMissing > 0 && (
          <p className="text-sm text-red-600 font-medium mt-2">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            {data.criticalMissing} critical requirement{data.criticalMissing > 1 ? 's' : ''} not met
          </p>
        )}
      </div>

      {/* Action Items */}
      {data.actionItems.length > 0 && (
        <div className="card border-l-4 border-l-orange-500">
          <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Action Items to Achieve Readiness ({data.actionItems.length})
          </h3>
          <div className="space-y-2">
            {data.actionItems.map((item, i) => (
              <div key={item.code} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-bold text-orange-600 w-6">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    <span className="font-mono text-gray-400 mr-2">{item.code}</span>
                    {item.title}
                    {item.isCritical && <span className="ml-2 text-xs text-red-600 font-medium">CRITICAL</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                  {item.evidenceGap && <p className="text-xs text-orange-600 mt-0.5">Evidence gap: {item.evidenceGap}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirement-level readiness */}
      <div className="card">
        <h3 className="font-semibold mb-4">Requirement Readiness Detail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-3 w-8"></th>
                <th className="pb-3 pr-3">Code</th>
                <th className="pb-3 pr-3">Requirement</th>
                <th className="pb-3 pr-3">Status</th>
                <th className="pb-3 pr-3">Evidence</th>
                <th className="pb-3">Module</th>
              </tr>
            </thead>
            <tbody>
              {data.requirements.map(req => (
                <tr key={req.id} className="border-b last:border-0">
                  <td className="py-3 pr-3">
                    {req.isReady ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : req.currentStatus === 'IN_PROGRESS' ? (
                      <Clock className="h-5 w-5 text-blue-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs text-gray-400">{req.code}</td>
                  <td className="py-3 pr-3">
                    <span className="font-medium">{req.title}</span>
                    {req.isCritical && <span className="ml-1 text-xs text-red-600">*</span>}
                  </td>
                  <td className="py-3 pr-3">
                    <StatusBadge
                      label={req.currentStatus.replace('_', ' ')}
                      color={req.currentStatus === 'COMPLIANT' ? 'green' : req.currentStatus === 'IN_PROGRESS' ? 'blue' : req.currentStatus === 'NON_COMPLIANT' ? 'red' : 'gray'}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    {req.autoDetected ? (
                      <span className={`text-xs ${req.evidenceAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {req.evidenceAvailable ? '✓' : '✗'} {req.evidenceDetail}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Manual check needed</span>
                    )}
                  </td>
                  <td className="py-3">
                    {req.evidenceModule && MODULE_LINKS[req.evidenceModule] && (
                      <Link
                        href={MODULE_LINKS[req.evidenceModule].href}
                        className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                      >
                        {MODULE_LINKS[req.evidenceModule].label}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">* Critical requirements — must be met for certification</p>
      </div>
    </div>
  );
}
