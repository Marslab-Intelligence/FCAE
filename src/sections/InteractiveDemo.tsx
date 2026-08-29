'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { useReveal } from '@/hooks/useGSAP';
import { DURATION_REVEAL, STAGGER_UNIT } from '@/lib/motion';
import { HelpCircle, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';

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

  useReveal('#qna .reveal-row', {
    y: 16,
    duration: DURATION_REVEAL,
    stagger: STAGGER_UNIT,
    ease: 'power3.out',
  });

  const activeItem = qnaList[selectedIndex];

  return (
    <section
      id="qna"
      ref={sectionRef}
      className="relative py-12 lg:py-20 overflow-hidden"
      aria-labelledby="qna-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 right-1/4 w-150 h-150 rounded-full bg-linear-to-r from-accent/10 via-transparent to-purple-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-xs sm:text-sm font-medium text-white/60 mb-3 sm:mb-4"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            Service Activity Explanation
          </motion.span>
          <h2
            id="qna-heading"
            className="qna-headline font-display font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight text-white mb-2 sm:mb-3"
          >
            <span className="stellar-gradient-text">Answering Your Core Business Questions</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Click any question below to see the exact SID service activity and deliverable designed to address it.
          </p>
        </div>

        {/* Q&A Interactive Accordion / Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Question List - Adaptively scaled max height so it fits any screen height cleanly */}
          <div
            className="lg:col-span-5 space-y-1.5 sm:space-y-2 max-h-[46vh] sm:max-h-[50vh] lg:max-h-110 overflow-y-auto pr-1.5 custom-scrollbar"
            data-lenis-prevent
          >
            {qnaList.map((item, idx) => (
              <button
                key={item.question}
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  'reveal-row w-full text-left py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2.5',
                  selectedIndex === idx
                    ? 'bg-accent/15 border-accent text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0', selectedIndex === idx ? 'text-accent' : 'text-white/40')} />
                  <span className="text-xs sm:text-sm font-medium leading-snug truncate">{item.question}</span>
                </div>
                <ChevronRight className={cn('w-3.5 h-3.5 shrink-0 transition-transform', selectedIndex === idx && 'translate-x-1 text-accent')} />
              </button>
            ))}
          </div>

          {/* Active Detail Showcase Card */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.activity}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-linear-to-bl from-accent/20 via-transparent to-transparent pointer-events-none rounded-bl-full" />

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Corresponding SID Activity
                </div>

                <h3 className="text-lg sm:text-2xl lg:text-3xl font-display font-semibold text-white mb-3 sm:mb-4">
                  {activeItem.activity}
                </h3>

                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs font-semibold text-white/45 uppercase tracking-wider block mb-1">
                    Primary Question Answered
                  </span>
                  <p className="text-sm sm:text-base lg:text-lg font-medium text-accent italic">
                    {activeItem.question}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-semibold text-white/45 uppercase tracking-wider block">
                    Short Description
                  </span>
                  <p className="text-white/70 text-xs sm:text-sm lg:text-base leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}