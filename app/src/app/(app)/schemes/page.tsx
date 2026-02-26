'use client';

import { useEffect, useState } from 'react';
import { Landmark, IndianRupee, CheckCircle2, Clock, FileText, PlusCircle, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';

interface Scheme {
  id: string;
  name: string;
  shortName: string | null;
  ministry: string | null;
  description: string;
  maxSubsidy: number | null;
  subsidyPercent: number | null;
  eligibility: string | null;
  documentsNeeded: string | null;
  applicationUrl: string | null;
  deadline: string | null;
  category: string;
  eligible: boolean;
  matchScore: number;
  matchReasons: string[];
}

interface Application {
  id: string;
  schemeId: string;
  scheme: { name: string; shortName: string | null };
  appliedBy: { name: string };
  status: string;
  amountApplied: number | null;
  amountApproved: number | null;
  amountDisbursed: number | null;
  applicationRef: string | null;
  notes: string | null;
  applicationDate: string;
}

interface Summary {
  totalSchemes: number;
  appliedCount: number;
  approvedCount: number;
  totalSubsidiesApplied: number;
  totalSubsidiesApproved: number;
  totalSubsidiesDisbursed: number;
}

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

const STATUS_COLORS: Record<string, string> = {
  IDENTIFIED: 'gray', DOCUMENTS_READY: 'yellow', APPLIED: 'blue', UNDER_REVIEW: 'purple',
  APPROVED: 'green', DISBURSED: 'green', REJECTED: 'red',
};

const CATEGORY_LABELS: Record<string, string> = {
  ENERGY: 'Energy', CERTIFICATION: 'Certification', EQUIPMENT: 'Equipment',
  SKILL_DEVELOPMENT: 'Skill Dev', GENERAL: 'General',
};

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const fetchData = () => {
    fetch('/api/schemes').then(r => r.json()).then(data => {
      setSchemes(data.schemes);
      setApplications(data.applications);
      setSummary(data.summary);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleApply = async (schemeId: string) => {
    setApplying(true);
    await fetch('/api/schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeId, status: 'IDENTIFIED' }),
    });
    fetchData();
    setApplying(false);
  };

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    await fetch('/api/schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status }),
    });
    fetchData();
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  const appliedSchemeIds = new Set(applications.map(a => a.schemeId));

  return (
    <div className="space-y-6">
      <PageHeader title="Government Schemes" subtitle="Track subsidies, incentives, and government support programs" />

      {/* Summary */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Landmark className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Available Schemes</p><p className="text-xl font-bold">{summary.totalSchemes}</p></div></div></div>
          <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><FileText className="h-5 w-5 text-purple-600" /></div><div><p className="text-xs text-gray-500">Applications</p><p className="text-xl font-bold">{summary.appliedCount}</p></div></div></div>
          <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Approved</p><p className="text-xl font-bold text-green-600">{fmt(summary.totalSubsidiesApproved)}</p></div></div></div>
          <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><IndianRupee className="h-5 w-5 text-orange-600" /></div><div><p className="text-xs text-gray-500">Disbursed</p><p className="text-xl font-bold text-orange-600">{fmt(summary.totalSubsidiesDisbursed)}</p></div></div></div>
        </div>
      )}

      {/* Subsidies History */}
      {summary && (summary.totalSubsidiesApproved > 0 || summary.totalSubsidiesDisbursed > 0) && (
        <div className="card border-l-4 border-l-green-500">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><IndianRupee className="h-4 w-4 text-green-600" /> Total Subsidies Unlocked</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Applied For</p>
              <p className="text-lg font-bold">{fmt(summary.totalSubsidiesApplied)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-lg font-bold text-blue-600">{fmt(summary.totalSubsidiesApproved)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Received</p>
              <p className="text-lg font-bold text-green-600">{fmt(summary.totalSubsidiesDisbursed)}</p>
            </div>
          </div>
          {applications.filter(a => a.status === 'DISBURSED').length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-medium text-gray-500 mb-2">Disbursement History</p>
              {applications.filter(a => a.status === 'DISBURSED').map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm py-1">
                  <span>{a.scheme.name}</span>
                  <span className="font-bold text-green-600">{fmt(a.amountDisbursed || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Applications */}
      {applications.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">My Applications ({applications.length})</h3>
          <div className="space-y-2">
            {applications.map(app => (
              <div key={app.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-sm">{app.scheme.name}</span>
                    <StatusBadge label={app.status.replace('_', ' ')} color={STATUS_COLORS[app.status] || 'gray'} />
                  </div>
                  <div className="flex items-center gap-2">
                    {app.amountDisbursed ? (
                      <span className="text-sm font-bold text-green-600">{fmt(app.amountDisbursed)} received</span>
                    ) : app.amountApproved ? (
                      <span className="text-sm font-bold text-blue-600">{fmt(app.amountApproved)} approved</span>
                    ) : null}
                    <select
                      value={app.status}
                      onChange={e => handleUpdateStatus(app.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="IDENTIFIED">Identified</option>
                      <option value="DOCUMENTS_READY">Docs Ready</option>
                      <option value="APPLIED">Applied</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="DISBURSED">Disbursed</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Applied by {app.appliedBy.name} on {new Date(app.applicationDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Schemes */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">Available Schemes ({schemes.length})</h3>
        <div className="space-y-2">
          {schemes.map(s => {
            const isExp = expanded === s.id;
            const isApplied = appliedSchemeIds.has(s.id);
            return (
              <div key={s.id} className="border rounded-lg overflow-hidden">
                <button onClick={() => setExpanded(isExp ? null : s.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                  {isExp ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <Landmark className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{s.name}</span>
                    {s.shortName && <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 rounded-full text-blue-600">{s.shortName}</span>}
                    <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{CATEGORY_LABELS[s.category] || s.category}</span>
                  </div>
                  {s.maxSubsidy && <span className="text-sm font-bold text-green-600">Up to {fmt(s.maxSubsidy)}</span>}
                  {s.eligible && s.matchScore >= 50 && !isApplied && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 rounded-full text-amber-700 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Recommended
                    </span>
                  )}
                  {isApplied && <span className="text-xs px-2 py-0.5 bg-green-100 rounded-full text-green-700">Applied</span>}
                </button>
                {isExp && (
                  <div className="px-4 pb-4 pt-1 border-t bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                    {s.matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {s.matchReasons.map((r, ri) => (
                          <span key={ri} className="text-xs px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700">{r}</span>
                        ))}
                        {!s.eligible && <span className="text-xs px-2 py-0.5 bg-red-50 border border-red-200 rounded-full text-red-600">May not qualify</span>}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      {s.ministry && <div><p className="text-xs text-gray-400">Ministry</p><p className="font-medium">{s.ministry}</p></div>}
                      {s.subsidyPercent && <div><p className="text-xs text-gray-400">Subsidy %</p><p className="font-medium">{s.subsidyPercent}%</p></div>}
                      {s.deadline && <div><p className="text-xs text-gray-400">Deadline</p><p className="font-medium">{new Date(s.deadline).toLocaleDateString()}</p></div>}
                    </div>
                    {s.documentsNeeded && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">Documents Needed</p>
                        <div className="flex flex-wrap gap-1">
                          {s.documentsNeeded.split(',').map((d, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-white border rounded-full">{d.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {!isApplied && (
                        <button onClick={() => handleApply(s.id)} disabled={applying} className="btn-primary text-xs">
                          <PlusCircle className="h-3 w-3 inline mr-1" /> Track This Scheme
                        </button>
                      )}
                      {s.applicationUrl && (
                        <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">Apply Online</a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {schemes.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No government schemes configured yet.</p>}
        </div>
      </div>
    </div>
  );
}
