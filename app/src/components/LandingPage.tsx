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
  { icon: Radio, title: 'IoT Metering', desc: 'Connect Schneider, ABB, Siemens meters via MQTT. Real-time dashboards, automatic consumption tracking.' },
  { icon: Activity, title: 'Power Quality', desc: 'EN 50160 compliance monitoring. Voltage sags/swells, THD analysis, harmonic trends, PQ scoring.' },
  { icon: GraduationCap, title: 'Training & Safety', desc: 'Manage training programs, inspections, incidents, and certifications in one place.' },
  { icon: CalendarClock, title: 'Compliance Calendar', desc: 'Never miss a deadline. Audit dates, cert renewals, and CAPA due dates in one view.' },
  { icon: Cpu, title: 'Multi-Vendor IoT', desc: 'Works with any energy meter — PAS600, Raspberry Pi gateways, Modbus RTU/TCP. Vendor-agnostic by design.' },
];

const STEPS = [
  { num: '1', title: 'Sign Up & Add Clients', desc: 'Create your consulting organization and onboard industrial clients in minutes.' },
  { num: '2', title: 'Collect & Analyze Data', desc: 'Enter energy data, utility bills, and safety records. Get instant compliance scores.' },
  { num: '3', title: 'Prove Value & Grow', desc: 'Generate reports, track savings, and demonstrate ROI to win more clients.' },
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
    features: ['Basic ₹299/meter — up to 4 parameters', 'Standard ₹599/meter — + voltage & current per phase', 'Advanced ₹999/meter — + max demand, TOU, predictive maintenance', 'Power Quality ₹1,499/meter — + THD, harmonics, EN 50160', 'Auto-ingestion — no manual logging', 'Live dashboard: kW, PF, voltage per meter', 'Add industry intelligence bundles on top (₹2,500–₹5,000/site)'],
    cta: 'See Full Pricing', href: '/start',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceSub: '',
    desc: 'For large consultancies, ESCOs, and multi-site rollouts.',
    highlight: false,
    features: ['Everything in Core + IoT', 'All 4 industry intelligence bundles available', 'Custom Intelligence — bespoke analytics', 'White-label branding', 'API access for ERP integration', 'Volume discount on meters'],
    cta: 'Contact Us', href: 'mailto:aravind@akshayacreatech.com',
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
            <Link href="/partner" className="hidden md:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2">For Partners</Link>
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
            The all-in-one platform for energy consultants to manage industrial compliance,
            track savings, and prove ROI — all in one place.
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
            { val: '4', label: 'IoT Add-ons' },
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">How it works</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-lg">Get started in 3 simple steps</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
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
              { icon: Users, title: 'Energy Consultants & Partners', desc: 'Manage multiple clients, earn recurring commission, and prove your value with data-driven reports.', href: '/partner', cta: 'Partner with us →' },
              { icon: Building2, title: 'Factories & Facilities', desc: 'MSMEs and industrial units — start free on manual entry, upgrade to real-time IoT when ready.', href: '/start', cta: 'Start free →' },
              { icon: FileText, title: 'ESCOs & Auditors', desc: 'Streamline audits, manage findings, generate compliance documentation, and track savings.', href: '/partner', cta: 'Learn more →' },
            ].map((w) => (
              <div key={w.title} className="card text-center flex flex-col">
                <div className="mx-auto h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                  <w.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{w.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex-1">{w.desc}</p>
                <Link href={w.href} className="mt-4 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">{w.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Chain */}
      <section className="bg-gray-900 dark:bg-gray-950 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">The Value Chain</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-brand-600/20 mb-4"><Zap className="h-8 w-8 text-brand-400" /></div>
              <h3 className="font-semibold text-lg mb-2">Platform Features</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Energy Cost Dashboard</li><li>Savings Tracker</li><li>ROI Calculator</li><li>Utility Bill Analyzer</li><li>Impact Reports</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-purple-600/20 mb-4"><Users className="h-8 w-8 text-purple-400" /></div>
              <h3 className="font-semibold text-lg mb-2">Consultant Value</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Data-backed advisory</li><li>Prove ROI to client</li><li>Pitch improvements</li><li>Find hidden charges</li><li>Retain & upsell</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-green-600/20 mb-4"><IndianRupee className="h-8 w-8 text-green-400" /></div>
              <h3 className="font-semibold text-lg mb-2">Client Wins</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>₹ saved on energy</li><li>Justify consultant fee</li><li>Smart investments</li><li>Avoid penalties</li><li>Win new customers</li>
              </ul>
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
                <Link href={p.href} className={`mt-6 block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  p.highlight ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>{p.cta}</Link>
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
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Ready to save energy and grow your business?</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-4">Join India&apos;s energy management platform. Free to start, no credit card required.</p>
          <Link href="/register" className="btn-primary text-base px-8 py-3 mt-8 inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
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
              <p className="text-sm max-w-sm">Energy management compliance suite for Indian industry. Save energy. Stay safe. Win customers.</p>
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
                <li><Link href="/partner" className="hover:text-white transition-colors">For Partners</Link></li>
                <li><Link href="/start" className="hover:text-white transition-colors">For Facilities</Link></li>
                <li><Link href="/partner/economics" className="hover:text-white transition-colors">Partner Economics</Link></li>
                <li><Link href="/investor" className="hover:text-white transition-colors">Investor Pitch</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 text-sm text-center">
            &copy; {new Date().getFullYear()} VoltSpark. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
