'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const qnaList = [
  {
    question: '"What happened this month?"',
    activity: 'Monthly Service Report',
    description: 'A summary report covering support activities, incidents, service requests, major actions performed, and overall service performance during the month.',
  },
  {
    question: '"How are we performing?"',
    activity: 'Service Review Meeting',
    description: 'A structured meeting to review service performance, discuss operational concerns, review action items, and plan improvements for the upcoming period.',
  },
  {
    question: '"How healthy are our operations?"',
    activity: 'Operational Review',
    description: 'Review of incidents, recurring issues, operational health, support trends, and improvement opportunities. Focuses on keeping the cloud environment optimized.',
  },
  {
    question: '"Who owns the relationship?"',
    activity: 'Success Manager Participation',
    description: 'A designated customer success representative who coordinates reviews, follows up on actions, tracks service delivery, and acts as the primary relationship contact.',
  },
  {
    question: '"How should we review cloud design?"',
    activity: 'Solution Architect Participation',
    description: 'Engagement of a senior architect to improve cloud design, scalability, security, modernization opportunities, and technical recommendations.',
  },
  {
    question: '"Can we discuss this face-to-face?"',
    activity: 'Onsite Review',
    description: 'In-person meeting conducted at the customer location to discuss operational performance, challenges, future requirements, and relationship alignment.',
  },
  {
    question: '"Are there any business concerns?"',
    activity: 'Executive Review',
    description: 'Review involving customer management and SID leadership focused on business risks, governance matters, strategic priorities, and escalation management.',
  },
  {
    question: '"What business value have we delivered?"',
    activity: 'Quarterly Business Review (QBR)',
    description: 'Structured business review conducted quarterly to assess service performance, delivered outcomes, business impact, achievements, and future goals.',
  },
  {
    question: '"Where is our technology going?"',
    activity: 'Technology Roadmap Review',
    description: 'Review of current and future technology initiatives, cloud strategy, modernization plans, architecture evolution, and investment priorities.',
  },
  {
    question: '"How does technology support business growth?"',
    activity: 'Executive Business Review',
    description: 'High-level strategic review between customer leadership and SID leadership focused on business growth, transformation initiatives, and tech strategy.',
  },
  {
    question: '"Who can help if this becomes critical?"',
    activity: 'Leadership Escalation Path',
    description: 'Direct access to SID senior management for urgent business-critical concerns, escalations, strategic decisions, or unresolved issues requiring rapid action.',
  },
];

/**
 * Presentational-only grouping of qnaList into the governance tiers the
 * content itself already runs through (routine ops → named owners →
 * scheduled business reviews → leadership escalation). `count` tracks
 * how many consecutive qnaList entries, in existing array order, belong
 * to each tier — the array itself is never reordered.
 */
const tiers = [
  { name: 'Operational', tagline: 'Recurring & routine', color: '#22d3ee', count: 3 },
  { name: 'Tactical', tagline: 'Named point of contact', color: '#818cf8', count: 3 },
  { name: 'Strategic', tagline: 'Scheduled, quarterly cadence', color: '#a78bfa', count: 3 },
  { name: 'Executive', tagline: 'Direct, as-needed access', color: '#fbbf24', count: 2 },
] as const;

const tierBoundaries = tiers.reduce<number[]>((acc, t, i) => {
  acc.push((acc[i - 1] ?? 0) + t.count);
  return acc;
}, []);

function tierIndexFor(qnaIndex: number) {
  return tierBoundaries.findIndex(boundary => qnaIndex < boundary);
}

const spineGradient = `linear-gradient(180deg, ${tiers
  .map((t, i) => {
    const start = ((tierBoundaries[i - 1] ?? 0) / qnaList.length) * 100;
    const end = (tierBoundaries[i] / qnaList.length) * 100;
    return `${t.color} ${start.toFixed(1)}%, ${t.color} ${end.toFixed(1)}%`;
  })
  .join(', ')})`;

function TierMeter({ level, color }: { level: number; color: string }) {
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className="w-0.75 rounded-full transition-colors duration-300"
          style={{
            height: `${5 + i * 3}px`,
            background: i < level ? color : 'rgba(255,255,255,0.14)',
          }}
        />
      ))}
    </span>
  );
}

function DetailReadout({
  item,
  tier,
}: {
  item: (typeof qnaList)[number];
  tier: (typeof tiers)[number];
}) {
  return (
    <div
      className="relative rounded-2xl rounded-l-md border border-white/10 bg-white/3 p-4 sm:p-6 lg:p-7"
      style={{ borderLeft: `3px solid ${tier.color}` }}
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: tier.color, boxShadow: `0 0 8px ${tier.color}` }}
        />
        <span className="text-[11px] sm:text-xs font-medium tracking-normal" style={{ color: tier.color }}>
          {tier.name} activity
        </span>
      </div>

      <h3 className="text-lg sm:text-2xl lg:text-3xl font-display font-semibold text-white mb-3 sm:mb-4">
        {item.activity}
      </h3>

      <div className="pl-3 border-l border-white/15 mb-3 sm:mb-4">
        <span className="text-[10px] sm:text-xs text-white/40">Answers</span>
        <p className="text-sm sm:text-base lg:text-lg font-medium mt-0.5" style={{ color: tier.color }}>
          {item.question}
        </p>
      </div>

      <p className="text-white/65 text-xs sm:text-sm lg:text-base leading-relaxed">{item.description}</p>
    </div>
  );
}

export function InteractiveDemo() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelector('.qna-headline'),
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

  const activeItem = qnaList[selectedIndex];
  const activeTierIndex = useMemo(() => tierIndexFor(selectedIndex), [selectedIndex]);
  const activeTier = tiers[activeTierIndex];

  return (
    <section
      id="qna"
      ref={sectionRef}
      className="relative section-y overflow-hidden"
      aria-labelledby="qna-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 right-1/4 w-150 h-150 rounded-full bg-linear-to-br from-cyan-500/8 via-transparent to-amber-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-sm font-medium text-white/55 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-accent" />
            Service Activity Explanation
          </motion.span>
          <h2
            id="qna-heading"
            className="qna-headline font-display font-semibold text-fluid-h2 tracking-tight leading-tight text-white mb-4"
          >
            <span className="stellar-gradient-text">Answering Your Core Business Questions</span>
          </h2>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            Click any question below to see the exact SID service activity and deliverable designed to address it.
          </p>
        </div>

        {/* Escalation spine: the 11 questions grouped into the governance tiers
            the underlying activities already run through — routine ops at the
            bottom of the chain, leadership escalation at the top. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            <ol className="relative">
              <div className="absolute left-3 top-1 bottom-1 w-px overflow-hidden" aria-hidden="true">
                <motion.div
                  className="w-full h-full origin-top"
                  style={{ background: spineGradient, opacity: 0.4 }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {tiers.map((tier, tIdx) => {
                const startIndex = tierBoundaries[tIdx - 1] ?? 0;
                const items = qnaList.slice(startIndex, tierBoundaries[tIdx]);

                return (
                  <li key={tier.name} className="mb-6 last:mb-0">
                    <div className="relative flex items-center gap-2.5 pl-6.5 mb-2">
                      <TierMeter level={tIdx + 1} color={tier.color} />
                      <span
                        className="font-display text-[13px] sm:text-sm font-semibold"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </span>
                      <span className="text-[11px] sm:text-xs text-white/35">· {tier.tagline}</span>
                    </div>

                    <div className="space-y-1">
                      {items.map((item, localIdx) => {
                        const idx = startIndex + localIdx;
                        const active = idx === selectedIndex;
                        return (
                          <div key={item.question}>
                            <button
                              onClick={() => setSelectedIndex(idx)}
                              aria-current={active}
                              className="relative w-full text-left pl-6.5 pr-2 py-2 rounded-md transition-colors duration-200"
                            >
                              <span
                                className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-300"
                                style={{
                                  width: active ? 9 : 6,
                                  height: active ? 9 : 6,
                                  background: active ? tier.color : 'rgba(255,255,255,0.25)',
                                  boxShadow: active ? `0 0 10px ${tier.color}` : 'none',
                                }}
                                aria-hidden="true"
                              />
                              <span
                                className={cn(
                                  'text-[13px] sm:text-sm font-medium leading-snug transition-colors duration-200',
                                  active ? 'text-white' : 'text-white/55 hover:text-white/85'
                                )}
                              >
                                {item.question}
                              </span>
                            </button>

                            {/* Mobile/tablet: detail expands inline, right under the active question */}
                            <div className="lg:hidden">
                              <AnimatePresence initial={false}>
                                {active && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pl-6.5 pt-2 pb-1 pr-1">
                                      <DetailReadout item={item} tier={tier} />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Desktop: sticky readout beside the spine */}
          <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.activity}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <DetailReadout item={activeItem} tier={activeTier} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
