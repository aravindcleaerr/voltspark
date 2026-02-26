'use client';

import { useState } from 'react';
import { FileText, Printer, Download, BarChart3, TrendingUp, Shield, AlertTriangle, IndianRupee, Users, Wrench, Award, FileDown, Mail } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { formatDate } from '@/lib/utils';
import { useSettings } from '@/lib/hooks/useSettings';
import { generateStandardReportPDF, generateImpactReportPDF } from '@/lib/pdf';

const REPORT_TYPES = [
  { value: 'energy-register', label: 'Energy Source Register', description: 'Complete list of identified energy sources with meter details' },
  { value: 'consumption-summary', label: 'Consumption Summary', description: 'Energy consumption data with deviation analysis' },
  { value: 'training-compliance', label: 'Training Compliance', description: 'Training programs and attendance records' },
  { value: 'audit-summary', label: 'Audit Summary', description: 'Audit history with findings and status' },
  { value: 'capa-summary', label: 'CAPA Summary', description: 'Corrective/preventive actions and closure rates' },
  { value: 'compliance-overview', label: 'Compliance Overview', description: 'Overall compliance status across all requirements' },
  { value: 'impact-report', label: 'Impact Report', description: 'Comprehensive before/after impact analysis across all modules' },
];

const EXPORT_MODULES = [
  { value: 'consumption', label: 'Consumption Data' },
  { value: 'bills', label: 'Utility Bills' },
  { value: 'savings', label: 'Savings Measures' },
  { value: 'training', label: 'Training Programs' },
  { value: 'audits', label: 'Audits' },
  { value: 'capas', label: 'CAPA Records' },
  { value: 'incidents', label: 'Incidents' },
  { value: 'certifications', label: 'Certifications' },
];

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

export default function ReportsPage() {
  const { settings } = useSettings();
  const [selectedType, setSelectedType] = useState('energy-register');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [impactData, setImpactData] = useState<any>(null);
  const [impactPeriod, setImpactPeriod] = useState('year');
  const [emailTo, setEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    if (selectedType === 'impact-report') {
      const data = await fetch(`/api/reports/impact?period=${impactPeriod}`).then(r => r.json());
      setImpactData(data);
      setReportData(null);
    } else {
      const params = new URLSearchParams({ type: selectedType });
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const data = await fetch(`/api/reports?${params}`).then(r => r.json());
      setReportData(data);
      setImpactData(null);
    }
    setLoading(false);
  };

  const handleExport = (module: string, format: string) => {
    window.open(`/api/export?module=${module}&format=${format}`, '_blank');
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Export" subtitle="Generate compliance evidence reports and export data" />

      {/* Report Selection */}
      <div className="card print:hidden">
        <h3 className="font-semibold mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
          {REPORT_TYPES.map(r => (
            <button key={r.value} onClick={() => setSelectedType(r.value)} className={`text-left p-3 rounded-lg border-2 transition-colors ${selectedType === r.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <p className="font-medium text-sm">{r.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {selectedType === 'impact-report' ? (
            <div>
              <label className="label-text text-xs">Period</label>
              <select className="input-field py-1.5" value={impactPeriod} onChange={e => setImpactPeriod(e.target.value)}>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="label-text text-xs">From Date</label>
                <input type="date" className="input-field py-1.5" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="label-text text-xs">To Date</label>
                <input type="date" className="input-field py-1.5" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </>
          )}
          <button onClick={generateReport} className="btn-primary flex items-center gap-2" disabled={loading}>
            <FileText className="h-4 w-4" />{loading ? 'Generating...' : 'Generate Report'}
          </button>
          {(reportData || impactData) && (
            <>
              <button onClick={handlePrint} className="btn-secondary flex items-center gap-2"><Printer className="h-4 w-4" /> Print</button>
              <button
                onClick={() => {
                  const name = settings?.company_name || 'Company';
                  if (impactData) generateImpactReportPDF(impactData, name);
                  else if (reportData) generateStandardReportPDF(reportData, name);
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" /> Download PDF
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailTo}
                  onChange={e => { setEmailTo(e.target.value); setEmailSent(false); }}
                  placeholder="recipient@email.com"
                  className="input-field py-1.5 text-sm w-48"
                />
                <button
                  onClick={async () => {
                    if (!emailTo) return;
                    setEmailSending(true);
                    await fetch('/api/reports/email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: emailTo,
                        reportType: impactData ? 'impact' : reportData?.type,
                        reportTitle: impactData ? 'Impact Report' : reportData?.title,
                      }),
                    });
                    setEmailSending(false);
                    setEmailSent(true);
                  }}
                  disabled={emailSending || !emailTo}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Mail className="h-4 w-4" /> {emailSent ? 'Sent!' : emailSending ? 'Sending...' : 'Email Report'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Data Export Panel */}
      <div className="card print:hidden">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Download className="h-5 w-5 text-brand-600" /> Data Export</h3>
        <p className="text-sm text-gray-500 mb-4">Download raw data from any module as CSV or JSON for external analysis.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXPORT_MODULES.map(m => (
            <div key={m.value} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <span className="text-sm font-medium">{m.label}</span>
              <div className="flex gap-1">
                <button onClick={() => handleExport(m.value, 'csv')} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium">CSV</button>
                <button onClick={() => handleExport(m.value, 'json')} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">JSON</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Report Output */}
      {impactData && (
        <div className="card print:shadow-none print:border-0">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-brand-900">{settings?.company_name || 'Company'}</h1>
            <p className="text-sm text-gray-500">Energy Management System — Impact Report</p>
            <p className="text-xs text-gray-400">Period: {impactData.period} | Generated {new Date().toLocaleDateString()}</p>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><BarChart3 className="h-5 w-5 text-brand-600" /> Executive Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600 font-medium">Compliance Score</p>
                <p className="text-2xl font-bold text-blue-700">{impactData.sections?.executiveSummary?.complianceScore ?? 0}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-600 font-medium">Total Savings</p>
                <p className="text-2xl font-bold text-green-700">{fmt(impactData.sections?.executiveSummary?.totalSavings ?? 0)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xs text-purple-600 font-medium">Energy Sources Tracked</p>
                <p className="text-2xl font-bold text-purple-700">{impactData.sections?.executiveSummary?.energySourcesTracked ?? 0}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-xs text-orange-600 font-medium">Active Improvements</p>
                <p className="text-2xl font-bold text-orange-700">{impactData.sections?.executiveSummary?.activeImprovements ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Energy Performance */}
          {impactData.sections?.energyPerformance && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><TrendingUp className="h-5 w-5 text-green-600" /> Energy Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Entries</p>
                  <p className="text-lg font-bold">{impactData.sections.energyPerformance.totalEntries}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Cost</p>
                  <p className="text-lg font-bold">{fmt(impactData.sections.energyPerformance.totalCost ?? 0)}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Deviation Rate</p>
                  <p className="text-lg font-bold text-red-600">{impactData.sections.energyPerformance.deviationRate ?? 0}%</p>
                </div>
              </div>
              {impactData.sections.energyPerformance.bySource?.length > 0 && (
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-3">Source</th><th className="pb-2 pr-3">Type</th><th className="pb-2 pr-3 text-right">Total Consumption</th><th className="pb-2 text-right">Cost</th></tr></thead>
                  <tbody>
                    {impactData.sections.energyPerformance.bySource.map((s: any, i: number) => (
                      <tr key={i} className="border-b"><td className="py-2 pr-3 font-medium">{s.source}</td><td className="py-2 pr-3">{s.type}</td><td className="py-2 pr-3 text-right font-mono">{s.totalValue?.toFixed(1)} {s.unit}</td><td className="py-2 text-right">{fmt(s.totalCost ?? 0)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Section 3: Compliance Status */}
          {impactData.sections?.complianceStatus && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><Shield className="h-5 w-5 text-blue-600" /> Compliance Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Active Frameworks</p>
                  <p className="text-lg font-bold">{impactData.sections.complianceStatus.activeFrameworks}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Overall Completion</p>
                  <p className="text-lg font-bold text-green-600">{impactData.sections.complianceStatus.overallCompletion ?? 0}%</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Active Certifications</p>
                  <p className="text-lg font-bold">{impactData.sections.complianceStatus.activeCertifications}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Inspections Completed</p>
                  <p className="text-lg font-bold">{impactData.sections.complianceStatus.inspectionsCompleted}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Safety Performance */}
          {impactData.sections?.safetyPerformance && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><AlertTriangle className="h-5 w-5 text-yellow-600" /> Safety Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Incidents</p>
                  <p className="text-lg font-bold">{impactData.sections.safetyPerformance.totalIncidents}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Resolved</p>
                  <p className="text-lg font-bold text-green-600">{impactData.sections.safetyPerformance.resolved}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Critical/High</p>
                  <p className="text-lg font-bold text-red-600">{impactData.sections.safetyPerformance.criticalHigh}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Resolution Rate</p>
                  <p className="text-lg font-bold">{impactData.sections.safetyPerformance.resolutionRate ?? 0}%</p>
                </div>
              </div>
              {impactData.sections.safetyPerformance.bySeverity && (
                <div className="mt-3 flex gap-3">
                  {Object.entries(impactData.sections.safetyPerformance.bySeverity).map(([sev, count]) => (
                    <span key={sev} className="text-xs px-2 py-1 rounded-full bg-gray-100">{sev}: {String(count)}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 5: Financial Impact */}
          {impactData.sections?.financialImpact && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><IndianRupee className="h-5 w-5 text-green-600" /> Financial Impact</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600">Total Investment</p>
                  <p className="text-lg font-bold">{fmt(impactData.sections.financialImpact.totalInvestment ?? 0)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600">Cumulative Savings</p>
                  <p className="text-lg font-bold text-green-700">{fmt(impactData.sections.financialImpact.cumulativeSavings ?? 0)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600">Monthly Savings</p>
                  <p className="text-lg font-bold text-green-700">{fmt(impactData.sections.financialImpact.monthlySavings ?? 0)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600">Avg Utility Bill</p>
                  <p className="text-lg font-bold">{fmt(impactData.sections.financialImpact.avgBillAmount ?? 0)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600">Total Utility Spend</p>
                  <p className="text-lg font-bold">{fmt(impactData.sections.financialImpact.totalBillAmount ?? 0)}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600">ROI Proposals</p>
                  <p className="text-lg font-bold">{impactData.sections.financialImpact.roiProposals ?? 0}</p>
                </div>
              </div>
              {impactData.sections.financialImpact.topSavingsMeasures?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Top Savings Measures</p>
                  <div className="space-y-2">
                    {impactData.sections.financialImpact.topSavingsMeasures.map((m: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b pb-1">
                        <span>{m.name} <span className="text-xs text-gray-400">({m.category})</span></span>
                        <span className="font-medium text-green-600">{fmt(m.cumulativeSavings ?? 0)} saved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 6: Improvement Roadmap */}
          {impactData.sections?.improvementRoadmap && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><Wrench className="h-5 w-5 text-purple-600" /> Improvement Roadmap</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Plans</p>
                  <p className="text-lg font-bold">{impactData.sections.improvementRoadmap.totalPlans}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Items</p>
                  <p className="text-lg font-bold">{impactData.sections.improvementRoadmap.totalItems}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-green-600">{impactData.sections.improvementRoadmap.completedItems}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Overdue</p>
                  <p className="text-lg font-bold text-red-600">{impactData.sections.improvementRoadmap.overdueItems}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Recommendations */}
          {impactData.sections?.recommendations?.length > 0 && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><Award className="h-5 w-5 text-orange-600" /> Recommendations</h3>
              <div className="space-y-2">
                {impactData.sections.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: Training & CAPA */}
          {impactData.sections?.trainingAndCAPA && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><Users className="h-5 w-5 text-indigo-600" /> Training & CAPA Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Training Programs</p>
                  <p className="text-lg font-bold">{impactData.sections.trainingAndCAPA.totalPrograms}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-green-600">{impactData.sections.trainingAndCAPA.completedPrograms}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Avg Attendance</p>
                  <p className="text-lg font-bold">{impactData.sections.trainingAndCAPA.avgAttendanceRate ?? 0}%</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total CAPAs</p>
                  <p className="text-lg font-bold">{impactData.sections.trainingAndCAPA.totalCAPAs}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Closed CAPAs</p>
                  <p className="text-lg font-bold text-green-600">{impactData.sections.trainingAndCAPA.closedCAPAs}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500">CAPA Closure Rate</p>
                  <p className="text-lg font-bold">{impactData.sections.trainingAndCAPA.capaClosureRate ?? 0}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
            <p>This report is generated as part of Energy Management compliance evidence.</p>
            <p>Powered by VoltSpark</p>
          </div>
        </div>
      )}

      {/* Standard Report Output */}
      {reportData && (
        <div className="card print:shadow-none print:border-0">
          {/* Report Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-brand-900">{settings?.company_name || 'Company'}</h1>
            <p className="text-sm text-gray-500">Energy Management System</p>
            <h2 className="text-lg font-semibold mt-2">{reportData.title}</h2>
            <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Energy Register */}
          {reportData.type === 'energy-register' && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-3">Source</th><th className="pb-2 pr-3">Type</th><th className="pb-2 pr-3">Unit</th><th className="pb-2 pr-3">Location</th><th className="pb-2 pr-3">Meter #</th><th className="pb-2">Active Targets</th></tr></thead>
              <tbody>
                {reportData.data?.map((s: any) => (
                  <tr key={s.id} className="border-b"><td className="py-2 pr-3 font-medium">{s.name}</td><td className="py-2 pr-3">{s.type}</td><td className="py-2 pr-3">{s.unit}</td><td className="py-2 pr-3">{s.location || '—'}</td><td className="py-2 pr-3">{s.meterNumber || '—'}</td><td className="py-2">{s.targets?.length || 0}</td></tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Consumption Summary */}
          {reportData.type === 'consumption-summary' && (
            <div>
              <table className="w-full text-sm mb-6">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-3">Source</th><th className="pb-2 pr-3">Type</th><th className="pb-2 pr-3 text-right">Total</th><th className="pb-2 pr-3 text-right">Entries</th><th className="pb-2 text-right">Deviations</th></tr></thead>
                <tbody>
                  {reportData.data?.map((d: any, i: number) => (
                    <tr key={i} className="border-b"><td className="py-2 pr-3 font-medium">{d.source}</td><td className="py-2 pr-3">{d.type}</td><td className="py-2 pr-3 text-right font-mono">{d.total.toFixed(1)} {d.unit}</td><td className="py-2 pr-3 text-right">{d.count}</td><td className="py-2 text-right">{d.deviations > 0 ? <span className="text-red-600 font-medium">{d.deviations}</span> : '0'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Training Compliance */}
          {reportData.type === 'training-compliance' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Total Employees: {reportData.totalEmployees}</p>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-3">Program</th><th className="pb-2 pr-3">Type</th><th className="pb-2 pr-3">Date</th><th className="pb-2 pr-3">Status</th><th className="pb-2 pr-3 text-right">Attended</th></tr></thead>
                <tbody>
                  {reportData.data?.map((p: any) => {
                    const attended = p.attendance?.filter((a: any) => a.attended).length || 0;
                    return (
                      <tr key={p.id} className="border-b"><td className="py-2 pr-3 font-medium">{p.title}</td><td className="py-2 pr-3">{p.type}</td><td className="py-2 pr-3">{formatDate(p.scheduledDate)}</td><td className="py-2 pr-3">{p.status}</td><td className="py-2 pr-3 text-right">{attended}/{p._count?.attendance || 0}</td></tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Audit Summary */}
          {reportData.type === 'audit-summary' && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-3">Audit</th><th className="pb-2 pr-3">Type</th><th className="pb-2 pr-3">Date</th><th className="pb-2 pr-3">Status</th><th className="pb-2 text-right">Findings</th></tr></thead>
              <tbody>
                {reportData.data?.map((a: any) => (
                  <tr key={a.id} className="border-b"><td className="py-2 pr-3 font-medium">{a.title}</td><td className="py-2 pr-3">{a.type}</td><td className="py-2 pr-3">{formatDate(a.auditDate)}</td><td className="py-2 pr-3">{a.status}</td><td className="py-2 text-right">{a._count?.findings || 0}</td></tr>
                ))}
              </tbody>
            </table>
          )}

          {/* CAPA Summary */}
          {reportData.type === 'capa-summary' && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500"><th className="pb-2 pr-3">CAPA #</th><th className="pb-2 pr-3">Title</th><th className="pb-2 pr-3">Type</th><th className="pb-2 pr-3">Priority</th><th className="pb-2 pr-3">Status</th><th className="pb-2">Assigned</th></tr></thead>
              <tbody>
                {reportData.data?.map((c: any) => (
                  <tr key={c.id} className="border-b"><td className="py-2 pr-3 font-mono text-xs">{c.capaNumber}</td><td className="py-2 pr-3 font-medium">{c.title}</td><td className="py-2 pr-3">{c.type}</td><td className="py-2 pr-3">{c.priority}</td><td className="py-2 pr-3">{c.status}</td><td className="py-2">{c.assignedTo?.name || '—'}</td></tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Compliance Overview */}
          {reportData.type === 'compliance-overview' && (
            <div className="space-y-4">
              {Object.entries(reportData.data || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-lg font-bold">{String(value)}{key.includes('Rate') ? '%' : ''}</span>
                </div>
              ))}
            </div>
          )}

          {/* Report Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
            <p>This report is generated as part of Energy Management compliance evidence.</p>
            <p>Powered by VoltSpark</p>
          </div>
        </div>
      )}
    </div>
  );
}
