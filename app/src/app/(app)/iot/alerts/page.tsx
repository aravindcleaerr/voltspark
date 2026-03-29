'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { AlertTriangle, Check, CheckCheck, Filter } from 'lucide-react';
import { IOT_ALERT_TYPES, IOT_ALERT_SEVERITIES } from '@/lib/constants';

interface Alert {
  id: string;
  type: string;
  severity: string;
  parameterName: string | null;
  actualValue: number | null;
  thresholdValue: number | null;
  message: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  meter: { id: string; name: string; meterType: string } | null;
}

export default function IoTAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [ackFilter, setAckFilter] = useState('');

  const fetchAlerts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '30' });
    if (typeFilter) params.set('type', typeFilter);
    if (severityFilter) params.set('severity', severityFilter);
    if (ackFilter) params.set('acknowledged', ackFilter);

    fetch(`/api/iot/alerts?${params}`)
      .then(r => r.json())
      .then(data => { setAlerts(data.alerts || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, [page, typeFilter, severityFilter, ackFilter]);

  const acknowledge = async (id: string) => {
    await fetch(`/api/iot/alerts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acknowledge: true }) });
    fetchAlerts();
  };

  const resolve = async (id: string) => {
    await fetch(`/api/iot/alerts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolve: true }) });
    fetchAlerts();
  };

  const severityColor = (s: string) => s === 'CRITICAL' ? 'bg-red-100 text-red-700' : s === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';

  return (
    <div>
      <PageHeader title="IoT Alerts" subtitle={`${total} alert${total !== 1 ? 's' : ''}`} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-gray-400" />
        <select className="input-field w-auto text-sm" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {IOT_ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="input-field w-auto text-sm" value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}>
          <option value="">All Severities</option>
          {IOT_ALERT_SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input-field w-auto text-sm" value={ackFilter} onChange={e => { setAckFilter(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="false">Unacknowledged</option>
          <option value="true">Acknowledged</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-200 rounded-lg" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No alerts</h3>
          <p className="text-gray-500">No IoT alerts match your filters.</p>
        </div>
      ) : (
        <div className="card divide-y">
          {alerts.map(alert => (
            <div key={alert.id} className="px-4 py-3 flex items-start gap-3">
              <AlertTriangle className={`h-4 w-4 mt-1 flex-shrink-0 ${alert.severity === 'CRITICAL' ? 'text-red-500' : alert.severity === 'WARNING' ? 'text-amber-500' : 'text-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${severityColor(alert.severity)}`}>{alert.severity}</span>
                  <span className="text-xs text-gray-400">{alert.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {alert.meter?.name} · {new Date(alert.createdAt).toLocaleString('en-IN')}
                  {alert.acknowledgedAt && <span className="ml-2 text-green-600">· Acknowledged</span>}
                  {alert.resolvedAt && <span className="ml-2 text-green-600">· Resolved</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!alert.acknowledgedAt && (
                  <button onClick={() => acknowledge(alert.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600" title="Acknowledge"><Check className="h-4 w-4" /></button>
                )}
                {!alert.resolvedAt && (
                  <button onClick={() => resolve(alert.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600" title="Resolve"><CheckCheck className="h-4 w-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 30 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 30)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 30)} className="btn-secondary text-sm">Next</button>
        </div>
      )}
    </div>
  );
}
