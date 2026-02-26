'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, CheckCircle2, AlertTriangle, TrendingUp, Award, FileDown, ChevronDown, ChevronRight, XCircle, Clock } from 'lucide-react';
import { generateComplianceSummaryPDF } from '@/lib/pdf';

interface Requirement {
  code: string;
  title: string;
  category: string;
  status: string;
  isCritical: boolean;
}

interface ShareData {
  title: string;
  generatedAt: string;
  data: {
    companyName: string;
    client: { name: string; address: string | null; industry: string | null; employeeCount: number | null } | null;
    compliance?: { framework: string; code: string; score: number; status: string; totalRequirements: number; compliantRequirements: number; requirements?: Requirement[] }[];
    certifications?: { name: string; category: string; issuingBody: string | null; status: string; issueDate: string | null; expiryDate: string | null; certificateNumber: string | null }[];
    safety?: { totalIncidents: number; resolvedIncidents: number; resolutionRate: number; totalInspections: number; completedInspections: number; avgInspectionScore: number | null };
    improvements?: { totalMeasures: number; implemented: number; totalInvestment: number; totalSavings: number };
  };
}

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

export default function PublicSharePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedFramework, setExpandedFramework] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(r => { if (!r.ok) throw new Error(r.status === 410 ? 'This view has expired.' : 'View not found.'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse space-y-4 w-full max-w-3xl px-4">
        <div className="h-12 bg-gray-200 rounded w-64 mx-auto" />
        <div className="h-96 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-500">{error}</p>
      </div>
    </div>
  );

  if (!data) return null;
  const { data: d } = data;

  const overallScore = d.compliance && d.compliance.length > 0
    ? Math.round(d.compliance.reduce((s, c) => s + c.score, 0) / d.compliance.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{d.companyName}</h1>
          {d.client?.address && <p className="text-sm text-gray-500 mt-1">{d.client.address}</p>}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
            {d.client?.industry && <span>{d.client.industry}</span>}
            {d.client?.employeeCount && <span>{d.client.employeeCount} employees</span>}
          </div>
          <h2 className="text-lg font-semibold text-brand-600 mt-3">{data.title}</h2>
          <p className="text-xs text-gray-400">Real-time compliance status — Generated {new Date(data.generatedAt).toLocaleDateString()}</p>
          <button
            onClick={() => generateComplianceSummaryPDF(data)}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Overall Score */}
        {d.compliance && d.compliance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-green-100 mb-4">
              <div>
                <p className={`text-4xl font-bold ${overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{overallScore}%</p>
                <p className="text-xs text-gray-500">Overall Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Frameworks */}
        {d.compliance && d.compliance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><Shield className="h-5 w-5 text-blue-600" /> Compliance Frameworks</h3>
            <div className="space-y-3">
              {d.compliance.map((c, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFramework(expandedFramework === i ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    {expandedFramework === i ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{c.framework}</span>
                        <span className={`text-sm font-bold ${c.score >= 80 ? 'text-green-600' : c.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{c.score}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-3 rounded-full ${c.score >= 80 ? 'bg-green-500' : c.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{c.compliantRequirements}/{c.totalRequirements} requirements met</p>
                    </div>
                  </button>
                  {expandedFramework === i && c.requirements && c.requirements.length > 0 && (
                    <div className="border-t bg-gray-50 px-4 py-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Requirement Details</p>
                      <div className="space-y-1.5">
                        {c.requirements.map((r, ri) => (
                          <div key={ri} className="flex items-center gap-2 text-sm">
                            {r.status === 'COMPLIANT' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : r.status === 'NON_COMPLIANT' ? (
                              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-xs font-mono text-gray-500 w-12 flex-shrink-0">{r.code}</span>
                            <span className="text-xs text-gray-700 flex-1">{r.title}</span>
                            {r.isCritical && <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full flex-shrink-0">Critical</span>}
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0">{r.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {d.certifications && d.certifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><Award className="h-5 w-5 text-purple-600" /> Certifications</h3>
            <div className="space-y-2">
              {d.certifications.map((c, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.issuingBody} {c.certificateNumber ? `• ${c.certificateNumber}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'VALID' ? 'bg-green-100 text-green-700' : c.status === 'EXPIRING_SOON' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    {c.expiryDate && <p className="text-xs text-gray-400 mt-1">Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Performance */}
        {d.safety && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><AlertTriangle className="h-5 w-5 text-yellow-600" /> Safety Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center"><p className="text-2xl font-bold">{d.safety.resolutionRate}%</p><p className="text-xs text-gray-500">Incident Resolution</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{d.safety.completedInspections}</p><p className="text-xs text-gray-500">Inspections Completed</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{d.safety.totalIncidents}</p><p className="text-xs text-gray-500">Total Incidents</p></div>
              {d.safety.avgInspectionScore && <div className="text-center"><p className="text-2xl font-bold">{d.safety.avgInspectionScore}%</p><p className="text-xs text-gray-500">Avg Inspection Score</p></div>}
            </div>
          </div>
        )}

        {/* Improvements */}
        {d.improvements && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><TrendingUp className="h-5 w-5 text-green-600" /> Energy Improvements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center"><p className="text-2xl font-bold">{d.improvements.totalMeasures}</p><p className="text-xs text-gray-500">Measures</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{d.improvements.implemented}</p><p className="text-xs text-gray-500">Implemented</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-green-600">{fmt(d.improvements.totalSavings)}</p><p className="text-xs text-gray-500">Total Savings</p></div>
              <div className="text-center"><p className="text-2xl font-bold">{fmt(d.improvements.totalInvestment)}</p><p className="text-xs text-gray-500">Investment</p></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4">
          <p>This is a real-time compliance dashboard. Data updates automatically.</p>
          <p className="mt-1">Powered by <span className="font-medium text-brand-600">VoltSpark</span></p>
        </div>
      </div>
    </div>
  );
}
