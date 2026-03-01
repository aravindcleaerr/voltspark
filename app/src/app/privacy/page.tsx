import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Privacy Policy — VoltSpark' };

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: March 1, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">1. Information We Collect</h2>
            <p><strong>Account information:</strong> Name, email address, company name, and password hash when you register.</p>
            <p><strong>Usage data:</strong> Energy consumption data, compliance records, utility bill information, training records, and other data you enter into the platform.</p>
            <p><strong>Technical data:</strong> IP address, browser type, device information, and usage analytics to improve the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to: (a) provide and maintain the Service; (b) authenticate your identity; (c) send transactional emails (password resets, invitations, alerts); (d) generate compliance reports and analytics; (e) improve the Service based on usage patterns; (f) comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored on secure cloud infrastructure (Turso/LibSQL on AWS ap-south-1). We use encryption in transit (TLS) and at rest. Passwords are hashed using bcrypt with industry-standard salt rounds. We implement role-based access controls to ensure multi-tenant data isolation.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with: (a) infrastructure providers (Vercel, Turso) as required to operate the Service; (b) email service providers (Resend) for transactional emails; (c) law enforcement if required by law. Shareable compliance views are only accessible via unique tokens you explicitly generate.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">5. Multi-Tenant Data Isolation</h2>
            <p>VoltSpark is a multi-tenant platform. Each client workspace is isolated at the database query level. Users can only access data for client workspaces they have been granted access to. Consultant organizations can manage multiple client workspaces, but each workspace&apos;s data is strictly segregated.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">6. Cookies & Analytics</h2>
            <p>We use essential cookies for authentication (session tokens). We may use analytics services to understand platform usage. You can disable non-essential cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">7. Your Rights</h2>
            <p>You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) request deletion of your account and data; (d) export your data (available via the platform&apos;s data export feature); (e) withdraw consent for optional data processing. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">8. Data Retention</h2>
            <p>We retain your data for as long as your account is active. After account deletion, we may retain anonymized, aggregated data for analytics. Backup copies may persist for up to 30 days before being permanently removed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">9. Children&apos;s Privacy</h2>
            <p>The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes via email. The latest version will always be available on this page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-3">Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:hello@voltspark.in" className="text-brand-600 hover:underline">hello@voltspark.in</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
