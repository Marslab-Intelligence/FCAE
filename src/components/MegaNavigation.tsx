'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useScrollProgress } from '@/hooks/useLenis';
import {
  Menu, X, ChevronDown,
  Cloud, Shield, DollarSign, Server, Cpu, Activity,
  Building2, Heart, ShoppingCart, Landmark, Factory,
  FileText, BarChart3, ListChecks,
  Bell, Settings, LogOut, LayoutDashboard
} from 'lucide-react';

const megaMenus = {
  'Packages': {
    icon: ListChecks,
    items: [
      { label: 'Foundation Package', href: '/plans/foundation', icon: Shield, desc: 'Entry-level 9/5 support & cost visibility' },
      { label: 'Care Package', href: '/plans/care', icon: DollarSign, desc: 'Operational excellence & FinOps optimization' },
      { label: 'Assure Package', href: '/plans/assure', icon: Shield, desc: 'Governance, security & dedicated SDM' },
      { label: 'Elite Package', href: '/plans/elite', icon: Server, desc: '24/6 round-the-clock & 15-min P1 SLA' },
      { label: 'Compare All 4 Tiers', href: '/plans', icon: BarChart3, desc: 'Full matrix across every service area' },
      { label: 'Technical Activities', href: '/activities', icon: ListChecks, desc: 'Granular activities behind each plan' },
    ],
  },
  Services: {
    icon: Server,
    items: [
      { label: 'Cloud Operations', href: '/services#cloud-ops', icon: Cloud, desc: 'Day-to-day cloud management & monitoring' },
      { label: 'Cloud Architecture', href: '/services#architecture', icon: Cpu, desc: 'Design scalable, resilient infrastructure' },
      { label: 'FinOps & Cost Optimization', href: '/services#finops', icon: DollarSign, desc: 'Reduce cloud spend without sacrificing performance' },
      { label: 'Security Governance', href: '/services#security', icon: Shield, desc: 'Posture assessments, compliance & risk reduction' },
      { label: 'Business Continuity', href: '/services#continuity', icon: Activity, desc: 'DR planning and resilience engineering' },
      { label: 'DevOps & Platform', href: '/services#devops', icon: Server, desc: 'Kubernetes, CI/CD, and platform engineering' },
    ],
  },
  Solutions: {
    icon: Building2,
    items: [
      { label: 'Healthcare', href: '/industries#healthcare', icon: Heart, desc: 'HIPAA-compliant cloud for health systems' },
      { label: 'Financial Services', href: '/industries#finance', icon: Landmark, desc: 'Secure, regulated cloud infrastructure' },
      { label: 'Retail & E-Commerce', href: '/industries#retail', icon: ShoppingCart, desc: 'Scalable platforms for peak demand' },
      { label: 'Manufacturing', href: '/industries#manufacturing', icon: Factory, desc: 'IIoT, edge computing, and automation' },
      { label: 'By Plan', href: '/plans', icon: BarChart3, desc: 'Foundation, Care, Assure, Elite tiers' },
      { label: 'Case Studies', href: '/portfolio', icon: FileText, desc: 'Real-world outcomes from our clients' },
    ],
  },
};

const mainNavLinks = [
  { label: 'Pricing', href: '/plans' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export interface NavUser {
  id: string;
  email: string;
  name: string | null;
}

export function MegaNavigation({ user }: { user: NavUser | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const scrollProgress = useScrollProgress();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMenu = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(key);
  };

  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 120);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500',
          isScrolled ? 'pt-3 px-4' : 'pt-0 px-0'
        )}
        role="banner"
      >
        <nav
          className={cn(
            'w-full grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500',
            // stellar-ai: the header shell stays transparent at every scroll
            // position — the floating `.liquid-glass` nav pill inside supplies
            // the frosted surface, so nothing is nested inside a second pill.
            isScrolled
              ? 'max-w-7xl h-14 px-4 sm:px-8'
              : 'max-w-7xl h-16 lg:h-20 px-4 sm:px-8'
          )}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link href="/" className="col-start-1 justify-self-start flex items-center shrink-0" aria-label="SID Home">
            <Image
              src="/logo1.png"
              alt="SID Managed Cloud"
              width={220}
              height={58}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation — stellar-ai: links grouped into a floating glass pill */}
          <div className="col-start-2 justify-self-center hidden lg:flex items-center gap-0.5 xl:gap-1 liquid-glass rounded-full px-1.5 xl:px-2 py-1.5">
            {/* Mega Menu Triggers */}
            {Object.entries(megaMenus).map(([key, menu]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => openMenu(key)}
                onMouseLeave={closeMenu}
              >
                <button
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 xl:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    activeMenu === key
                      ? 'bg-white/10 text-white'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  )}
                  aria-expanded={activeMenu === key}
                  aria-haspopup="true"
                >
                  {key}
                  <ChevronDown
                    className={cn('w-3.5 h-3.5 transition-transform duration-200', activeMenu === key && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {activeMenu === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="liquid-glass absolute top-full left-1/2 -translate-x-1/2 mt-2 w-130 rounded-2xl bg-stellar-panel/95 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.8)]"
                      onMouseEnter={() => openMenu(key)}
                      onMouseLeave={closeMenu}
                    >
                      <div className="p-2 grid grid-cols-2 gap-1">
                        {menu.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/6 transition-colors group"
                            onClick={() => setActiveMenu(null)}
                          >
                            {/* stellar-ai: neutral white-alpha icon tile, violet glyph */}
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-white/10 transition-colors">
                              <item.icon className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white/85 group-hover:text-white transition-colors">{item.label}</p>
                              <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {mainNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-2.5 xl:px-4 py-2 rounded-full text-sm font-medium text-white/75 whitespace-nowrap hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — CTA + User */}
          <div className="col-start-3 justify-self-end hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {user ? (
              <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                <button className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-violet-200 text-xs font-semibold shrink-0">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <span className="max-w-24 xl:max-w-32 truncate whitespace-nowrap">{user.name || user.email.split('@')[0]}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="liquid-glass absolute right-0 top-full mt-2 w-52 rounded-2xl bg-stellar-panel/95 shadow-2xl"
                    >
                      <div className="p-1">
                        <Link href="/account" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="/account/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        <Link href="/account/notifications" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <Bell className="w-4 h-4" /> Notifications
                        </Link>
                        <div className="h-px bg-white/10 my-1" />
                        <form action="/api/auth/signout" method="post">
                          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/sign-in" className="text-sm font-medium text-white/70 whitespace-nowrap hover:text-white transition-colors">
                Sign in
              </Link>
            )}
            {/* stellar-ai: solid white pill CTA replaces the violet gradient + glow */}
            <Link
              href="/plans"
              className="rounded-full bg-white px-4 xl:px-5 py-2.5 text-sm font-semibold text-black whitespace-nowrap transition hover:bg-white/90"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="col-start-3 justify-self-end lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-text hover:bg-white/10 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              'fixed left-0 right-0 z-40 lg:hidden overflow-hidden bg-stellar-deep/98 backdrop-blur-2xl border-b border-white/10',
              isScrolled ? 'top-17' : 'top-16'
            )}
          >
            <div className="px-6 py-6 space-y-2 max-h-[80vh] overflow-y-auto" data-lenis-prevent>
              {Object.entries(megaMenus).map(([key, menu]) => (
                <div key={key} className="space-y-1">
                  <p className="stellar-eyebrow px-3 pt-4 pb-1">{key}</p>
                  {menu.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 text-violet-300 shrink-0" strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
              {mainNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <Link
                  href={user ? '/account' : '/sign-in'}
                  className="block rounded-full px-4 py-3 bg-white/5 border border-white/10 text-sm font-medium text-white/85 text-center transition-all hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {user ? `Dashboard (${user.name || user.email.split('@')[0]})` : 'Sign in'}
                </Link>
                <Link
                  href="/plans"
                  className="block rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-white/90"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-white/40 z-50 origin-left"
        style={{ scaleX: scrollProgress }}
        aria-hidden="true"
      />
    </>
  );
}
