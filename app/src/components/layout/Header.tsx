'use client';

import { signOut, useSession } from 'next-auth/react';
import { Menu, LogOut, User } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 no-print">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 text-sm">
          <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
            <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-gray-900 dark:text-gray-100">{session?.user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{(session?.user as any)?.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
