'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [program, setProgram] = useState<any>(null);
  const [attendance, setAttendance] = useState<Record<string, { attended: boolean; score: string; feedback: string }>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch(`/api/training/programs/${params.id}`).then(r => r.json()),
    ]).then(([u, p]) => {
      setUsers(u);
      setProgram(p);
      // Pre-fill existing attendance
      const att: Record<string, any> = {};
      u.forEach((user: any) => {
        const existing = p.attendance?.find((a: any) => a.userId === user.id);
        att[user.id] = { attended: existing?.attended || false, score: existing?.score?.toString() || '', feedback: existing?.feedback || '' };
      });
      setAttendance(att);
    }).finally(() => setLoading(false));
  }, [params.id]);

  const toggleAll = (attended: boolean) => {
    setAttendance(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => { updated[k] = { ...updated[k], attended }; });
      return updated;
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        trainingProgramId: params.id as string,
        attendance: Object.entries(attendance).map(([userId, data]) => ({
          userId, attended: data.attended, score: data.score ? parseFloat(data.score) : undefined, feedback: data.feedback || undefined,
        })),
      };
      const res = await fetch('/api/training/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to save attendance');
      router.push(`/training/${params.id}`);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-4" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Mark Attendance" subtitle={program?.title || 'Training Program'} action={
        <button onClick={handleSubmit} className="btn-primary flex items-center gap-2" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Attendance'}</button>
      } />
      <Link href={`/training/${params.id}`} className="text-sm text-brand-600 hover:underline flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to program</Link>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Employees ({users.length})</h3>
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)} className="text-xs btn-secondary">Select All</button>
            <button onClick={() => toggleAll(false)} className="text-xs btn-secondary">Deselect All</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Attended</th>
                <th className="pb-2 pr-4">Employee</th>
                <th className="pb-2 pr-4">Department</th>
                <th className="pb-2 pr-4">Score</th>
                <th className="pb-2">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    <input type="checkbox" checked={attendance[user.id]?.attended || false} onChange={e => setAttendance(prev => ({ ...prev, [user.id]: { ...prev[user.id], attended: e.target.checked } }))} className="rounded border-gray-300" />
                  </td>
                  <td className="py-2 pr-4 font-medium">{user.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{user.department || '—'}</td>
                  <td className="py-2 pr-4">
                    <input type="number" min="0" max="100" className="input-field w-20 py-1 text-xs" value={attendance[user.id]?.score || ''} onChange={e => setAttendance(prev => ({ ...prev, [user.id]: { ...prev[user.id], score: e.target.value } }))} placeholder="—" />
                  </td>
                  <td className="py-2">
                    <input className="input-field py-1 text-xs" value={attendance[user.id]?.feedback || ''} onChange={e => setAttendance(prev => ({ ...prev, [user.id]: { ...prev[user.id], feedback: e.target.value } }))} placeholder="Optional" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
