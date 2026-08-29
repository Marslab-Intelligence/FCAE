'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReveal } from '@/hooks/useGSAP';
import { DURATION_REVEAL, STAGGER_UNIT } from '@/lib/motion';
import { Calendar, Check } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const reviewsData = [
  { activity: 'Monthly Service Report', foundation: 'Monthly', care: 'Monthly', assure: 'Monthly', elite: 'Monthly' },
  { activity: 'Service Review Meeting', foundation: 'Half-Yearly', care: 'Quarterly', assure: 'Every 2 Months', elite: 'Monthly' },
  { activity: 'Operational Review', foundation: '—', care: 'Quarterly', assure: 'Every 2 Months', elite: 'Monthly' },
  { activity: 'Success Manager Participation', foundation: '—', care: 'Quarterly', assure: 'Every 2 Months', elite: 'Monthly' },
  { activity: 'Solution Architect Participation', foundation: 'On Demand', care: 'Quarterly', assure: 'Every 2 Months', elite: 'Monthly' },
  { activity: 'Onsite Review', foundation: '—', care: 'Half-Yearly', assure: 'Quarterly', elite: 'Quarterly' },
  { activity: 'Executive Review', foundation: '—', care: '—', assure: 'Quarterly', elite: 'Quarterly' },
  { activity: 'Quarterly Business Review (QBR)', foundation: '—', care: '—', assure: 'Quarterly', elite: 'Quarterly' },
  { activity: 'Technology Roadmap Review', foundation: '—', care: '—', assure: 'Half-Yearly', elite: 'Quarterly' },
  { activity: 'Executive Business Review', foundation: '—', care: '—', assure: '—', elite: 'Quarterly' },
  { activity: 'Leadership Escalation Path', foundation: '—', care: '—', assure: '—', elite: '✓' },
];

export function Integrations() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelector('.reviews-headline'),
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

  useReveal('#reviews .reveal-row', {
    y: 16,
    duration: DURATION_REVEAL,
    stagger: STAGGER_UNIT,
    ease: 'power3.out',
  });

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative section-y overflow-hidden"
      aria-labelledby="reviews-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full bg-linear-to-r from-blue-500/10 via-transparent to-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-sm font-medium text-white/55 mb-6"
          >
            <Calendar className="w-4 h-4 text-accent" />
            Executive Cadence & Oversight
          </motion.span>
          <h2
            id="reviews-heading"
            className="reviews-headline font-display font-semibold text-fluid-h2 tracking-tight leading-tight text-white mb-4"
          >
            Service Reviews & <span className="text-gradient-accent">Executive Engagement</span>
          </h2>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            Structured engagement model ensuring operational visibility, architect support, and executive alignment.
          </p>
        </div>

        {/* Reviews Cadence Table */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-semibold text-white">Engagement Frequency</h3>
              <p className="text-sm text-white/55">Cadence of reporting, reviews, and architecture sessions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-4 px-6 text-sm font-semibold text-white">Review / Engagement Activity</th>
                  <th className="py-4 px-6 text-sm font-semibold text-blue-400 text-center w-1/5">Foundation</th>
                  <th className="py-4 px-6 text-sm font-semibold text-emerald-400 text-center w-1/5">Care</th>
                  <th className="py-4 px-6 text-sm font-semibold text-amber-400 text-center w-1/5">Assure</th>
                  <th className="py-4 px-6 text-sm font-semibold text-purple-400 text-center w-1/5">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {reviewsData.map((row) => (
                  <tr key={row.activity} className="reveal-row hover:bg-white/[0.07] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{row.activity}</td>
                    <td className="py-4 px-6 text-center font-medium text-white/55">{row.foundation}</td>
                    <td className="py-4 px-6 text-center font-medium text-white/55">{row.care}</td>
                    <td className="py-4 px-6 text-center font-medium text-white/55">{row.assure}</td>
                    <td className="py-4 px-6 text-center font-semibold text-purple-300">
                      {row.elite === '✓' ? <Check className="w-5 h-5 text-purple-400 mx-auto" /> : row.elite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}