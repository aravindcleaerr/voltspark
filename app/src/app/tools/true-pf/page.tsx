import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { computeScenarios, type Scenario } from '@/lib/pq/true-pf';
import TruePFForm from './TruePFForm';

interface SearchParams { r?: string }

interface SharedResult {
  scenarios: Scenario[];
  inputs: { units: number; kva: number; dpf: number; penalty: number; thdi: number };
  shareToken: string;
}

async function loadShared(token: string | undefined): Promise<SharedResult | null> {
  if (!token) return null;
  try {
    const row = await prisma.leadMagnetSubmission.findUnique({ where: { shareToken: token } });
    if (!row || row.sourceTool !== 'true-pf') return null;
    const inputs = JSON.parse(row.inputJson);
    let scenarios: Scenario[];
    try {
      scenarios = JSON.parse(row.scenariosJson);
    } catch {
      scenarios = computeScenarios({ dpfNow: inputs.dpf, thdiNow: inputs.thdi, currentPenalty: inputs.penalty });
    }
    return { scenarios, inputs, shareToken: row.shareToken };
  } catch {
    return null;
  }
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const shared = await loadShared(searchParams.r);

  let ogUrl = '/api/og/true-pf';
  let ogDescription = 'In 3 minutes, see whether your monthly PF penalty is reactive or harmonic — and whether an APFC bank alone can fix it. Free, no signup.';

  if (shared) {
    const { dpf, thdi, penalty } = shared.inputs;
    const params = new URLSearchParams({
      dpf: dpf.toString(),
      thdi: thdi.toString(),
      pen: penalty.toString(),
    });
    ogUrl = `/api/og/true-pf?${params.toString()}`;
    const harmonicShare = shared.scenarios[1].estimatedPenalty;
    const harmonicPct = penalty > 0 ? Math.round((harmonicShare / penalty) * 100) : 0;
    ogDescription = `True PF ${shared.scenarios[0].truePF.toFixed(3)} · ~${harmonicPct}% of this factory's PF penalty is harmonic distortion that an APFC alone cannot fix.`;
  }

  return {
    title: 'True Power Factor Revealer — VoltSpark',
    description: 'In 3 minutes, see whether your monthly PF penalty is reactive or harmonic — and whether an APFC bank alone can fix it. Free, no signup. By VoltSpark.',
    openGraph: {
      title: 'True Power Factor Revealer — VoltSpark',
      description: ogDescription,
      type: 'website',
      url: 'https://volt-spark.vercel.app/tools/true-pf',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'True Power Factor Revealer — VoltSpark',
      description: ogDescription,
      images: [ogUrl],
    },
  };
}

export default async function TruePFPage({ searchParams }: { searchParams: SearchParams }) {
  const shared = await loadShared(searchParams.r);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 space-y-10">
      <header className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 px-4 py-1.5 rounded-full">
          Free tool · 3 minutes · No signup
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Your PF penalty isn&apos;t one number.<br />
          <span className="text-brand-600">It&apos;s two — and your APFC only fixes one.</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Enter five numbers from your last electricity bill. We&apos;ll show you the part of your penalty
          that&apos;s reactive power (an APFC bank fixes this) and the part that&apos;s harmonic distortion
          (only an Active Harmonic Filter does).
        </p>
      </header>

      <TruePFForm initialResult={shared} />

      <section className="max-w-2xl mx-auto pt-6 text-sm text-gray-600 dark:text-gray-400 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">Why this matters</h2>
        <p>
          Most factories with VFDs, UPS units, or rectifiers pay a power-factor penalty every month even after
          installing an APFC bank. The reason: BESCOM (and most DISCOMs) bill against <strong>True Power Factor</strong>,
          which combines displacement PF and harmonic distortion. APFC banks correct only the displacement portion.
        </p>
        <p>
          This tool is the same calculation a good power-quality consultant would walk you through in a one-day visit —
          made public, free, and shareable.
        </p>
      </section>
    </div>
  );
}
