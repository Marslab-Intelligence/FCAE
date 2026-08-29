'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Landmark, ShoppingCart, Factory, Building2, Plane, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const industries = [
  {
    id: 'healthcare',
    icon: Heart,
    title: 'Healthcare & Life Sciences',
    desc: 'HIPAA-compliant cloud infrastructure for hospitals, diagnostic chains, and health-tech platforms.',
    challenges: ['Patient data security & HIPAA compliance', 'Medical imaging storage at scale', 'HL7/FHIR data integration', 'High-availability for critical systems'],
    clients: 'Hospital chains, diagnostic labs, health-tech, pharma',
    color: 'from-red-500/15 to-rose-500/10 border-red-500/25',
    iconColor: 'bg-red-500/20 text-red-400',
  },
  {
    id: 'finance',
    icon: Landmark,
    title: 'Financial Services',
    desc: 'Secure, compliant cloud for banks, NBFCs, insurance companies, and fintech innovators.',
    challenges: ['RBI/SEBI compliance requirements', 'Core banking on cloud migration', 'Real-time fraud detection at scale', 'Data residency & sovereignty'],
    clients: 'Banks, NBFCs, insurers, payment gateways, fintech',
    color: 'from-blue-500/15 to-indigo-500/10 border-blue-500/25',
    iconColor: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'retail',
    icon: ShoppingCart,
    title: 'Retail & E-Commerce',
    desc: 'Auto-scaling platforms built to handle flash sales, festive seasons, and rapid growth.',
    challenges: ['10x traffic spikes during sales', 'Real-time inventory management', 'Omnichannel customer experience', 'Payment gateway high availability'],
    clients: 'D2C brands, marketplaces, omnichannel retailers',
    color: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/25',
    iconColor: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'manufacturing',
    icon: Factory,
    title: 'Manufacturing & Industry',
    desc: 'Smart manufacturing cloud connecting factory floors, supply chains, and enterprise systems.',
    challenges: ['Legacy system cloud migration', 'IIoT sensor data ingestion', 'ERP integration on cloud', 'Factory floor connectivity'],
    clients: 'Industrial conglomerates, auto manufacturers, FMCG',
    color: 'from-amber-500/15 to-orange-500/10 border-amber-500/25',
    iconColor: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'real-estate',
    icon: Building2,
    title: 'Real Estate & PropTech',
    desc: 'Scalable platforms for property portals, smart buildings, and real estate management.',
    challenges: ['Property listing scalability', 'GIS & mapping integrations', 'Payment collection systems', 'IoT for smart buildings'],
    clients: 'Property portals, developers, PropTech startups',
    color: 'from-purple-500/15 to-violet-500/10 border-purple-500/25',
    iconColor: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'travel',
    icon: Plane,
    title: 'Travel & Hospitality',
    desc: 'Resilient reservation systems and booking platforms that scale with demand.',
    challenges: ['Real-time availability & pricing', 'GDS system integrations', 'Peak season capacity', 'Mobile-first guest experience'],
    clients: 'OTAs, hotel chains, airlines, travel-tech',
    color: 'from-cyan-500/15 to-sky-500/10 border-cyan-500/25',
    iconColor: 'bg-cyan-500/20 text-cyan-400',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function IndustriesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-16 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-linear-to-r from-accent/8 to-purple-600/5 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-8">
            <Building2 className="w-4 h-4 text-accent" /> Industries We Serve
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6">
            Cloud solutions tailored to <span className="text-gradient-accent">your industry</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            We understand that every industry has unique compliance, scalability, and operational requirements. Our managed cloud practice is shaped by deep vertical expertise.
          </motion.p>
        </div>
      </section>

      {/* Industries */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.id}
              id={industry.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.1}
              className={cn('p-8 md:p-10 rounded-3xl border bg-linear-to-br transition-all hover:scale-[1.005]', industry.color)}
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4', industry.iconColor)}>
                    <industry.icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-display font-semibold text-2xl text-white mb-2">{industry.title}</h2>
                  <p className="text-white/55 text-sm leading-relaxed mb-4">{industry.desc}</p>
                  <p className="text-xs text-white/45">
                    <span className="font-semibold text-white/55">Typical clients: </span>{industry.clients}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-4">Key Challenges We Solve</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {industry.challenges.map((c) => (
                      <div key={c} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-white/55">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white text-sm font-medium hover:bg-white/12 transition-all"
                    >
                      Talk to our {industry.title.split('&')[0].trim()} specialist <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-y border-t border-white/8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/20"
          >
            <h2 className="font-display font-semibold text-fluid-h2 text-white mb-4">Don&apos;t see your industry?</h2>
            <p className="text-white/55 mb-8 max-w-xl mx-auto">Our cloud engineering practice serves businesses across all verticals. Let&apos;s discuss your specific requirements.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-all">
              Start a Conversation <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
