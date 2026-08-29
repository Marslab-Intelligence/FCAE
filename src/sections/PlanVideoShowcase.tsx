'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gauge, Lock, Rocket, ShieldCheck, Play, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type PlanKey = 'foundation' | 'care' | 'assure' | 'elite';

const PLAN_ICONS: Record<PlanKey, LucideIcon> = {
  foundation: ShieldCheck,
  care: Gauge,
  assure: Lock,
  elite: Rocket,
};

const PLAN_META: Record<PlanKey, { name: string; stage: string; accentBg: string; accentText: string; video: string }> = {
  foundation: {
    name: 'Foundation',
    stage: 'Operate',
    accentBg: 'bg-blue-500/20 border border-blue-500/30',
    accentText: 'text-blue-400',
    video: '/videos/feature-1.mp4',
  },
  care: {
    name: 'Care',
    stage: 'Optimize',
    accentBg: 'bg-emerald-500/20 border border-emerald-500/30',
    accentText: 'text-emerald-400',
    video: '/videos/feature-2.mp4',
  },
  assure: {
    name: 'Assure',
    stage: 'Govern',
    accentBg: 'bg-amber-500/20 border border-amber-500/30',
    accentText: 'text-amber-400',
    video: '/videos/feature-3.mp4',
  },
  elite: {
    name: 'Elite',
    stage: 'Transform',
    accentBg: 'bg-purple-500/20 border border-purple-500/30',
    accentText: 'text-purple-400',
    video: '/videos/feature-4.mp4',
  },
};

const PLAN_ORDER: PlanKey[] = ['foundation', 'care', 'assure', 'elite'];

export function PlanVideoShowcase() {
  return (
    <section className="relative py-12 md:py-16 bg-transparent border-t border-white/5 scroll-mt-24" id="plan-showcase">
      <div className="mx-auto max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="stellar-eyebrow"
        >
          Choose Your Plan
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          See Foundation, Care, Assure &amp; Elite in Action
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg"
        >
          A walkthrough of every plan, from reliable day-to-day operations to round-the-clock strategic partnership. Click any package to explore its dedicated landing page.
        </motion.p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((key, i) => {
            const meta = PLAN_META[key];
            const Icon = PLAN_ICONS[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={`/plans/${key}`} className="flex flex-col gap-3 group">
                  <div className="liquid-glass relative flex aspect-4/3 flex-col items-center justify-center rounded-3xl p-4 text-center overflow-hidden group-hover:border-violet-500/50 group-hover:scale-[1.02] transition-all duration-300">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity"
                      src={meta.video}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.accentBg} backdrop-blur-md shadow-lg`}>
                        <Icon className={`h-6 w-6 ${meta.accentText}`} strokeWidth={1.5} />
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white font-medium group-hover:bg-white group-hover:text-black transition-colors">
                        <Play className="w-3 h-3 text-violet-300 fill-violet-300 group-hover:text-black group-hover:fill-black" /> Open {meta.name} Webpage
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className={`font-display text-base font-semibold ${meta.accentText} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                      {meta.name} Package <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-xs uppercase tracking-wider text-white/40">{meta.stage} stage</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
