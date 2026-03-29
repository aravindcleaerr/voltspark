'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Target,
  GraduationCap,
  ClipboardCheck,
  Shield,
  ShieldCheck,
  FileText,
  Settings,
  X,
  ChevronsUpDown,
  ChevronDown,
  Building2,
  IndianRupee,
  Briefcase,
  Receipt,
  HardHat,
  CalendarClock,
  TrendingUp,
  Calculator,
  ListChecks,
  FolderOpen,
  Bell,
  Landmark,
  PieChart,
  Share2,
  ClipboardList,
  Upload,
  Gauge,
  LayoutGrid,
  SlidersHorizontal,
  AlertTriangle,
  ChefHat,
  Wrench,
  Cpu,
  Radio,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Assessment', href: '/assessment', icon: ClipboardList },
      { name: 'Calendar', href: '/calendar', icon: CalendarClock },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Energy',
    items: [
      { name: 'Energy Sources', href: '/energy-sources', icon: Zap },
      { name: 'Consumption', href: '/consumption', icon: BarChart3 },
      { name: 'Utility Bills', href: '/utility-bills', icon: Receipt },
      { name: 'Energy Costs', href: '/costs', icon: IndianRupee },
      { name: 'Targets', href: '/targets', icon: Target },
    ],
  },
  {
    label: 'Compliance & Safety',
    items: [
      { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
      { name: 'Audits', href: '/audits', icon: ClipboardCheck },
      { name: 'CAPA', href: '/capa', icon: Shield },
      { name: 'Safety', href: '/safety', icon: HardHat },
      { name: 'Training', href: '/training', icon: GraduationCap },
    ],
  },
  {
    label: 'Financial',
    items: [
      { name: 'Savings', href: '/savings', icon: TrendingUp },
      { name: 'ROI Calculator', href: '/roi', icon: Calculator },
      { name: 'Schemes', href: '/schemes', icon: Landmark },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'Action Plans', href: '/action-plans', icon: ListChecks },
      { name: 'Reports', href: '/reports', icon: FileText },
      { name: 'Documents', href: '/documents', icon: FolderOpen },
      { name: 'Shareable Views', href: '/share', icon: Share2 },
      { name: 'Bulk Import', href: '/import', icon: Upload },
      { name: 'Analytics', href: '/analytics', icon: PieChart },
    ],
  },
];

const kitchenNavSection: NavSection = {
  label: 'Kitchen Intelligence',
  items: [
    { name: 'Kitchen Dashboard', href: '/kitchen', icon: Gauge },
    { name: 'Zones', href: '/kitchen/zones', icon: LayoutGrid },
    { name: 'Load Management', href: '/kitchen/load-management', icon: SlidersHorizontal },
    { name: 'Demand Events', href: '/kitchen/demand-events', icon: AlertTriangle },
  ],
};

const iotNavSection: NavSection = {
  label: 'IoT Metering',
  items: [
    { name: 'IoT Dashboard', href: '/iot/dashboard', icon: Radio },
    { name: 'Devices', href: '/iot/devices', icon: Cpu },
    { name: 'IoT Alerts', href: '/iot/alerts', icon: AlertTriangle },
  ],
};

const adminNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface ClientOption {
  id: string;
  name: string;
  slug: string;
  industry?: string;
}

function NavSectionGroup({ section, pathname, onClose }: { section: NavSection; pathname: string; onClose: () => void }) {
  const hasActive = section.items.some(item => pathname.startsWith(item.href));
  const [expanded, setExpanded] = useState(hasActive);

  // Auto-expand when a child becomes active
  useEffect(() => {
    if (hasActive) setExpanded(true);
  }, [hasActive]);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-400 hover:text-brand-200 transition-colors"
      >
        {section.label}
        <ChevronDown className={cn('h-3 w-3 transition-transform', expanded ? '' : '-rotate-90')} />
      </button>
      {expanded && (
        <div className="space-y-0.5">
          {section.items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: session, update } = useSession();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [hasKitchen, setHasKitchen] = useState(false);
  const [hasIoT, setHasIoT] = useState(false);

  const activeClientName = (session?.user as any)?.activeClientName;
  const activeClientId = (session?.user as any)?.activeClientId;
  const orgRole = (session?.user as any)?.orgRole;
  const isConsultant = !!orgRole;

  useEffect(() => {
    if (isConsultant) {
      fetch('/api/clients')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setClients(data); })
        .catch(() => {});
    }
  }, [isConsultant]);

  useEffect(() => {
    if (activeClientId) {
      const checkAddons = () => {
        fetch('/api/clients/current')
          .then(r => { if (!r.ok) throw new Error('not ok'); return r.json(); })
          .then(data => {
            try {
              const addons: string[] = JSON.parse(data?.enabledAddons || '[]');
              setHasKitchen(addons.includes('KITCHEN'));
              setHasIoT(addons.includes('IOT_METERING'));
            } catch { setHasKitchen(false); setHasIoT(false); }
          })
          .catch(() => { setHasKitchen(false); setHasIoT(false); });
      };
      checkAddons();
      const timer = setTimeout(checkAddons, 1000);
      return () => clearTimeout(timer);
    } else {
      setHasKitchen(false);
      setHasIoT(false);
    }
  }, [activeClientId]);

  const switchClient = async (client: ClientOption) => {
    const res = await fetch('/api/auth/switch-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id }),
    });
    if (res.ok) {
      const data = await res.json();
      await update(data);
      setShowSwitcher(false);
      window.location.href = '/dashboard';
    }
  };

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
          'fixed inset-y-0 left-0 z-50 w-64 bg-brand-900 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-brand-800">
          <div>
            <h1 className="text-lg font-bold">VoltSpark</h1>
            <p className="text-xs text-brand-300">Energy Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-brand-800 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace switcher */}
        {activeClientName && (
          <div className="px-2 pt-3 pb-1">
            <button
              onClick={() => isConsultant && setShowSwitcher(!showSwitcher)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-brand-800/50 border border-brand-700',
                isConsultant && 'hover:bg-brand-800 cursor-pointer'
              )}
            >
              <Building2 className="h-4 w-4 text-brand-400 flex-shrink-0" />
              <span className="truncate flex-1 text-left font-medium text-brand-100">{activeClientName}</span>
              {isConsultant && <ChevronsUpDown className="h-3 w-3 text-brand-400 flex-shrink-0" />}
            </button>
            {showSwitcher && clients.length > 0 && (
              <div className="mt-1 bg-brand-800 rounded-lg border border-brand-700 overflow-hidden">
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => switchClient(client)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-brand-700 transition-colors',
                      client.id === activeClientId ? 'bg-brand-700 text-white' : 'text-brand-200'
                    )}
                  >
                    <span className="block font-medium truncate">{client.name}</span>
                    {client.industry && <span className="text-xs text-brand-400">{client.industry}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Console link for consultants */}
        {isConsultant && (
          <div className="px-2 pt-2">
            <Link
              href="/console"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/console'
                  ? 'bg-brand-700 text-white'
                  : 'text-brand-200 hover:bg-brand-800 hover:text-white'
              )}
            >
              <Briefcase className="h-5 w-5 flex-shrink-0" />
              Portfolio
            </Link>
          </div>
        )}

        {/* Main navigation — collapsible sections */}
        <nav className="mt-2 px-2 space-y-2 flex-1 overflow-y-auto pb-2">
          {navSections.map((section, idx) => (
            <React.Fragment key={section.label}>
              <NavSectionGroup section={section} pathname={pathname} onClose={onClose} />
              {/* Show Kitchen Intelligence right after Overview */}
              {idx === 0 && hasKitchen && (
                <NavSectionGroup section={kitchenNavSection} pathname={pathname} onClose={onClose} />
              )}
              {/* Show IoT Metering after Energy section */}
              {idx === 1 && hasIoT && (
                <NavSectionGroup section={iotNavSection} pathname={pathname} onClose={onClose} />
              )}
            </React.Fragment>
          ))}

          <div className="pt-3 mt-2 border-t border-brand-800">
            {adminNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-700 text-white'
                      : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
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
