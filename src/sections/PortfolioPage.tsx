'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingDown, TrendingUp, Shield, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const caseStudies = [
  {
    client: 'Fintech Leader',
    industry: 'Financial Services',
    plan: 'Elite',
    challenge: 'Uncontrolled cloud costs growing 40% YoY with no visibility into resource utilization across 12 AWS accounts.',
    solution: 'Implemented FinOps governance framework, reserved instance strategy, and automated rightsizing across all accounts.',
    results: [
      { label: 'Cost Reduction', value: '43%', icon: TrendingDown, color: 'text-emerald-400' },
      { label: 'Visibility', value: '100%', icon: TrendingUp, color: 'text-blue-400' },
      { label: 'Time to Savings', value: '60 days', icon: Clock, color: 'text-amber-400' },
    ],
    testimonial: 'SID transformed our cloud spend from a black box to a strategic asset. Best ROI we\'ve seen on any technology investment.',
    author: 'CTO, Leading NBFC',
    gradient: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20',
    tag: 'FinOps',
  },
  {
    client: 'Healthcare Platform',
    industry: 'Healthcare & Life Sciences',
    plan: 'Assure',
    challenge: 'Growing patient data platform needed HIPAA compliance and security governance without slowing engineering velocity.',
    solution: 'Deployed security posture management, IAM restructuring, compliance automation, and achieved HIPAA compliance in 90 days.',
    results: [
      { label: 'Compliance', value: 'HIPAA', icon: Shield, color: 'text-emerald-400' },
      { label: 'Security Score', value: '+68%', icon: TrendingUp, color: 'text-purple-400' },
      { label: 'Time to Comply', value: '90 days', icon: Clock, color: 'text-amber-400' },
    ],
    testimonial: 'We passed our HIPAA audit with zero findings. SID made compliance feel achievable, not overwhelming.',
    author: 'VP Engineering, Digital Health Platform',
    gradient: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20',
    tag: 'Security & Compliance',
  },
  {
    client: 'E-Commerce Giant',
    industry: 'Retail & E-Commerce',
    plan: 'Assure',
    challenge: 'Seasonal traffic spikes causing outages during Diwali sales. Needed elastic scaling and DR that could handle 10x normal load.',
    solution: 'Redesigned auto-scaling architecture, implemented multi-region DR, and ran load testing to validate 15x peak capacity.',
    results: [
      { label: 'Uptime', value: '99.99%', icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Peak Load', value: '15x', icon: Star, color: 'text-amber-400' },
      { label: 'Recovery Time', value: '<5 min', icon: Clock, color: 'text-blue-400' },
    ],
    testimonial: 'Zero downtime during our biggest sale of the year. The confidence our SID-managed infrastructure gives us is invaluable.',
    author: 'Head of Technology, D2C Brand',
    gradient: 'from-amber-500/10 to-orange-500/5 border-amber-500/20',
    tag: 'Performance & Resilience',
  },
  {
    client: 'Manufacturing Conglomerate',
    industry: 'Manufacturing & Industry',
    plan: 'Elite',
    challenge: 'Legacy on-premises datacenter with 200+ servers needed cloud migration with zero disruption to factory operations.',
    solution: 'Phased migration over 18 months using Wave methodology, factory floor IoT connectivity, and hybrid cloud architecture.',
    results: [
      { label: 'Servers Migrated', value: '200+', icon: TrendingUp, color: 'text-purple-400' },
      { label: 'Cost Saving', value: '₹8Cr/yr', icon: TrendingDown, color: 'text-emerald-400' },
      { label: 'Downtime', value: '0 hours', icon: Clock, color: 'text-amber-400' },
    ],
    testimonial: 'SID migrated our entire datacenter in 18 months with zero production disruption. Outstanding engineering discipline.',
    author: 'CIO, Industrial Manufacturing Group',
    gradient: 'from-purple-500/10 to-violet-500/5 border-purple-500/20',
    tag: 'Cloud Migration',
  },
];

const planColors: Record<string, string> = {
  Foundation: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Care: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Assure: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Elite: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function PortfolioPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-16 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-linear-to-r from-accent/8 to-emerald-500/5 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-8">
            <Star className="w-4 h-4 text-accent" /> Case Studies
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6">
            Real results from <span className="text-gradient-accent">real clients</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            See how we&apos;ve helped enterprises across industries reduce costs, improve resilience, and achieve compliance.
          </motion.p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="section-y">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {caseStudies.map((cs, i) => (
            <motion.div
              key={cs.client}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.1}
              className={cn('p-8 md:p-10 rounded-3xl border bg-linear-to-br transition-all hover:scale-[1.01]', cs.gradient)}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/55 border border-white/15">
                  {cs.industry}
                </span>
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', planColors[cs.plan])}>
                  {cs.plan} Plan
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-xs font-semibold text-accent border border-accent/20">
                  {cs.tag}
                </span>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="font-display font-semibold text-2xl text-white mb-4">{cs.client}</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-2">Challenge</p>
                      <p className="text-sm text-white/55 leading-relaxed">{cs.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-2">Solution</p>
                      <p className="text-sm text-white/55 leading-relaxed">{cs.solution}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-4">Results</p>
                  {/* gap/padding/text tightened at the base size — three tiles at
                      320px leave ~63px per column. Font-size alone wasn't enough:
                      values like "₹8Cr/yr" have no space to wrap on, so an
                      unbroken 7-char token still overflowed at text-base. Verified
                      via Playwright DOM measurement (tests/visual/portfolio-support.spec.ts),
                      not just eyeballed — `break-words` lets it wrap mid-token as
                      a last resort. */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {cs.results.map((r) => (
                      <div key={r.label} className="p-2 sm:p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <r.icon className={cn('w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-2', r.color)} />
                        <p className={cn('font-display font-semibold text-sm sm:text-2xl mb-1 wrap-break-word', r.color)}>{r.value}</p>
                        <p className="text-[10px] sm:text-xs text-white/45 wrap-break-word">{r.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mt-4">
                    <p className="text-sm text-white italic leading-relaxed mb-3">&quot;{cs.testimonial}&quot;</p>
                    <p className="text-xs text-white/45 font-semibold">— {cs.author}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-y border-t border-white/8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="p-12 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/20">
            <h2 className="font-display font-semibold text-fluid-h2 text-white mb-4">Ready to be our next <span className="text-gradient-accent">success story?</span></h2>
            <p className="text-white/55 mb-8 max-w-xl mx-auto">Join 200+ enterprises. Start with a free cloud assessment today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-all hover:from-accent-glow hover:to-purple-500">
                Request Free Assessment <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/plans" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/15 text-white font-semibold hover:bg-white/8 transition-all">
                View Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
