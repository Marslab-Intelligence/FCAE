'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { caseStudies } from '@/lib/case-studies';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function BlogPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-125 h-125 rounded-full bg-linear-to-br from-accent/8 to-purple-600/5 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-8">
            <BookOpen className="w-4 h-4 text-accent" /> Blog & Resources
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6 max-w-3xl">
            Systems we&apos;ve actually <span className="text-gradient-accent">shipped</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-xl text-white/55 max-w-2xl leading-relaxed">
            Four platforms MarsLab has built or is building, read from the code rather than the pitch deck — the business
            problem, who it&apos;s for, the architecture, and the trade-offs an engineer would actually ask about.
          </motion.p>
        </div>
      </section>

      {/* Case studies */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {caseStudies.map((study, i) => (
              <motion.article
                key={study.slug}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.12}
                className="case-card relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-8 flex flex-col"
              >
                {/* Oversized index watermark — the editorial "dossier" motif */}
                <span
                  aria-hidden="true"
                  className="font-display-serif absolute -top-6 -right-2 text-[7.5rem] sm:text-[9rem] font-semibold italic leading-none select-none pointer-events-none opacity-[0.07]"
                  style={{ color: study.accent.hex }}
                >
                  {study.index}
                </span>

                <div className="relative z-10 flex items-center gap-3 mb-5">
                  <span
                    className={cn('px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border', study.accent.text, study.accent.border, study.accent.bg)}
                  >
                    {study.index} · {study.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/45">
                    {study.status}
                  </span>
                </div>

                <h2 className="relative z-10 font-display-serif text-3xl sm:text-4xl font-semibold text-white mb-3 leading-tight">
                  {study.name}
                </h2>
                <p className="relative z-10 text-white/60 leading-relaxed mb-6 max-w-xl">{study.tagline}</p>

                <div className="relative z-10 grid grid-cols-2 gap-3 mb-7">
                  {study.stats.slice(0, 4).map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
                      <div className="font-display font-semibold text-sm sm:text-base text-white truncate" title={stat.value}>
                        {stat.value}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 mt-auto pt-5 border-t border-white/8 flex items-center justify-between">
                  <span className="text-xs text-white/35">
                    {study.features.length} key features documented
                  </span>
                  <Link
                    href={`/blog/${study.slug}`}
                    className={cn(
                      'group inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:gap-2.5',
                      study.accent.text,
                      study.accent.border,
                      study.accent.bg
                    )}
                  >
                    More info <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
