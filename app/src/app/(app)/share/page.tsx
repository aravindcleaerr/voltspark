'use client';

import { useEffect, useState } from 'react';
import { Share2, Eye, Copy, PlusCircle, Link2, ExternalLink, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface ShareableView {
  id: string;
  token: string;
  title: string;
  sections: string | null;
  isActive: boolean;
  expiresAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  createdAt: string;
}

export default function SharePage() {
  const [views, setViews] = useState<ShareableView[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchViews = () => {
    fetch('/api/share').then(r => r.json()).then(data => setViews(data.views)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchViews(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Vendor Compliance Dashboard',
        sections: ['compliance', 'certifications', 'safety', 'improvements'],
      }),
    });
    if (res.ok) fetchViews();
    setCreating(false);
  };

  const handleToggle = async (viewId: string, isActive: boolean) => {
    await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewId, toggleActive: !isActive }),
    });
    fetchViews();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shareable Views"
        subtitle="Create public compliance dashboards for vendor qualification"
        action={
          <button onClick={handleCreate} disabled={creating} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle className="h-4 w-4" /> {creating ? 'Creating...' : 'New Shareable View'}
          </button>
        }
      />

      <div className="card">
        <p className="text-sm text-gray-500 mb-4">
          Share a real-time compliance dashboard with customers, OEM buyers, or auditors.
          No login required — they access it via a unique URL.
        </p>

        <div className="space-y-3">
          {views.map(v => (
            <div key={v.id} className={`border rounded-lg p-4 ${v.isActive ? '' : 'opacity-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span className="font-medium text-sm">{v.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {v.viewCount} views</span>
                    {v.lastViewedAt && <span>Last viewed {new Date(v.lastViewedAt).toLocaleDateString()}</span>}
                    <span>Created {new Date(v.createdAt).toLocaleDateString()}</span>
                    {v.expiresAt && <span className="text-orange-500">Expires {new Date(v.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyLink(v.token)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === v.token ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={`/share/${v.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                  >
                    <ExternalLink className="h-3 w-3" /> Preview
                  </a>
                  <button
                    onClick={() => handleToggle(v.id, v.isActive)}
                    className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                  >
                    {v.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {views.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Share2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No shareable views yet.</p>
              <p className="text-xs mt-1">Create one to share your compliance status with buyers and auditors.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
