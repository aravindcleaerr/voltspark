'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Users, Building2, Shield, Bell, Mail, UserPlus, Lock } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { useSettings } from '@/lib/hooks/useSettings';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, loading: settingsLoading } = useSettings();
  const [notifPrefs, setNotifPrefs] = useState({
    email_cert_expiry: true,
    email_capa_overdue: true,
    email_action_overdue: true,
    email_bill_anomaly: true,
    email_safety_incident: true,
    email_digest: false,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [pwResult, setPwResult] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'EMPLOYEE', department: '', employeeId: '' });
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetch('/api/users').then(r => r.ok ? r.json() : []).then(setUsers).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (settings) {
      setNotifPrefs(prev => ({
        ...prev,
        email_cert_expiry: settings.email_cert_expiry !== 'false',
        email_capa_overdue: settings.email_capa_overdue !== 'false',
        email_action_overdue: settings.email_action_overdue !== 'false',
        email_bill_anomaly: settings.email_bill_anomaly !== 'false',
        email_safety_incident: settings.email_safety_incident !== 'false',
        email_digest: settings.email_digest === 'true',
      }));
    }
  }, [settings]);

  const saveNotifPrefs = async () => {
    setSavingPrefs(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: Object.fromEntries(Object.entries(notifPrefs).map(([k, v]) => [k, String(v)])) }),
    });
    setSavingPrefs(false);
  };

  if (loading || settingsLoading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="System configuration and user management" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-brand-600" /> Company Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Company</dt><dd className="font-medium">{settings?.company_name || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Certification</dt><dd>{settings?.certification || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Consultant</dt><dd>{settings?.consultant || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">System</dt><dd>Energy Management Compliance Suite</dd></div>
          </dl>
        </div>

        {/* Current User */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-brand-600" /> Your Account</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{(session?.user as any)?.name || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{(session?.user as any)?.email || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd><StatusBadge label={(session?.user as any)?.role || '—'} color="blue" /></dd></div>
          </dl>
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium flex items-center gap-1.5 mb-3"><Lock className="h-3.5 w-3.5" /> Change Password</h4>
            <div className="space-y-2">
              <input type="password" placeholder="Current password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} className="input text-sm w-full" />
              <input type="password" placeholder="New password (min 8 chars)" value={passwordForm.newPw} onChange={e => setPasswordForm(p => ({ ...p, newPw: e.target.value }))} className="input text-sm w-full" />
              <input type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} className="input text-sm w-full" />
            </div>
            {pwResult && <p className={`text-xs mt-2 ${pwResult.ok ? 'text-green-600' : 'text-red-600'}`}>{pwResult.ok ? 'Password changed successfully!' : pwResult.error}</p>}
            <button
              onClick={async () => {
                setPwResult(null);
                if (passwordForm.newPw !== passwordForm.confirm) { setPwResult({ error: 'Passwords do not match' }); return; }
                if (passwordForm.newPw.length < 8) { setPwResult({ error: 'Password must be at least 8 characters' }); return; }
                setChangingPw(true);
                const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.newPw }) });
                if (res.ok) { setPwResult({ ok: true }); setPasswordForm({ current: '', newPw: '', confirm: '' }); }
                else { const err = await res.json(); setPwResult({ error: err.error || 'Failed to change password' }); }
                setChangingPw(false);
              }}
              disabled={changingPw || !passwordForm.current || !passwordForm.newPw || !passwordForm.confirm}
              className="btn-primary text-xs mt-3"
            >
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-brand-600" /> Users ({users.length})</h3>
          <button onClick={() => { setShowInvite(!showInvite); setInviteResult(null); }} className="btn-primary text-xs flex items-center gap-1">
            <UserPlus className="h-3.5 w-3.5" /> Invite User
          </button>
        </div>

        {showInvite && (
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <p className="text-sm font-medium mb-3">Invite a new user</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name *" className="input text-sm" />
              <input type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="Email *" className="input text-sm" />
              <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))} className="input text-sm">
                <option value="CLIENT_ADMIN">Admin</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <input value={inviteForm.department} onChange={e => setInviteForm(p => ({ ...p, department: e.target.value }))} placeholder="Department (optional)" className="input text-sm" />
              <input value={inviteForm.employeeId} onChange={e => setInviteForm(p => ({ ...p, employeeId: e.target.value }))} placeholder="Employee ID (optional)" className="input text-sm" />
            </div>
            {inviteResult && (
              <p className={`text-xs mt-2 ${inviteResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                {inviteResult.ok ? 'Invitation sent successfully!' : inviteResult.error}
              </p>
            )}
            <button
              onClick={async () => {
                if (!inviteForm.name || !inviteForm.email) return;
                setInviting(true);
                setInviteResult(null);
                const res = await fetch('/api/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(inviteForm),
                });
                if (res.ok) {
                  setInviteResult({ ok: true });
                  setInviteForm({ name: '', email: '', role: 'EMPLOYEE', department: '', employeeId: '' });
                  fetch('/api/users').then(r => r.json()).then(setUsers);
                } else {
                  const err = await res.json();
                  setInviteResult({ error: err.error || 'Failed to invite user' });
                }
                setInviting(false);
              }}
              disabled={inviting || !inviteForm.name || !inviteForm.email}
              className="btn-primary text-xs mt-3"
            >
              {inviting ? 'Sending invite...' : 'Send Invitation'}
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Employee ID</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2">Department</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{user.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{user.email}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{user.employeeId || '—'}</td>
                  <td className="py-2 pr-4"><StatusBadge label={user.role} color={user.role === 'ADMIN' ? 'red' : user.role === 'MANAGER' ? 'blue' : 'gray'} /></td>
                  <td className="py-2">{user.department || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-brand-600" /> Email Notification Preferences</h3>
        <p className="text-sm text-gray-500 mb-4">Configure which alerts trigger email notifications. In-app notifications are always active.</p>
        <div className="space-y-3">
          {[
            { key: 'email_cert_expiry', label: 'Certification Expiry', desc: 'Email when certifications are expiring (30/15/7 days)' },
            { key: 'email_capa_overdue', label: 'Overdue CAPAs', desc: 'Email when corrective actions are past due date' },
            { key: 'email_action_overdue', label: 'Overdue Action Items', desc: 'Email when action plan items are overdue' },
            { key: 'email_bill_anomaly', label: 'Bill Anomalies', desc: 'Email when utility bill anomalies are detected' },
            { key: 'email_safety_incident', label: 'Safety Incidents', desc: 'Email for unresolved major/fatal incidents' },
            { key: 'email_digest', label: 'Daily Digest', desc: 'Send a daily summary email of all alerts (instead of individual)' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={(notifPrefs as any)[item.key]}
                onChange={e => setNotifPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          ))}
        </div>
        <button onClick={saveNotifPrefs} disabled={savingPrefs} className="btn-primary mt-4 text-sm">
          <Mail className="h-4 w-4 inline mr-1" /> {savingPrefs ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

    </div>
  );
}
