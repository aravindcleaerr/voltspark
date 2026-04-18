import Link from 'next/link';
import { Zap, ArrowLeft, IndianRupee, TrendingUp } from 'lucide-react';

export const metadata = { title: 'Partner Economics — VoltSpark' };

const scenarios = [
  {
    machines: 1,
    label: '1 machine / source',
    example: 'Single incomer, one DG, or one compressor',
    gateway: 35000,
    meters: 8500,
    total: 43500,
    savingsLow: 200000,
    savingsHigh: 400000,
    payback: '2–3 months',
  },
  {
    machines: 3,
    label: '3 machines / sources',
    example: 'Incomer + DG + compressor',
    gateway: 35000,
    meters: 25500,
    total: 60500,
    savingsLow: 500000,
    savingsHigh: 1000000,
    payback: '1–2 months',
  },
  {
    machines: 5,
    label: '5 machines / sources',
    example: 'Incomer + 2 feeders + DG + solar',
    gateway: 35000,
    meters: 42500,
    total: 77500,
    savingsLow: 800000,
    savingsHigh: 1500000,
    payback: '< 2 months',
  },
  {
    machines: 10,
    label: '10 machines / sources',
    example: 'Full plant sub-metering across all bays',
    gateway: 35000,
    meters: 85000,
    total: 120000,
    savingsLow: 1500000,
    savingsHigh: 2500000,
    payback: '< 2 months',
  },
];

const machineTypes = [
  {
    type: 'Manufacturing feeder (CNC / metal processing)',
    loss: 'Power factor penalties + demand overshoot',
    savingsRange: '₹30,000–80,000 / year per feeder',
    module: 'IoT Metering + Power Quality',
  },
  {
    type: 'Air compressor',
    loss: 'Air leaks + idle running + degradation',
    savingsRange: '₹50,000–1,50,000 / year per compressor',
    module: 'Compressed Air Intelligence',
  },
  {
    type: 'Kitchen / induction zone',
    loss: 'Demand penalties + time-of-day overspend',
    savingsRange: '₹80,000–2,50,000 / year per kitchen',
    module: 'Kitchen Intelligence',
  },
  {
    type: 'DG / backup power',
    loss: 'Untracked diesel consumption + idle hours',
    savingsRange: '₹20,000–60,000 / year per DG set',
    module: 'IoT Metering',
  },
  {
    type: 'HVAC / utility feeder',
    loss: 'Off-hours waste + poor load factor',
    savingsRange: '₹20,000–50,000 / year per feeder',
    module: 'IoT Metering',
  },
  {
    type: 'Solar / rooftop generation',
    loss: 'Inverter underperformance goes undetected',
    savingsRange: '₹15,000–40,000 / year per array',
    module: 'IoT Metering',
  },
];

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// Assumption for portfolio scale: typical IoT site = 1 Advanced + 3 Standard + Manufacturing bundle
// Client bill: ₹999 + 3×₹599 + ₹2,500 = ₹5,296/mo  →  partner earns 30% = ₹1,589/mo
const partnerTiers = [
  { sites: 5, avgCommPerSite: 1589 },
  { sites: 10, avgCommPerSite: 1589 },
  { sites: 20, avgCommPerSite: 1589 },
];

export default function EconomicsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold">VoltSpark</span>
          </Link>
          <Link href="/partner" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Partner Overview
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-20">

        {/* Header */}
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Partner Economics</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">The numbers behind the pitch</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Two views: what your client invests and what savings become possible (per machine), and what you earn as a partner (per site, recurring).
          </p>
        </section>

        {/* ── SECTION 1: Customer ROI ── */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
            <div className="h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <h2 className="text-xl font-bold">Customer Investment & Savings Potential</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Investment scales with the number of machines or energy sources being monitored.</p>
            </div>
          </div>

          {/* Important framing note */}
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-5 py-4 text-sm">
            <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0 mt-0.5">i</span>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <p><strong className="text-gray-900 dark:text-white">Important:</strong> The figures below show the savings <em>opportunity</em> that VoltSpark helps identify — not savings that happen automatically.</p>
              <p>VoltSpark surfaces where energy is being wasted and quantifies it in ₹. Realising those savings requires your client to act on the findings — fixing leaks, adjusting settings, changing equipment, or improving processes. Your role as a consultant is to guide those decisions. VoltSpark gives you the evidence to make the case.</p>
            </div>
          </div>

          {/* Investment explained */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">How the investment is structured</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fixed — one per site</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹30,000–40,000</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Smart gateway (edge server). Connects all meters on the site. Shared across every machine — this cost does not repeat per machine.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Variable — per machine / source</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹6,000–12,000</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Smart meter + current transformers + installation. One meter per machine, feeder, DG, solar array, or energy source. Add as many as needed.</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3">
              <strong className="text-amber-800 dark:text-amber-200">Key insight:</strong> The gateway cost is shared across all meters on the site.
              A client with 10 machines pays the same ₹35,000 gateway as one with 1 machine —
              so the per-machine cost drops sharply as the site grows.
            </p>
          </div>

          {/* Scenario table */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Investment vs. savings by site size</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="text-left px-5 py-3">Site size</th>
                    <th className="text-right px-4 py-3">Gateway</th>
                    <th className="text-right px-4 py-3">Meters</th>
                    <th className="text-right px-4 py-3 font-bold text-gray-700 dark:text-gray-300">Total invest.</th>
                    <th className="text-right px-4 py-3">Per machine</th>
                    <th className="text-right px-4 py-3 text-green-600 dark:text-green-400">Savings potential (if acted on)</th>
                    <th className="text-right px-4 py-3">Payback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {scenarios.map((s) => (
                    <tr key={s.machines} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{s.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.example}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-gray-400">{fmt(s.gateway)}</td>
                      <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-gray-400">{fmt(s.meters)}</td>
                      <td className="px-4 py-4 text-right font-mono font-semibold text-gray-900 dark:text-white">{fmt(s.total)}</td>
                      <td className="px-4 py-4 text-right font-mono text-gray-500 dark:text-gray-400 text-xs">{fmt(Math.round(s.total / s.machines))}</td>
                      <td className="px-4 py-4 text-right font-mono text-green-700 dark:text-green-400">{fmt(s.savingsLow)}–{fmt(s.savingsHigh)}</td>
                      <td className="px-4 py-4 text-right text-xs font-medium text-brand-600 dark:text-brand-400 whitespace-nowrap">{s.payback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 px-1">Savings estimates are conservative mid-range figures based on typical Indian industrial facilities. Actual savings depend on site conditions, tariff structure, and improvement actions taken.</p>
          </div>

          {/* Per machine type */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Savings opportunity by machine / energy source type</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="text-left px-5 py-3">Machine / source type</th>
                    <th className="text-left px-4 py-3">What it's losing</th>
                    <th className="text-right px-4 py-3 text-green-600 dark:text-green-400">Savings potential</th>
                    <th className="text-left px-4 py-3">Module</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {machineTypes.map((m) => (
                    <tr key={m.type} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{m.type}</td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">{m.loss}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-green-700 dark:text-green-400 text-xs whitespace-nowrap">{m.savingsRange}</td>
                      <td className="px-4 py-3.5 text-xs text-brand-600 dark:text-brand-400 whitespace-nowrap">{m.module}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 px-1">Example: a factory with 1 incomer + 1 compressor + 1 utility feeder = 3 meters, total hardware ₹60,500. If the identified issues are acted on, conservative annual savings potential is ₹5–10L — implying a payback period under 2 months.</p>
          </div>
        </section>

        {/* ── SECTION 2: Partner Revenue ── */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
            <div className="h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <h2 className="text-xl font-bold">Partner Revenue — what you earn</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recurring monthly commission per client site, on top of your hardware margin and consulting fees.</p>
            </div>
          </div>

          {/* Commission structure */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">How commission works</h3>
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-5 py-4 text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0 mt-0.5">i</span>
              <p className="text-gray-700 dark:text-gray-300">The core platform is <strong className="text-gray-900 dark:text-white">always free</strong> — manual entry, compliance tracking, audits, and savings tracker cost the client nothing. You earn 30% recurring commission on IoT meter data ingestion and domain modules only, as VoltSpark only charges for what creates real infrastructure cost.</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="text-left px-5 py-3">IoT meter tier</th>
                    <th className="text-left px-4 py-3">Parameters measured</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Analytics included</th>
                    <th className="text-right px-4 py-3">Client pays / meter</th>
                    <th className="text-right px-4 py-3 text-green-600 dark:text-green-400">You earn (30%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { tier: 'Basic', params: 'kWh, kVA, PF, Hz (up to 4)', analytics: 'Consumption trends, basic cost tracking', client: '₹299/mo', comm: '₹90/mo' },
                    { tier: 'Standard', params: '+ V & A per phase (5–10)', analytics: '+ PF monitoring, phase imbalance, demand tracking', client: '₹599/mo', comm: '₹180/mo' },
                    { tier: 'Advanced', params: '+ max demand, TOU, load profile (11–15)', analytics: '+ Demand prediction, tariff optimisation, predictive maintenance', client: '₹999/mo', comm: '₹300/mo' },
                    { tier: 'Power Quality', params: '+ THD, harmonics, sag/swell, EN 50160 (15+)', analytics: '+ Full PQ analysis, harmonic filter sizing, equipment damage prediction', client: '₹1,499/mo', comm: '₹450/mo' },
                  ].map((r) => (
                    <tr key={r.tier} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">{r.tier}</td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">{r.params}</td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">{r.analytics}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.client}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-green-700 dark:text-green-400 font-semibold whitespace-nowrap">{r.comm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="text-left px-5 py-3">Industry Intelligence Bundle</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">For whom</th>
                    <th className="text-right px-4 py-3">Client pays / site</th>
                    <th className="text-right px-4 py-3 text-green-600 dark:text-green-400">You earn (30%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { name: 'Manufacturing Intelligence', for: 'CNC, metal, auto, plastics — production intensity, compressed air, machine profiles', client: '₹2,500/mo', comm: '₹750/mo' },
                    { name: 'Commercial Kitchen Intelligence', for: 'Restaurants, hotels, canteens — demand management, HACCP, load shedding', client: '₹4,000/mo', comm: '₹1,200/mo' },
                    { name: 'HVAC & Building Intelligence', for: 'Offices, malls, buildings — HVAC COP, zone consumption, chiller performance', client: '₹3,000/mo', comm: '₹900/mo' },
                    { name: 'Healthcare Intelligence', for: 'Hospitals, labs, pharma — critical load uptime, DG/UPS, NABH evidence', client: '₹4,000/mo', comm: '₹1,200/mo' },
                    { name: 'Custom Intelligence', for: 'Any industry — bespoke dashboards, custom metrics, tailored alerts', client: 'From ₹5,000/mo', comm: 'From ₹1,500/mo' },
                  ].map((r) => (
                    <tr key={r.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">{r.for}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.client}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-green-700 dark:text-green-400 font-semibold whitespace-nowrap">{r.comm}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50 dark:bg-green-950/30 font-semibold">
                    <td className="px-5 py-3.5 text-gray-900 dark:text-white" colSpan={2}>Example: CNC factory — 1 Advanced + 3 Standard meters + Manufacturing bundle</td>
                    <td className="px-4 py-3.5 text-right font-mono text-gray-900 dark:text-white">₹5,595/mo</td>
                    <td className="px-4 py-3.5 text-right font-mono text-green-700 dark:text-green-400 text-base">₹1,679/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 px-1">A site can subscribe to multiple bundles simultaneously — a hospital, for example, may need Healthcare + Commercial Kitchen + HVAC & Building all active at once.</p>
          </div>

          {/* Portfolio scale */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Portfolio scale — typical IoT site: 1 Advanced + 3 Standard meters + Manufacturing Intelligence bundle</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {partnerTiers.map((t) => {
                const monthly = t.avgCommPerSite * t.sites;
                const annual = monthly * 12;
                return (
                  <div key={t.sites} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t.sites} IoT client sites</p>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{monthly.toLocaleString('en-IN')}/mo</p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-0.5">{fmt(annual)}/year</p>
                    </div>
                    <p className="text-xs text-gray-400">Recurring. Grows as clients add more meters or domain modules.</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 px-1">This is SaaS commission only — separate from your hardware margin (typically 20–35% on meters and gateway) and your consulting fees. Free-tier clients contribute ₹0 but become IoT upsell targets as trust builds.</p>
          </div>

          {/* Flywheel */}
          <div className="bg-gray-950 dark:bg-gray-900 text-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-400" />
              <h3 className="font-semibold">The compounding effect</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { step: 'Year 1', title: 'Build evidence', body: 'Savings Tracker documents the ₹ impact of each improvement your client acts on. Client sees the ROI of your advice. You have proof for the next conversation.' },
                { step: 'Year 2', title: 'Deepen per site', body: 'Client enables more add-ons as trust grows. Higher per-site revenue with zero acquisition cost.' },
                { step: 'Year 3+', title: 'Scale portfolio', body: 'Referrals come from satisfied clients. Each new site adds to your recurring base. Benchmarks improve.' },
              ].map((s) => (
                <div key={s.step} className="space-y-1">
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider">{s.step}</p>
                  <p className="font-semibold text-white">{s.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-600 text-white p-8 text-center space-y-4">
          <p className="text-xl font-bold">Ready to start?</p>
          <p className="text-brand-100 text-sm">One client site. 30 days. Savings opportunities identified and documented.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
              Start Free
            </Link>
            <a href="mailto:aravind@akshayacreatech.com" className="border border-brand-300 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-500 transition-colors">
              Talk to Us
            </a>
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 VoltSpark</span>
          <div className="flex gap-4">
            <Link href="/partner" className="hover:text-gray-600 dark:hover:text-gray-300">Partner Overview</Link>
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
