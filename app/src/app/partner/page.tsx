import Link from 'next/link';
import { Zap, AlertTriangle, ArrowRight, Factory, UtensilsCrossed, Building2, HeartPulse, Info } from 'lucide-react';

export const metadata = { title: 'Partner with VoltSpark — Grow Your Practice' };

const verticals = [
  {
    icon: Factory,
    label: 'Manufacturing & CNC',
    pain: 'High electricity bill, ZED/ISO certification pressure, power factor penalties, compressed air leaks.',
    rupee: '₹5–20L in waste typically identified',
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: UtensilsCrossed,
    label: 'Kitchens & Hospitality',
    pain: 'Simultaneous loads spike demand charges. One dinner service can trigger ₹40K–₹2L in penalties.',
    rupee: '₹10–30L in waste typically identified',
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    icon: Building2,
    label: 'Commercial Buildings',
    pain: 'HVAC, lighting and utility loads run untracked. No visibility into which floor or tenant is the problem.',
    rupee: '₹8–25L in waste typically identified',
    color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: HeartPulse,
    label: 'Hospitals & Healthcare',
    pain: 'Critical loads, backup power costs, NABH compliance — no single platform tracks energy and safety together.',
    rupee: '₹5–15L in waste typically identified',
    color: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
];

const addons = [
  {
    name: 'IoT Metering',
    tagline: 'Real-time visibility across every energy source',
    body: 'One smart gateway connects all meters in the facility — incomer, DG, solar, individual machines. Data flows into VoltSpark automatically. No manual logs. No missed readings.',
    impact: 'Surfaces hidden losses within days. Your client can see exactly where energy is going — and decide what to fix.',
  },
  {
    name: 'Power Quality Monitor',
    tagline: 'Identify equipment and downtime risks early',
    body: 'Tracks voltage sags, swells, harmonics (THD) and power factor per phase. Raises an alert when grid instability could cause a breakdown or PLC trip.',
    impact: 'Early warning gives your client time to act — before a breakdown, not after.',
  },
  {
    name: 'Compressed Air Intelligence',
    tagline: 'Find what your compressor is wasting',
    body: 'Tracks energy per cubic metre of air produced. Rising specific energy signals a leak or degradation. Flags the problem so it can be investigated and fixed.',
    impact: '20–30% of compressed air is typically wasted. VoltSpark identifies it — acting on it is where the savings come from.',
  },
  {
    name: 'Kitchen Intelligence',
    tagline: 'Visibility and alerts for demand management',
    body: 'Monitors live kVA demand against contracted limit. Raises alerts before a breach threshold is crossed. Tracks ToD patterns and HACCP temperatures.',
    impact: 'Gives operators the information to make load-shedding decisions in real time. Penalty avoidance follows from those decisions.',
  },
];

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold">VoltSpark</span>
          </Link>
          <Link href="/register" className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Get Started →
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 dark:bg-brand-950 px-4 py-1.5 rounded-full">
            For Energy & Compliance Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Your clients are paying for losses<br />
            <span className="text-brand-600">they don't know exist.</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Every factory, kitchen, hospital, and office building has an electricity bill. Almost none know
            where 20–40% of it is wasted. VoltSpark makes you the one who finds it and proves it in ₹ —
            so your clients can act on it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/partner/economics" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              See the numbers <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="mailto:aravind@akshayacreatech.com" className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Talk to us
            </a>
          </div>
        </section>

        {/* How savings actually happen — important clarity */}
        <section>
          <div className="flex items-start gap-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <p className="font-semibold text-gray-900 dark:text-white">How savings actually happen</p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-blue-700 dark:text-blue-300">VoltSpark finds it</p>
                  <p className="text-gray-600 dark:text-gray-400">Surfaces waste, penalties, risks, and deviations — quantified in ₹, not just kWh.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-blue-700 dark:text-blue-300">You recommend the fix</p>
                  <p className="text-gray-600 dark:text-gray-400">Your expertise turns the data into an action plan — equipment changes, process adjustments, maintenance.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-blue-700 dark:text-blue-300">Client acts and saves</p>
                  <p className="text-gray-600 dark:text-gray-400">Savings come from the improvements your client implements — VoltSpark tracks and proves every rupee of it.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                VoltSpark is a visibility and evidence platform. It does not automatically reduce your client&apos;s bill —
                that happens when insights are acted on. The platform&apos;s job is to make sure nothing stays hidden and nothing goes unproven.
              </p>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section>
          <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white">The problem every consultant faces</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                You know where the waste is. But your client sees an Excel report once a quarter and forgets it by the next board meeting.
                VoltSpark gives them a live dashboard that speaks their language — <strong>₹ identified, risks flagged, compliance tracked</strong>.
                Your recommendations become visible, measurable, and impossible to ignore.
              </p>
            </div>
          </div>
        </section>

        {/* Verticals */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Works across every vertical you serve</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">One platform. Any facility that pays an electricity bill.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {verticals.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.label} className={`rounded-xl border p-5 space-y-3 ${v.color}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${v.iconColor}`} />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{v.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.pain}</p>
                  <p className={`text-sm font-bold ${v.iconColor}`}>{v.rupee}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 px-1">Figures represent typical ranges of waste identified in audits of similar facilities. Actual savings depend on what actions are taken.</p>
        </section>

        {/* How it works */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Start manual. Add IoT when ready.</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">No hardware dependency to get started. IoT add-ons layer on top when the client is ready to invest.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Core platform', body: 'Energy tracking, utility bill analysis, compliance (ZED / ISO 50001 / Electrical Safety), CAPA, training, audits. Manual entry. Works from day one.' },
              { step: '2', title: 'Identify and document', body: 'Savings Tracker and ROI Calculator attach a ₹ number to every improvement you recommend — so clients can prioritise and you can prove your value.' },
              { step: '3', title: 'Upgrade with IoT', body: 'When the client is ready, enable add-on modules. Real-time data flows in automatically, reducing manual work and enabling faster identification of issues.' },
            ].map((s) => (
              <div key={s.step} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
                <div className="h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">{s.step}</div>
                <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Add-ons */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">IoT add-on modules</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Each module is enabled per client site. Clients pay for what they use.</p>
          </div>
          <div className="space-y-3">
            {addons.map((a) => (
              <div key={a.name} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{a.name}</span>
                  <span className="text-sm text-brand-600 dark:text-brand-400">— {a.tagline}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a.body}</p>
                <p className="text-sm font-medium text-green-700 dark:text-green-400 pt-1">↳ {a.impact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partner revenue teaser */}
        <section className="rounded-2xl bg-gray-950 dark:bg-gray-900 text-white p-8 space-y-4">
          <h2 className="text-xl font-bold">What you earn as a partner</h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            You earn a recurring commission on every client site you bring onto VoltSpark — base platform plus each add-on they enable.
            The more problems you solve per site, the more add-ons make sense, and the higher the per-site revenue.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              { sites: '5 sites', monthly: '₹19,500/mo', annual: '₹2.34L/yr' },
              { sites: '10 sites', monthly: '₹39,000/mo', annual: '₹4.68L/yr' },
              { sites: '20 sites', monthly: '₹78,000/mo', annual: '₹9.36L/yr' },
            ].map((r) => (
              <div key={r.sites} className="bg-gray-800 rounded-xl p-4 space-y-1 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{r.sites}</p>
                <p className="text-xl font-bold text-white">{r.monthly}</p>
                <p className="text-xs text-green-400">{r.annual}</p>
              </div>
            ))}
          </div>
          <Link href="/partner/economics" className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-medium pt-1">
            See full breakdown — per machine investment + partner revenue model <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Why now */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Why clients cannot wait</h2>
          <div className="space-y-2">
            {[
              'ZED certification is now a vendor qualification requirement for many Tier 1 auto OEMs. Factories without it risk losing orders.',
              'ISO 50001 audits require documented energy baselines, targets, and improvement evidence — not Excel sheets.',
              "BEE PAT cycle penalties are rising. Facilities that can't prove energy reduction face fines.",
              'BESCOM and other DISCOMs have tightened PF and demand norms — penalties are bigger than they were 3 years ago.',
            ].map((point, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-3">
                <span className="text-brand-600 font-bold flex-shrink-0">→</span>
                {point}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-600 text-white p-8 text-center space-y-4">
          <p className="text-xl font-bold">Ready to build your practice on VoltSpark?</p>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">Start with one client. Identify savings opportunities in the first month. Build from there.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
              Start Free
            </Link>
            <Link href="/partner/economics" className="border border-brand-300 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-500 transition-colors">
              See the Numbers
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 VoltSpark</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
