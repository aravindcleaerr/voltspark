'use client';

import { useEffect, useState } from 'react';
import { FileText, FolderOpen, Upload, Search, ExternalLink, File, Shield, ClipboardCheck, GraduationCap, Zap } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface Doc {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  linkedToType: string | null;
  linkedToId: string | null;
  description: string | null;
  uploadedBy: { name: string };
  createdAt: string;
}

interface DocsData {
  documents: Doc[];
  summary: { total: number; byCategory: Record<string, number>; totalSize: number };
}

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  POLICY: { label: 'Policies', icon: <Shield className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
  CERTIFICATE: { label: 'Certificates', icon: <Shield className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
  AUDIT_REPORT: { label: 'Audit Reports', icon: <ClipboardCheck className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700' },
  TEST_REPORT: { label: 'Test Reports', icon: <FileText className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700' },
  PHOTO: { label: 'Photos', icon: <File className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-700' },
  BILL: { label: 'Bills', icon: <FileText className="h-4 w-4" />, color: 'bg-red-100 text-red-700' },
  TRAINING_MATERIAL: { label: 'Training', icon: <GraduationCap className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700' },
  OTHER: { label: 'Other', icon: <File className="h-4 w-4" />, color: 'bg-gray-100 text-gray-700' },
};

const formatSize = (bytes: number | null) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentsPage() {
  const [data, setData] = useState<DocsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'OTHER', fileUrl: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    const params = filter ? `?category=${filter}` : '';
    fetch(`/api/documents${params}`).then(r => r.json()).then(setData).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setForm({ name: '', category: 'OTHER', fileUrl: '', description: '' }); fetchData(); }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;
  if (!data) return <div className="text-red-600">Failed to load documents</div>;

  const filtered = search
    ? data.documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase()))
    : data.documents;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Library"
        subtitle={`${data.summary.total} documents · ${formatSize(data.summary.totalSize)}`}
        action={
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Upload className="h-4 w-4" /> Add Document
          </button>
        }
      />

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter(null)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filter ? 'bg-brand-100 border-brand-300 text-brand-800' : 'bg-white border-gray-200'}`}>
          All ({data.summary.total})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, val]) => {
          const count = data.summary.byCategory[key] || 0;
          if (count === 0) return null;
          return (
            <button key={key} onClick={() => setFilter(key)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${filter === key ? 'bg-brand-100 border-brand-300 text-brand-800' : 'bg-white border-gray-200'}`}>
              {val.icon} {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg" placeholder="Search documents..." />
      </div>

      {/* Document grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(doc => {
          const catInfo = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.OTHER;
          return (
            <div key={doc.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${catInfo.color}`}>
                  {catInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{catInfo.label} · {formatSize(doc.fileSize)}</p>
                  {doc.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {doc.uploadedBy.name} · {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{search ? 'No documents match your search.' : 'No documents uploaded yet.'}</p>
        </div>
      )}

      {/* Add Document Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Add Document</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Document Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" placeholder="e.g., Energy Policy v2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">File URL *</label>
                  <input required value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full text-sm border rounded-lg px-3 py-2 h-16 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Adding...' : 'Add Document'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
