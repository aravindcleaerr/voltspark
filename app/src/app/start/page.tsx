import Link from 'next/link';
import { Zap, CheckCircle, ArrowRight, FileText, BarChart3, Wrench, Cpu, Info } from 'lucide-react';

export const metadata = { title: 'Start with VoltSpark — Know What Your Electricity Bill Is Hiding' };

const losses = [
  { label: 'Power Factor penalty', detail: 'BESCOM charges extra when PF drops below 0.90. Most facilities don\'t know their PF until the penalty arrives.', range: '₹15,000–₹50,000 / month' },
  { label: 'Max Demand overshoot', detail: 'Drawing more kVA than your contracted limit even once in a month triggers a 50% surcharge on the excess.', range: '₹10,000–₹40,000 / month' },
  { label: 'Compressed air leaks', detail: '20–30% of air produced by a compressor is typically lost to leaks. That electricity is paid for and wasted.', range: '₹15,000–₹1,20,000 / month' },
  { label: 'Off-hours consumption', detail: 'Machines, HVAC, and lighting left running after shifts add directly to the bill with zero production output.', range: '₹10,000–₹60,000 / month' },
  { label: 'DG running cost', detail: 'Diesel generators cost 3–5× more per unit than grid power. Untracked DG hours are untracked money.', range: '₹20,000–₹2,00,000 / month' },
];

const steps = [
  {
    step: '1',
    icon: FileText,
    title: 'Enter your utility bill',
    body: 'Start by entering your monthly electricity bill — units consumed, demand charges, PF penalty, and total amount. VoltSpark immediately shows you what is normal and what is not.',
  },
  {
    step: '2',
    icon: BarChart3,
    title: 'See what your bill is hiding',
    body: 'VoltSpark analyses your bill against BESCOM norms and flags anomalies — PF penalties, demand overshoot, unusual spikes, tariff errors. Every issue is shown in ₹, not technical jargon.',
  },
  {
    step: '3',
    icon: Wrench,
    title: 'Fix it and track the savings',
    body: 'When you or your electrician fixes an issue, log the improvement. VoltSpark tracks the before and after — so you know exactly how much you saved, and your bill proves it.',
  },
];

const features = [
  'Monthly utility bill analysis — PF penalty, demand overshoot, tariff anomalies',
  'Energy cost dashboard — total spend in ₹ across grid, DG, solar, and other sources',
  'Savings tracker — document every improvement with a ₹ before-and-after',
  'ROI calculator — evaluate VFD, solar, LED, APFC, compressed air investments before buying',
  'Compliance tracking — ZED, ISO 50001, Electrical Safety in one place',
  'Audit & CAPA management — log findings, assign actions, track closure',
  'Training records — track certifications and expiry dates',
  'Government scheme eligibility — check which subsidies and incentives apply to you',
  'Shareable compliance report — one link to share your compliance status with buyers or auditors',
];

export default function StartPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold">VoltSpark</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="mailto:aravind@akshayacreatech.com" className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Talk to us
            </a>
            <Link href="/register" className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Start Free →
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 dark:bg-brand-950 px-4 py-1.5 rounded-full">
            For Industrial & Commercial Facilities
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Your electricity bill is hiding<br />
            <span className="text-brand-600">money you can get back.</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Most factories, kitchens, and commercial buildings lose <strong className="text-gray-900 dark:text-white">₹50,000–₹3,00,000 every month</strong> to
            penalties, waste, and inefficiencies they don&apos;t know about. VoltSpark shows you where — and tracks every rupee you save when you fix it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="mailto:aravind@akshayacreatech.com" className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Talk to us first
            </a>
          </div>
          <p className="text-xs text-gray-400">No hardware needed to start. Works with your existing utility bill.</p>
        </section>

        {/* What's hiding in the bill */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">What is typically hiding in your electricity bill</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              These are the most common avoidable losses in industrial and commercial facilities. Most go unnoticed because they are buried inside the bill — or never appear in it at all.
            </p>
          </div>
          <div className="space-y-3">
            {losses.map((l) => (
              <div key={l.label} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4">
                <div className="flex-1 space-y-0.5">
                  <p className="font-semibold text-gray-900 dark:text-white">{l.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{l.detail}</p>
                </div>
                <div className="text-sm font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap sm:text-right">{l.range}</div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4 text-sm">
            <Info className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-500 dark:text-gray-400">
              These are typical ranges observed in similar facilities — not guaranteed savings. What applies to your facility depends on your current setup, tariff structure, and what actions you take after VoltSpark identifies the issue.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">How it works</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">No installation required. Start with your last utility bill.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
                    <Icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3">
            <strong className="text-amber-800 dark:text-amber-200">Important:</strong> VoltSpark shows you where the problem is and how much it is costing you.
            Fixing it — whether that is an APFC panel, a VFD, sealing a compressor leak, or correcting a tariff error — requires your electrician, contractor, or equipment vendor.
            VoltSpark gives you the evidence to have that conversation and track the result.
          </p>
        </section>

        {/* Everything included */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Everything included in one platform</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">No credit card needed. Everything below is included on the free plan — manual entry, forever free.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* No hardware needed */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Start today. No hardware needed.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" />
                <p className="font-semibold text-gray-900 dark:text-white">Manual entry — start immediately</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Enter your meter readings, utility bills, and energy data manually. VoltSpark works entirely from the data you type in.
                Most facilities start here and get meaningful insights within the first week.
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">No installation. No electrician. Just your bills.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-brand-500" />
                <p className="font-semibold text-gray-900 dark:text-white">IoT meters — upgrade when ready</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                When you want real-time data — live kW, PF, voltage per machine or feeder — smart meters can be installed by a local electrical contractor.
                Once connected, meter readings flow into VoltSpark automatically. No more manual logging.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Hardware supplied and installed by third-party contractors. VoltSpark handles the data.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Simple, transparent pricing</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Start free. Pay only for IoT smart meters you connect — no flat subscription, no per-user charges.</p>
          </div>

          {/* Free tier */}
          <div className="border-2 border-brand-600 rounded-2xl p-6 space-y-4 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">Core Platform — Always Free</span>
            </div>
            <div className="pt-2 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-black text-gray-900 dark:text-white">₹0<span className="text-lg font-normal text-gray-400">/month</span></p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium pb-1">Forever free — no credit card needed</p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {[
                'Manual meter entry + utility bill analysis',
                'Energy cost dashboard (₹ view)',
                'ZED / ISO 50001 / Electrical Safety compliance',
                'Audit & CAPA management',
                'Savings tracker + ROI calculator (7 templates)',
                'Government scheme eligibility checker',
                'PDF reports & data export',
                '2 years data retention · Unlimited users',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Start Free →
            </Link>
          </div>

          {/* IoT meter tiers */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">IoT Smart Meters — when you want real-time data</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Priced per smart meter per month, based on how many parameters the meter measures. No minimum. Add meters one at a time.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="text-left pb-2 pr-4">Tier</th>
                    <th className="text-left pb-2 pr-4">What it measures</th>
                    <th className="text-left pb-2 pr-4 hidden sm:table-cell">Analytics included</th>
                    <th className="text-right pb-2">Per meter/month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { tier: 'Basic', params: 'kWh, kVA, PF, Hz (up to 4)', analytics: 'Consumption trends, basic cost tracking', price: '₹299' },
                    { tier: 'Standard', params: '+ voltage & current per phase (5–10)', analytics: '+ PF monitoring, phase imbalance, demand tracking', price: '₹599' },
                    { tier: 'Advanced', params: '+ max demand, TOU, load profile (11–15)', analytics: '+ Demand prediction, tariff optimisation, predictive maintenance', price: '₹999' },
                    { tier: 'Power Quality', params: '+ THD, harmonics, sag/swell, EN 50160 (15+)', analytics: '+ Full PQ analysis, harmonic filter sizing, equipment damage prediction', price: '₹1,499' },
                  ].map((r) => (
                    <tr key={r.tier} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{r.tier}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 text-xs">{r.params}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">{r.analytics}</td>
                      <td className="py-3 text-right font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Industry Intelligence Bundles (per site, on top of meters):</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Each bundle applies domain-specific analytics to your meter data — interpreting readings through the lens of your industry&apos;s machines and operations. Requires Standard+ IoT meters. Multiple bundles can be active on the same site.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: 'Manufacturing Intelligence', price: '₹2,500/month', note: 'Production energy intensity, compressed air efficiency, machine load profiles, shift analysis. For CNC, metal, auto, plastics.' },
                  { name: 'Commercial Kitchen Intelligence', price: '₹4,000/month', note: 'Demand management, load shedding alerts, HACCP temperature logging, ToD patterns. For restaurants, hotels, canteens.' },
                  { name: 'HVAC & Building Intelligence', price: '₹3,000/month', note: 'HVAC COP/EER tracking, floor/zone consumption, chiller performance. For offices, malls, commercial buildings.' },
                  { name: 'Healthcare Intelligence', price: '₹4,000/month', note: 'Critical load uptime, DG/UPS performance, clean room energy, NABH compliance evidence. For hospitals, labs, pharma.' },
                ].map((m) => (
                  <div key={m.name} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                      <p className="text-sm font-mono text-brand-600 dark:text-brand-400 font-semibold whitespace-nowrap">+{m.price}</p>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{m.note}</p>
                  </div>
                ))}
              </div>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Intelligence — <span className="font-mono text-brand-600 dark:text-brand-400">from ₹5,000/month</span></p>
                <p className="text-xs text-gray-400 mt-0.5">Bespoke analytics for specific industries or processes. <a href="mailto:aravind@akshayacreatech.com" className="text-brand-600 dark:text-brand-400 hover:underline">Talk to us.</a></p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon: Textile Manufacturing · Food Processing · Cold Chain & Logistics</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Example monthly bills:</p>
              <div className="space-y-1.5 text-sm">
                {[
                  { label: '2 meters — 1 Standard incomer + 1 Basic DG sub-meter', price: '₹898/month' },
                  { label: '5 meters — 1 Advanced incomer + 3 Standard feeders + 1 Basic DG', price: '₹3,095/month' },
                  { label: '13 meters — 1 Advanced incomer + 8 Standard sub-feeders + 4 Basic utility meters', price: '₹6,987/month' },
                ].map((ex) => (
                  <div key={ex.label} className="flex items-center justify-between gap-4">
                    <p className="text-gray-500 dark:text-gray-400">{ex.label}</p>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">{ex.price}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400">Smart meter hardware and installation by your local electrical contractor. VoltSpark handles data ingestion, analytics, and alerts.</p>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-600 text-white p-8 text-center space-y-5">
          <h2 className="text-2xl font-bold">See what your bill is hiding — in 10 minutes</h2>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            Sign up, enter your last three bills, and VoltSpark will show you exactly where your money is going.
            No hardware. No installation. No commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors flex items-center justify-center gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="mailto:aravind@akshayacreatech.com" className="border border-brand-300 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-500 transition-colors">
              Talk to us first
            </a>
          </div>
          <p className="text-xs text-brand-200">Core platform always free · IoT metering from ₹299/meter/month · No setup fees</p>
        </section>

      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 VoltSpark by Akshaya Createch</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
