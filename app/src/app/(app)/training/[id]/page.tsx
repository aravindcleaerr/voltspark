'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { TRAINING_STATUSES, TRAINING_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/training/programs/${params.id}`)
      .then(r => r.json())
      .then(setProgram)
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const res = await fetch(`/api/training/programs/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { const data = await res.json(); setProgram((p: any) => ({ ...p, ...data })); }
    setUpdating(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;
  if (!program) return <div className="text-red-600">Program not found</div>;

  const statusInfo = TRAINING_STATUSES.find(s => s.value === program.status);
  const typeLabel = TRAINING_TYPES.find(t => t.value === program.type)?.label || program.type;
  const attended = program.attendance?.filter((a: any) => a.attended).length || 0;
  const total = program.attendance?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader title={program.title} subtitle={typeLabel} action={
        <div className="flex gap-2">
          {program.status === 'SCHEDULED' && <button onClick={() => updateStatus('IN_PROGRESS')} className="btn-primary" disabled={updating}>Start Training</button>}
          {program.status === 'IN_PROGRESS' && <button onClick={() => updateStatus('COMPLETED')} className="btn-primary" disabled={updating}>Mark Completed</button>}
          <Link href={`/training/${params.id}/attendance`} className="btn-secondary flex items-center gap-1"><Users className="h-4 w-4" /> Attendance</Link>
        </div>
      } />

      <Link href="/training" className="text-sm text-brand-600 hover:underline flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to training</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <h3 className="font-semibold mb-4">Program Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><StatusBadge label={statusInfo?.label || program.status} color={statusInfo?.color || 'gray'} /></dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd>{typeLabel}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-gray-500"><Calendar className="h-3 w-3 inline mr-1" />Date</dt><dd>{formatDate(program.scheduledDate)}</dd></div>
            {program.trainer && <div className="flex justify-between"><dt className="text-gray-500">Trainer</dt><dd>{program.trainer}</dd></div>}
            {program.duration && <div className="flex justify-between items-center"><dt className="text-gray-500"><Clock className="h-3 w-3 inline mr-1" />Duration</dt><dd>{program.duration}h</dd></div>}
            {program.location && <div className="flex justify-between items-center"><dt className="text-gray-500"><MapPin className="h-3 w-3 inline mr-1" />Location</dt><dd>{program.location}</dd></div>}
          </dl>
          {program.description && <div className="mt-4 pt-4 border-t"><p className="text-sm text-gray-600">{program.description}</p></div>}
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attendance ({attended}/{total})</h3>
            {total > 0 && <span className="text-sm font-medium text-brand-600">{Math.round((attended / total) * 100)}% attendance</span>}
          </div>

          {total === 0 ? (
            <p className="text-sm text-gray-500">No attendance recorded. <Link href={`/training/${params.id}/attendance`} className="text-brand-600 hover:underline">Mark attendance</Link></p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Employee</th>
                    <th className="pb-2 pr-4">Department</th>
                    <th className="pb-2 pr-4">Attended</th>
                    <th className="pb-2 pr-4">Score</th>
                    <th className="pb-2">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {program.attendance.map((att: any) => (
                    <tr key={att.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{att.user?.name || 'Unknown'}</td>
                      <td className="py-2 pr-4 text-gray-500">{att.user?.department || '—'}</td>
                      <td className="py-2 pr-4">
                        {att.attended ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-400" />}
                      </td>
                      <td className="py-2 pr-4">{att.score ?? '—'}</td>
                      <td className="py-2 text-xs text-gray-500">{att.feedback || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
