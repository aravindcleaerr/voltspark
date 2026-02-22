'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

export default function NewClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name') as string,
      slug: (form.get('slug') as string).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      address: form.get('address') as string || undefined,
      industry: form.get('industry') as string || undefined,
      employeeCount: form.get('employeeCount') ? parseInt(form.get('employeeCount') as string) : undefined,
      gridTariffRate: form.get('gridTariffRate') ? parseFloat(form.get('gridTariffRate') as string) : undefined,
      solarTariffRate: form.get('solarTariffRate') ? parseFloat(form.get('solarTariffRate') as string) : undefined,
      dgTariffRate: form.get('dgTariffRate') ? parseFloat(form.get('dgTariffRate') as string) : undefined,
      contractDemand: form.get('contractDemand') ? parseFloat(form.get('contractDemand') as string) : undefined,
      powerFactorTarget: form.get('powerFactorTarget') ? parseFloat(form.get('powerFactorTarget') as string) : undefined,
    };

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/console');
    } else {
      const err = await res.json();
      setError(err.error || 'Failed to create client');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Add Client" subtitle="Create a new client workspace" />

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <div className="text-red-600 text-sm bg-red-50 rounded p-2">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Company Name *</label>
            <input name="name" required className="input-field" placeholder="e.g., Unnathi CNC Technologies" />
          </div>
          <div>
            <label className="label-text">Slug *</label>
            <input name="slug" required className="input-field" placeholder="e.g., unnathi-cnc" pattern="[a-z0-9\-]+" title="Lowercase letters, numbers, and hyphens only" />
          </div>
        </div>

        <div>
          <label className="label-text">Address</label>
          <input name="address" className="input-field" placeholder="Factory address" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Industry</label>
            <input name="industry" className="input-field" placeholder="e.g., CNC Precision Machining" />
          </div>
          <div>
            <label className="label-text">Employee Count</label>
            <input name="employeeCount" type="number" min="1" className="input-field" placeholder="e.g., 50" />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm text-gray-700 mb-3">Energy Tariff Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Grid Tariff (₹/kWh)</label>
              <input name="gridTariffRate" type="number" step="0.01" min="0" className="input-field" placeholder="e.g., 7.50" />
            </div>
            <div>
              <label className="label-text">Solar Tariff (₹/kWh)</label>
              <input name="solarTariffRate" type="number" step="0.01" min="0" className="input-field" placeholder="e.g., 0" />
            </div>
            <div>
              <label className="label-text">DG Tariff (₹/kWh)</label>
              <input name="dgTariffRate" type="number" step="0.01" min="0" className="input-field" placeholder="e.g., 18" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Contract Demand (kVA)</label>
            <input name="contractDemand" type="number" step="0.1" min="0" className="input-field" placeholder="e.g., 100" />
          </div>
          <div>
            <label className="label-text">Power Factor Target</label>
            <input name="powerFactorTarget" type="number" step="0.01" min="0" max="1" className="input-field" placeholder="e.g., 0.95" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Client'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
