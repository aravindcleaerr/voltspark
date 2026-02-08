'use client';

import { useState } from 'react';
import { FileText, Printer, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { formatDate } from '@/lib/utils';

const REPORT_TYPES = [
  { value: 'energy-register', label: 'Energy Source Register', description: 'Complete list of identified energy sources with meter details' },
  { value: 'consumption-summary', label: 'Consumption Summary', description: 'Energy consumption data with deviation analysis' },
  { value: 'training-compliance', label: 'Training Compliance', description: 'Training programs and attendance records' },
  { value: 'audit-summary', label: 'Audit Summary', description: 'Audit history with findings and status' },
  { value: 'capa-summary', label: 'CAPA Summary', description: 'Corrective/preventive actions and closure rates' },
  { value: 'zed-compliance', label: 'ZED Compliance Overview', description: 'Overall ZED compliance status across all requirements' },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState('energy-register');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const generateReport = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: selectedType });
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    const data = await fetch(`/api/reports?${params}`).then(r => r.json());
    setReportData(data);
    setLoading(false);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Generate ZED compliance evidence reports" />

      {/* Report Selection */}
      <div className="card print:hidden">
        <h3 className="font-semibold mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {REPORT_TYPES.map(r => (
            <button key={r.value} onClick={() => setSelectedType(r.value)} className={`text-left p-3 rounded-lg border-2 transition-colors ${selectedType === r.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <p className="font-medium text-sm">{r.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label-text text-xs">From Date</label>
            <input type="date" className="input-field py-1.5" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label-text text-xs">To Date</label>
            <input type="date" className="input-field py-1.5" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <button onClick={generateReport} className="btn-primary flex items-center gap-2" disabled={loading}>
            <FileText className="h-4 w-4" />{loading ? 'Generating...' : 'Generate Report'}
          </button>
          {reportData && (
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2"><Printer className="h-4 w-4" /> Print</button>
          )}
        </div>
      </div>

      {/* Report Output */}
      {reportData && (
        <div className="card print:shadow-none print:border-0">
          {/* Report Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-brand-900">Unnathi CNC Technologies Pvt Ltd</h1>
            <p className="text-sm text-gray-500">ZED Certification - Energy Management System</p>
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

          {/* ZED Compliance Overview */}
          {reportData.type === 'zed-compliance' && (
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
            <p>This report is generated as part of ZED Certification compliance evidence.</p>
            <p>System maintained by Akshaya Createch | Unnathi CNC Technologies Pvt Ltd</p>
          </div>
        </div>
      )}
    </div>
  );
}
