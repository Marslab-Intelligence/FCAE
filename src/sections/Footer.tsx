'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useReveal } from '@/hooks/useGSAP';
import { DURATION_REVEAL, STAGGER_UNIT } from '@/lib/motion';
import { Globe, ExternalLink, Share2 } from 'lucide-react';

const footerLinks = {
  'Services': [
    { label: 'Cloud Operations', href: '/services#cloud-ops' },
    { label: 'FinOps & Cost Optimization', href: '/services#finops' },
    { label: 'Security Governance', href: '/services#security' },
    { label: 'DevOps & Platform', href: '/services#devops' },
    { label: 'Add-On Services', href: '/add-ons' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Industries', href: '/industries' },
    { label: 'Blog & Resources', href: '/blog' },
    { label: 'Contact Us', href: '/contact' },
  ],
  'Plans': [
    { label: 'Foundation (9/5)', href: '/plans' },
    { label: 'Care (12/5)', href: '/plans' },
    { label: 'Assure (16/6)', href: '/plans' },
    { label: 'Elite (24/6)', href: '/plans' },
    { label: 'SLA Commitments', href: '/sla' },
  ],
  'Support': [
    { label: 'FAQs', href: '/faqs' },
    { label: 'Sign In', href: '/sign-in' },
    { label: 'Create Account', href: '/sign-up' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};

export function Footer() {
  useReveal('footer .reveal-col', {
    y: 20,
    duration: DURATION_REVEAL,
    stagger: STAGGER_UNIT,
    ease: 'power3.out',
  });

  return (
    <footer className="relative border-t border-white/10 bg-stellar-deep">
      {/* stellar-ai: the violet/emerald glow orb is removed — the footer is a
          flat deep plane, matching stellar's minimal treatment. */}

      <div className="relative z-10 max-w-384 mx-auto px-6 py-14 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="reveal-col lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo1.png"
                alt="SID Managed Cloud"
                width={220}
                height={58}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-white/55 leading-relaxed mb-6 text-sm">
              Enterprise managed cloud services providing operational stability, FinOps optimization, security governance, and strategic leadership.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Globe, href: '#', label: 'Website' },
                { icon: Share2, href: '#', label: 'Social' },
                { icon: ExternalLink, href: '#', label: 'News' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/45 hover:text-white hover:border-white/20 hover:bg-white/8 transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="reveal-col">
                <h3 className="font-display font-semibold text-white text-xs uppercase tracking-widest mb-5">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-white/55 hover:text-white transition-colors block py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <p>© {new Date().getFullYear()} SID Managed Cloud Services Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="/sla" className="hover:text-white transition-colors">SLA</a>
            <a href="mailto:hello@sidcloud.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}