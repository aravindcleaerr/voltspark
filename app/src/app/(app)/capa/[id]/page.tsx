'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, Search, Wrench, Eye, XCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { CAPA_STATUSES, CAPA_PRIORITIES, CAPA_SOURCES, RCA_METHODS } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/utils';

const STATUS_FLOW = ['OPEN', 'RCA_IN_PROGRESS', 'ACTION_PLANNED', 'IN_IMPLEMENTATION', 'VERIFICATION', 'CLOSED'];
const STATUS_ICONS: Record<string, any> = { OPEN: AlertTriangle, RCA_IN_PROGRESS: Search, ACTION_PLANNED: Clock, IN_IMPLEMENTATION: Wrench, VERIFICATION: Eye, CLOSED: CheckCircle, REOPENED: XCircle };

export default function CAPADetailPage() {
  const params = useParams();
  const [capa, setCapa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [editSection, setEditSection] = useState('');

  // Editable fields
  const [rcaMethod, setRcaMethod] = useState('');
  const [rcaDetails, setRcaDetails] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  const loadCapa = () => {
    fetch(`/api/capa/${params.id}`).then(r => r.json()).then(data => {
      setCapa(data);
      setRcaMethod(data.rcaMethod || '');
      setRcaDetails(data.rcaDetails || '');
      setRootCause(data.rootCause || '');
      setCorrectiveAction(data.correctiveAction || '');
      setPreventiveAction(data.preventiveAction || '');
      setVerificationMethod(data.verificationMethod || '');
      setVerificationResult(data.verificationResult || '');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadCapa(); }, [params.id]);

  const updateCapa = async (data: any) => {
    setSaving(true);
    await fetch(`/api/capa/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    loadCapa();
    setEditSection('');
    setSaving(false);
  };

  const advanceStatus = () => {
    const currentIdx = STATUS_FLOW.indexOf(capa.status);
    if (currentIdx < STATUS_FLOW.length - 1) updateCapa({ status: STATUS_FLOW[currentIdx + 1] });
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    await fetch(`/api/capa/${params.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) });
    setComment('');
    loadCapa();
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!capa) return <div className="text-red-600">CAPA not found</div>;

  const statusInfo = CAPA_STATUSES.find(s => s.value === capa.status);
  const priorityInfo = CAPA_PRIORITIES.find(p => p.value === capa.priority);
  const sourceInfo = CAPA_SOURCES.find(s => s.value === capa.source);
  const currentIdx = STATUS_FLOW.indexOf(capa.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? CAPA_STATUSES.find(s => s.value === STATUS_FLOW[currentIdx + 1]) : null;

  return (
    <div className="space-y-6">
      <PageHeader title={`${capa.capaNumber}: ${capa.title}`} subtitle={`${capa.type} Action`} action={
        nextStatus && capa.status !== 'CLOSED' ? (
          <button onClick={advanceStatus} className="btn-primary" disabled={saving}>Advance to {nextStatus.label}</button>
        ) : capa.status === 'CLOSED' ? (
          <button onClick={() => updateCapa({ status: 'REOPENED' })} className="btn-danger" disabled={saving}>Reopen</button>
        ) : null
      } />

      <Link href="/capa" className="text-sm text-brand-600 hover:underline flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to CAPA list</Link>

      {/* Status Timeline */}
      <div className="card">
        <h3 className="font-semibold mb-4">Status Progress</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STATUS_FLOW.map((status, idx) => {
            const info = CAPA_STATUSES.find(s => s.value === status);
            const Icon = STATUS_ICONS[status] || Clock;
            const isComplete = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={status} className="flex items-center">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${isCurrent ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {info?.label || status}
                </div>
                {idx < STATUS_FLOW.length - 1 && <div className={`w-6 h-0.5 mx-1 ${isComplete ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><StatusBadge label={statusInfo?.label || capa.status} color={statusInfo?.color || 'gray'} /></dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Priority</dt><dd><StatusBadge label={priorityInfo?.label || capa.priority} color={priorityInfo?.color || 'gray'} /></dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd>{capa.type}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Source</dt><dd>{sourceInfo?.label || capa.source}</dd></div>
              {capa.sourceReference && <div className="flex justify-between"><dt className="text-gray-500">Ref</dt><dd>{capa.sourceReference}</dd></div>}
              <div className="flex justify-between"><dt className="text-gray-500">Raised By</dt><dd>{capa.raisedBy?.name || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Assigned To</dt><dd>{capa.assignedTo?.name || '—'}</dd></div>
              {capa.actionDueDate && <div className="flex justify-between"><dt className="text-gray-500">Due Date</dt><dd>{formatDate(capa.actionDueDate)}</dd></div>}
              <div className="flex justify-between"><dt className="text-gray-500">Created</dt><dd>{formatDate(capa.createdAt)}</dd></div>
            </dl>
          </div>

          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Problem Description</p>
            <p className="text-sm">{capa.description}</p>
          </div>
        </div>

        {/* Middle Column - RCA & Actions */}
        <div className="space-y-6">
          {/* RCA Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Root Cause Analysis</h3>
              <button onClick={() => setEditSection(editSection === 'rca' ? '' : 'rca')} className="text-xs text-brand-600 hover:underline">
                {editSection === 'rca' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editSection === 'rca' ? (
              <div className="space-y-3">
                <div>
                  <label className="label-text text-xs">RCA Method</label>
                  <select className="input-field py-1.5 text-sm" value={rcaMethod} onChange={e => setRcaMethod(e.target.value)}>
                    <option value="">Select method</option>
                    {RCA_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text text-xs">Analysis Details</label>
                  <textarea className="input-field py-1.5 text-sm" rows={4} value={rcaDetails} onChange={e => setRcaDetails(e.target.value)} placeholder={rcaMethod === 'FIVE_WHY' ? 'Why 1:\nWhy 2:\nWhy 3:\nWhy 4:\nWhy 5:' : 'Enter analysis details...'} />
                </div>
                <div>
                  <label className="label-text text-xs">Root Cause</label>
                  <textarea className="input-field py-1.5 text-sm" rows={2} value={rootCause} onChange={e => setRootCause(e.target.value)} placeholder="Identified root cause" />
                </div>
                <button onClick={() => updateCapa({ rcaMethod, rcaDetails, rootCause })} className="btn-primary text-sm" disabled={saving}>{saving ? 'Saving...' : 'Save RCA'}</button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {capa.rcaMethod ? (
                  <>
                    <p><span className="text-gray-500">Method:</span> {RCA_METHODS.find(m => m.value === capa.rcaMethod)?.label || capa.rcaMethod}</p>
                    {capa.rcaDetails && <div className="bg-gray-50 rounded p-3 text-xs whitespace-pre-wrap">{capa.rcaDetails}</div>}
                    {capa.rootCause && <p><span className="text-gray-500">Root Cause:</span> {capa.rootCause}</p>}
                  </>
                ) : (
                  <p className="text-gray-400 text-xs">No RCA performed yet</p>
                )}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Actions</h3>
              <button onClick={() => setEditSection(editSection === 'actions' ? '' : 'actions')} className="text-xs text-brand-600 hover:underline">
                {editSection === 'actions' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editSection === 'actions' ? (
              <div className="space-y-3">
                <div>
                  <label className="label-text text-xs">Corrective Action</label>
                  <textarea className="input-field py-1.5 text-sm" rows={3} value={correctiveAction} onChange={e => setCorrectiveAction(e.target.value)} placeholder="Immediate corrective action taken" />
                </div>
                <div>
                  <label className="label-text text-xs">Preventive Action</label>
                  <textarea className="input-field py-1.5 text-sm" rows={3} value={preventiveAction} onChange={e => setPreventiveAction(e.target.value)} placeholder="Measures to prevent recurrence" />
                </div>
                <button onClick={() => updateCapa({ correctiveAction, preventiveAction })} className="btn-primary text-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Actions'}</button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {capa.correctiveAction ? <div><p className="text-gray-500 text-xs">Corrective:</p><p>{capa.correctiveAction}</p></div> : null}
                {capa.preventiveAction ? <div className="mt-2"><p className="text-gray-500 text-xs">Preventive:</p><p>{capa.preventiveAction}</p></div> : null}
                {!capa.correctiveAction && !capa.preventiveAction && <p className="text-gray-400 text-xs">No actions defined yet</p>}
              </div>
            )}
          </div>

          {/* Verification Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Verification</h3>
              <button onClick={() => setEditSection(editSection === 'verify' ? '' : 'verify')} className="text-xs text-brand-600 hover:underline">
                {editSection === 'verify' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editSection === 'verify' ? (
              <div className="space-y-3">
                <div>
                  <label className="label-text text-xs">Verification Method</label>
                  <input className="input-field py-1.5 text-sm" value={verificationMethod} onChange={e => setVerificationMethod(e.target.value)} placeholder="How was effectiveness verified?" />
                </div>
                <div>
                  <label className="label-text text-xs">Result</label>
                  <textarea className="input-field py-1.5 text-sm" rows={2} value={verificationResult} onChange={e => setVerificationResult(e.target.value)} placeholder="Verification results" />
                </div>
                <button onClick={() => updateCapa({ verificationMethod, verificationResult, verificationDate: new Date().toISOString() })} className="btn-primary text-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Verification'}</button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {capa.verificationMethod ? (
                  <>
                    <p><span className="text-gray-500">Method:</span> {capa.verificationMethod}</p>
                    {capa.verificationResult && <p><span className="text-gray-500">Result:</span> {capa.verificationResult}</p>}
                    {capa.verificationDate && <p><span className="text-gray-500">Date:</span> {formatDate(capa.verificationDate)}</p>}
                  </>
                ) : (
                  <p className="text-gray-400 text-xs">Not yet verified</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Comments */}
        <div className="card">
          <h3 className="font-semibold mb-4">Discussion ({capa.comments?.length || 0})</h3>
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {capa.comments?.map((c: any) => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{c.user?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(c.createdAt)}</span>
                </div>
                <p className="text-sm">{c.comment}</p>
              </div>
            ))}
            {(!capa.comments || capa.comments.length === 0) && <p className="text-sm text-gray-400">No comments yet</p>}
          </div>
          <div className="flex gap-2">
            <textarea className="input-field flex-1 py-1.5 text-sm" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
            <button onClick={addComment} className="btn-primary self-end" disabled={saving || !comment.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
