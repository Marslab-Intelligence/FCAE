'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Target, Heart, Zap, Shield,
  Users, Globe, Award, TrendingUp, Star, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { value: '200+', label: 'Enterprises Served', icon: Building2 },
  { value: '99.98%', label: 'Average Uptime SLA', icon: TrendingUp },
  { value: '₹500Cr+', label: 'Cloud Cost Saved', icon: Star },
  { value: '12+', label: 'Years of Excellence', icon: Award },
];

const values = [
  {
    icon: Target,
    title: 'Customer Obsession',
    desc: 'Every decision starts and ends with what\'s best for our clients. We measure success by your outcomes, not our outputs.',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: Shield,
    title: 'Security First',
    desc: 'We treat your infrastructure with the same care and rigor as our own. Security and compliance are non-negotiable.',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Engineering Excellence',
    desc: 'We employ cloud-native practitioners who live and breathe AWS, Azure, and GCP at enterprise scale every day.',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    icon: Heart,
    title: 'Radical Transparency',
    desc: 'No hidden fees, no surprise bills. We show you exactly what we do, when we do it, and what it costs.',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    iconColor: 'text-purple-400',
  },
];

const team = [
  { name: 'Rohan Mehta', role: 'Founder & CEO', exp: 'Ex-AWS Principal Solutions Architect', initials: 'RM' },
  { name: 'Priya Nair', role: 'CTO & Co-Founder', exp: 'Ex-Google Cloud Staff Engineer', initials: 'PN' },
  { name: 'Arjun Sharma', role: 'VP of Delivery', exp: '15+ years enterprise cloud operations', initials: 'AS' },
  { name: 'Divya Krishnan', role: 'Head of FinOps', exp: 'FinOps Foundation Board Member', initials: 'DK' },
  { name: 'Suresh Iyer', role: 'Head of Security', exp: 'CISSP, Ex-KPMG Cyber Practice', initials: 'SI' },
  { name: 'Meera Pillai', role: 'Head of Customer Success', exp: 'Managing ₹2000Cr+ cloud portfolios', initials: 'MP' },
];

const milestones = [
  { year: '2012', event: 'Founded in Bangalore with a mission to democratize enterprise cloud operations' },
  { year: '2015', event: 'Achieved AWS Advanced Consulting Partner status; first 50 enterprise clients' },
  { year: '2018', event: 'Launched proprietary FinOps dashboard; saved clients ₹100Cr in first year' },
  { year: '2020', event: 'Expanded to Azure & GCP; launched Security Governance practice' },
  { year: '2022', event: 'Crossed 150 enterprise clients; launched 24/7 Elite support tier' },
  { year: '2024', event: 'Serving 200+ enterprises with ₹500Cr+ cumulative cloud savings delivered' },
];

const certifications = [
  'AWS Advanced Consulting Partner',
  'Microsoft Azure Expert MSP',
  'Google Cloud Premier Partner',
  'ISO 27001:2022 Certified',
  'SOC 2 Type II Compliant',
  'FinOps Certified Practitioner',
];

import { Building2 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function AboutPage() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const timelineFillRef = useRef<HTMLDivElement | null>(null);
  const timelineItemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const wrap = timelineRef.current;
    if (!wrap) return;

    // Respect reduced-motion: leave the CSS default (everything visible,
    // fill line fully drawn) alone and skip the observer entirely.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Opt into the hidden-until-revealed CSS states. If this effect never
    // runs (JS disabled/fails), the timeline stays in its static, fully
    // visible default state.
    wrap.classList.add('timeline-js');
    const fill = timelineFillRef.current;
    if (fill) fill.style.height = '0px';

    const items = timelineItemRefs.current.filter((el): el is HTMLDivElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLDivElement;
          target.classList.add('is-visible');

          // Grow the connecting line to reach this item's dot — recomputed
          // only on reveal, never on scroll.
          if (fill) {
            const dot = target.querySelector<HTMLElement>('.timeline-dot');
            if (dot) {
              const reach = dot.offsetTop + dot.offsetHeight / 2 - wrap.offsetTop;
              fill.style.height = `${Math.max(reach, 0)}px`;
            }
          }

          observer.unobserve(target);
        }
      },
      { threshold: 0.25 }
    );

    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-125 h-125 rounded-full bg-linear-to-br from-accent/10 to-purple-600/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-100 h-100 rounded-full bg-linear-to-br from-emerald-500/8 to-teal-500/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-sm font-medium text-white/90 mb-8"
          >
            <Users className="w-4 h-4 text-accent" />
            Our Story
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6"
          >
            Built by cloud engineers,{' '}
            <span className="text-gradient-accent">for enterprise scale</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-xl text-white/85 max-w-3xl mx-auto leading-relaxed"
          >
            SID Managed Cloud was founded by practitioners who spent years inside AWS, Google Cloud, and Microsoft Azure. We built the service we always wanted — one that treats cloud operations as a strategic business function, not a cost center.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="section-y border-y border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <p className="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/85 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.span
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-sm font-medium text-white/90 mb-6"
              >
                <Target className="w-4 h-4 text-accent" /> Our Mission
              </motion.span>
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
                className="font-display font-semibold text-fluid-h2 tracking-tight leading-tight text-white mb-6"
              >
                Making enterprise cloud <span className="text-gradient-accent">simple and predictable</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={2}
                className="text-lg text-white/85 leading-relaxed mb-8"
              >
                We believe every organization deserves access to world-class cloud expertise — not just the Fortune 500. Our managed services model gives mid-market and enterprise companies the same operational rigor that tech giants build in-house, at a fraction of the cost.
              </motion.p>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={3}
                className="space-y-3"
              >
                {['Transparent pricing with no hidden fees', 'Dedicated cloud engineers, not ticket-based support', 'Proactive operations before issues become incidents', 'Strategic partnership, not just vendor management'].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-white/90 text-sm">{point}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i * 0.5}
                  className={cn('p-6 rounded-3xl border bg-linear-to-br transition-all hover:scale-[1.02]', v.color)}
                >
                  <div className={cn('w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-4', v.iconColor)}>
                    <v.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section-y border-y border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-xs uppercase tracking-widest text-white/70 font-semibold mb-8"
          >
            Industry Certifications & Partnerships
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/15 text-sm font-medium text-white/90 hover:border-accent/30 hover:text-white transition-all"
              >
                {cert}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-y">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-display font-semibold text-fluid-h2 tracking-tight text-white mb-4"
            >
              Our <span className="text-gradient-accent">Journey</span>
            </motion.h2>
            <p className="text-white/85 text-lg">A decade of cloud excellence</p>
          </div>
          <div ref={timelineRef} className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white/15 to-transparent" />
            <div
              ref={timelineFillRef}
              className="timeline-fill absolute left-6 md:left-1/2 top-0 w-px bg-linear-to-b from-accent to-cyan-400"
              aria-hidden="true"
            />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  ref={(el) => { timelineItemRefs.current[i] = el; }}
                  className={cn(
                    'timeline-item flex gap-8 md:gap-0',
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse timeline-item--reverse'
                  )}
                >
                  <div className={cn('hidden md:block md:w-1/2 py-4', i % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12')}>
                    <span className="timeline-year font-display font-bold text-3xl lg:text-5xl text-white drop-shadow-[0_0_20px_rgba(167,139,250,0.8)]">{m.year}</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="timeline-dot relative w-14 h-14 flex items-center justify-center z-10 shrink-0">
                      <span className="timeline-dot-ring absolute inset-0 rounded-full" aria-hidden="true" />
                      <span className="timeline-dot-halo absolute inset-0 rounded-full" aria-hidden="true" />
                      <span className="timeline-dot-core relative w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{m.year.slice(2)}</span>
                      </span>
                    </div>
                  </div>
                  <div className={cn('timeline-text md:w-1/2 py-4', i % 2 === 0 ? 'pl-8 md:pl-12' : 'md:pr-12')}>
                    <span className="md:hidden text-white font-bold font-display">{m.year}: </span>
                    <p className="text-white/90 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-y border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-display font-semibold text-fluid-h2 tracking-tight text-white mb-4"
            >
              Leadership <span className="text-gradient-accent">Team</span>
            </motion.h2>
            <p className="text-white/85 text-lg max-w-2xl mx-auto">
              Practitioners who&apos;ve operated cloud at the world&apos;s largest tech companies.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                className="p-6 rounded-3xl bg-white/4 border border-white/10 hover:border-accent/30 hover:bg-white/6 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-accent to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-4 group-hover:scale-105 transition-transform">
                  {member.initials}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-0.5">{member.name}</h3>
                <p className="text-accent text-sm font-medium mb-2">{member.role}</p>
                <p className="text-xs text-white/80 leading-relaxed">{member.exp}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/20"
          >
            <h2 className="font-display font-semibold text-fluid-h2 tracking-tight text-white mb-4">
              Ready to transform your <span className="text-gradient-accent">cloud operations?</span>
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto">
              Join 200+ enterprises who&apos;ve trusted SID Managed Cloud to handle their most critical infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/plans"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold text-base hover:from-accent-glow hover:to-purple-500 shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-all"
              >
                Explore Plans <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/15 text-white font-semibold text-base hover:bg-white/8 transition-all"
              >
                Talk to Sales <Globe className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
