'use client';

import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: 'SID transformed our cloud spend from a black box into a strategic asset. 43% cost reduction in 60 days is unprecedented.',
    author: 'Vikram Nair',
    role: 'CTO',
    company: 'Leading Indian NBFC',
    avatar: 'VN',
    stars: 5,
    plan: 'Elite',
    color: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20',
  },
  {
    quote: 'We passed our HIPAA audit with zero findings. SID made compliance feel achievable, not overwhelming.',
    author: 'Dr. Ananya Krishnamurthy',
    role: 'VP Engineering',
    company: 'Digital Health Platform',
    avatar: 'AK',
    stars: 5,
    plan: 'Assure',
    color: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20',
  },
  {
    quote: 'Zero downtime during Diwali sale at 15x normal traffic. The infrastructure confidence SID provides is invaluable.',
    author: 'Prashant Mehta',
    role: 'Head of Technology',
    company: 'Major D2C Brand',
    avatar: 'PM',
    stars: 5,
    plan: 'Assure',
    color: 'from-amber-500/10 to-orange-500/5 border-amber-500/20',
  },
];

const planColors: Record<string, string> = {
  Assure: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Elite: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function HomeTestimonialsSection() {
  return (
    <section className="relative section-y overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-linear-to-r from-accent/5 to-purple-600/5 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-6"
          >
            <Star className="w-4 h-4 text-accent" /> Client Success Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-semibold text-fluid-h2 tracking-tight text-white mb-4"
          >
            <span className="stellar-gradient-text">Trusted by 200+ enterprises</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/55 max-w-xl mx-auto"
          >
            See what industry leaders say about their experience with SID Managed Cloud.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={cn('p-7 rounded-3xl border bg-linear-to-br flex flex-col hover:scale-[1.02] transition-all liquid-glass', t.color)}
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm text-white leading-relaxed flex-1 mb-6">
                &quot;{t.quote}&quot;
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-accent to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-white">{t.author}</p>
                  <p className="text-xs text-white/45">{t.role} · {t.company}</p>
                </div>
                <span className={cn('ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold border', planColors[t.plan])}>
                  {t.plan}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-glow font-medium text-sm transition-colors"
          >
            View all case studies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
