'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, GraduationCap, Users, Calendar } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { TRAINING_STATUSES, TRAINING_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function TrainingPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/training/programs').then(r => r.json()).then(setPrograms).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-lg" />)}</div></div>;

  const grouped = { upcoming: programs.filter(p => p.status === 'SCHEDULED'), inProgress: programs.filter(p => p.status === 'IN_PROGRESS'), completed: programs.filter(p => p.status === 'COMPLETED'), cancelled: programs.filter(p => p.status === 'CANCELLED') };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Management"
        subtitle="Energy awareness training programs (Compliance Requirement 3)"
        action={<Link href="/training/new" className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Program</Link>}
      />

      {programs.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No training programs" description="Schedule your first energy awareness training." action={<Link href="/training/new" className="btn-primary">Create Program</Link>} />
      ) : (
        <div className="space-y-8">
          {[
            { title: 'Upcoming', items: grouped.upcoming },
            { title: 'In Progress', items: grouped.inProgress },
            { title: 'Completed', items: grouped.completed },
            { title: 'Cancelled', items: grouped.cancelled },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.title}>
              <h2 className="text-lg font-semibold mb-3">{group.title} ({group.items.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((program: any) => {
                  const typeLabel = TRAINING_TYPES.find(t => t.value === program.type)?.label || program.type;
                  const statusInfo = TRAINING_STATUSES.find(s => s.value === program.status);
                  return (
                    <Link key={program.id} href={`/training/${program.id}`} className="card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{program.title}</h3>
                        <StatusBadge label={statusInfo?.label || program.status} color={statusInfo?.color || 'gray'} />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{program.description || typeLabel}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(program.scheduledDate)}</span>
                        {program.trainer && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{program.trainer}</span>}
                        <span>{program._count?.attendance || 0} attendees</span>
                        {program.duration && <span>{program.duration}h</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
