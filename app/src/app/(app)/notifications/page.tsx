'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Shield, Clock, FileText, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'border-l-red-500 bg-red-50',
  WARNING: 'border-l-yellow-500 bg-yellow-50',
  INFO: 'border-l-blue-500 bg-blue-50',
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  CERT_EXPIRY: Shield,
  AUDIT_DUE: FileText,
  CAPA_OVERDUE: AlertTriangle,
  BILL_ANOMALY: FileText,
  SAFETY_RISK: AlertTriangle,
  INSPECTION_DUE: Clock,
  ACTION_OVERDUE: Clock,
  SYSTEM: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger: 'check' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.generated > 0) fetchNotifications();
    }
    setGenerating(false);
  };

  const handleMarkRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markRead: true, notificationId: id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markRead: true, markAllRead: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        action={
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={generating} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} /> {generating ? 'Checking...' : 'Check Now'}
            </button>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Mark All Read
              </button>
            )}
          </div>
        }
      />

      <div className="space-y-2">
        {notifications.map(n => {
          const Icon = TYPE_ICONS[n.type] || Bell;
          return (
            <div
              key={n.id}
              className={`border-l-4 rounded-lg p-4 ${SEVERITY_STYLES[n.severity] || 'border-l-gray-300 bg-gray-50'} ${!n.isRead ? 'ring-1 ring-brand-200' : 'opacity-75'}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${n.severity === 'CRITICAL' ? 'text-red-600' : n.severity === 'WARNING' ? 'text-yellow-600' : 'text-blue-600'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium text-gray-600'}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {n.actionUrl && (
                      <a href={n.actionUrl} className="text-xs text-brand-600 hover:underline font-medium">View Details</a>
                    )}
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-xs text-gray-400 hover:text-gray-600">Mark as read</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications yet.</p>
            <p className="text-xs mt-1">Click "Check Now" to scan for alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
