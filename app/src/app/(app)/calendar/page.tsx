'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, AlertTriangle, Clock, CheckCircle2, Award, ClipboardCheck, GraduationCap, Shield } from 'lucide-react';
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

export default function CalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

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
      />

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
                  const Icon = TYPE_ICONS[event.type] || Calendar;
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
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">{TYPE_LABELS[event.type] || event.type}</p>
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
    </div>
  );
}
