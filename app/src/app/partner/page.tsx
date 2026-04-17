import Link from 'next/link';
import { Zap, TrendingDown, CheckCircle, ArrowRight, IndianRupee, Cpu, Shield } from 'lucide-react';

export const metadata = { title: 'Partner with VoltSpark — IoT Investment Case' };

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

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* Hero */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 dark:bg-brand-950 px-4 py-1.5 rounded-full">
            IoT Investment Case · For Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            VoltSpark + IoT<br />
            <span className="text-brand-600">The 60-Second Case</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Indian MSMEs spend <strong className="text-gray-900 dark:text-white">₹3–20 Lakh/month</strong> on electricity with no real-time visibility.
            A meter measures. <strong className="text-gray-900 dark:text-white">VoltSpark acts.</strong>
          </p>
        </section>

        {/* Cost of doing nothing */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-500" />
            What It Costs to Do Nothing
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">Loss Source</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">Monthly</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">Annually</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5">Power Factor penalty <span className="text-xs text-gray-400">(PF below 0.90)</span></td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-600 dark:text-red-400">₹30,000</td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-600 dark:text-red-400">₹3.6L</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5">Max Demand overshoot <span className="text-xs text-gray-400">(contracted vs actual kVA)</span></td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-600 dark:text-red-400">₹18,000</td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-600 dark:text-red-400">₹2.2L</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5">Compressed air leaks <span className="text-xs text-gray-400">(25% of compressor load)</span></td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-600 dark:text-red-400">₹21,500</td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-600 dark:text-red-400">₹2.6L</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5">1 unplanned breakdown <span className="text-xs text-gray-400">(lost production + emergency repair)</span></td>
                  <td className="px-5 py-3.5 text-right font-mono text-gray-400">—</td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-600 dark:text-red-400">₹3–12L</td>
                </tr>
                <tr className="bg-red-50 dark:bg-red-950/30 font-semibold">
                  <td className="px-5 py-3.5">Total avoidable loss (typical MSME)</td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-700 dark:text-red-300">₹70,000+</td>
                  <td className="px-5 py-3.5 text-right font-mono text-red-700 dark:text-red-300">₹8–20L</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm font-semibold text-center text-gray-700 dark:text-gray-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl py-3 px-5">
            Hardware + VoltSpark cost: <span className="text-amber-700 dark:text-amber-300">₹25,000–80,000 one-time.</span> Payback: under 3 months.
          </p>
        </section>

        {/* Why VoltSpark */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-brand-500" />
            Why VoltSpark, Not Just a Meter
          </h2>
          <p className="text-gray-600 dark:text-gray-400">A standalone meter gives you data. VoltSpark gives you <strong className="text-gray-900 dark:text-white">decisions.</strong></p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { text: 'Auto-detects PF dips, demand spikes, and anomalies — raises CAPA automatically' },
              { text: 'Quantifies savings in ₹, not just kWh — so the factory owner sees money, not numbers' },
              { text: 'Builds ZED / ISO 50001 compliance evidence as you go — audit-ready at any time' },
              { text: 'Consultant sees all clients from one dashboard — scales to 10 or 100 factories' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Entry path */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-brand-500" />
            The Low-Risk Entry Path
          </h2>
          <div className="space-y-3">
            {[
              {
                label: 'Week 1–2',
                title: 'Free Baseline Audit',
                body: 'Install 1 smart meter at the incomer (₹8,000–12,000). VoltSpark auto-generates a ₹-value report showing exactly what the factory is losing.',
                color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
                tag: 'text-blue-700 dark:text-blue-300',
              },
              {
                label: 'Month 1–3',
                title: 'Sub-Metering Pilot',
                body: 'Expand to 3–5 meters across feeders. Customer sees ₹ savings vs ₹ investment in real time — no guesswork.',
                color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
                tag: 'text-amber-700 dark:text-amber-300',
              },
              {
                label: 'Month 4+',
                title: 'Full Rollout',
                body: 'Complete plant metering, compliance tracking, automated reporting. Customer doesn\'t leave — 12 months of data is a switching cost.',
                color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
                tag: 'text-green-700 dark:text-green-300',
              },
            ].map((step, i) => (
              <div key={i} className={`flex gap-4 rounded-xl border p-5 ${step.color}`}>
                <div className={`text-xs font-bold uppercase tracking-wider w-20 flex-shrink-0 mt-0.5 ${step.tag}`}>{step.label}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">{step.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner revenue */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-brand-500" />
            Partner Revenue — 20 Clients, Year 1
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">Revenue Stream</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5">Hardware supply & installation <span className="text-xs text-gray-400">(one-time)</span></td>
                  <td className="px-5 py-3.5 text-right font-mono text-gray-900 dark:text-white">₹8,00,000</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5">VoltSpark SaaS share <span className="text-xs text-gray-400">(30% of ₹2,999/mo × 20 clients)</span></td>
                  <td className="px-5 py-3.5 text-right font-mono text-gray-900 dark:text-white">₹2,16,000/yr</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5">Add-on share <span className="text-xs text-gray-400">(Power Quality, Compressed Air)</span></td>
                  <td className="px-5 py-3.5 text-right font-mono text-gray-900 dark:text-white">₹72,000/yr</td>
                </tr>
                <tr className="bg-brand-50 dark:bg-brand-950/30 font-semibold">
                  <td className="px-5 py-3.5 text-brand-700 dark:text-brand-300">Year 1 Total</td>
                  <td className="px-5 py-3.5 text-right font-mono text-brand-700 dark:text-brand-300 text-base">₹10.88L</td>
                </tr>
                <tr className="bg-green-50 dark:bg-green-950/30 font-semibold">
                  <td className="px-5 py-3.5 text-green-700 dark:text-green-300">Year 2 — same clients, no new work</td>
                  <td className="px-5 py-3.5 text-right font-mono text-green-700 dark:text-green-300 text-base">₹2.88L recurring</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why now */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-500" />
            Why Now
          </h2>
          <div className="bg-gray-950 dark:bg-gray-900 text-white rounded-xl p-6 space-y-3">
            <p className="text-gray-300 leading-relaxed">
              ZED certification, ISO 50001, and BEE PAT are no longer optional for factories supplying Tier 1 auto OEMs.
              <strong className="text-white"> IoT-backed energy data is becoming a vendor qualification requirement.</strong>
            </p>
            <p className="text-gray-300 leading-relaxed">
              The factory that has it <span className="text-green-400 font-semibold">wins the order.</span> The one that doesn't is asked to get it — on the OEM's timeline, not their own.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-600 text-white p-8 text-center space-y-4">
          <p className="text-xl font-bold">VoltSpark brings the platform. Partners bring the hardware and the customers.</p>
          <p className="text-brand-100 text-sm">We all win when the factory saves money.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
              Start Free Demo
            </Link>
            <a href="mailto:aravind@akshayacreatech.com" className="border border-brand-300 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-500 transition-colors">
              Talk to Us
            </a>
          </div>
          <p className="text-xs text-brand-200 pt-2">
            Live platform: volt-spark.vercel.app
          </p>
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
