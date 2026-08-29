'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { maturityJourney } from '@/lib/maturity-journey';
import { useReveal } from '@/hooks/useGSAP';
import { DURATION_REVEAL, STAGGER_UNIT } from '@/lib/motion';
import { Award, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, TrendingUp, Clapperboard } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const coeItems = [
  { name: 'Cloud Operations', foundation: '✓', care: '✓', assure: '✓', elite: '✓' },
  { name: 'Cloud Architecture', foundation: 'Limited', care: '✓', assure: '✓', elite: '✓' },
  { name: 'FinOps', foundation: '—', care: '✓', assure: '✓', elite: '✓' },
  { name: 'Security', foundation: '—', care: 'Limited', assure: '✓', elite: '✓' },
  { name: 'Business Continuity', foundation: '—', care: '—', assure: '✓', elite: '✓' },
  { name: 'DevOps & Platform Engineering', foundation: '—', care: 'Advisory', assure: '✓', elite: '✓' },
  { name: 'Kubernetes & Containers', foundation: '—', care: 'Advisory', assure: '✓', elite: '✓' },
  { name: 'AI & Data Engineering', foundation: '—', care: '—', assure: 'Advisory', elite: '✓' },
];

const coeAccessSummary = [
  { plan: 'Foundation', color: 'text-blue-400', summary: 'Cloud Operations' },
  { plan: 'Care', color: 'text-emerald-400', summary: 'Cloud Operations + Cloud Architecture + FinOps' },
  {
    plan: 'Assure',
    color: 'text-amber-400',
    summary: 'Cloud Operations + Cloud Architecture + FinOps + Security + Business Continuity + DevOps & Platform Engineering',
  },
  { plan: 'Elite', color: 'text-purple-400', summary: 'Full FCAE COE Access' },
];

export function Showcase() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelector('.coe-headline'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  useReveal('#coe .reveal-row', {
    y: 16,
    duration: DURATION_REVEAL,
    stagger: STAGGER_UNIT,
    ease: 'power3.out',
  });

  const renderBadge = (status: string) => {
    if (status === '✓') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Included
        </span>
      );
    }
    if (status === 'Limited') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5" /> Limited
        </span>
      );
    }
    if (status === 'Advisory') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" /> Advisory
        </span>
      );
    }
    return <span className="text-white/45/40 text-sm">—</span>;
  };

  return (
    <section
      id="coe"
      ref={sectionRef}
      className="relative section-y overflow-hidden"
      aria-labelledby="coe-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 right-1/4 w-150 h-150 rounded-full bg-linear-to-br from-purple-600/10 via-transparent to-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass text-sm font-medium text-white/55 mb-6"
          >
            <Award className="w-4 h-4 text-purple-400" />
            FCAE Center of Excellence
          </motion.span>
          <h2
            id="coe-heading"
            className="coe-headline font-display font-semibold text-fluid-h2 tracking-tight leading-tight text-white mb-4"
          >
            Center of Excellence <span className="stellar-gradient-text">(COE) Access</span>
          </h2>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            Gain direct access to specialized Cloud, FinOps, Security, and Engineering domain experts based on your service tier.
          </p>
        </div>

        {/* FCAE Maturity Journey Steps */}
        <div className="mb-16">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-xl font-display font-semibold text-white">FCAE Maturity Journey</h3>
            </div>
            <Link
              href="/journey"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass hover:bg-white/8 text-sm font-medium text-white transition-all duration-300 group"
            >
              <Clapperboard className="w-4 h-4 text-accent" />
              Watch the journey
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {maturityJourney.map((step, idx) => (
              <motion.div
                key={step.plan}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn('p-6 rounded-3xl bg-linear-to-b liquid-glass flex flex-col justify-between transition-all duration-300 hover:bg-white/8', step.color)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">Step 0{idx + 1}</span>
                    <span className="text-sm font-display font-semibold">{step.plan}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{step.focus}</h4>
                  <p className="text-xs text-white/55 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COE Matrix Table */}
        <div className="rounded-3xl liquid-glass overflow-hidden shadow-2xl mb-12">
          <div className="p-6 border-b border-white/10 bg-white/2">
            <h3 className="text-xl font-display font-semibold text-white">COE Specialist Domains</h3>
            <p className="text-sm text-white/55">Domain capability distribution across tiers</p>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="py-4 px-6 text-sm font-semibold text-white">Specialist Domain</th>
                  <th className="py-4 px-6 text-sm font-semibold text-blue-400 text-center w-1/5">Foundation</th>
                  <th className="py-4 px-6 text-sm font-semibold text-emerald-400 text-center w-1/5">Care</th>
                  <th className="py-4 px-6 text-sm font-semibold text-amber-400 text-center w-1/5">Assure</th>
                  <th className="py-4 px-6 text-sm font-semibold text-purple-400 text-center w-1/5">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {coeItems.map((item) => (
                  <tr key={item.name} className="reveal-row hover:bg-white/[0.07] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{item.name}</td>
                    <td className="py-4 px-6 text-center">{renderBadge(item.foundation)}</td>
                    <td className="py-4 px-6 text-center">{renderBadge(item.care)}</td>
                    <td className="py-4 px-6 text-center">{renderBadge(item.assure)}</td>
                    <td className="py-4 px-6 text-center">{renderBadge(item.elite)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stacked Mobile View */}
          <div className="md:hidden divide-y divide-white/8">
            {coeItems.map((item) => (
              <div key={item.name} className="p-5 space-y-3">
                <span className="font-display font-semibold text-white text-sm block">{item.name}</span>
                <dl className="grid grid-cols-2 gap-2.5 pt-1">
                  {([
                    ['Foundation', item.foundation, 'text-blue-400'],
                    ['Care', item.care, 'text-emerald-400'],
                    ['Assure', item.assure, 'text-amber-400'],
                    ['Elite', item.elite, 'text-purple-400'],
                  ] as const).map(([plan, status, tone]) => (
                    <div key={plan} className="rounded-xl border border-white/10 bg-white/4 px-3 py-2 flex flex-col justify-between">
                      <dt className={cn('text-[10px] font-mono uppercase tracking-wider font-semibold', tone)}>{plan}</dt>
                      <dd className="mt-1.5">{renderBadge(status)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>

        {/* FCAE COE Access Summary */}
        <div className="mb-12">
          <h3 className="text-xl font-display font-semibold text-white mb-6">FCAE COE Access Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coeAccessSummary.map((item, idx) => (
              <motion.div
                key={item.plan}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-6 rounded-3xl liquid-glass transition-all duration-300 hover:bg-white/8"
              >
                <span className={cn('text-sm font-display font-semibold', item.color)}>{item.plan}</span>
                <p className="mt-2 text-xs text-white/55 leading-relaxed">{item.summary}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COE Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl liquid-glass">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase">
              <AlertCircle className="w-3.5 h-3.5" /> Limited Access
            </span>
            <p className="text-xs text-white/55 leading-normal">
              Access for reviews, recommendations, and planned discussions related to subscribed service scope.
            </p>
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase">
              <HelpCircle className="w-3.5 h-3.5" /> Advisory Access
            </span>
            <p className="text-xs text-white/55 leading-normal">
              Specialist guidance and recommendations. Implementation services may require a separate SOW.
            </p>
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" /> Included (✓)
            </span>
            <p className="text-xs text-white/55 leading-normal">
              Ongoing engagement, reviews, recommendations, and execution support within service scope.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}