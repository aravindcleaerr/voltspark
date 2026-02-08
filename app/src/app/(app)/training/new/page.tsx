'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { TRAINING_TYPES } from '@/lib/constants';

export default function NewTrainingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', type: 'AWARENESS', trainer: '', scheduledDate: '', duration: '', location: '', maxParticipants: '', notes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, duration: form.duration ? parseFloat(form.duration) : undefined, maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined };
      const res = await fetch('/api/training/programs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create program');
      router.push('/training');
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="New Training Program" subtitle="Schedule an energy awareness training" />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label-text">Program Title *</label>
          <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g., Energy Conservation Awareness" />
        </div>
        <div>
          <label className="label-text">Description</label>
          <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Training program description" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Type *</label>
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Scheduled Date *</label>
            <input type="date" className="input-field" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Trainer</label>
            <input className="input-field" value={form.trainer} onChange={e => setForm(f => ({ ...f, trainer: e.target.value }))} placeholder="e.g., Akshaya Createch" />
          </div>
          <div>
            <label className="label-text">Duration (hours)</label>
            <input type="number" step="0.5" className="input-field" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g., 2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Location</label>
            <input className="input-field" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Conference Room" />
          </div>
          <div>
            <label className="label-text">Max Participants</label>
            <input type="number" className="input-field" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} placeholder="e.g., 30" />
          </div>
        </div>
        <div>
          <label className="label-text">Notes</label>
          <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Program'}</button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
