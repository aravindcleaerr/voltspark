'use client';

import Link from 'next/link';
import { Zap, Shield, TrendingUp, BarChart3, Users, IndianRupee, CheckCircle2, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: IndianRupee, title: 'Save Energy Costs', desc: 'Track consumption, identify waste, and prove savings with hard numbers. Know exactly where every rupee goes.', color: 'text-green-600 bg-green-100' },
  { icon: Shield, title: 'Stay Compliant', desc: 'Multi-framework compliance tracking — ZED, ISO 50001, Electrical Safety. Always audit-ready.', color: 'text-blue-600 bg-blue-100' },
  { icon: TrendingUp, title: 'Prove ROI', desc: 'Pre-built ROI calculators, savings tracking, and consultant fee justification. Numbers that speak.', color: 'text-purple-600 bg-purple-100' },
  { icon: BarChart3, title: 'Impact Reports', desc: 'Generate comprehensive impact reports. Eight sections covering energy, safety, compliance, and financials.', color: 'text-orange-600 bg-orange-100' },
  { icon: Users, title: 'Multi-Client Portfolio', desc: 'Manage multiple industrial clients from one dashboard. Health scores, risk alerts, and cross-client insights.', color: 'text-indigo-600 bg-indigo-100' },
  { icon: CheckCircle2, title: 'Vendor Qualification', desc: 'Share real-time compliance dashboards with buyers. Win new customers with proof, not promises.', color: 'text-teal-600 bg-teal-100' },
];

const STATS = [
  { value: '₹', label: 'Track every rupee of energy spend' },
  { value: '3x', label: 'Average ROI for consultant clients' },
  { value: '100%', label: 'Audit-ready compliance evidence' },
  { value: '24/7', label: 'Real-time monitoring & alerts' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">VoltSpark</span>
          </div>
          <Link href="/login" className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6">
          <Zap className="h-4 w-4" /> Energy Management for Industrial India
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Save Energy. Stay Safe.<br />
          <span className="text-brand-600">Win Customers.</span>
        </h1>
        <p className="text-lg text-gray-500 mt-6 max-w-2xl mx-auto">
          VoltSpark helps industrial facilities save energy costs, stay compliant, and prove their value —
          managed by trusted compliance consultants through a single platform.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/login" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
          <p className="text-gray-500 mt-2">One platform for energy management, compliance, safety, and financial proof.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-lg ${f.color} mb-4`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Chain */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">The Value Chain</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-brand-600/20 mb-4">
                <Zap className="h-8 w-8 text-brand-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Platform Features</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Energy Cost Dashboard</li>
                <li>Savings Tracker</li>
                <li>ROI Calculator</li>
                <li>Utility Bill Analyzer</li>
                <li>Impact Reports</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-purple-600/20 mb-4">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Consultant Value</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Data-backed advisory</li>
                <li>Prove ROI to client</li>
                <li>Pitch improvements</li>
                <li>Find hidden charges</li>
                <li>Retain & upsell</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-green-600/20 mb-4">
                <IndianRupee className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Client Wins</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>₹ saved on energy</li>
                <li>Justify consultant fee</li>
                <li>Smart investments</li>
                <li>Avoid penalties</li>
                <li>Win new customers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Transform Your Practice?</h2>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">
          Join consultants who deliver measurable outcomes. Start tracking energy, proving ROI, and winning clients.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors mt-8">
          Get Started <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-brand-600" />
            <span className="font-semibold text-gray-600">VoltSpark</span>
          </div>
          <p>Energy Management for Industrial India</p>
          <p className="mt-1">Save energy. Stay safe. Win customers.</p>
        </div>
      </footer>
    </div>
  );
}
