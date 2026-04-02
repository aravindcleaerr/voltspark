'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { AlertTriangle, Filter } from 'lucide-react';

const PQ_EVENT_TYPES = [
  { value: 'VOLTAGE_SAG', label: 'Voltage Sag' },
  { value: 'VOLTAGE_SWELL', label: 'Voltage Swell' },
  { value: 'THD_V_HIGH', label: 'THD Voltage High' },
  { value: 'THD_I_HIGH', label: 'THD Current High' },
  { value: 'PF_LOW', label: 'Low Power Factor' },
  { value: 'VOLTAGE_UNBALANCE', label: 'Voltage Unbalance' },
  { value: 'FREQUENCY_DEVIATION', label: 'Frequency Deviation' },
];

interface PQEvent {
  id: string;
  type: string;
  severity: string;
  phase: string | null;
  actualValue: number;
  thresholdValue: number;
  nominalValue: number | null;
  message: string;
  createdAt: string;
  meter: { id: string; name: string; meterType: string } | null;
}

export default function PQEventsPage() {
  const [events, setEvents] = useState<PQEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '30' });
    if (typeFilter) params.set('type', typeFilter);
    if (severityFilter) params.set('severity', severityFilter);
    fetch(`/api/pq/events?${params}`).then(r => r.json()).then(data => { setEvents(data.events || []); setTotal(data.total || 0); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [page, typeFilter, severityFilter]);

  const severityColor = (s: string) => s === 'CRITICAL' ? 'bg-red-100 text-red-700' : s === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';

  return (
    <div>
      <PageHeader title="Power Quality Events" subtitle={`${total} event${total !== 1 ? 's' : ''} detected`} />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-gray-400" />
        <select className="input-field w-auto text-sm" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {PQ_EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="input-field w-auto text-sm" value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}>
          <option value="">All Severities</option>
          <option value="WARNING">Warning</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-200 rounded-lg" />)}</div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No PQ events</h3>
          <p className="text-gray-500">No power quality events match your filters. Run analysis from the PQ Dashboard to detect events.</p>
        </div>
      ) : (
        <div className="card divide-y">
          {events.map(event => (
            <div key={event.id} className="px-4 py-3 flex items-start gap-3">
              <AlertTriangle className={`h-4 w-4 mt-1 flex-shrink-0 ${event.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${severityColor(event.severity)}`}>{event.severity}</span>
                  <span className="text-xs text-gray-400">{event.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">{event.message}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {event.meter?.name} · {new Date(event.createdAt).toLocaleString('en-IN')}
                  {event.phase && <span> · Phase {event.phase}</span>}
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 flex-shrink-0">
                <div className="font-mono">{event.actualValue.toFixed(1)}</div>
                <div className="text-gray-400">limit: {event.thresholdValue.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

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
