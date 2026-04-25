import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col">
      <nav className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">VoltSpark</span>
            <span className="hidden sm:inline text-sm text-gray-400 ml-2">Free Tools</span>
          </Link>
          <Link href="/start" className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            See VoltSpark →
          </Link>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-between gap-3">
          <span>VoltSpark · Energy &amp; Compliance for Indian Industry</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-200">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-200">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
