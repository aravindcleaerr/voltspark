import Link from 'next/link';
import { Zap, AlertTriangle, ArrowRight, Factory, UtensilsCrossed, Building2, HeartPulse, Info, Wrench } from 'lucide-react';

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
    label: 'Commercial Kitchens & Hospitality',
    pain: 'Simultaneous loads spike demand charges. One dinner service can trigger ₹40K–₹2L in penalties.',
    rupee: '₹10–30L in waste typically identified',
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    icon: Building2,
    label: 'Commercial Buildings & Offices',
    pain: 'HVAC, lighting and utility loads run untracked. No visibility into which floor, zone, or tenant is the problem.',
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

const bundles = [
  {
    name: 'Manufacturing Intelligence',
    price: '₹2,500/site/month',
    industry: 'CNC, metal processing, auto components, plastics',
    tagline: 'Production energy intensity and compressed air efficiency',
    capabilities: [
      'Production energy intensity — kWh per unit of output',
      'Compressed air specific energy (kWh/m³) and leak detection',
      'Machine load profiles and idle vs. productive hours',
      'Shift-wise consumption breakdown',
      'VFD efficiency tracking',
    ],
    machines: 'Compressors, CNC spindles, conveyors, chillers, cooling towers',
    color: 'border-blue-200 dark:border-blue-800',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Commercial Kitchen Intelligence',
    price: '₹4,000/site/month',
    industry: 'Restaurants, hotels, canteens, cloud kitchens, institutional kitchens',
    tagline: 'Demand management, load shedding alerts, and HACCP compliance',
    capabilities: [
      'Live demand vs contracted kVA — alerts before penalty threshold',
      'Automatic load shedding recommendations during peak service',
      'Meal-time demand spike analysis and ToD patterns',
      'HACCP temperature logging for refrigeration and storage',
      'Energy cost per cover — the F&B sector metric',
    ],
    machines: 'Induction stoves, ovens, walk-in coolers, dishwashers, exhaust fans',
    color: 'border-orange-200 dark:border-orange-800',
    accent: 'text-orange-600 dark:text-orange-400',
  },
  {
    name: 'HVAC & Building Intelligence',
    price: '₹3,000/site/month',
    industry: 'Offices, commercial buildings, malls, hotels, warehouses',
    tagline: 'HVAC efficiency, zone-level consumption, and occupancy analytics',
    capabilities: [
      'HVAC COP/EER tracking — identify inefficient chillers and AHUs',
      'Floor and zone-wise consumption breakdown',
      'Occupancy-based load correlation',
      'Chiller performance curves and sequencing efficiency',
      'Elevator and common area energy profiling',
    ],
    machines: 'AHUs, chillers, cooling towers, lifts, lighting feeders, UPS',
    color: 'border-purple-200 dark:border-purple-800',
    accent: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'Healthcare Intelligence',
    price: '₹4,000/site/month',
    industry: 'Hospitals, diagnostic labs, pharma, blood banks',
    tagline: 'Critical load uptime, backup power, and NABH-ready compliance evidence',
    capabilities: [
      'Critical load uptime monitoring — OT, ICU, life support feeders',
      'DG and UPS performance — runtime, fuel efficiency, switchover time',
      'Clean room energy intensity and deviation alerts',
      'Medical equipment energy profiling',
      'NABH-compatible compliance evidence generation',
    ],
    machines: 'OT loads, ICU feeders, sterilizers, CSSD, DG sets, UPS banks',
    color: 'border-rose-200 dark:border-rose-800',
    accent: 'text-rose-600 dark:text-rose-400',
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
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">No hardware dependency to get started. Smart meters and industry intelligence bundles layer on top when the client is ready to invest.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Core platform', body: 'Energy tracking, utility bill analysis, compliance (ZED / ISO 50001 / Electrical Safety), CAPA, training, audits. Manual entry. Works from day one.' },
              { step: '2', title: 'Identify and document', body: 'Savings Tracker and ROI Calculator attach a ₹ number to every improvement you recommend — so clients can prioritise and you can prove your value.' },
              { step: '3', title: 'Upgrade with IoT + Intelligence', body: 'When the client is ready, install smart meters and enable the industry intelligence bundle for their vertical. Real-time data flows in automatically — domain-specific analytics surface exactly what that industry\'s machines are wasting.' },
            ].map((s) => (
              <div key={s.step} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
                <div className="h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">{s.step}</div>
                <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industry Intelligence Bundles */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Industry Intelligence Bundles</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Priced per site per month — on top of the meter data layer. Each bundle applies domain-specific analytics
              to the IoT readings: what those numbers mean for that industry&apos;s machines, operations, and compliance requirements.
              A site can subscribe to multiple bundles simultaneously.
            </p>
          </div>
          <div className="space-y-4">
            {bundles.map((b) => (
              <div key={b.name} className={`border rounded-xl p-5 space-y-3 ${b.color}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900 dark:text-white">{b.name}</p>
                    <p className={`text-sm font-medium ${b.accent}`}>{b.tagline}</p>
                    <p className="text-xs text-gray-400">{b.industry}</p>
                  </div>
                  <span className={`text-sm font-mono font-bold ${b.accent} whitespace-nowrap`}>{b.price}</span>
                </div>
                <ul className="grid sm:grid-cols-2 gap-1.5">
                  {b.capabilities.map((c) => (
                    <li key={c} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className={`${b.accent} flex-shrink-0 font-bold`}>·</span>{c}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 pt-1"><span className="font-medium">Typical machines monitored:</span> {b.machines}</p>
              </div>
            ))}
          </div>

          {/* Custom + Coming Soon */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-gray-400" />
                <p className="font-semibold text-gray-900 dark:text-white">Custom Intelligence</p>
                <span className="text-xs font-mono text-gray-500 ml-auto">From ₹5,000/site/month</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Bespoke dashboards, custom metrics, and tailored alerts for industries or processes not covered above.
                We work with you and your client to define what matters — specific machines, production flows, or compliance requirements.
              </p>
            </div>
            <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 space-y-3">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Coming soon</p>
              <div className="space-y-2">
                {[
                  { name: 'Textile Manufacturing Intelligence', note: 'Looms, humidifiers, compressors, chillers' },
                  { name: 'Food Processing Intelligence', note: 'Boilers, cold storage, processing lines' },
                  { name: 'Cold Chain & Logistics Intelligence', note: 'Refrigerated warehouses, transport hub loads' },
                ].map((cs) => (
                  <div key={cs.name}>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cs.name}</p>
                    <p className="text-xs text-gray-400">{cs.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Partner revenue teaser */}
        <section className="rounded-2xl bg-gray-950 dark:bg-gray-900 text-white p-8 space-y-4">
          <h2 className="text-xl font-bold">What you earn as a partner</h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            You earn 30% recurring commission on every IoT meter and domain module your client enables.
            The core platform is free — so clients sign up with zero friction, and you earn as they upgrade to IoT.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              { sites: '5 IoT sites', monthly: '₹6,445/mo', annual: '₹77,340/yr' },
              { sites: '10 IoT sites', monthly: '₹12,890/mo', annual: '₹1.55L/yr' },
              { sites: '20 IoT sites', monthly: '₹25,780/mo', annual: '₹3.09L/yr' },
            ].map((r) => (
              <div key={r.sites} className="bg-gray-800 rounded-xl p-4 space-y-1 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{r.sites}</p>
                <p className="text-xl font-bold text-white">{r.monthly}</p>
                <p className="text-xs text-green-400">{r.annual}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 pt-1">Based on avg commission of ₹1,289/IoT site/month (typical site: 1 Advanced + 3 Standard meters + 1 domain module). Additional to your hardware margin and consulting fees.</p>
          <Link href="/partner/economics" className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-medium pt-1">
            See full breakdown — per meter investment + partner revenue model <ArrowRight className="h-4 w-4" />
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
