'use client';

import { useMemo, useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { computeScenarios, bucketToThdi, THDI_BUCKETS, type Scenario, type ThdiBucketId } from '@/lib/pq/true-pf';
import ResultCard from './ResultCard';

type Errors = Partial<Record<'units' | 'kva' | 'dpf' | 'penalty' | 'thdi', string>>;

interface FormState {
  units: string;
  kva: string;
  dpf: string;
  penalty: string;
  thdiBucket: ThdiBucketId | '';
  thdiOverride: string;
  email: string;
}

const empty: FormState = {
  units: '',
  kva: '',
  dpf: '',
  penalty: '',
  thdiBucket: '',
  thdiOverride: '',
  email: '',
};

function validate(s: FormState): { errors: Errors; thdiDecimal: number | null } {
  const errors: Errors = {};
  const num = (v: string) => (v.trim() === '' ? NaN : Number(v));

  const u = num(s.units);
  if (isNaN(u) || u <= 0) errors.units = 'Enter monthly units (kWh) from your bill';

  const k = num(s.kva);
  if (isNaN(k) || k <= 0) errors.kva = 'Enter apparent demand (kVA) from your bill';

  const d = num(s.dpf);
  if (isNaN(d) || d < 0.5 || d > 1.0) errors.dpf = 'DPF must be between 0.5 and 1.0';

  const p = num(s.penalty);
  if (isNaN(p) || p < 0) errors.penalty = 'Enter the PF penalty amount in ₹ (0 if none)';

  // THDi: bucket OR numeric override (override wins)
  let thdiDecimal: number | null = null;
  const overrideRaw = s.thdiOverride.trim();
  if (overrideRaw !== '') {
    const t = Number(overrideRaw);
    if (isNaN(t) || t < 0 || t > 150) {
      errors.thdi = 'THDi must be between 0 and 150 (%)';
    } else {
      thdiDecimal = t / 100;
    }
  } else if (s.thdiBucket) {
    thdiDecimal = bucketToThdi(s.thdiBucket);
  } else {
    errors.thdi = 'Pick a load type or enter THDi %';
  }

  return { errors, thdiDecimal };
}

interface InitialResult {
  scenarios: Scenario[];
  inputs: { units: number; kva: number; dpf: number; penalty: number; thdi: number };
  shareToken?: string;
}

export default function TruePFForm({ initialResult }: { initialResult?: InitialResult | null }) {
  const [s, setS] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<InitialResult | null>(initialResult ?? null);

  const { errors, thdiDecimal } = useMemo(() => validate(s), [s]);
  const canSubmit = Object.keys(errors).length === 0 && thdiDecimal !== null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setS(prev => ({ ...prev, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || thdiDecimal === null) return;

    const inputs = {
      units: Number(s.units),
      kva: Number(s.kva),
      dpf: Number(s.dpf),
      penalty: Number(s.penalty),
      thdi: thdiDecimal,
    };

    const scenarios = computeScenarios({
      dpfNow: inputs.dpf,
      thdiNow: inputs.thdi,
      currentPenalty: inputs.penalty,
    });

    setSubmitting(true);
    let shareToken: string | undefined;
    try {
      const res = await fetch('/api/tools/true-pf/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: s.email.trim() || null,
          inputs,
          scenarios,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        shareToken = json.shareToken;
      }
    } catch {
      // Non-blocking — result still shows even if persistence fails.
    } finally {
      setSubmitting(false);
    }

    setResult({ scenarios, inputs, shareToken });
    requestAnimationFrame(() => {
      document.getElementById('true-pf-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function reset() {
    setResult(null);
    setS(empty);
    requestAnimationFrame(() => {
      document.getElementById('true-pf-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (result) {
    return (
      <ResultCard
        scenarios={result.scenarios}
        inputs={result.inputs}
        shareToken={result.shareToken}
        onReset={reset}
      />
    );
  }

  return (
    <form id="true-pf-form" onSubmit={onSubmit} className="card space-y-5 max-w-2xl mx-auto">
      <div>
        <label className="label-text">Last month&apos;s units consumed (kWh) <span className="text-red-500">*</span></label>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={s.units}
          onChange={e => set('units', e.target.value)}
          placeholder="e.g. 45000"
          className="input-field"
        />
        {errors.units && <p className="text-xs text-red-600 mt-1">{errors.units}</p>}
      </div>

      <div>
        <label className="label-text">Last month&apos;s apparent demand (kVA) <span className="text-red-500">*</span></label>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={s.kva}
          onChange={e => set('kva', e.target.value)}
          placeholder="e.g. 180"
          className="input-field"
        />
        {errors.kva && <p className="text-xs text-red-600 mt-1">{errors.kva}</p>}
      </div>

      <div>
        <label className="label-text">
          Displacement Power Factor (DPF) <span className="text-red-500">*</span>
          <span className="ml-1 inline-flex items-center text-gray-400" title="The PF printed on your BESCOM bill — usually between 0.85 and 1.00">
            <Info className="h-3.5 w-3.5" />
          </span>
        </label>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.5"
          max="1.0"
          value={s.dpf}
          onChange={e => set('dpf', e.target.value)}
          placeholder="e.g. 0.92"
          className="input-field"
        />
        {errors.dpf && <p className="text-xs text-red-600 mt-1">{errors.dpf}</p>}
      </div>

      <div>
        <label className="label-text">Current PF penalty paid this month (₹) <span className="text-red-500">*</span></label>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={s.penalty}
          onChange={e => set('penalty', e.target.value)}
          placeholder="e.g. 50000 (use 0 if none)"
          className="input-field"
        />
        {errors.penalty && <p className="text-xs text-red-600 mt-1">{errors.penalty}</p>}
      </div>

      <div>
        <label className="label-text">
          What kind of loads do you run? <span className="text-red-500">*</span>
          <span className="ml-1 inline-flex items-center text-gray-400" title="Used to estimate harmonic distortion (THDi). VFDs, UPS, and rectifiers add the most distortion.">
            <Info className="h-3.5 w-3.5" />
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {THDI_BUCKETS.map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => { set('thdiBucket', b.id); set('thdiOverride', ''); }}
              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors min-h-[44px] ${
                s.thdiBucket === b.id && !s.thdiOverride
                  ? 'border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium'
                  : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500 dark:text-gray-400">Or, if you have a power-quality report, enter THDi % directly:</label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            max="150"
            value={s.thdiOverride}
            onChange={e => { set('thdiOverride', e.target.value); if (e.target.value) set('thdiBucket', ''); }}
            placeholder="e.g. 35"
            className="input-field mt-1"
          />
        </div>
        {errors.thdi && <p className="text-xs text-red-600 mt-1">{errors.thdi}</p>}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
        <label className="label-text">Email (optional — for the detailed PDF report)</label>
        <input
          type="email"
          value={s.email}
          onChange={e => set('email', e.target.value)}
          placeholder="you@company.com"
          className="input-field"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          We&apos;ll show the result on screen either way. Email is only used to send you the PDF.
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="btn-primary w-full text-base py-3"
      >
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Calculating…</span>
        ) : (
          'Reveal my True Power Factor →'
        )}
      </button>
    </form>
  );
}
