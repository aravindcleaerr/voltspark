'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, PlusCircle, Trash2, GripVertical, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface TemplateItem {
  section: string;
  itemText: string;
  helpText: string;
  type: string;
  isCritical: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isBuiltIn: boolean;
  _count: { items: number; inspections: number };
}

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical Safety' },
  { value: 'FIRE', label: 'Fire Safety' },
  { value: 'GENERAL_SAFETY', label: 'General Safety' },
  { value: 'CUSTOM', label: 'Custom' },
];

const ITEM_TYPES = [
  { value: 'PASS_FAIL', label: 'Pass/Fail' },
  { value: 'TEXT', label: 'Text Input' },
  { value: 'NUMERIC', label: 'Numeric Value' },
  { value: 'PHOTO', label: 'Photo Evidence' },
];

export default function InspectionTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [saving, setSaving] = useState(false);

  // Builder state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('GENERAL_SAFETY');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<TemplateItem[]>([
    { section: 'General', itemText: '', helpText: '', type: 'PASS_FAIL', isCritical: false },
  ]);

  const fetchTemplates = () => {
    fetch('/api/inspection-templates').then(r => r.json()).then(setTemplates).finally(() => setLoading(false));
  };
  useEffect(() => { fetchTemplates(); }, []);

  const addItem = () => {
    const lastSection = items.length > 0 ? items[items.length - 1].section : 'General';
    setItems(prev => [...prev, { section: lastSection, itemText: '', helpText: '', type: 'PASS_FAIL', isCritical: false }]);
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof TemplateItem, value: string | boolean) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!name || items.filter(it => it.itemText).length === 0) return;
    setSaving(true);
    await fetch('/api/inspection-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, description, items: items.filter(it => it.itemText) }),
    });
    fetchTemplates();
    setShowBuilder(false);
    setName('');
    setDescription('');
    setItems([{ section: 'General', itemText: '', helpText: '', type: 'PASS_FAIL', isCritical: false }]);
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-96 bg-gray-200 rounded-lg" /></div>;

  // Group sections for display
  const sections = Array.from(new Set(items.map(it => it.section)));

  return (
    <div className="space-y-6">
      <PageHeader title="Inspection Templates" subtitle="Create and manage safety inspection checklists" />

      <div className="flex gap-2">
        <button onClick={() => setShowBuilder(!showBuilder)} className="btn-primary text-sm">
          <PlusCircle className="h-4 w-4 inline mr-1" /> New Template
        </button>
        <button onClick={() => router.push('/safety')} className="btn-secondary text-sm">Back to Safety</button>
      </div>

      {/* Template Builder */}
      {showBuilder && (
        <div className="card border-2 border-brand-200">
          <h3 className="font-semibold mb-4">Create Inspection Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Template name" className="input" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="input">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="input" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Checklist Items</p>
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2 border rounded-lg p-3 bg-gray-50">
                <span className="text-xs text-gray-400 mt-2 w-6">{i + 1}</span>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    value={item.section}
                    onChange={e => updateItem(i, 'section', e.target.value)}
                    placeholder="Section"
                    className="input text-xs"
                  />
                  <input
                    value={item.itemText}
                    onChange={e => updateItem(i, 'itemText', e.target.value)}
                    placeholder="Check item / question"
                    className="input text-xs col-span-2 sm:col-span-1"
                  />
                  <select
                    value={item.type}
                    onChange={e => updateItem(i, 'type', e.target.value)}
                    className="input text-xs"
                  >
                    {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={item.isCritical} onChange={e => updateItem(i, 'isCritical', e.target.checked)} className="rounded" />
                      <AlertTriangle className="h-3 w-3 text-red-500" /> Critical
                    </label>
                  </div>
                </div>
                <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 mt-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={addItem} className="btn-secondary text-xs"><PlusCircle className="h-3.5 w-3.5 inline mr-1" /> Add Item</button>
            <button onClick={handleSave} disabled={saving || !name} className="btn-primary text-xs">
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      )}

      {/* Existing Templates */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-4">Templates ({templates.length})</h3>
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
              <div>
                <span className="font-medium text-sm">{t.name}</span>
                <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                  {CATEGORIES.find(c => c.value === t.category)?.label || t.category}
                </span>
                {t.isBuiltIn && <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 rounded-full text-blue-600">Built-in</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{t._count.items} items</span>
                <span>{t._count.inspections} inspections</span>
              </div>
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No templates yet. Create your first inspection template.</p>}
        </div>
      </div>
    </div>
  );
}
