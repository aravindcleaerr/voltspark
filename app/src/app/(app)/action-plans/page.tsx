'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListChecks, CheckCircle2, Clock, AlertTriangle, PlusCircle, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  assignee: { name: string } | null;
  dueDate: string | null;
  status: string;
  priority: string;
  completedAt: string | null;
}

interface ActionPlan {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  createdBy: { name: string };
  clientFramework: { framework: { name: string; code: string } } | null;
  items: ActionItem[];
}

interface PlansData {
  plans: ActionPlan[];
  summary: {
    totalPlans: number;
    activePlans: number;
    totalItems: number;
    doneItems: number;
    overdueItems: number;
    completionRate: number;
  };
}

const ITEM_STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Circle className="h-4 w-4 text-gray-300" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  DONE: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  BLOCKED: <AlertTriangle className="h-4 w-4 text-red-500" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-400', MEDIUM: 'text-blue-500', HIGH: 'text-orange-500', CRITICAL: 'text-red-600',
};

export default function ActionPlansPage() {
  const [data, setData] = useState<PlansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });
  const [saving, setSaving] = useState(false);
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ title: '', dueDate: '', priority: 'MEDIUM' });

  const fetchData = () => {
    fetch('/api/action-plans').then(r => r.json()).then(setData).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/action-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setForm({ title: '', description: '', targetDate: '' }); fetchData(); }
    setSaving(false);
  };

  const toggleItemStatus = async (planId: string, itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'DONE' ? 'PENDING' : currentStatus === 'PENDING' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'DONE' : 'PENDING';
    await fetch(`/api/action-plans/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, status: nextStatus }),
    });
    fetchData();
  };

  const addItem = async (planId: string) => {
    if (!itemForm.title) return;
    setSaving(true);
    await fetch(`/api/action-plans/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addItem: itemForm }),
    });
    setAddingItem(null);
    setItemForm({ title: '', dueDate: '', priority: 'MEDIUM' });
    setSaving(false);
    fetchData();
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!data) return <div className="text-red-600">Failed to load action plans</div>;

  const { summary, plans } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Action Plans"
        subtitle="Improvement roadmaps with milestones and deadlines"
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle className="h-4 w-4" /> New Plan
          </button>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><ListChecks className="h-5 w-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Active Plans</p><p className="text-xl font-bold">{summary.activePlans}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Completion Rate</p><p className="text-xl font-bold text-green-600">{summary.completionRate}%</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-gray-100 rounded-lg"><Clock className="h-5 w-5 text-gray-600" /></div><div><p className="text-xs text-gray-500">Total Items</p><p className="text-xl font-bold">{summary.doneItems} / {summary.totalItems}</p></div></div></div>
        <div className="card"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><p className="text-xs text-gray-500">Overdue</p><p className="text-xl font-bold text-red-600">{summary.overdueItems}</p></div></div></div>
      </div>

      {/* Plans */}
      {plans.map(plan => {
        const isExp = expanded === plan.id;
        const done = plan.items.filter(i => i.status === 'DONE').length;
        const total = plan.items.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div key={plan.id} className="card">
            <button onClick={() => setExpanded(isExp ? null : plan.id)} className="w-full flex items-center gap-3 text-left">
              {isExp ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{plan.title}</h3>
                  <StatusBadge label={plan.status} color={plan.status === 'COMPLETED' ? 'green' : plan.status === 'ACTIVE' ? 'blue' : 'gray'} />
                  {plan.clientFramework && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{plan.clientFramework.framework.name}</span>
                  )}
                </div>
                {plan.description && <p className="text-xs text-gray-500 mt-1">{plan.description}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold">{pct}%</p>
                <p className="text-xs text-gray-400">{done}/{total} done</p>
              </div>
            </button>

            {/* Progress bar */}
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2 bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>

            {isExp && (
              <div className="mt-4 space-y-1">
                {plan.items.map(item => {
                  const overdue = item.status !== 'DONE' && item.dueDate && new Date(item.dueDate) < new Date();
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 ${item.status === 'DONE' ? 'opacity-60' : ''}`}
                    >
                      <button onClick={() => toggleItemStatus(plan.id, item.id, item.status)} className="flex-shrink-0">
                        {ITEM_STATUS_ICONS[item.status]}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${item.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>{item.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                          {item.assignee && <span className="text-xs text-gray-400">→ {item.assignee.name}</span>}
                          {item.dueDate && (
                            <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                              Due: {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              {overdue && ' (overdue)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add item */}
                {addingItem === plan.id ? (
                  <div className="flex items-end gap-2 px-3 py-2 border-t mt-2 pt-2">
                    <div className="flex-1">
                      <input value={itemForm.title} onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))} className="w-full text-sm border rounded-lg px-3 py-2" placeholder="Action item title..." autoFocus />
                    </div>
                    <input type="date" value={itemForm.dueDate} onChange={e => setItemForm(f => ({ ...f, dueDate: e.target.value }))} className="text-sm border rounded-lg px-2 py-2 w-36" />
                    <select value={itemForm.priority} onChange={e => setItemForm(f => ({ ...f, priority: e.target.value }))} className="text-sm border rounded-lg px-2 py-2">
                      <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                    </select>
                    <button onClick={() => addItem(plan.id)} disabled={saving} className="btn-primary text-xs">Add</button>
                    <button onClick={() => setAddingItem(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingItem(plan.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-lg mt-2">
                    <PlusCircle className="h-4 w-4" /> Add item
                  </button>
                )}

                <p className="text-xs text-gray-400 mt-2 px-3">Created by {plan.createdBy.name}
                  {plan.targetDate && <> · Target: {new Date(plan.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {plans.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <ListChecks className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No action plans yet. Create one to start tracking improvements.</p>
        </div>
      )}

      {/* New Plan Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Create Action Plan</h3>
            <form onSubmit={createPlan} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" placeholder="e.g., ZED Bronze Roadmap" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2 h-16 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Target Date</label>
                <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Creating...' : 'Create Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
