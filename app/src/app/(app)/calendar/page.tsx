'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, AlertTriangle, Clock, CheckCircle2, Award, ClipboardCheck, GraduationCap, Shield, RefreshCw, Plus, X, Repeat } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  status: string;
  urgency: 'overdue' | 'urgent' | 'upcoming' | 'future';
  module: string;
  href: string;
}

interface CalendarData {
  events: CalendarEvent[];
  summary: { total: number; overdue: number; urgent: number; upcoming: number };
}

interface Schedule {
  id: string;
  title: string;
  category: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  reminderDays: number;
  isActive: boolean;
  assignedTo?: { name: string } | null;
}

const TYPE_ICONS: Record<string, any> = {
  CERTIFICATION_EXPIRY: Award,
  AUDIT_DUE: ClipboardCheck,
  TRAINING_SCHEDULED: GraduationCap,
  CAPA_DUE: Shield,
  INSPECTION_DUE: ClipboardCheck,
};

const TYPE_LABELS: Record<string, string> = {
  CERTIFICATION_EXPIRY: 'Certification',
  AUDIT_DUE: 'Audit',
  TRAINING_SCHEDULED: 'Training',
  CAPA_DUE: 'CAPA',
  INSPECTION_DUE: 'Inspection',
};

const URGENCY_COLORS: Record<string, string> = {
  overdue: 'red',
  urgent: 'orange',
  upcoming: 'yellow',
  future: 'blue',
};

const URGENCY_LABELS: Record<string, string> = {
  overdue: 'Overdue',
  urgent: 'Within 2 weeks',
  upcoming: 'Next 30-60 days',
  future: 'Future',
};

const SCHEDULE_CATEGORIES = [
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'CERTIFICATION_RENEWAL', label: 'Certification Renewal' },
  { value: 'DATA_ENTRY', label: 'Data Entry' },
  { value: 'CUSTOM', label: 'Custom' },
];

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Biweekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'BIANNUAL', label: 'Every 6 Months' },
  { value: 'ANNUAL', label: 'Annually' },
];

export default function CalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [tab, setTab] = useState<'calendar' | 'schedules'>('calendar');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'INSPECTION', frequency: 'MONTHLY', dayOfMonth: '1', startDate: '', reminderDays: '7', description: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/calendar').then(r => r.json()),
      fetch('/api/schedules').then(r => r.json()),
    ]).then(([cal, sched]) => {
      setData(cal);
      if (Array.isArray(sched)) setSchedules(sched);
    }).finally(() => setLoading(false));
  }, []);

  const createSchedule = async () => {
    if (!form.title || !form.startDate) return;
    setSaving(true);
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setSchedules(prev => [created, ...prev]);
      setForm({ title: '', category: 'INSPECTION', frequency: 'MONTHLY', dayOfMonth: '1', startDate: '', reminderDays: '7', description: '' });
      setShowForm(false);
      // Refresh calendar
      fetch('/api/calendar').then(r => r.json()).then(setData);
    }
    setSaving(false);
  };

  const toggleSchedule = async (id: string, isActive: boolean) => {
    await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, isActive: !isActive } : s));
  };

  const deleteSchedule = async (id: string) => {
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!data) return <div className="text-red-600">Failed to load calendar</div>;

  const filtered = filter === 'all' ? data.events : data.events.filter(e => e.urgency === filter);

  // Group by month
  const grouped: Record<string, CalendarEvent[]> = {};
  for (const event of filtered) {
    const d = new Date(event.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Calendar"
        subtitle="All certifications, audits, training & deadlines in one view"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setTab(tab === 'calendar' ? 'schedules' : 'calendar')} className="btn-secondary flex items-center gap-2">
              {tab === 'calendar' ? <><Repeat className="h-4 w-4" /> Schedules</> : <><Calendar className="h-4 w-4" /> Calendar</>}
            </button>
          </div>
        }
      />

      {tab === 'calendar' ? (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <button onClick={() => setFilter(filter === 'overdue' ? 'all' : 'overdue')} className={`card text-center transition-shadow ${filter === 'overdue' ? 'ring-2 ring-red-500' : 'hover:shadow-md'}`}>
              <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <p className="text-3xl font-bold text-red-600">{data.summary.overdue}</p>
              <p className="text-xs text-gray-500">Overdue</p>
            </button>
            <button onClick={() => setFilter(filter === 'urgent' ? 'all' : 'urgent')} className={`card text-center transition-shadow ${filter === 'urgent' ? 'ring-2 ring-orange-500' : 'hover:shadow-md'}`}>
              <Clock className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-3xl font-bold text-orange-600">{data.summary.urgent}</p>
              <p className="text-xs text-gray-500">Urgent ({"<"}2 weeks)</p>
            </button>
            <button onClick={() => setFilter(filter === 'upcoming' ? 'all' : 'upcoming')} className={`card text-center transition-shadow ${filter === 'upcoming' ? 'ring-2 ring-yellow-500' : 'hover:shadow-md'}`}>
              <Calendar className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-3xl font-bold text-yellow-600">{data.summary.upcoming}</p>
              <p className="text-xs text-gray-500">Upcoming</p>
            </button>
            <button onClick={() => setFilter('all')} className={`card text-center transition-shadow ${filter === 'all' ? 'ring-2 ring-brand-500' : 'hover:shadow-md'}`}>
              <CheckCircle2 className="h-6 w-6 text-brand-500 mx-auto mb-1" />
              <p className="text-3xl font-bold">{data.summary.total}</p>
              <p className="text-xs text-gray-500">Total Events</p>
            </button>
          </div>

          {/* Timeline view */}
          {filtered.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No events in this category</p>
            </div>
          ) : (
            Object.entries(grouped).map(([monthKey, events]) => {
              const [year, month] = monthKey.split('-');
              return (
                <div key={monthKey}>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {monthNames[parseInt(month) - 1]} {year}
                  </h3>
                  <div className="space-y-2">
                    {events.map(event => {
                      const isRecurring = event.type.startsWith('SCHEDULE_');
                      const Icon = isRecurring ? RefreshCw : (TYPE_ICONS[event.type] || Calendar);
                      const label = isRecurring ? event.type.replace('SCHEDULE_', '').replace(/_/g, ' ') : (TYPE_LABELS[event.type] || event.type);
                      const daysFromNow = Math.floor((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const daysLabel = daysFromNow < 0 ? `${Math.abs(daysFromNow)}d overdue` : daysFromNow === 0 ? 'Today' : `${daysFromNow}d`;

                      return (
                        <Link
                          key={event.id}
                          href={event.href}
                          className={`card flex items-center gap-4 hover:shadow-md transition-shadow ${event.urgency === 'overdue' ? 'border-l-4 border-l-red-500' : event.urgency === 'urgent' ? 'border-l-4 border-l-orange-500' : ''}`}
                        >
                          <div className={`p-2 rounded-lg ${
                            event.urgency === 'overdue' ? 'bg-red-100 text-red-600'
                            : event.urgency === 'urgent' ? 'bg-orange-100 text-orange-600'
                            : isRecurring ? 'bg-purple-100 text-purple-600'
                            : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-gray-500">{label}{isRecurring ? ' (recurring)' : ''}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs font-medium ${daysFromNow < 0 ? 'text-red-600' : daysFromNow <= 14 ? 'text-orange-600' : 'text-gray-500'}`}>
                              {daysLabel}
                            </span>
                            <span className="text-xs text-gray-400 w-20 text-right">{formatDate(event.date)}</span>
                            <StatusBadge label={URGENCY_LABELS[event.urgency]} color={URGENCY_COLORS[event.urgency]} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </>
      ) : (
        <>
          {/* Schedules management tab */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{schedules.length} recurring schedule{schedules.length !== 1 ? 's' : ''}</p>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
              {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New Schedule</>}
            </button>
          </div>

          {showForm && (
            <div className="card space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><RefreshCw className="h-4 w-4 text-purple-600" /> New Recurring Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="e.g. Monthly Panel Inspection" />
                </div>
                <div>
                  <label className="label-text">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {SCHEDULE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">
                    {FREQUENCY_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Day of Month</label>
                  <input type="number" min="1" max="28" value={form.dayOfMonth} onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Reminder (days before)</label>
                  <input type="number" min="1" max="30" value={form.reminderDays} onChange={e => setForm(f => ({ ...f, reminderDays: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label-text">Description (optional)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" placeholder="Notes about this schedule" />
              </div>
              <button onClick={createSchedule} disabled={saving || !form.title || !form.startDate} className="btn-primary">
                {saving ? 'Creating...' : 'Create Schedule'}
              </button>
            </div>
          )}

          {schedules.length === 0 && !showForm ? (
            <div className="card text-center py-12 text-gray-500">
              <RefreshCw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No recurring schedules</p>
              <p className="text-sm mt-1">Create schedules for inspections, training, audits, and more</p>
            </div>
          ) : (
            <div className="space-y-2">
              {schedules.map(sched => (
                <div key={sched.id} className={`card flex items-center gap-4 ${!sched.isActive ? 'opacity-50' : ''}`}>
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sched.title}</p>
                    <p className="text-xs text-gray-500">
                      {SCHEDULE_CATEGORIES.find(c => c.value === sched.category)?.label} · {FREQUENCY_OPTIONS.find(f => f.value === sched.frequency)?.label}
                      {sched.assignedTo ? ` · ${sched.assignedTo.name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={sched.isActive ? 'Active' : 'Paused'} color={sched.isActive ? 'green' : 'gray'} />
                    <button onClick={() => toggleSchedule(sched.id, sched.isActive)} className="text-xs text-gray-500 hover:text-gray-700">
                      {sched.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => deleteSchedule(sched.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
