'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useScrollProgress } from '@/hooks/useLenis';
import { Menu, X, User } from 'lucide-react';

const navLinks = [
  { label: 'Plan Comparison', href: '/plans' },
  { label: 'Technical Activities', href: '/activities' },
  { label: 'Center of Excellence', href: '/coe' },
  { label: 'Service Reviews', href: '/reviews' },
  { label: 'SLA Commitments', href: '/sla' },
];

export interface NavUser {
  id: string;
  email: string;
  name: string | null;
}

export function Navigation({ user }: { user: NavUser | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out-premium',
          isScrolled ? 'pt-3 px-4' : 'pt-0 px-0'
        )}
        role="banner"
      >
        <nav
          className={cn(
            'w-full flex items-center justify-between transition-all duration-500 ease-out-premium',
            isScrolled
              ? 'max-w-4xl h-14 px-4 rounded-full bg-bg/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]'
              : 'max-w-384 h-16 lg:h-20 px-6 rounded-none bg-transparent border border-transparent'
          )}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label="SID Home"
          >
            <Image
              src="/logo1.png"
              alt="SID Managed Cloud"
              width={220}
              height={58}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-text-muted hover:text-text hover:-translate-y-0.5 transition-all text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-4">
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.name || user.email.split('@')[0]}
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-text-muted hover:text-text transition-colors"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/plans"
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-medium text-sm hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] transition-all"
              >
                Select Plan
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-text hover:bg-white/10 hover:border-white/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu — a sibling of the pill nav so it always stays full-bleed */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              'fixed left-0 right-0 z-40 lg:hidden overflow-hidden bg-bg/95 backdrop-blur-xl border-t border-white/10 transition-[top] duration-500',
              isScrolled ? 'top-19' : 'top-16'
            )}
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-3 rounded-xl text-text-muted hover:text-text hover:bg-white/5 text-base font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link
                  href={user ? '/account' : '/sign-in'}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-text hover:border-white/20 text-base font-medium text-center transition-all"
                >
                  {user ? user.name || user.email.split('@')[0] : 'Sign in'}
                </Link>
                <Link
                  href="/plans"
                  className="px-4 py-3 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-medium text-base text-center hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] transition-all"
                >
                  Select Plan
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-linear-to-r from-accent to-lime z-50 origin-left"
        style={{ scaleX: scrollProgress }}
        transition={{ duration: 0.1 }}
        aria-hidden="true"
      />
    </>
  );
}
