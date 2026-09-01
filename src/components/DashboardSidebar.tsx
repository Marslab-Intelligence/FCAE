'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Server, Activity, ShieldCheck, Cpu, HardDrive,
  Settings, CreditCard, HelpCircle, FileText, LogOut,
  Menu, X, ChevronRight, type LucideIcon
} from 'lucide-react';

const navGroups = [
  {
    title: 'Cloud Operations',
    items: [
      { href: '/account', icon: Server, label: 'Overview', exact: true },
      { href: '/account/reports', icon: Activity, label: 'Infrastructure & SLA' },
      { href: '/account/plan', icon: Cpu, label: 'My Package & Tier' },
    ],
  },
  {
    title: 'Services & Security',
    items: [
      { href: '/account/add-ons', icon: HardDrive, label: 'Add-On Catalog' },
      { href: '/account/progress', icon: ShieldCheck, label: 'Onboarding & Security' },
    ],
  },
  {
    title: 'Account & Billing',
    items: [
      { href: '/account/profile', icon: Settings, label: 'Profile & Settings' },
      { href: '/account/payments', icon: CreditCard, label: 'Invoices & Billing' },
    ],
  },
];

interface DashboardSidebarProps {
  user: { id: string; email: string; name: string | null };
  signOutAction: () => Promise<void>;
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-accent/15 text-accent border border-accent/30 font-semibold shadow-xs'
          : 'text-text-muted hover:text-text hover:bg-bg-slate/60 border border-transparent'
      )}
    >
      <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-accent' : 'text-text-dim group-hover:text-text')} />
      <span className="truncate">{label}</span>
    </Link>
  );
}


function SidebarInnerContent({
  user: _user,
  signOutAction,
  onNavigate,
}: DashboardSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string, exact = false) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="flex flex-col h-full glass-panel text-text select-none overflow-hidden">
      {/* Brand Header */}
      <Link href="/account" className="flex flex-col gap-1 px-4 py-4 border-b border-border">
        <Image
          src="/logo1.png"
          alt="SID Managed Cloud"
          width={200}
          height={52}
          className="h-10 w-auto object-contain"
          priority
        />
        <span className="text-[10px] font-medium text-text-dim">FCAE Managed Infrastructure</span>
      </Link>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-5 px-3 py-4 overflow-y-auto" aria-label="Sidebar Navigation" data-lenis-prevent>
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-text-dim uppercase tracking-wider">
              {group.title}
            </p>
            <div className="space-y-0.5 mt-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item.href, item.exact)}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom SLA Card & Actions */}
      <div className="p-3 border-t border-border space-y-3 mt-auto bg-transparent">
        {/* SLA Status Card */}
        <div className="p-3 rounded-xl glass-card space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider">SLA Status</p>
            <span className="w-2 h-2 rounded-full bg-text-dim/40" />
          </div>
          <p className="text-xs font-bold text-text-dim">Cloud Health —</p>
          <p className="text-[11px] text-text-dim leading-snug">No cluster health data yet.</p>
          <Link
            href="/account/reports"
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline pt-1 transition-colors"
          >
            View Live Metrics <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Quick Links */}
        <div className="space-y-0.5 text-xs text-text-muted">
          <Link href="/account/support" onClick={onNavigate} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:text-text hover:bg-bg-slate/60 transition-colors">
            <HelpCircle className="w-3.5 h-3.5 text-text-dim" />
            <span>Cloud Support</span>
          </Link>
          <Link href="/account/reports" onClick={onNavigate} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:text-text hover:bg-bg-slate/60 transition-colors">
            <FileText className="w-3.5 h-3.5 text-text-dim" />
            <span>SLA Reports</span>
          </Link>
        </div>

        {/* Sign Out */}
        <div className="pt-2 border-t border-border space-y-1">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>

        <p className="text-[10px] text-text-dim px-2 pt-1 text-center">
          © 2026 SID Cloud Services
        </p>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user, signOutAction }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-bg-elevated border-b border-border">
        <Link href="/account" className="flex items-center gap-2">
          <Image
            src="/logo1.png"
            alt="SID Managed Cloud"
            width={170}
            height={44}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-bg-card border border-border text-text"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-bg-elevated border-r border-border z-50"
            >
              <SidebarInnerContent user={user} signOutAction={signOutAction} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Fixed Width (w-64 = 256px) Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 border-r border-border bg-bg-elevated/85 backdrop-blur-md z-30">
        <SidebarInnerContent user={user} signOutAction={signOutAction} />
      </aside>
    </>
  );
}
