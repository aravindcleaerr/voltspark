'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Minus, ChevronDown, ChevronRight, Save, ClipboardCheck } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';

interface Requirement {
  id: string;
  code: string;
  category: string;
  title: string;
  description: string | null;
  evidenceGuidance: string | null;
  evidenceModule: string | null;
  weight: number;
  isCritical: boolean;
  status: {
    id: string;
    status: string;
    notes: string | null;
    evidenceLinks: string | null;
    updatedBy: { name: string } | null;
    updatedAt: string;
  } | null;
}

interface FrameworkDetail {
  id: string;
  framework: { id: string; code: string; name: string; description: string | null; version: string };
  status: string;
  score: number;
  targetDate: string | null;
  requirements: Requirement[];
}

const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'gray', icon: Minus },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue', icon: Clock },
  { value: 'COMPLIANT', label: 'Compliant', color: 'green', icon: CheckCircle2 },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant', color: 'red', icon: XCircle },
  { value: 'NOT_APPLICABLE', label: 'N/A', color: 'gray', icon: AlertTriangle },
];

const MODULE_LABELS: Record<string, string> = {
  ENERGY_SOURCE: 'Energy Sources',
  CONSUMPTION: 'Consumption & Targets',
  TRAINING: 'Training',
  AUDIT: 'Audits',
  CAPA: 'CAPA',
  INSPECTION: 'Safety Inspections',
};

const MODULE_HREFS: Record<string, string> = {
  ENERGY_SOURCE: '/energy-sources',
  CONSUMPTION: '/consumption',
  TRAINING: '/training',
  AUDIT: '/audits',
  CAPA: '/capa',
  INSPECTION: '/safety',
};

export default function FrameworkDetailPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const [data, setData] = useState<FrameworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [editEvidence, setEditEvidence] = useState<Record<string, string>>({});

  const fetchData = () => {
    fetch(`/api/client-frameworks/${frameworkId}/requirements`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [frameworkId]);

  const updateStatus = async (requirementId: string, status: string) => {
    setSaving(requirementId);
    const res = await fetch(`/api/client-frameworks/${frameworkId}/requirements`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirementId,
        status,
        notes: editNotes[requirementId],
        evidenceLinks: editEvidence[requirementId],
      }),
    });
    if (res.ok) {
      fetchData();
    }
    setSaving(null);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!data) return <div className="text-red-600">Failed to load framework</div>;

  // Group requirements by category
  const categories: Record<string, Requirement[]> = {};
  for (const req of data.requirements) {
    if (!categories[req.category]) categories[req.category] = [];
    categories[req.category].push(req);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.framework.name}
        subtitle={`v${data.framework.version} — Score: ${data.score}%`}
        breadcrumbs={[
          { label: 'Compliance', href: '/compliance' },
          { label: data.framework.name },
        ]}
        action={
          <Link href={`/compliance/readiness/${frameworkId}`} className="btn-primary flex items-center gap-2 text-sm">
            <ClipboardCheck className="h-4 w-4" /> Readiness Check
          </Link>
        }
      />

      {/* Score summary bar */}
      <div className="card">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-3xl font-bold text-brand-600">{data.score}%</span>
          <div className="flex-1">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${data.score >= 80 ? 'bg-green-500' : data.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {STATUS_OPTIONS.filter(s => s.value !== 'NOT_APPLICABLE').map(opt => {
            const count = data.requirements.filter(r => (r.status?.status || 'NOT_STARTED') === opt.value).length;
            return (
              <span key={opt.value} className="flex items-center gap-1.5">
                <opt.icon className={`h-4 w-4 ${opt.color === 'green' ? 'text-green-500' : opt.color === 'blue' ? 'text-blue-500' : opt.color === 'red' ? 'text-red-500' : 'text-gray-400'}`} />
                {count} {opt.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Requirements by category */}
      {Object.entries(categories).map(([category, reqs]) => (
        <div key={category} className="card">
          <h3 className="font-semibold text-gray-700 mb-4">{category}</h3>
          <div className="space-y-2">
            {reqs.map(req => {
              const currentStatus = req.status?.status || 'NOT_STARTED';
              const statusInfo = STATUS_OPTIONS.find(s => s.value === currentStatus)!;
              const isExpanded = expandedReq === req.id;

              return (
                <div key={req.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setExpandedReq(isExpanded ? null : req.id);
                      if (!isExpanded && req.status) {
                        setEditNotes(prev => ({ ...prev, [req.id]: req.status?.notes || '' }));
                        setEditEvidence(prev => ({ ...prev, [req.id]: req.status?.evidenceLinks || '' }));
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    <span className="text-xs font-mono text-gray-400 w-16 flex-shrink-0">{req.code}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{req.title}</span>
                      {req.isCritical && <span className="ml-2 text-xs text-red-600 font-medium">CRITICAL</span>}
                    </div>
                    <span className="text-xs text-gray-400 mr-2">wt: {req.weight}</span>
                    <StatusBadge label={statusInfo.label} color={statusInfo.color} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t bg-gray-50 space-y-3">
                      {req.description && <p className="text-sm text-gray-600">{req.description}</p>}
                      {req.evidenceGuidance && (
                        <div className="text-xs bg-blue-50 text-blue-700 rounded px-3 py-2">
                          <strong>Evidence guidance:</strong> {req.evidenceGuidance}
                        </div>
                      )}
                      {req.evidenceModule && (
                        <p className="text-xs text-gray-500">
                          Evidence source:{' '}
                          <Link
                            href={MODULE_HREFS[req.evidenceModule] || '#'}
                            className="font-medium text-brand-600 hover:underline"
                          >
                            {MODULE_LABELS[req.evidenceModule] || req.evidenceModule} →
                          </Link>
                        </p>
                      )}

                      {/* Status update controls */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateStatus(req.id, opt.value)}
                            disabled={saving === req.id}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                              currentStatus === opt.value
                                ? opt.color === 'green' ? 'bg-green-100 border-green-300 text-green-800'
                                : opt.color === 'blue' ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : opt.color === 'red' ? 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-gray-100 border-gray-300 text-gray-800'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Notes and Evidence */}
                      <div className="grid gap-3 sm:grid-cols-2 pt-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Notes</label>
                          <textarea
                            value={editNotes[req.id] || ''}
                            onChange={e => setEditNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="w-full text-sm border rounded-lg px-3 py-2 h-20 resize-none"
                            placeholder="Add notes..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Evidence Links</label>
                          <textarea
                            value={editEvidence[req.id] || ''}
                            onChange={e => setEditEvidence(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="w-full text-sm border rounded-lg px-3 py-2 h-20 resize-none"
                            placeholder="Paste links to evidence..."
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => updateStatus(req.id, currentStatus)}
                        disabled={saving === req.id}
                        className="btn-primary text-xs flex items-center gap-1.5"
                      >
                        <Save className="h-3 w-3" />
                        {saving === req.id ? 'Saving...' : 'Save Notes'}
                      </button>

                      {req.status?.updatedBy && (
                        <p className="text-xs text-gray-400">Last updated by {req.status.updatedBy.name}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
