'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

interface ClientFramework {
  id: string;
  status: string;
  score: number;
  targetDate: string | null;
  assignedDate: string;
  framework: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    version: string;
    _count: { requirements: number };
  };
  requirementStatuses: Record<string, number>;
}

interface AvailableFramework {
  id: string;
  code: string;
  name: string;
  description: string | null;
  version: string;
  _count: { requirements: number };
}

function ScoreBar({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const h = size === 'sm' ? 'h-2' : 'h-3';
  return (
    <div className={`w-full ${h} bg-gray-200 rounded-full overflow-hidden`}>
      <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState<ClientFramework[]>([]);
  const [available, setAvailable] = useState<AvailableFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/client-frameworks').then(r => r.json()),
      fetch('/api/frameworks').then(r => r.json()),
    ]).then(([cf, all]) => {
      setFrameworks(cf);
      setAvailable(all);
    }).finally(() => setLoading(false));
  }, []);

  const assignedIds = new Set(frameworks.map(f => f.framework.id));
  const unassigned = available.filter(f => !assignedIds.has(f.id));

  const assignFramework = async (frameworkId: string) => {
    setAssigning(true);
    const res = await fetch('/api/client-frameworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frameworkId }),
    });
    if (res.ok) {
      const [cf] = await Promise.all([
        fetch('/api/client-frameworks').then(r => r.json()),
      ]);
      setFrameworks(cf);
      setShowAssign(false);
    }
    setAssigning(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        subtitle="Framework tracking & gap analysis"
        action={
          unassigned.length > 0 ? (
            <button onClick={() => setShowAssign(!showAssign)} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Framework
            </button>
          ) : undefined
        }
      />

      {/* Assign framework modal */}
      {showAssign && unassigned.length > 0 && (
        <div className="card border-2 border-brand-200 bg-brand-50">
          <h3 className="font-semibold mb-3">Available Frameworks</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {unassigned.map(fw => (
              <div key={fw.id} className="bg-white rounded-lg border p-4 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{fw.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{fw._count.requirements} requirements &middot; v{fw.version}</p>
                  {fw.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{fw.description}</p>}
                </div>
                <button
                  onClick={() => assignFramework(fw.id)}
                  disabled={assigning}
                  className="btn-primary text-xs px-3 py-1.5 ml-3 flex-shrink-0"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {frameworks.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No frameworks assigned"
          description="Assign a compliance framework to start tracking requirements."
          action={unassigned.length > 0 ? <button onClick={() => setShowAssign(true)} className="btn-primary">Add Framework</button> : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {frameworks.map(cf => {
            const total = cf.framework._count.requirements;
            const compliant = cf.requirementStatuses['COMPLIANT'] || 0;
            const inProgress = cf.requirementStatuses['IN_PROGRESS'] || 0;
            const nonCompliant = cf.requirementStatuses['NON_COMPLIANT'] || 0;
            const notStarted = cf.requirementStatuses['NOT_STARTED'] || 0;

            return (
              <Link
                key={cf.id}
                href={`/compliance/${cf.id}`}
                className="card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-brand-600 transition-colors truncate">{cf.framework.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">v{cf.framework.version} &middot; {total} requirements</p>
                  </div>
                  <span className="text-2xl font-bold text-brand-600 ml-2">{cf.score}%</span>
                </div>

                <ScoreBar score={cf.score} />

                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  <div className="text-xs">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-0.5" />
                    <span className="font-medium">{compliant}</span>
                    <p className="text-gray-400">Done</p>
                  </div>
                  <div className="text-xs">
                    <Clock className="h-4 w-4 text-blue-500 mx-auto mb-0.5" />
                    <span className="font-medium">{inProgress}</span>
                    <p className="text-gray-400">WIP</p>
                  </div>
                  <div className="text-xs">
                    <XCircle className="h-4 w-4 text-red-500 mx-auto mb-0.5" />
                    <span className="font-medium">{nonCompliant}</span>
                    <p className="text-gray-400">Fail</p>
                  </div>
                  <div className="text-xs">
                    <AlertTriangle className="h-4 w-4 text-gray-400 mx-auto mb-0.5" />
                    <span className="font-medium">{notStarted}</span>
                    <p className="text-gray-400">Pending</p>
                  </div>
                </div>

                {cf.targetDate && (
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t">Target: {formatDate(cf.targetDate)}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
