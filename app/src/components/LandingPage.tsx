'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  Zap, Shield, TrendingUp, BarChart3, Users, IndianRupee, CheckCircle2,
  ArrowRight, Building2, FileText, GraduationCap, CalendarClock, Play,
  Radio, Activity, ChefHat, Cpu,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const FEATURES = [
  { icon: IndianRupee, title: 'Save Energy Costs', desc: 'Track consumption, identify waste, and prove savings with hard numbers. Know exactly where every rupee goes.' },
  { icon: Shield, title: 'Stay Compliant', desc: 'Multi-framework compliance tracking — ZED, ISO 50001, Electrical Safety. Always audit-ready.' },
  { icon: TrendingUp, title: 'Prove ROI', desc: 'Pre-built ROI calculators, savings tracking, and consultant fee justification. Numbers that speak.' },
  { icon: BarChart3, title: 'Utility Bill Analysis', desc: 'Auto-detect PF penalties, demand overshoot, and cost anomalies. BESCOM-style penalty estimation built in.' },
  { icon: Radio, title: 'IoT Smart Meters', desc: 'Connect any Modbus meter via MQTT gateway. Real-time dashboards, automatic consumption tracking, per-meter tier pricing.' },
  { icon: Activity, title: 'Power Quality Monitor', desc: 'EN 50160 compliance monitoring. Voltage sags/swells, THD analysis, harmonic trends, PQ scoring. Bundled in the PQ meter tier.' },
  { icon: GraduationCap, title: 'Training & Safety', desc: 'Manage training programs, inspections, incidents, and certifications in one place.' },
  { icon: CalendarClock, title: 'Compliance Calendar', desc: 'Never miss a deadline. Audit dates, cert renewals, and CAPA due dates in one view.' },
  { icon: Cpu, title: 'Multi-Vendor IoT', desc: 'Works with any energy meter or sensor — Modbus RTU/TCP, MQTT gateways, industrial PCs. Vendor-agnostic by design.' },
];

const FACILITY_STEPS = [
  { num: '1', title: 'Sign up free', desc: 'Create your facility account. No credit card, no hardware — just your last electricity bill to get started.' },
  { num: '2', title: 'See what your bill hides', desc: 'Enter monthly bills and meter readings. VoltSpark flags PF penalties, demand overshoot, and cost anomalies automatically in ₹.' },
  { num: '3', title: 'Fix waste, track savings', desc: 'Act on each finding. Every improvement is logged with a ₹ before-and-after so your bill proves the result.' },
];

const CONSULTANT_STEPS = [
  { num: '1', title: 'Create your consultant account', desc: 'Register as an energy consultant or ESCO. Manage multiple client facilities from one portfolio dashboard.' },
  { num: '2', title: 'Add clients, collect data', desc: 'Onboard each facility, enter their energy data, and run utility bill analysis. Get compliance scores and gap assessments instantly.' },
  { num: '3', title: 'Prove value, retain clients', desc: 'Generate ₹ savings reports, ROI analyses, and compliance documentation. Use the numbers to renew contracts and win referrals.' },
];

const PLANS = [
  {
    name: 'Core Platform',
    price: '₹0',
    priceSub: 'forever free',
    desc: 'Manual entry, compliance, and savings tracking — no hardware required.',
    highlight: false,
    features: ['Unlimited clients & users', 'Manual meter entry + utility bill analysis', 'Energy cost dashboard (₹ view)', 'ZED / ISO 50001 / Electrical Safety compliance', 'Audit, CAPA & findings management', 'Savings tracker + ROI calculator (7 templates)', 'PDF reports & shareable compliance views', '2 years data retention'],
    cta: 'Start Free', href: '/register',
  },
  {
    name: 'IoT Metering',
    price: 'from ₹299',
    priceSub: 'per meter / month',
    desc: 'Real-time data from smart meters — pay only per device connected.',
    highlight: true,
    features: ['Basic ₹299/meter — up to 4 parameters + 1 sensor', 'Standard ₹599/meter — + voltage & current per phase + 2 sensors', 'Advanced ₹999/meter — + max demand, TOU, predictive maintenance + 3 sensors', 'Power Quality ₹1,499/meter — + THD, harmonics, EN 50160 + 5 sensors', 'Auto-ingestion — no manual logging', 'Live dashboard: kW, PF, voltage per meter', 'Add industry intelligence bundles on top (₹2,500–₹5,000/site)'],
    cta: 'See Full Pricing', href: '/start',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceSub: '',
    desc: 'For large consultancies, ESCOs, and multi-site rollouts.',
    highlight: false,
    features: ['Everything in Core + IoT', 'All 4 industry intelligence bundles available', 'Custom Intelligence — bespoke analytics', 'White-label branding', 'API access for ERP integration', 'Volume discount on meters'],
    cta: 'Contact Us', href: 'https://wa.me/918317308558?text=Hi%2C+I+am+interested+in+VoltSpark+Enterprise',
  },
];

const ADDONS = [
  { name: 'Manufacturing Intelligence', desc: 'Production energy intensity (kWh/unit), compressed air efficiency, machine load profiles, shift analysis. For CNC, metal, auto, plastics.', price: '₹2,500/site/month', icon: Cpu },
  { name: 'Commercial Kitchen Intelligence', desc: 'Demand management, load shedding alerts, HACCP temperature logging, ToD patterns. For restaurants, hotels, canteens, cloud kitchens.', price: '₹4,000/site/month', icon: ChefHat },
  { name: 'HVAC & Building Intelligence', desc: 'HVAC COP/EER tracking, floor/zone-level consumption, chiller performance, occupancy analytics. For offices, malls, commercial buildings.', price: '₹3,000/site/month', icon: Radio },
  { name: 'Healthcare Intelligence', desc: 'Critical load uptime, DG/UPS performance, clean room energy, NABH-compatible compliance evidence. For hospitals, labs, pharma.', price: '₹4,000/site/month', icon: Activity },
];

export default function LandingPage() {
  const [demoLoading, setDemoLoading] = useState(false);

  const handleTryDemo = async () => {
    setDemoLoading(true);
    await signIn('credentials', {
      email: 'demo@voltspark.in',
      password: 'demo123',
      callbackUrl: '/dashboard',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">VoltSpark</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/start" className="hidden md:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2">For Facilities</Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2">Login</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" /> Energy Management for Industrial India
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            Save Energy. Stay Safe.<br />
            <span className="text-brand-600">Win Customers.</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
            Industrial facilities sign up directly and track their own energy costs and compliance.
            Energy consultants manage their entire client portfolio from one dashboard.
            One platform, both tracks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
            <button onClick={handleTryDemo} disabled={demoLoading} className="text-base px-8 py-3 flex items-center gap-2 rounded-lg border-2 border-brand-600 text-brand-600 dark:text-brand-400 font-medium hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors disabled:opacity-50">
              {demoLoading ? 'Loading...' : 'Try Live Demo'} <Play className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Already have an account? <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free to start</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-500" /> Multi-tenant</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { val: '35+', label: 'Modules' },
            { val: '4', label: 'Industry Bundles' },
            { val: '100%', label: 'Indian compliance' },
            { val: 'PWA', label: 'Mobile ready' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-brand-600">{s.val}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Everything you need for compliance</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg">From energy audits to safety inspections — one platform, every module.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">How it works</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg">Two ways to use VoltSpark — pick yours</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Facility track */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-7 space-y-7">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full">For Facilities</span>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign up directly and manage your own energy data</p>
              </div>
              <div className="space-y-6">
                {FACILITY_STEPS.map((s) => (
                  <div key={s.num} className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.num}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/start" className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">
                Start free as a facility <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {/* Consultant track */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-7 space-y-7">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">For Consultants & ESCOs</span>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage your client portfolio from one dashboard</p>
              </div>
              <div className="space-y-6">
                {CONSULTANT_STEPS.map((s) => (
                  <div key={s.num} className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.num}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="https://wa.me/918317308558?text=Hi%2C+I+am+an+energy+consultant+interested+in+VoltSpark" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
                WhatsApp us to become a partner <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Built for</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Factories & Industrial Facilities', desc: 'Sign up for free and manage your own energy bills, savings, and compliance — no consultant, no hardware required to start. Your bill tells the story; VoltSpark reads it for you.', href: '/start', cta: 'Start free →' },
              { icon: Users, title: 'Energy Consultants & ESCOs', desc: 'Add all your client facilities under one consultant account. Each client gets their own dashboard. You get a portfolio view, ₹ savings proof, and recurring commission on IoT upgrades.', href: 'https://wa.me/918317308558?text=Hi%2C+I+am+an+energy+consultant+interested+in+VoltSpark', cta: 'WhatsApp us to partner →' },
              { icon: FileText, title: 'ZED / ISO 50001 Auditors', desc: 'Run audits, log findings, assign CAPAs, and generate compliance documentation for ZED, ISO 50001, and Electrical Safety — all in one place. Client-ready reports in one click.', href: '/register', cta: 'Try it free →' },
            ].map((w) => (
              <div key={w.title} className="card text-center flex flex-col">
                <div className="mx-auto h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                  <w.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{w.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex-1">{w.desc}</p>
                {w.href.startsWith('http') ? (
                  <a href={w.href} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">{w.cta}</a>
                ) : (
                  <Link href={w.href} className="mt-4 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">{w.cta}</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get — two tracks */}
      <section className="bg-gray-900 dark:bg-gray-950 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">What you get</h2>
          <p className="text-center text-gray-400 mb-12 text-sm">Whether you manage your own facility or a portfolio of clients</p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Facility track */}
            <div className="bg-gray-800/60 rounded-2xl p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-600/20"><Building2 className="h-6 w-6 text-brand-400" /></div>
                <div>
                  <p className="font-semibold text-white">If you are a facility</p>
                  <p className="text-xs text-gray-400">Self-managed, sign up directly</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {[
                  'Know exactly where every ₹ on your electricity bill goes',
                  'Catch PF penalties and demand overshoot before they recur',
                  'Track every improvement with a ₹ before-and-after',
                  'Run ROI on VFD, solar, APFC, and LED before buying',
                  'Stay ZED / ISO 50001 compliant without paperwork overhead',
                  'Share your compliance status with buyers and auditors via a single link',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/start" className="inline-flex items-center gap-1.5 text-sm text-brand-400 font-medium hover:underline">
                See full feature list <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {/* Consultant track */}
            <div className="bg-gray-800/60 rounded-2xl p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600/20"><Users className="h-6 w-6 text-purple-400" /></div>
                <div>
                  <p className="font-semibold text-white">If you are a consultant or ESCO</p>
                  <p className="text-xs text-gray-400">Manage your client portfolio</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {[
                  'One dashboard for all your client sites — no more spreadsheet juggling',
                  'Data-backed advisory: show clients the number, not just the recommendation',
                  '₹ savings reports that justify your fees every month',
                  'Recurring commission income on every IoT meter your client adds',
                  'Audit-ready compliance documentation generated in one click',
                  'Retain clients with proof — not just promises',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="https://wa.me/918317308558?text=Hi%2C+I+am+an+energy+consultant+interested+in+VoltSpark" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-purple-400 font-medium hover:underline">
                WhatsApp us to partner <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800/50 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Simple pricing</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg">Core platform always free. Pay only for IoT smart meters you connect.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div key={p.name} className={`card flex flex-col ${p.highlight ? 'ring-2 ring-brand-600 relative' : ''}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">IoT Upgrade Path</div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{p.price}</span>
                  {p.priceSub && <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{p.priceSub}</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{p.desc}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                {p.href.startsWith('http') ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className={`mt-6 block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    p.highlight ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>{p.cta}</a>
                ) : (
                  <Link href={p.href} className={`mt-6 block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    p.highlight ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>{p.cta}</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">IoT & Intelligence Modules</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Layer real-time visibility and domain-specific analytics on top of the free core platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADDONS.map((a) => (
              <div key={a.name} className="card flex flex-col">
                <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-3">
                  <a.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{a.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed flex-1">{a.desc}</p>
                <p className="mt-3 text-sm font-mono font-bold text-brand-600 dark:text-brand-400">{a.price}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-sm text-gray-400">
            Hardware supplied and installed by electrical contractors. VoltSpark handles data ingestion, analytics, and alerts.{' '}
            <Link href="/start" className="text-brand-600 dark:text-brand-400 hover:underline">See full pricing →</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Ready to stop the waste?</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-4">Free to start. No credit card. No hardware required.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border-2 border-brand-600 rounded-2xl p-7 text-center space-y-4">
              <Building2 className="h-8 w-8 text-brand-600 mx-auto" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">I manage a facility</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign up free and start with your last electricity bill. No consultant needed.</p>
              </div>
              <Link href="/register" className="block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Start Free →
              </Link>
            </div>
            <div className="border-2 border-purple-500 rounded-2xl p-7 text-center space-y-4">
              <Users className="h-8 w-8 text-purple-600 mx-auto" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">I am a consultant / ESCO</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage multiple client sites from one account. Earn commission on IoT upgrades.</p>
              </div>
              <a href="https://wa.me/918317308558?text=Hi%2C+I+am+an+energy+consultant+interested+in+VoltSpark" target="_blank" rel="noopener noreferrer" className="block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                WhatsApp to Partner →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="h-4 w-4 text-white" /></div>
                <span className="text-lg font-bold text-white">VoltSpark</span>
              </div>
              <p className="text-sm max-w-sm mb-3">Energy management compliance suite for Indian industry. Save energy. Stay safe. Win customers.</p>
              <p className="text-xs text-gray-500">A product of <a href="https://akshayacreatech.in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Akshaya Createch</a>, Bengaluru</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p><a href="https://wa.me/918317308558" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp: +91 83173 08558</a></p>
                <p><a href="mailto:aravind@akshayacreatech.in" className="hover:text-white transition-colors">aravind@akshayacreatech.in</a></p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Start Free</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Go deeper</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/start" className="hover:text-white transition-colors">For Facilities</Link></li>
                <li><a href="https://wa.me/918317308558?text=Hi%2C+I+am+an+energy+consultant+interested+in+VoltSpark" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">For Consultants</a></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 text-sm text-center">
            &copy; {new Date().getFullYear()} VoltSpark by <a href="https://akshayacreatech.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Akshaya Createch</a>. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
