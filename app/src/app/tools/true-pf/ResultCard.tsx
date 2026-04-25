'use client';

import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, Download, Linkedin, MessageCircle, Twitter } from 'lucide-react';
import { useState } from 'react';
import type { Scenario } from '@/lib/pq/true-pf';

interface Props {
  scenarios: Scenario[];
  inputs: { units: number; kva: number; dpf: number; penalty: number; thdi: number };
  shareToken?: string;
  onReset: () => void;
}

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n).toLocaleString('en-IN')}`;

const COL_STYLE = {
  now:       { tone: 'red',    head: 'NOW',              label: 'Today, on your bill' },
  afterAPFC: { tone: 'amber',  head: 'AFTER APFC ONLY',  label: 'If you only fix the displacement PF' },
  afterAHF:  { tone: 'green',  head: 'AFTER AHF',        label: 'If you also remove harmonics' },
} as const;

const TONE = {
  red:   { ring: 'ring-red-200 dark:ring-red-900',     bg: 'bg-red-50 dark:bg-red-950/30',       head: 'text-red-700 dark:text-red-300',       chip: 'bg-red-600 text-white',     pen: 'text-red-700 dark:text-red-300' },
  amber: { ring: 'ring-amber-200 dark:ring-amber-900', bg: 'bg-amber-50 dark:bg-amber-950/30',   head: 'text-amber-700 dark:text-amber-300',   chip: 'bg-amber-500 text-white',   pen: 'text-amber-700 dark:text-amber-300' },
  green: { ring: 'ring-green-200 dark:ring-green-900', bg: 'bg-green-50 dark:bg-green-950/30',   head: 'text-green-700 dark:text-green-300',   chip: 'bg-green-600 text-white',   pen: 'text-green-700 dark:text-green-300' },
};

export default function ResultCard({ scenarios, inputs, shareToken, onReset }: Props) {
  const now = scenarios[0];
  const apfc = scenarios[1];
  const ahf = scenarios[2];

  // The "harmonic share" of the current penalty = what APFC alone CANNOT fix.
  // Equal to the leftover penalty after APFC scrubs the displacement-PF portion.
  const harmonicShare = apfc.estimatedPenalty;
  const reactiveShare = Math.max(0, now.estimatedPenalty - harmonicShare);
  const harmonicPct = now.estimatedPenalty > 0
    ? Math.round((harmonicShare / now.estimatedPenalty) * 100)
    : 0;

  const annualPenalty = now.estimatedPenalty * 12;
  const annualSavingsAhf = (now.estimatedPenalty - ahf.estimatedPenalty) * 12;

  const shareUrl = typeof window !== 'undefined'
    ? (shareToken ? `${window.location.origin}/tools/true-pf?r=${shareToken}` : window.location.href)
    : 'https://volt-spark.vercel.app/tools/true-pf';
  const shareText = `Indian factories pay ${fmt(now.estimatedPenalty)}/month in PF penalties. ~${harmonicPct}% of mine is harmonic distortion that an APFC alone cannot fix. Calculate yours →`;

  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div id="true-pf-result" className="space-y-6 max-w-5xl mx-auto">
      {/* Headline */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your True Power Factor</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on DPF <strong>{inputs.dpf.toFixed(2)}</strong>, THDi <strong>{(inputs.thdi * 100).toFixed(0)}%</strong>, and a current penalty of <strong>{fmt(inputs.penalty)}</strong>/month.
        </p>
      </div>

      {/* Three-column killer card (stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(s => {
          const meta = COL_STYLE[s.label];
          const tone = TONE[meta.tone];
          return (
            <div
              key={s.label}
              className={`rounded-xl ring-1 ${tone.ring} ${tone.bg} p-5 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold tracking-widest ${tone.head}`}>{meta.head}</span>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${tone.chip}`}>
                  {s.label === 'now' ? 'Penalty zone' : s.label === 'afterAPFC' ? 'Still leaking' : 'Clear'}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{meta.label}</p>

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">DPF</dt><dd className="font-mono">{s.dpf.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Distortion factor</dt><dd className="font-mono">{s.distortionPF.toFixed(3)}</dd></div>
                <div className="flex justify-between border-t border-current/10 pt-1.5 mt-1.5">
                  <dt className="font-semibold">True PF</dt>
                  <dd className="font-mono font-bold text-lg">{s.truePF.toFixed(3)}</dd>
                </div>
              </dl>

              <div className="mt-4 pt-3 border-t border-current/10">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Penalty / month</p>
                <p className={`text-2xl font-bold ${tone.pen} mt-0.5`}>{fmt(s.estimatedPenalty)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* The punch line */}
      {now.estimatedPenalty > 0 && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-5 flex gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Your APFC bank is an incomplete fix.
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Roughly <strong>{fmt(harmonicShare)}/month</strong> of your penalty is <strong>harmonic distortion</strong> — an APFC bank cannot remove it. Only an Active Harmonic Filter (AHF) can.
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Annualised: <strong>{fmt(annualPenalty)}/year</strong> at risk · <strong>{fmt(annualSavingsAhf)}/year</strong> recoverable with the right fix.
            </p>
          </div>
        </div>
      )}

      {now.estimatedPenalty === 0 && (
        <div className="rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/40 p-5 flex gap-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-green-900 dark:text-green-100">No PF penalty on the bill — but is your True PF safe?</p>
            <p className="text-sm text-green-800 dark:text-green-200">
              Your DISCOM may not penalise you today, but harmonic distortion still ages your transformer and capacitor bank. The True PF column shows what your installation actually sees.
            </p>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="/start"
          className="btn-primary text-center inline-flex items-center justify-center"
        >
          <Download className="h-4 w-4 mr-2" /> Get the detailed PDF report
        </a>
        <a
          href="/start"
          className="btn-secondary text-center inline-flex items-center justify-center"
        >
          Book a 20-min walkthrough
        </a>
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary text-center inline-flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Run another check
        </button>
      </div>

      {/* Share */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-medium mb-3">Share this with your team or your consultant</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium min-h-[44px]"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a66c2] hover:bg-[#084d92] text-white text-sm font-medium min-h-[44px]"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-medium min-h-[44px]"
          >
            <Twitter className="h-4 w-4" /> Post on X
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium min-h-[44px]"
          >
            <Copy className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
        Indicative estimate, not a substitute for site measurement. Penalty math is anchored to the figure you entered;
        a power-quality analyser report will sharpen the numbers.
      </p>

      {reactiveShare > 0 && harmonicShare > 0 && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Penalty split (estimated): reactive ~{fmt(reactiveShare)}/mo · harmonic ~{fmt(harmonicShare)}/mo.
        </p>
      )}
    </div>
  );
}
