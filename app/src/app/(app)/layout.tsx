'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Skip redirect if already on assessment or settings page
    if (pathname === '/assessment' || pathname === '/settings' || pathname === '/console' || pathname.startsWith('/console/')) {
      setChecked(true);
      return;
    }

    fetch('/api/assessment')
      .then(r => r.json())
      .then(data => {
        if (!data.isComplete) {
          router.replace('/assessment');
        } else {
          setChecked(true);
        }
      })
      .catch(() => setChecked(true));
  }, [pathname, router]);

  if (!checked && pathname !== '/assessment') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <OnboardingGuard>{children}</OnboardingGuard>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
