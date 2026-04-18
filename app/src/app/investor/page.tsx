import Link from 'next/link';
import { Zap, TrendingUp, Shield, Users, ArrowRight, Building2, Cpu, IndianRupee, AlertTriangle } from 'lucide-react';

export const metadata = { title: 'Investor Pitch — VoltSpark by Akshaya Createch' };

const marketRows = [
  { label: 'TAM', sublabel: 'Energy management software — Indian industry', value: '₹5,000 Cr/yr', note: '~12 lakh medium industrial facilities spending ₹3L–₹50L/month on electricity' },
  { label: 'SAM', sublabel: 'MSME segment reachable through consultants', value: '₹500 Cr/yr', note: 'Manufacturing, kitchens, hospitals, commercial buildings with compliance pressure' },
  { label: 'SOM', sublabel: '3-year target', value: '₹25 Cr/yr', note: '5,000 IoT-enabled sites at ~₹5,300/month average (meters + sensors + intelligence bundle) — achievable with 200 onboarded consultants converting 40–50% of clients to IoT' },
];

const fundUse = [
  { pct: '40%', amount: '₹40L', label: 'Product Development', items: ['Mobile app (iOS + Android)', 'Advanced analytics & benchmarking', 'Two new industry intelligence bundles', 'ML anomaly detection engine (rule-based alerts live; ML roadmap Q4 2026)'] },
  { pct: '35%', amount: '₹35L', label: 'Sales & Partnerships', items: ['Consultant onboarding program', 'Channel partnerships (hardware OEMs, DISCOMs)', 'Industry events & ZED/ISO consultant networks'] },
  { pct: '25%', amount: '₹25L', label: 'Hiring', items: ['1 full-stack product engineer', '1 sales & partnerships manager'] },
];

const moat = [
  { title: 'Data switching cost', body: '12 months of energy baselines, compliance evidence, sensor logs, and savings records inside VoltSpark is not something a client moves away from easily.' },
  { title: 'Consultant distribution', body: 'Each consultant brings 5–20 clients. Winning 50 consultants is equivalent to winning 500–1,000 client sites — without direct sales to each factory.' },
  { title: 'Unified sensor + energy infrastructure', body: 'Established partnerships with Lotus Controls (Schneider authorised distributor) and Titan (Tor.ai) mean the hardware-software bundle is integrated. Schneider\'s PAS600 gateway supports both energy meters and environmental sensors (temperature, humidity, CO2, vibration, pressure) on the same infrastructure — no second gateway, no second vendor.' },
  { title: 'Multi-sensor compliance automation', body: 'When a cold room temperature breaches 4°C, VoltSpark auto-creates an audit finding, links it to HACCP requirements, and triggers a CAPA. When an OT humidity drifts outside NABH range, the same pipeline fires. No competitor in India connects sensor readings to compliance workflows automatically.' },
  { title: 'Regulatory switching cost', body: 'NABH-accredited hospitals and FSSAI-registered kitchens depend on VoltSpark\'s timestamped sensor logs as compliance evidence. Migrating to another platform mid-audit cycle is not a decision any compliance manager makes voluntarily.' },
  { title: 'Compliance evidence layer', body: 'VoltSpark generates the audit trail for ZED, ISO 50001, NABH, FSSAI, and LEED/IGBC. Replacing it mid-certification cycle is not an option a client would choose.' },
  { title: 'Anonymised benchmarking', body: 'As the client base grows, cross-industry benchmarks become a unique asset — no single-facility tool can offer "your kWh/unit vs. industry average" or "your cold room temperature variance vs. HACCP peers".' },
];

const team = [
  {
    name: 'Aravind V Bayari',
    role: 'Technology & Product',
    org: 'Co-founder, Akshaya Createch',
    bio: '25+ years in embedded systems, IoT, and industrial automation. 20+ products shipped across 10+ industries including defence (HAL Tejas flight control, GTRE Kaveri engine), medical devices, and industrial automation. Hardware Lead at KuboCare (Antler-backed, $1M seed). B.E. Instrumentation & Electronics, RV College. Technology Development Board Award, Government of India (2013).',
    url: 'https://aravindcleaerr.github.io/',
    tags: ['Embedded Systems', 'IoT', 'Industrial Automation', 'Product'],
  },
  {
    name: 'Lakshminarasimhan K',
    role: 'Domain & Operations',
    org: 'Founder, Akshaya Createch',
    bio: '40+ years in industrial electrical systems. 32 years as AGM at Kasturi & Sons Ltd (The Hindu Group) managing transformers, DG sets, automation, HVAC, and fire safety across large commercial facilities. Founder of Akshaya Createch — electrical consultancy, solar EPC, and intelligent kitchen load management. B.E. Electrical & Electronics, TCE Madurai.',
    url: 'https://akshayacreatech.in/founder',
    tags: ['Electrical Systems', 'Energy Consultancy', 'Solar EPC', 'Industrial Ops'],
  },
];

const partners = [
  { name: 'Lotus Controls', detail: 'Authorised Schneider Electric distributor — IoT gateway (PAS600), energy sub-metering hardware, and environmental sensors (temperature, humidity, CO2, vibration, pressure). All devices run on the same gateway infrastructure — one installation serves both energy and compliance monitoring.', logo: '⚡' },
  { name: 'Titan by Tor.ai', detail: 'Smart metering for commercial kitchens — demand management, load shedding, and kitchen-grade IoT integration.', logo: '🔌' },
];

export default function InvestorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold">VoltSpark</span>
            <span className="text-xs text-gray-400 hidden sm:inline">by Akshaya Createch</span>
          </Link>
          <a href="mailto:aravind@akshayacreatech.com" className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Get in Touch
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 dark:bg-brand-950 px-4 py-1.5 rounded-full">
            Pre-Seed · Raising ₹1 Crore
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            The software layer for<br />
            <span className="text-brand-600">industrial energy compliance</span><br />
            in India.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            India&apos;s industrial sector wastes an estimated <strong className="text-gray-900 dark:text-white">₹3 lakh crore annually</strong> in avoidable energy costs.
            VoltSpark is the platform that identifies it, quantifies it in ₹, and tracks every rupee saved — built for the
            energy consultants who serve India&apos;s 12 lakh+ industrial facilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href="mailto:aravind@akshayacreatech.com" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              Talk to us <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/" className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              See the platform
            </Link>
          </div>
        </section>

        {/* Important framing */}
        <section>
          <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">Where we are today</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                VoltSpark is a live, production platform with one paying client (Unnathi CNC Technologies, Peenya, Bengaluru).
                IoT hardware partnerships are established with Lotus Controls and Titan. We are at pre-revenue scale —
                this raise funds the sales motion and product expansion needed to reach 50+ clients in 18 months.
              </p>
            </div>
          </div>
        </section>

        {/* Market */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-brand-500" /> The Market Opportunity</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">India&apos;s compliance and energy management software market for industry is nascent, underpenetrated, and growing fast.</p>
          </div>
          <div className="space-y-3">
            {marketRows.map((r) => (
              <div key={r.label} className="flex gap-4 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="w-12 flex-shrink-0">
                  <span className="text-xs font-black text-brand-600 uppercase tracking-widest">{r.label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{r.sublabel}</p>
                    <p className="text-xl font-black text-brand-600 whitespace-nowrap">{r.value}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 px-1">Market estimates derived from MSME Ministry data, BEE reports, and DISCOM annual reports. These are indicative figures for investor orientation, not audited projections.</p>
        </section>

        {/* Problem */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-amber-500" /> Why This Market Is Underserved</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'No India-specific platform', body: 'Existing solutions (Zenatix, EnergyBrain) target large enterprises. The 12 lakh MSME industrial facilities — ₹1Cr–₹100Cr turnover — have no affordable, ZED/BESCOM-aware option.' },
              { title: 'Consultants work in Excel', body: 'India has thousands of ZED, ISO 50001, and electrical safety consultants. Every one of them manages clients in spreadsheets and WhatsApp. No practice management platform exists for them.' },
              { title: 'Compliance pressure is accelerating', body: 'ZED certification is now an OEM vendor qualification requirement. ISO 50001 is being mandated by large buyers. BEE PAT penalties are increasing. The "do nothing" option is closing.' },
              { title: 'IoT alone is not enough', body: 'Hardware vendors sell dashboards with raw kWh data. No platform connects real-time energy and environmental sensor readings (temperature, humidity, CO2, vibration) to compliance frameworks, automated evidence logs, and ₹ ROI in the same workflow.' },
            ].map((p, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
                <p className="font-semibold text-gray-900 dark:text-white">{p.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Solution */}
        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-brand-500" /> VoltSpark&apos;s Approach</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">B2B2C SaaS. Consultants are the distribution channel. Their clients are the end customers.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Consultant signs up', body: 'Energy auditor, ZED/ISO consultant, or ESCO registers on VoltSpark. Adds their industrial clients. Manages all from one portfolio dashboard.' },
              { step: '2', title: 'Client gets visibility', body: 'Factory owner sees a live energy cost dashboard, compliance status, and savings opportunities — all in ₹. Not kWh. Not Excel.' },
              { step: '3', title: 'Intelligence bundles unlock revenue', body: 'As trust grows, consultant enables industry intelligence bundles. Hardware partners (Lotus Controls, Titan) supply and install smart meters and environmental sensors — all running on the same gateway. VoltSpark handles data ingestion, rule-based alerts, compliance evidence generation, and ₹ analytics.' },
            ].map((s) => (
              <div key={s.step} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
                <div className="h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">{s.step}</div>
                <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Business model */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6 text-brand-500" /> Business Model</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="text-left px-5 py-3">Revenue stream</th>
                  <th className="text-left px-4 py-3">Model</th>
                  <th className="text-right px-4 py-3">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">Core platform</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">Manual entry, compliance, audits, CAPA, savings tracker, reports — adoption funnel for IoT upsell</td>
                  <td className="px-4 py-3.5 text-right font-mono text-green-700 dark:text-green-400 font-semibold">FREE</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">IoT meter — Basic</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">4 electrical params: kWh, kVA, PF, Hz. Consumption trends, basic cost tracking. <span className="text-brand-600 font-medium">Includes 1 environmental sensor.</span></td>
                  <td className="px-4 py-3.5 text-right font-mono">₹299/meter/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">IoT meter — Standard</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">10 electrical params: + V & A per phase. PF monitoring, demand tracking, phase imbalance alerts. <span className="text-brand-600 font-medium">Includes 2 environmental sensors.</span></td>
                  <td className="px-4 py-3.5 text-right font-mono">₹599/meter/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">IoT meter — Advanced</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">15 electrical params: + max demand, TOU, load profile. Demand prediction, tariff optimisation. <span className="text-brand-600 font-medium">Includes 3 environmental sensors.</span></td>
                  <td className="px-4 py-3.5 text-right font-mono">₹999/meter/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">IoT meter — Power Quality</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">15+ params: + THD, harmonics, sag/swell, EN 50160. Full PQ analysis, harmonic filter sizing. <span className="text-brand-600 font-medium">Includes 5 environmental sensors.</span></td>
                  <td className="px-4 py-3.5 text-right font-mono">₹1,499/meter/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">Environmental sensor <span className="text-xs font-normal text-gray-400">(additional)</span></td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">Temperature, humidity, CO2, vibration, pressure, or flow. Beyond the included sensor allowance. Schneider-compatible, runs on the same PAS600 gateway. Rule-based threshold alerts; ML anomaly detection on roadmap.</td>
                  <td className="px-4 py-3.5 text-right font-mono">₹149/sensor/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">Manufacturing Intelligence</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">Production energy intensity (kWh/unit), compressed air efficiency, machine load profiles, shift analysis. Vibration + temperature sensors unlock predictive maintenance for CNC, motors, and bearings. CNC, metal, auto, plastics.</td>
                  <td className="px-4 py-3.5 text-right font-mono">₹2,500/site/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">Commercial Kitchen Intelligence</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">Demand management, load shedding alerts, HACCP cold chain monitoring (temperature sensors on cold rooms + cooking equipment), humidity tracking, ToD analytics. Restaurants, hotels, canteens.</td>
                  <td className="px-4 py-3.5 text-right font-mono">₹4,000/site/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">HVAC & Building Intelligence</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">HVAC COP/EER tracking (requires supply/return temperature sensors), zone IAQ monitoring (CO2 + humidity), occupancy correlation, filter health. Offices, malls, hotels.</td>
                  <td className="px-4 py-3.5 text-right font-mono">₹3,000/site/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">Healthcare Intelligence</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">Critical load uptime, NABH-compliant OT/ICU temperature + humidity logging, blood bank cold chain, clean room differential pressure, DG/UPS performance. Hospitals, labs, pharma.</td>
                  <td className="px-4 py-3.5 text-right font-mono">₹4,000/site/mo</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">Custom Intelligence</td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">Bespoke analytics for specific industries or processes — custom sensor types, dashboards, metrics, and compliance mappings.</td>
                  <td className="px-4 py-3.5 text-right font-mono">From ₹5,000/site/mo</td>
                </tr>
                <tr className="bg-brand-50 dark:bg-brand-950/30 font-semibold">
                  <td className="px-5 py-3.5 text-gray-900 dark:text-white" colSpan={2}>Typical IoT site: 1 Advanced + 3 Standard meters (9 sensors included) + Manufacturing Intelligence bundle</td>
                  <td className="px-4 py-3.5 text-right font-mono text-brand-700 dark:text-brand-300 text-base">~₹5,300/site/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: '500 IoT sites', monthly: '₹26.5L/mo', annual: '₹3.2Cr/yr', note: '~25 consultants, avg 20 IoT clients each' },
              { label: '2,000 IoT sites', monthly: '₹1.06Cr/mo', annual: '₹12.7Cr/yr', note: '~100 consultants — Year 3 target' },
              { label: '4,700 IoT sites', monthly: '₹2.49Cr/mo', annual: '₹29.9Cr/yr', note: 'Platform maturity — aligns with SOM of ₹25–30Cr/yr' },
            ].map((r) => (
              <div key={r.label} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{r.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{r.monthly}</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">{r.annual}</p>
                <p className="text-xs text-gray-400 pt-1">{r.note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 px-1">Revenue projections assume ~₹5,300/site/month average for IoT-enabled sites (1 Advanced + 3 Standard meters with 9 sensors included + 1 intelligence bundle). Free-tier sites generate ₹0 but build the adoption base for IoT upsell. Sites with multiple bundles (e.g. hospital: Healthcare + Kitchen + HVAC) and additional sensors generate higher ARPU. These are illustrative, not guaranteed forecasts.</p>
        </section>

        {/* IoT Partners */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Cpu className="h-6 w-6 text-brand-500" /> Established IoT Hardware Partnerships</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {partners.map((p) => (
              <div key={p.name} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.logo}</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-3">
            VoltSpark is hardware-agnostic by design — any Modbus RTU device can push data via our IoT ingestion API.
            The Lotus Controls and Titan partnerships provide a validated, locally-available hardware stack for initial deployments, including both energy meters and environmental sensors on a single gateway infrastructure, reducing time-to-value for new client sites.
          </p>
        </section>

        {/* Moat */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-brand-500" /> Why This Is Defensible</h2>
          <div className="space-y-3">
            {moat.map((m) => (
              <div key={m.title} className="flex gap-4 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4">
                <span className="text-brand-600 font-bold flex-shrink-0 mt-0.5">→</span>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">{m.title} — </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{m.body}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-brand-500" /> The Team</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">VoltSpark is a product of Akshaya Createch. The founding team brings together deep domain expertise in industrial electrical systems and product engineering.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {team.map((t) => (
              <div key={t.name} className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{t.name}</p>
                  <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">{t.role}</p>
                  <p className="text-xs text-gray-400">{t.org}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {t.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">{tag}</span>
                  ))}
                </div>
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  Full profile <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* The ask */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6 text-brand-500" /> The Ask</h2>
          <div className="rounded-2xl bg-gray-950 dark:bg-gray-900 text-white p-8 space-y-6">
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Pre-Seed Round</p>
              <p className="text-5xl font-black text-white">₹1 Crore</p>
              <p className="text-gray-400 text-sm">Raised through Akshaya Createch · 18-month runway to 50+ paying client sites</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {fundUse.map((f) => (
                <div key={f.label} className="bg-gray-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <p className="font-bold text-white">{f.label}</p>
                    <p className="text-brand-400 font-mono text-sm">{f.amount}</p>
                  </div>
                  <p className="text-3xl font-black text-gray-400">{f.pct}</p>
                  <ul className="space-y-1">
                    {f.items.map((item) => (
                      <li key={item} className="text-xs text-gray-400 flex gap-2">
                        <span className="text-brand-400 flex-shrink-0">·</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-5 space-y-2 text-sm text-gray-400">
              <p><strong className="text-white">Milestone at 18 months:</strong> 50+ active client sites, 10+ onboarded consultants, ₹25L+ ARR.</p>
              <p><strong className="text-white">What this unlocks:</strong> Demonstrated unit economics and consultant acquisition playbook for a Series A raise.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-600 text-white p-8 text-center space-y-4">
          <p className="text-xl font-bold">Interested in learning more?</p>
          <p className="text-brand-100 text-sm max-w-lg mx-auto">
            We are happy to share detailed financials, product walkthrough, and customer evidence on request.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href="mailto:aravind@akshayacreatech.com" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
              aravind@akshayacreatech.com
            </a>
            <Link href="/" className="border border-brand-300 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-500 transition-colors">
              See the platform
            </Link>
          </div>
          <p className="text-xs text-brand-200 pt-2">Live platform at volt-spark.vercel.app · Product by Akshaya Createch, Bengaluru</p>
        </section>

      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>© 2026 Akshaya Createch. VoltSpark is a product of Akshaya Createch, Bengaluru.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
