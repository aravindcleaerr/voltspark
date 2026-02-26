'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, ClipboardCheck, AlertTriangle, Award, Plus, Calendar } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

interface SafetyData {
  inspections: any[];
  templates: any[];
  incidents: any[];
  certifications: any[];
  riskScore: number;
  riskBreakdown: Record<string, number>;
}

const RISK_WEIGHTS = {
  earthing: 20,
  protection: 15,
  panels: 15,
  certifications: 15,
  maintenance: 10,
  training: 10,
  incidents: 10,
  emergency: 5,
};

function RiskGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : score >= 40 ? 'text-orange-600' : 'text-red-600';
  const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : score >= 40 ? 'bg-orange-100' : 'bg-red-100';
  const label = score >= 80 ? 'LOW RISK' : score >= 60 ? 'MODERATE' : score >= 40 ? 'HIGH RISK' : 'CRITICAL';

  return (
    <div className={`text-center p-6 rounded-xl ${bgColor}`}>
      <p className={`text-5xl font-bold ${color}`}>{score}</p>
      <p className={`text-sm font-semibold mt-1 ${color}`}>{label}</p>
      <p className="text-xs text-gray-500 mt-1">Safety Risk Score (out of 100)</p>
    </div>
  );
}

const SEVERITY_COLORS: Record<string, string> = {
  NEAR_MISS: 'yellow',
  MINOR: 'orange',
  MAJOR: 'red',
  FATAL: 'red',
};

const CERT_STATUS_COLORS: Record<string, string> = {
  VALID: 'green',
  EXPIRING_SOON: 'yellow',
  EXPIRED: 'red',
  REVOKED: 'red',
};

export default function SafetyPage() {
  const [data, setData] = useState<SafetyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewInspection, setShowNewInspection] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/inspections').then(r => r.json()),
      fetch('/api/incidents').then(r => r.json()),
      fetch('/api/certifications').then(r => r.json()),
    ]).then(([inspData, incidents, certifications]) => {
      // Calculate safety risk score
      const inspections = inspData.inspections || [];
      const templates = inspData.templates || [];
      const latestInspection = inspections.find((i: any) => i.status === 'COMPLETED');
      const inspScore = latestInspection ? latestInspection.score || 50 : 30;

      const validCerts = certifications.filter((c: any) => c.status === 'VALID').length;
      const totalCerts = certifications.length;
      const certScore = totalCerts > 0 ? Math.round((validCerts / totalCerts) * 100) : 50;

      const openIncidents = incidents.filter((i: any) => i.status === 'OPEN').length;
      const incidentScore = openIncidents === 0 ? 100 : Math.max(0, 100 - openIncidents * 25);

      // Weighted safety risk score
      const riskScore = Math.round(
        inspScore * 0.50 + certScore * 0.25 + incidentScore * 0.25
      );

      setData({
        inspections,
        templates,
        incidents,
        certifications,
        riskScore,
        riskBreakdown: { inspections: inspScore, certifications: certScore, incidents: incidentScore },
      });
    }).finally(() => setLoading(false));
  }, []);

  const startInspection = async (templateId: string) => {
    const res = await fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, inspectionDate: new Date().toISOString() }),
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!data) return <div className="text-red-600">Failed to load safety data</div>;

  const expiringSoon = data.certifications.filter((c: any) => c.status === 'EXPIRING_SOON' || c.status === 'EXPIRED');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety & Compliance"
        subtitle="Inspections, incidents, certifications & risk scoring"
        action={
          <button onClick={() => setShowNewInspection(!showNewInspection)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Inspection
          </button>
        }
      />

      {/* New Inspection Panel */}
      {showNewInspection && data.templates.length > 0 && (
        <div className="card border-2 border-brand-200 bg-brand-50">
          <h3 className="font-semibold mb-3">Select Inspection Template</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.templates.map((t: any) => (
              <button
                key={t.id}
                onClick={() => startInspection(t.id)}
                className="bg-white rounded-lg border p-4 text-left hover:border-brand-300 transition-colors"
              >
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t._count.items} items &middot; {t.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Risk Score + Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <RiskGauge score={data.riskScore} />
        <Link href="/safety/inspections" className="card hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <ClipboardCheck className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{data.inspections.length}</p>
          <p className="text-xs text-gray-500">Inspections</p>
        </Link>
        <Link href="/safety/incidents" className="card hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{data.incidents.length}</p>
          <p className="text-xs text-gray-500">Incidents</p>
        </Link>
        <Link href="/safety/certifications" className="card hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <Award className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{data.certifications.length}</p>
          <p className="text-xs text-gray-500">Certifications</p>
        </Link>
      </div>

      {/* Risk Breakdown */}
      <div className="card">
        <h3 className="font-semibold mb-3">Risk Score Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(data.riskBreakdown).map(([key, score]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm capitalize w-28">{key}</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expiring Certifications Alert */}
      {expiringSoon.length > 0 && (
        <div className="card border-l-4 border-l-red-500">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4" /> Certification Alerts
          </h3>
          <div className="space-y-2">
            {expiringSoon.map((cert: any) => (
              <div key={cert.id} className="flex items-center justify-between text-sm bg-red-50 rounded px-3 py-2">
                <div>
                  <span className="font-medium">{cert.name}</span>
                  <span className="text-gray-500 ml-2">{cert.issuingBody}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Expires: {formatDate(cert.expiryDate)}</span>
                  <StatusBadge label={cert.status.replace('_', ' ')} color={CERT_STATUS_COLORS[cert.status] || 'gray'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Inspections */}
      {data.inspections.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Recent Inspections</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Template</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Inspector</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Score</th>
                  <th className="pb-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {data.inspections.slice(0, 5).map((insp: any) => (
                  <tr key={insp.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{insp.template?.name}</td>
                    <td className="py-3 pr-4">{formatDate(insp.inspectionDate)}</td>
                    <td className="py-3 pr-4">{insp.inspector?.name || '—'}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge label={insp.status} color={insp.status === 'COMPLETED' ? 'green' : insp.status === 'IN_PROGRESS' ? 'blue' : 'gray'} />
                    </td>
                    <td className="py-3 pr-4">{insp.score != null ? `${insp.score}%` : '—'}</td>
                    <td className="py-3">
                      {insp.overallResult && <StatusBadge label={insp.overallResult} color={insp.overallResult === 'PASS' ? 'green' : insp.overallResult === 'FAIL' ? 'red' : 'yellow'} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Incidents */}
      {data.incidents.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Recent Incidents</h3>
          <div className="space-y-2">
            {data.incidents.slice(0, 5).map((inc: any) => (
              <div key={inc.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{inc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{inc.location} &middot; {formatDate(inc.incidentDate)}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <StatusBadge label={inc.severity} color={SEVERITY_COLORS[inc.severity] || 'gray'} />
                  <StatusBadge label={inc.status} color={inc.status === 'CLOSED' ? 'green' : inc.status === 'OPEN' ? 'red' : 'yellow'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
