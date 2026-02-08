'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Users, Building2, Shield } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="System configuration and user management" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-brand-600" /> Company Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Company</dt><dd className="font-medium">Unnathi CNC Technologies Pvt Ltd</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Certification</dt><dd>ZED (Zero Defect Zero Effect)</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Consultant</dt><dd>Akshaya Createch</dd></div>
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
        </div>
      </div>

      {/* User Management */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-brand-600" /> Users ({users.length})</h3>
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

      {/* Demo Info */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Demo Accounts</h3>
        <p className="text-sm text-blue-700 mb-3">Default password for all accounts: <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">unnathi123</code></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          <div className="bg-white rounded p-2"><strong>Admin:</strong> sureshkumar@unnathicnc.com</div>
          <div className="bg-white rounded p-2"><strong>Manager:</strong> sandeep@unnathicnc.com</div>
          <div className="bg-white rounded p-2"><strong>Employee:</strong> rajesh@unnathicnc.com</div>
        </div>
      </div>
    </div>
  );
}
