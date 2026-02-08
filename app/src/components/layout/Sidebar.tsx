'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Target,
  GraduationCap,
  ClipboardCheck,
  Shield,
  FileText,
  Settings,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Energy Sources', href: '/energy-sources', icon: Zap },
  { name: 'Consumption', href: '/consumption', icon: BarChart3 },
  { name: 'Targets', href: '/targets', icon: Target },
  { name: 'Training', href: '/training', icon: GraduationCap },
  { name: 'Audits', href: '/audits', icon: ClipboardCheck },
  { name: 'CAPA', href: '/capa', icon: Shield },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const adminNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-brand-900 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-brand-800">
          <div>
            <h1 className="text-lg font-bold">Unnathi CNC</h1>
            <p className="text-xs text-brand-300">ZED Energy Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-brand-800 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-brand-800">
            {adminNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-700 text-white'
                      : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
