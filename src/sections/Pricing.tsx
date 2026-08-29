'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCurrency, CurrencyToggle } from '@/components/CurrencyProvider';
import { ArrowRight } from 'lucide-react';

type Cycle = 'monthly' | 'yearly';

const plans = [
  {
    id: 'foundation',
    category: 'Entry-level support',
    name: 'Foundation',
    tagline: 'Reliable cloud support and access to expertise',
    accent: 'text-blue-400',
    hex: '#60a5fa',
    glow: 'rgba(59,130,246,0.5)',
    border: 'border-blue-500/20',
    gradientBg: 'from-blue-950/60 via-[#0c0c14] to-[#0c0c14]',
    orbColor: 'bg-blue-500/20',
    meshColor: 'rgba(59,130,246,0.04)',
    accentLine: 'from-blue-500 via-cyan-400 to-transparent',
    ctaBg: 'bg-blue-500 hover:bg-blue-400 text-white',
    ctaGlow: 'shadow-[0_0_24px_-4px_rgba(59,130,246,0.6)]',
    icon: '🛡️',
    prices: { monthly: 49000, yearly: 39000 },
    features: ['9/5 support window (9am–6pm)', 'Up to 6 hrs P1 response/mo', 'Reliable cloud operations', 'Incident assistance', 'Cloud cost visibility'],
  },
  {
    id: 'care',
    category: 'Cost & performance',
    name: 'Care',
    tagline: 'Operational excellence & cloud cost optimization',
    accent: 'text-emerald-400',
    hex: '#34d399',
    glow: 'rgba(16,185,129,0.5)',
    border: 'border-emerald-500/20',
    gradientBg: 'from-emerald-950/60 via-[#0c0c14] to-[#0c0c14]',
    orbColor: 'bg-emerald-500/20',
    meshColor: 'rgba(16,185,129,0.04)',
    accentLine: 'from-emerald-500 via-teal-400 to-transparent',
    ctaBg: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    ctaGlow: 'shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)]',
    icon: '⚡',
    prices: { monthly: 99000, yearly: 79000 },
    features: ['12/5 support window (8am–8pm)', 'Up to 8 hrs P1 response/mo', 'Everything in Foundation', 'Cloud cost optimization', 'Performance optimization'],
  },
  {
    id: 'assure',
    category: 'Governance & security',
    name: 'Assure',
    tagline: 'Governance, security & risk reduction',
    recommended: true,
    accent: 'text-amber-400',
    hex: '#fbbf24',
    glow: 'rgba(245,158,11,0.55)',
    border: 'border-amber-500/30',
    gradientBg: 'from-amber-950/60 via-[#0c0c14] to-[#0c0c14]',
    orbColor: 'bg-amber-500/25',
    meshColor: 'rgba(245,158,11,0.05)',
    accentLine: 'from-amber-500 via-orange-400 to-transparent',
    ctaBg: 'bg-amber-500 hover:bg-amber-400 text-black font-bold',
    ctaGlow: 'shadow-[0_0_24px_-4px_rgba(245,158,11,0.7)]',
    icon: '★',
    prices: { monthly: 179000, yearly: 149000 },
    features: ['16/6 support (8am–11:59pm Mon–Sat)', 'Up to 10 hrs P1 response/mo', 'Everything in Care', 'Security governance', 'Compliance readiness', 'Dedicated SDM', 'Executive reviews'],
  },
  {
    id: 'elite',
    category: 'Strategic innovation',
    name: 'Elite',
    tagline: 'Strategic leadership & executive accountability',
    accent: 'text-purple-400',
    hex: '#c084fc',
    glow: 'rgba(168,85,247,0.5)',
    border: 'border-purple-500/20',
    gradientBg: 'from-purple-950/60 via-[#0c0c14] to-[#0c0c14]',
    orbColor: 'bg-purple-500/20',
    meshColor: 'rgba(168,85,247,0.04)',
    accentLine: 'from-purple-500 via-pink-400 to-transparent',
    ctaBg: 'bg-purple-500 hover:bg-purple-400 text-white',
    ctaGlow: 'shadow-[0_0_24px_-4px_rgba(168,85,247,0.6)]',
    icon: '👑',
    prices: { monthly: 299000, yearly: 249000 },
    features: ['24/6 round-the-clock (Mon–Sat)', 'Unlimited P1 incident support', 'Everything in Assure', 'Strategic tech roadmap', 'Innovation & modernization', 'Leadership escalation path'],
  },
];

type Plan = (typeof plans)[number];

function PricingCard({
  plan,
  price,
  cycle,
  i,
  savedTier,
}: {
  plan: Plan;
  price: number;
  cycle: Cycle;
  i: number;
  savedTier: string | null;
}) {
  const { compact } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      /* stellar-ai: plan cards become plain `.liquid-glass` panels. The
         per-plan gradient wash, mesh grid, blurred orbs, diagonal accent lines,
         coloured glow shadow and the cursor-tracking glass lens are all removed
         in favour of stellar's flat frosted surface. */
      className={cn(
        'group relative flex flex-col h-full rounded-3xl overflow-hidden liquid-glass transition-colors duration-300',
        'hover:bg-white/[0.07]',
        plan.recommended && 'ring-1 ring-white/20'
      )}
    >
      {/* ── Card content ── */}
      <div className="relative z-10 flex flex-col flex-1 p-4.5">

        {/* Icon + badge row — stellar-ai: neutral white-alpha chips */}
        <div className="flex items-center justify-between mb-3 min-h-5">
          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-base shrink-0">{plan.icon}</span>
          {savedTier === plan.id ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-medium text-white/70 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Current
            </span>
          ) : plan.recommended ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-medium text-white/70 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> Popular
            </span>
          ) : null}
        </div>

        {/* Plan name + category — stellar-ai: white headings, eyebrow label */}
        <Link href={`/plans/${plan.id}`} className="group/link">
          <h3 className="font-display font-semibold text-xl lg:text-2xl tracking-tight leading-none text-white group-hover/link:text-violet-300 transition-colors flex items-center justify-between">
            {plan.name} <ArrowRight className="w-4 h-4 text-violet-300 opacity-70 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
          </h3>
        </Link>
        <p className="stellar-eyebrow mt-1.5 block text-[10px]">{plan.category}</p>
        <p className="text-xs text-white/55 leading-relaxed mt-1.5 mb-3 min-h-10">{plan.tagline}</p>

        {/* Price */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${plan.id}-${cycle}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mb-3"
          >
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
                {compact(price)}
              </span>
              <span className="text-white/55 text-xs ml-1">/ mo</span>
            </div>
            <p className="text-[10px] text-white/45 mt-0.5 h-4">
              {cycle === 'yearly' ? (
                <>Billed yearly ({compact(price * 12)}/yr) — <span className="text-violet-300 font-medium">save 20%</span></>
              ) : (
                'Billed monthly, cancel anytime'
              )}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Divider — stellar-ai: plain hairline instead of a coloured gradient */}
        <div className="h-px w-full mb-3.5 bg-white/10" />

        {/* Features — stellar-ai: violet bullet dots replace coloured check chips */}
        <ul className="space-y-1.5 mb-4 flex-1">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 text-xs text-white/70 leading-snug">
              <span className="mt-1.5 shrink-0 h-1 w-1 rounded-full bg-violet-400" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA links */}
        <div className="flex flex-col gap-1.5">
          <Link href={`/plans/${plan.id}`}>
            <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-white text-black text-xs font-semibold transition hover:bg-white/90">
              View {plan.name} Page <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
          <Link href={savedTier === plan.id ? '/account' : `/build?plan=${plan.id}`}>
            <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-full bg-white/10 text-white/90 text-[11px] font-medium transition hover:bg-white/20 border border-white/10">
              {savedTier === plan.id ? 'Manage Plan' : 'Customize in Builder'}
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function Pricing({ savedTier = null }: { isSignedIn?: boolean; savedTier?: string | null }) {
  const [cycle, setCycle] = useState<Cycle>('yearly');

  return (
    /* Transparent section plane — lets global cosmic galaxy backdrop show through */
    <section className="relative py-12 md:py-16 bg-transparent border-t border-white/5 scroll-mt-24" aria-labelledby="pricing-heading">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="stellar-eyebrow">
              Transparent Pricing
            </motion.p>
            <motion.h2 id="pricing-heading" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="mt-2 font-display text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Pick your managed cloud tier
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="mt-2 text-xs md:text-sm text-white/55 max-w-xl leading-relaxed">
              Flat monthly pricing, no per-seat math — scale as your cloud grows.
            </motion.p>
          </div>

          {/* Billing cycle + display currency. The currency switch lives here
              rather than in the global nav — it only affects prices, so it
              belongs beside them. */}
          <div className="flex flex-wrap items-center gap-2.5">
          <div className="liquid-glass flex items-center gap-1 p-1 rounded-full w-fit">
            {(['monthly', 'yearly'] as Cycle[]).map(c => (
              <button key={c} onClick={() => setCycle(c)}
                className={cn('flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all capitalize',
                  cycle === c ? 'bg-white text-black' : 'text-white/65 hover:bg-white/5 hover:text-white')}>
                {c === 'yearly' ? 'Yearly' : 'Monthly'}
                {c === 'yearly' && <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-semibold border',
                  cycle === c ? 'bg-black/10 text-black border-black/15' : 'bg-white/5 text-white/60 border-white/10')}>-20%</span>}
              </button>
            ))}
          </div>
            <CurrencyToggle />
          </div>
        </div>

        {/* ── 4 Plan cards 1×4 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 mb-8 items-stretch">
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              price={plan.prices[cycle]}
              cycle={cycle}
              i={i}
              savedTier={savedTier}
            />
          ))}
        </div>
      </div>
    </section>
  );
}