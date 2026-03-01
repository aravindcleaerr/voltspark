import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Terms of Service — VoltSpark' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">VoltSpark</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: March 1, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using VoltSpark (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service. The Service is operated by VoltSpark (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. Description of Service</h2>
            <p>VoltSpark is a cloud-based energy management and compliance platform designed for industrial facilities, energy consultants, and ESCOs operating in India. The Service includes energy monitoring, compliance tracking, savings analysis, reporting, and related tools.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. User Accounts</h2>
            <p>You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Acceptable Use</h2>
            <p>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to other accounts or systems; (c) interfere with the proper functioning of the Service; (d) upload malicious code or content; (e) resell or redistribute the Service without authorization.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Data Ownership</h2>
            <p>You retain all rights to the data you enter into the Service. We do not claim ownership of your content. We may use aggregated, anonymized data for analytics and product improvement purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Service Availability</h2>
            <p>We strive to maintain high availability but do not guarantee uninterrupted access. We may perform maintenance, updates, or modifications to the Service at any time. We will make reasonable efforts to provide advance notice of planned downtime.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Limitation of Liability</h2>
            <p>The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the fees you paid in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Termination</h2>
            <p>You may close your account at any time by contacting us. We may suspend or terminate your access for violation of these Terms. Upon termination, your right to use the Service ceases, and we may delete your data after a reasonable retention period.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">9. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify registered users of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:hello@voltspark.in" className="text-brand-600 hover:underline">hello@voltspark.in</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
