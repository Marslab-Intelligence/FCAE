'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, ArrowUpRight, Users, Layers, Cpu, Compass, ExternalLink, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type CaseStudy, caseStudies, ocrFallbackLadder, ocrExtractionSample, fcaeCoreStatusMatrix,
} from '@/lib/case-studies';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const } }),
};

const statusColors: Record<string, string> = {
  'PARTIALLY AVAILABLE': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  'IN PROGRESS': 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  PLANNED: 'text-white/50 border-white/15 bg-white/5',
};

function SectionHeading({ eyebrow, title, accent }: { eyebrow: string; title: string; accent: string }) {
  return (
    <div className="mb-8">
      <span className="font-mono text-xs font-semibold" style={{ color: accent }}>{eyebrow}</span>
      <h2 className="font-display-serif text-2xl sm:text-3xl font-semibold text-white mt-1.5">{title}</h2>
    </div>
  );
}

export function CaseStudyDetail({ study }: { study: CaseStudy }) {
  const others = caseStudies.filter((c) => c.slug !== study.slug);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-150 h-150 rounded-full blur-3xl opacity-15"
          style={{ background: `radial-gradient(circle, ${study.accent.hex}, transparent 70%)` }}
        />
      </div>

      {/* Hero */}
      <section className="relative pt-32 pb-14">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white/75 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Blog & Resources
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={cn('px-3 py-1 rounded-full text-xs font-mono font-semibold border', study.accent.text, study.accent.border, study.accent.bg)}
            >
              {study.index} · {study.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/50">
              {study.status}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="font-display-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-5"
          >
            {study.name}
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={3} className="text-xl text-white/60 leading-relaxed max-w-2xl mb-9">
            {study.tagline}
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {study.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
                <div className="font-display font-semibold text-lg text-white">{stat.value}</div>
                <div className="text-[11px] text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Summary + Problem */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-lg text-white/75 leading-relaxed mb-14 pl-5 border-l-2"
            style={{ borderColor: study.accent.hex }}
          >
            {study.summary}
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionHeading eyebrow="The problem" title="Why this needed to exist" accent={study.accent.hex} />
            <div className="space-y-4">
              {study.problem.map((para, i) => (
                <p key={i} className="text-white/60 leading-relaxed">{para}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-10 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionHeading eyebrow="Who it's for" title="Roles this was built around" accent={study.accent.hex} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {study.users.map((user) => (
                <div key={user.role} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" style={{ color: study.accent.hex }} />
                    <span className="font-display font-semibold text-white text-sm">{user.role}</span>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed">{user.need}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key features */}
      <section className="py-10 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionHeading eyebrow="Key features" title="What it actually does" accent={study.accent.hex} />
            <div className="space-y-3">
              {study.features.map((feature, i) => (
                <div key={feature.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <span className="font-mono text-xs shrink-0 mt-1" style={{ color: study.accent.hex }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-white text-base mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{feature.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-10 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionHeading eyebrow="Technology stack" title="What it's built from" accent={study.accent.hex} />
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              {study.stack.map((row, i) => (
                <div
                  key={row.layer}
                  className={cn('flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 px-5 py-4', i !== 0 && 'border-t border-white/8')}
                >
                  <div className="flex items-center gap-2 sm:w-40 shrink-0">
                    <Layers className="w-3.5 h-3.5 text-white/30" />
                    <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-wide">{row.layer}</span>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed">{row.tech}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Engineering decisions */}
      <section className="py-10 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionHeading eyebrow="Engineering decisions" title="Trade-offs worth knowing about" accent={study.accent.hex} />
            <div className="space-y-4">
              {study.decisions.map((decision) => (
                <div key={decision.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-4 h-4" style={{ color: study.accent.hex }} />
                    <h3 className="font-display font-semibold text-white text-base">{decision.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wide text-white/35 mb-1">Reason</span>
                      <p className="text-white/60 leading-relaxed">{decision.reason}</p>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wide text-white/35 mb-1">Benefit</span>
                      <p className="text-white/60 leading-relaxed">{decision.benefit}</p>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wide text-white/35 mb-1">Trade-off</span>
                      <p className="text-white/60 leading-relaxed">{decision.tradeoff}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-10 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionHeading eyebrow="Resources" title="Dig deeper" accent={study.accent.hex} />

            <div className="space-y-4">
              {study.resources.map((res) => (
                <div key={res.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText className="w-4 h-4" style={{ color: study.accent.hex }} />
                        <h3 className="font-display font-semibold text-white text-sm">{res.label}</h3>
                      </div>
                      <p className="text-sm text-white/55 leading-relaxed max-w-xl">{res.description}</p>
                    </div>
                    {res.href && (
                      <Link
                        href={res.href}
                        target={res.external ? '_blank' : undefined}
                        rel={res.external ? 'noopener noreferrer' : undefined}
                        className={cn('shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold', study.accent.text, study.accent.border, study.accent.bg)}
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* OCR: five-rung fallback ladder */}
                  {study.slug === 'ocr-smart-scan' && res.label === 'The five-rung fallback ladder' && (
                    <div className="mt-5 rounded-xl border border-white/8 overflow-hidden">
                      {ocrFallbackLadder.map((rung, i) => (
                        <div key={rung.rung} className={cn('flex items-center gap-4 px-4 py-3', i !== 0 && 'border-t border-white/8')}>
                          <span className="font-mono text-xs text-white/35 w-14 shrink-0">RUNG {rung.rung}</span>
                          <p className="text-sm text-white/60 flex-1">{rung.description}</p>
                          <span
                            className={cn(
                              'shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border',
                              rung.mode === 'AUTOMATIC' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            )}
                          >
                            {rung.mode}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* OCR: extraction result JSON sample */}
                  {study.slug === 'ocr-smart-scan' && res.label === 'Extraction result shape' && (
                    <pre className="mt-5 rounded-xl border border-white/8 bg-black/40 p-4 overflow-x-auto text-xs leading-relaxed text-white/70 font-mono">
                      {ocrExtractionSample}
                    </pre>
                  )}

                  {/* FCAE CORE: functional status matrix */}
                  {study.slug === 'fcae-core' && res.label === 'Functional status matrix' && (
                    <div className="mt-5 rounded-xl border border-white/8 overflow-hidden">
                      {fcaeCoreStatusMatrix.map((row, i) => (
                        <div key={row.capability} className={cn('flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3', i !== 0 && 'border-t border-white/8')}>
                          <span className="text-sm text-white/75 font-medium sm:w-56 shrink-0">{row.capability}</span>
                          <span className="text-xs text-white/45 flex-1">{row.value}</span>
                          <span className={cn('shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border w-fit', statusColors[row.status])}>
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* More case studies */}
      <section className="py-14 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6 flex items-center gap-2">
            <Compass className="w-4 h-4 text-white/40" />
            <span className="text-sm font-medium text-white/45">More from the notebook</span>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] transition-colors"
              >
                <span className={cn('font-mono text-[11px] font-semibold', other.accent.text)}>{other.index} · {other.category}</span>
                <h3 className="font-display-serif text-lg font-semibold text-white mt-2 mb-2 group-hover:opacity-80 transition-opacity">{other.name}</h3>
                <span className={cn('inline-flex items-center gap-1 text-xs font-medium', other.accent.text)}>
                  Read case study <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
