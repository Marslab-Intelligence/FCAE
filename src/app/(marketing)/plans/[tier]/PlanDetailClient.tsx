'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { 
  ShieldCheck, Gauge, Lock, Rocket, 
  Check, ArrowRight, Clock, Shield, Sparkles, 
  Activity, Cpu, DollarSign, ChevronRight, Zap,
  Layers, Globe2, ArrowUpRight, Network, BookOpen, Code2, Terminal,
  Award, Users, Calendar, TrendingUp, CheckCircle2
} from 'lucide-react';
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/components/CurrencyProvider';
import GlassSurface from '@/components/GlassSurface';

const ICON_MAP: Record<string, LucideIcon> = {
  'shield-check': ShieldCheck,
  'gauge': Gauge,
  'lock': Lock,
  'rocket': Rocket,
  'activity': Activity,
  'dollarsign': DollarSign,
  'cpu': Cpu,
  'zap': Zap,
  'shield': Shield,
  'clock': Clock,
  'layers': Layers,
  'globe': Globe2,
  'award': Award,
  'users': Users,
  'calendar': Calendar,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle2,
  'network': Network,
  'book-open': BookOpen,
  'code': Code2,
  'terminal': Terminal,
};

export function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName.toLowerCase()] || ShieldCheck;
}

export function RenderIcon({ name, className }: { name: string; className?: string }) {
  return React.createElement(getIconComponent(name), { className });
}

export type PlanKey = 'foundation' | 'care' | 'assure' | 'elite';

export interface PlanArchitectureService {
  icon: string;
  title: string;
  description: string;
}

export interface PlanDetail {
  id: PlanKey;
  name: string;
  category: string;
  tagline: string;
  heroTitle: string;
  heroSub: string;
  badge: string;
  priceMonthly: number;
  priceYearly: number;
  icon: string;
  video: string;
  bgPage: string;
  videoOpacity: string;
  heroOverlay: string;
  glow1: string;
  glow2: string;
  badgeTheme: string;
  accentText: string;
  accentBg: string;
  borderColor: string;
  cardHoverBorder: string;
  glowColor: string;
  sectionBg: string;
  meshBg: string;
  terminalTheme: string;
  badgeColor: string;
  stats: { value: string; label: string }[];
  features: string[];
  operationalSpecs: { title: string; desc: string; icon: string }[];
  coeActivities: string[];
  slaResponse: string;
  supportWindow: string;
  sdmAllocation: string;
  architectureServicesLeft?: PlanArchitectureService[];
  architectureServicesRight?: PlanArchitectureService[];
}

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

interface PlanDetailClientProps {
  plan: PlanDetail;
  planKey: PlanKey;
  allTiers: PlanKey[];
  allPlanDetails: Record<PlanKey, PlanDetail>;
}

export default function PlanDetailClient({
  plan,
  planKey,
  allTiers,
  allPlanDetails,
}: PlanDetailClientProps) {
  const { compact } = useCurrency();
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.08,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const topOrbY = useTransform(scrollYProgress, [0, 1], [30, -45]);
  const bottomOrbY = useTransform(scrollYProgress, [0, 1], [-25, 45]);

  // Floating tier-switcher bar: hide on scroll-down, reveal on scroll-up —
  // it's `fixed`, so without this it just sits on top of content forever.
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const [switcherHidden, setSwitcherHidden] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - lastScrollY.current;
    // Ignore tiny jitter (mobile momentum scroll, trackpad noise) and stay
    // visible near the very top regardless of direction.
    if (Math.abs(diff) > 4) {
      setSwitcherHidden(diff > 0 && latest > 120);
    }
    lastScrollY.current = latest;
  });

  // Left & Right Service items mapped dynamically per plan or falling back to default Cloud Operations
  const leftCloudServices = plan.architectureServicesLeft || [
    {
      icon: 'layers',
      title: 'Composable Infra',
      description: 'Modular primitives—auth, data, telemetry, and edge in one cohesive layer.',
    },
    {
      icon: 'globe',
      title: 'Global Orchestration',
      description: 'Multi-region mesh with sub-50ms routing so your global users feel local.',
    },
    {
      icon: 'shield',
      title: 'Trust-Native Security',
      description: 'Zero-trust defaults, encrypted pipelines, and continuous compliance audit trails.',
    },
  ];

  const rightCloudServices = plan.architectureServicesRight || [
    {
      icon: 'dollarsign',
      title: 'FinOps Optimization',
      description: 'Continuous rightsizing, savings plan reviews, and resource burn management.',
    },
    {
      icon: 'cpu',
      title: 'Autoscaling Governance',
      description: 'Kubernetes HPA tuning and infrastructure auto-expansion for heavy traffic spikes.',
    },
    {
      icon: 'activity',
      title: '24/7 War Room SLA',
      description: 'Real-time telemetry scanning with instant incident triage & guaranteed response.',
    },
  ];

  const counterStats = [
    { icon: Award, value: 150, suffix: '+', label: 'Cloud Projects' },
    { icon: Users, value: 1200, suffix: '+', label: 'Active Clusters' },
    { icon: Calendar, value: 12, suffix: ' Yrs', label: 'SLA Experience' },
    { icon: TrendingUp, value: 99, suffix: '.99%', label: 'Uptime Reliability' },
  ];

  return (
    <div className={cn('min-h-screen text-white overflow-x-hidden transition-colors duration-700', plan.bgPage)}>
      
      {/* ── Persistent Tier-Accented Floating Glass Package Switcher Bar ── */}
      <motion.div
        className="fixed top-24 z-50 w-full px-4 pointer-events-none"
        animate={{ y: switcherHidden ? -140 : 0, opacity: switcherHidden ? 0 : 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={9999}
          backgroundOpacity={0.15}
          blur={14}
          displace={10}
          distortionScale={-140}
          redOffset={4}
          greenOffset={12}
          blueOffset={22}
          saturation={2.0}
          className={cn(
            'mx-auto max-w-4xl rounded-full p-2 flex items-center justify-between pointer-events-auto border transition-all duration-500 shadow-2xl',
            plan.borderColor,
            plan.glowColor
          )}
        >
          {/* Inner Tier Switcher Track */}
          <div className="flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-xl rounded-full border border-white/15 overflow-x-auto no-scrollbar">
            {allTiers.map((tKey) => {
              const t = allPlanDetails[tKey];
              const isActive = tKey === planKey;
              return (
                <Link
                  key={tKey}
                  href={`/plans/${tKey}`}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 capitalize',
                    isActive
                      ? 'bg-white text-slate-950 shadow-[0_0_25px_rgba(255,255,255,0.7)] font-extrabold scale-[1.02]'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  )}
                >
                  <span className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all duration-300',
                    isActive ? 'bg-slate-950 scale-110' : t.accentText.replace('text-', 'bg-')
                  )} />
                  <span>{t.name}</span>
                  {tKey === 'assure' && (
                    <span className={cn(
                      'ml-1 text-[9px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider',
                      isActive
                        ? 'bg-slate-200/50 text-amber-800 border border-amber-600/30'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    )}>
                      Popular
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider & Action Button */}
          <div className="flex items-center shrink-0">
            <div className="h-6 w-px bg-white/20 mx-2 hidden sm:block" />
            <Link
              href={`/build?plan=${plan.id}`}
              className={cn(
                'hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 font-extrabold text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 shrink-0 active:scale-95 shadow-2xl',
                plan.glowColor
              )}
            >
              Customize {plan.name} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </GlassSurface>
      </motion.div>

      {/* ── Full-Screen Edge-to-Edge Kinetic Hero Section (UNTOUCHED BACKGROUND IMAGES/VIDEOS) ── */}
      <section className="relative w-full min-h-[92vh] lg:min-h-screen flex flex-col justify-between pt-48 md:pt-52 lg:pt-56 pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-white/10">
        
        {/* Background Full-Bleed Video (High Visibility Opacity & Ambient Glows - UNCHANGED) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-700 scale-105', plan.videoOpacity)}
            src={plan.video}
          />
          <div className={cn('absolute inset-0', plan.heroOverlay)} />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/40 via-slate-900/20 to-slate-950/40" />
          
          <div className={cn('absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full blur-[130px] opacity-70 pointer-events-none', plan.glow1)} />
          <div className={cn('absolute bottom-1/4 right-1/4 w-125 h-125 rounded-full blur-[130px] opacity-70 pointer-events-none', plan.glow2)} />
        </div>

        {/* Hero Top Meta Row - Positioned smoothly below floating bar with crystal legibility */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 mb-10 pt-2">
          <span className={cn('px-6 py-2.5 rounded-full text-xs font-mono font-extrabold tracking-widest border uppercase shadow-2xl backdrop-blur-2xl bg-slate-900/40', plan.badgeTheme)}>
            {plan.badge}
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-white font-semibold bg-slate-900/40 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/20 shadow-2xl">
            <Sparkles className={cn('w-4 h-4 animate-pulse', plan.accentText)} /> SID {plan.name} Architecture
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full my-auto">
          <div className="flex items-center gap-2.5 mb-3">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border shadow-xl backdrop-blur-2xl bg-slate-900/40', plan.accentBg)}>
              <RenderIcon name={plan.icon} className={cn('w-4.5 h-4.5', plan.accentText)} />
            </div>
            <span className={cn('font-display text-sm md:text-base font-bold tracking-wide uppercase drop-shadow-md', plan.accentText)}>
              {plan.name} Package Website
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white tracking-tight leading-[1.12] mb-5 max-w-3xl drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
            {plan.heroTitle}
          </h1>

          <div className="max-w-xl mb-6 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-2xl">
            <p className="text-sm md:text-base text-white/90 font-normal leading-relaxed drop-shadow-md">
              {plan.heroSub}
            </p>
          </div>

          {/* Pricing & CTA Row */}
          <div className="flex flex-wrap items-center gap-5 pt-5 border-t border-white/20 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-xl px-4.5 py-3 rounded-2xl border border-white/15 shadow-2xl">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-3xl lg:text-4xl text-white tracking-tight">
                  {compact(plan.priceYearly)}
                </span>
                <span className="text-white/70 text-sm">/ month</span>
              </div>
              <p className="text-[10px] text-white/80 mt-0.5">
                Billed yearly ({compact(plan.priceYearly * 12)}/yr) — <span className="text-emerald-400 font-semibold">Save 20%</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 ml-auto">
              <Link
                href={`/build?plan=${plan.id}`}
                className={cn('px-7 py-3.5 rounded-full bg-white text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide transition hover:scale-105 shadow-2xl flex items-center gap-2', plan.glowColor)}
              >
                Select & Build {plan.name} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white font-semibold text-xs sm:text-sm transition hover:bg-white/20 shadow-2xl"
              >
                Contact Solutions
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Stats Grid */}
        <div className="relative z-10 max-w-7xl mx-auto w-full mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {plan.stats.map((st) => (
              <div key={st.label} className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-white/15 shadow-2xl hover:border-white/30 transition">
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/60">{st.label}</p>
                <p className={cn('font-display text-xl lg:text-2xl font-extrabold mt-1', plan.accentText)}>{st.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REDESIGNED EDITORIAL ABOUT & ARCHITECTURE SHOWCASE SECTION ── */}
      <section
        ref={sectionRef}
        className={cn('relative isolate w-full overflow-hidden py-20 px-4 sm:px-6 lg:px-12 border-b border-white/10', plan.sectionBg)}
      >
        {/* Background Radial Orbs & Subtle Lines */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className={cn('absolute -left-28 top-12 h-72 w-72 rounded-full blur-3xl opacity-30', plan.glow1)}
            style={shouldReduceMotion ? undefined : { y: topOrbY }}
          />
          <motion.div
            className={cn('absolute -right-28 bottom-10 h-80 w-80 rounded-full blur-3xl opacity-30', plan.glow2)}
            style={shouldReduceMotion ? undefined : { y: bottomOrbY }}
          />
        </div>

        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-360 flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Header Area */}
          <motion.header
            className="mb-10 flex flex-col items-center gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left"
            variants={itemVariants}
          >
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center justify-center gap-2 lg:justify-start">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full border bg-white/10 backdrop-blur-md', plan.borderColor)}>
                  <Sparkles className={cn('h-3.5 w-3.5', plan.accentText)} />
                </span>
                <span className={cn('text-[11px] font-mono font-semibold uppercase tracking-[0.24em]', plan.accentText)}>
                  Discover {plan.name} Architecture
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-[3.2rem] font-extrabold tracking-tight leading-[1.05] text-white">
                Cloud environments engineered to{' '}
                <span className={cn('italic font-serif font-normal', plan.accentText)}>
                  scale without limits.
                </span>
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg lg:mx-0 font-light">
                We combine modular primitives, continuous FinOps governance, zero-trust security, and 24/7 war room operations into one cohesive experience.
              </p>
            </div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            >
              <Link
                href={`/build?plan=${plan.id}`}
                className={cn(
                  'group flex shrink-0 items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-2xl transition-all hover:bg-white/90',
                  plan.glowColor
                )}
              >
                Explore {plan.name} Architecture
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/40 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-3.5 w-3.5 text-slate-950" />
                </span>
              </Link>
            </motion.div>
          </motion.header>

          {/* Desktop 3-Column Content Layout */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)_minmax(0,1fr)] lg:items-center lg:gap-6 xl:gap-8 min-h-0 flex-1">
            
            {/* Left Services / Primitives Column */}
            <motion.div className="flex flex-col justify-center gap-4" variants={containerVariants}>
              {leftCloudServices.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  service={service}
                  index={index}
                  alignment="left"
                  plan={plan}
                />
              ))}
            </motion.div>

            {/* Center Showcase Image Card */}
            <motion.div variants={itemVariants}>
              <ImageCard plan={plan} />
            </motion.div>

            {/* Right Services / Primitives Column */}
            <motion.div className="flex flex-col justify-center gap-4" variants={containerVariants}>
              {rightCloudServices.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  service={service}
                  index={index}
                  alignment="right"
                  plan={plan}
                />
              ))}
            </motion.div>
          </div>

          {/* Tablet and Mobile Content Layout */}
          <div className="lg:hidden">
            <motion.div className="mb-6" variants={itemVariants}>
              <ImageCard plan={plan} />
            </motion.div>

            <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2" variants={containerVariants}>
              {[...leftCloudServices, ...rightCloudServices].map((service, index) => (
                <ServiceCard
                  key={service.title}
                  service={service}
                  index={index}
                  alignment="mobile"
                  plan={plan}
                />
              ))}
            </motion.div>
          </div>

          {/* Statistics Counter Cards Row */}
          <motion.div
            className="mt-12 grid grid-cols-2 gap-4 sm:mt-12 lg:grid-cols-4 lg:gap-4"
            variants={containerVariants}
          >
            {counterStats.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} plan={plan} />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Open Mesh & Ecosystem Stats Section ── */}
      <section className={cn('relative w-full py-24 px-4 sm:px-6 lg:px-12 border-b border-white/10', plan.meshBg)}>
        <div className="max-w-7xl mx-auto">
          <div className={cn('liquid-glass rounded-[48px] p-10 md:p-16 border bg-white/5 backdrop-blur-xl shadow-2xl', plan.borderColor)}>
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className={cn('text-xs font-mono font-semibold uppercase tracking-[0.25em]', plan.accentText)}>
                  Ecosystem & Mesh
                </p>
                <h2 className="mt-3 font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                  An Open Mesh for Builders & Enterprises
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/75 max-w-xl font-light">
                  Connect your cloud stack to {plan.name}—marketplace apps, certified partners, and shared governance for long-horizon roadmaps.
                </p>
                <Link
                  href="/build"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/20 hover:border-white/40 shadow-xl"
                >
                  Explore the Mesh Catalog
                  <ArrowUpRight className={cn('h-4 w-4', plan.accentText)} strokeWidth={2} />
                </Link>
              </div>

              <div className="space-y-5">
                {[
                  { icon: Sparkles, label: 'Intelligence Layer', stat: '12B+', detail: 'Inference & telemetry events orchestrated monthly across the mesh.' },
                  { icon: Network, label: 'Partner Mesh', stat: '240+', detail: 'Native cloud integrations from identity management to deep observability.' },
                  { icon: Cpu, label: 'Edge Fabric', stat: '48', detail: 'Global cloud regions with dedicated compute pools and private interconnects.' }
                ].map((pillar) => {
                  const PillarIcon = pillar.icon;
                  return (
                    <div
                      key={pillar.label}
                      className={cn('flex gap-6 rounded-3xl border bg-white/10 backdrop-blur-xl p-7 transition shadow-lg', plan.borderColor, plan.cardHoverBorder)}
                    >
                      <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border', plan.accentBg, plan.accentText)}>
                        <PillarIcon className="h-7 w-7" strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50">
                          {pillar.label}
                        </p>
                        <p className="mt-1 font-display text-3xl lg:text-4xl font-extrabold text-white">
                          {pillar.stat}
                        </p>
                        <p className="mt-1 text-sm text-white/70 font-light">{pillar.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Developer CLI Terminal & Blueprint Specs ── */}
      <section className={cn('relative w-full py-24 px-4 sm:px-6 lg:px-12 border-b border-white/10', plan.sectionBg)}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className={cn('text-xs font-mono font-semibold uppercase tracking-[0.25em]', plan.accentText)}>
                Developer Velocity & Specs
              </p>
              <h2 className="mt-3 font-display text-2xl md:text-4xl font-bold tracking-tight text-white">
                {plan.name} Cloud Blueprint
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/75 font-light">
                Everything your engineering team needs to integrate, extend, and operate on the {plan.name} tier.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-950 transition hover:bg-gray-100 shadow-xl"
            >
              Talk to Cloud Solutions
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-10">
            {[
              { icon: BookOpen, title: 'Quickstart Blueprint', excerpt: 'Deploy your first epoch cloud environment in under 10 minutes with our guided IaC templates.', cta: 'Read Quickstart' },
              { icon: Code2, title: 'API & Telemetry Specs', excerpt: 'REST, gRPC, and GraphQL endpoints for mesh registration, tokens, and workload scheduling.', cta: 'View API Reference' },
              { icon: Terminal, title: 'CLI & Automation SDKs', excerpt: 'TypeScript, Go, and Python clients with local cloud emulation and CI/CD-ready authentication.', cta: 'Install CLI' }
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={card.title}
                  className={cn('flex flex-col justify-between rounded-3xl border liquid-glass bg-white/10 backdrop-blur-xl p-8 transition shadow-xl', plan.borderColor, plan.cardHoverBorder)}
                >
                  <div>
                    <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl border mb-6', plan.accentBg, plan.accentText)}>
                      <CardIcon className="h-7 w-7" strokeWidth={1.75} />
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70 font-light">{card.excerpt}</p>
                  </div>
                  <Link
                    href={`/build?plan=${plan.id}`}
                    className={cn('mt-8 text-sm font-semibold flex items-center gap-2', plan.accentText)}
                  >
                    {card.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Interactive CLI Terminal Box */}
          <div className={cn('overflow-x-auto rounded-3xl border p-8 md:p-10 font-mono text-sm leading-relaxed shadow-2xl backdrop-blur-2xl', plan.terminalTheme)}>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
              <span className="text-xs text-white/50 ml-3">bash — sid-cloud-cli v2.4.0</span>
            </div>
            <code className="text-base">
              <span className="text-emerald-400">$</span> sid-cloud init --tier {plan.id} --environment production<br />
              <span className={plan.accentText}>✓</span> {plan.name} credentials & IAM policies configured<br />
              <span className={plan.accentText}>✓</span> Telemetry scanners active across us-east-1, eu-west-2, ap-south-1<br />
              <span className={plan.accentText}>✓</span> Escalation SLA active ({plan.supportWindow})<br />
              <span className="text-amber-300">→</span> View live environment topology: <span className="underline">https://sid-cloud.foundation/plans/{plan.id}</span>
            </code>
          </div>
        </div>
      </section>

      {/* ── Package Specifications Grid ── */}
      <section className={cn('relative w-full py-24 px-4 sm:px-6 lg:px-12 border-b border-white/10', plan.sectionBg)}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <span className={cn('text-xs font-mono font-semibold uppercase tracking-[0.25em]', plan.accentText)}>Operational Breakdown</span>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-3">
              What&apos;s Included in {plan.name}
            </h2>
            <p className="text-sm md:text-base text-white/70 mt-3 font-light">
              Comprehensive operational features engineered specifically for {plan.category.toLowerCase()} workloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plan.operationalSpecs.map((spec) => {
              const SpecIcon = getIconComponent(spec.icon);
              return (
                <div key={spec.title} className={cn('liquid-glass rounded-3xl p-8 border bg-white/10 backdrop-blur-xl flex flex-col justify-between transition-all shadow-xl', plan.borderColor, plan.cardHoverBorder)}>
                  <div>
                    <div className={cn('w-14 h-14 rounded-2xl border flex items-center justify-center mb-6', plan.accentBg, plan.accentText)}>
                      <SpecIcon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white mb-3">{spec.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed font-light">{spec.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Check List & SLA Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className={cn('liquid-glass rounded-3xl p-10 border bg-white/10 backdrop-blur-xl shadow-xl', plan.borderColor)}>
              <h3 className="font-display font-semibold text-2xl text-white mb-8 flex items-center gap-3">
                <Check className={cn('w-6 h-6', plan.accentText)} /> Feature Checklist
              </h3>
              <ul className="space-y-5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-4 text-base text-white/90 leading-relaxed font-light">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-md', plan.accentBg)}>
                      <Check className={cn('w-3.5 h-3.5', plan.accentText)} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <div className={cn('liquid-glass rounded-3xl p-10 border bg-white/10 backdrop-blur-xl shadow-xl', plan.borderColor)}>
                <h3 className="font-display font-semibold text-2xl text-white mb-6 flex items-center gap-3">
                  <Clock className={cn('w-6 h-6', plan.accentText)} /> Service Commitments & SLAs
                </h3>
                <div className="space-y-5 text-base">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-white/60">Incident SLA Response</span>
                    <span className={cn('font-mono font-semibold text-lg', plan.accentText)}>{plan.slaResponse}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-white/60">Support Hours Window</span>
                    <span className="font-mono font-semibold text-white">{plan.supportWindow}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-white/60">SDM Allocation</span>
                    <span className="font-mono font-semibold text-white">{plan.sdmAllocation}</span>
                  </div>
                </div>
              </div>

              <div className={cn('liquid-glass rounded-3xl p-10 border bg-white/10 backdrop-blur-xl shadow-xl', plan.borderColor)}>
                <h3 className="font-display font-semibold text-2xl text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-300" /> Center of Excellence (COE) Activities
                </h3>
                <div className="space-y-3">
                  {plan.coeActivities.map((act) => (
                    <div key={act} className="flex items-center gap-3 text-sm text-white/85 bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                      <ChevronRight className={cn('w-4 h-4 shrink-0', plan.accentText)} />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Callout & Builder Navigation ── */}
      <section className={cn('relative w-full py-24 px-4 sm:px-6 lg:px-12', plan.sectionBg)}>
        <div className="max-w-7xl mx-auto">
          <div className={cn('liquid-glass rounded-[48px] p-12 md:p-20 border text-center flex flex-col items-center shadow-2xl relative overflow-hidden bg-white/5 backdrop-blur-xl', plan.borderColor)}>
            <div className={cn('absolute inset-0 opacity-40 pointer-events-none', plan.meshBg)} />
            <span className={cn('text-xs font-mono font-semibold uppercase tracking-[0.25em] mb-3', plan.accentText)}>Ready to Deploy {plan.name}?</span>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl text-white mb-4 tracking-tight max-w-3xl leading-tight">
              Customize & Build Your Dedicated {plan.name} Website Package
            </h2>
            <p className="text-base text-white/80 max-w-xl mb-8 font-light">
              Add optional specialized add-ons (DevOps, FinOps, Security Governance) to your {plan.name} package in our interactive package builder.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
              <Link
                href={`/build?plan=${plan.id}`}
                className={cn('px-8 py-4 rounded-full bg-white text-slate-950 font-extrabold text-sm transition hover:scale-105 shadow-2xl flex items-center gap-2.5', plan.glowColor)}
              >
                Open Package Builder with {plan.name} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/plans"
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm transition hover:bg-white/20"
              >
                Compare All 4 Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Service Card Component ── */
interface ServiceCardProps {
  service: { icon: LucideIcon | string; title: string; description: string };
  index: number;
  alignment: 'left' | 'right' | 'mobile';
  plan: PlanDetail;
}

function ServiceCard({ service, index, alignment, plan }: ServiceCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const isLeft = alignment === 'left';

  return (
    <motion.article
      className={cn(
        'group relative overflow-hidden rounded-[24px] border bg-white/10 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300',
        plan.borderColor,
        plan.cardHoverBorder,
        'lg:min-h-27.5',
        isLeft ? 'lg:text-right' : ''
      )}
      variants={itemVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className={cn('flex items-start gap-4', isLeft ? 'lg:flex-row-reverse' : '')}>
        <motion.div
          className={cn('relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-inner transition-colors duration-300', plan.accentBg, plan.accentText)}
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: [0, -6, 6, 0],
                  transition: { duration: 0.45 },
                }
          }
        >
          {typeof service.icon === 'string' ? (
            <RenderIcon name={service.icon} className="h-6 w-6" />
          ) : (
            <service.icon className="h-6 w-6" />
          )}
          <CheckCircle2 className={cn('absolute -right-1 -top-1 h-4 w-4 fill-slate-950', plan.accentText)} />
        </motion.div>

        <div className="min-w-0">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-white">
            {service.title}
          </h3>
          <p className="text-xs leading-relaxed text-white/70 font-light xl:text-sm">
            {service.description}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'absolute bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-24',
          plan.accentText.replace('text-', 'bg-'),
          isLeft ? 'right-6' : 'left-6'
        )}
      />
    </motion.article>
  );
}

/* ── Image Card Component ── */
function ImageCard({ plan }: { plan: PlanDetail }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="group relative mx-auto h-95 w-full max-w-135 sm:h-115 lg:h-[46vh] lg:min-h-92.5 lg:max-h-130"
      whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={cn('relative h-full overflow-hidden rounded-[32px] border bg-white/10 backdrop-blur-xl shadow-2xl', plan.borderColor)}>
        <motion.img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90"
          alt="Modern Architecture & Managed Infrastructure"
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
          initial={{ scale: 1.07 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-900/20 to-transparent" />

        {/* Glass Badge */}
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/30 bg-slate-900/40 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-white backdrop-blur-xl shadow-lg">
          <span className={cn('h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]', plan.accentText.replace('text-', 'bg-'))} />
          {plan.name} Architecture
        </div>

        {/* Card Content Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
          <div className="mb-2.5 flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-white/70">
            <span className="h-px w-8 bg-white/60" />
            Selected Architecture Showcase
          </div>

          <div className="flex items-end justify-between gap-4">
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl leading-snug">
              Calm, refined and<br />
              naturally connected.
            </h3>

            <motion.button
              type="button"
              aria-label="View architecture specs"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white text-slate-950 shadow-xl"
              whileHover={shouldReduceMotion ? undefined : { rotate: -12, scale: 1.08 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Floating Glow */}
      <motion.div
        className={cn('pointer-events-none absolute -right-4 top-[20%] h-16 w-16 rounded-full blur-xl opacity-50', plan.glow1)}
        animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/* ── Spring Counter Stat Card Component ── */
function StatCard({ stat, index, plan }: { stat: { icon: LucideIcon; value: number; suffix: string; label: string }; index: number; plan: PlanDetail }) {
  const counterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(counterRef, { once: true, amount: 0.45 });
  const Icon = stat.icon;
  const motionValue = useMotionValue(0);

  const springValue = useSpring(motionValue, { stiffness: 55, damping: 18, mass: 0.8 });
  const displayedValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      motionValue.set(stat.value);
    }
  }, [isInView, motionValue, stat.value]);

  return (
    <motion.div
      ref={counterRef}
      className={cn(
        'group flex min-h-22.5 items-center gap-4 rounded-[24px] border bg-white/10 p-4 backdrop-blur-xl shadow-xl transition-colors duration-300 hover:bg-white/20',
        plan.borderColor,
        plan.cardHoverBorder
      )}
      variants={itemVariants}
      transition={{ delay: index * 0.06 }}
    >
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105', plan.accentBg, plan.accentText)}>
        <Icon className="h-6 w-6" />
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          <motion.span>{displayedValue}</motion.span>
          <span className={plan.accentText}>{stat.suffix}</span>
        </div>
        <p className="truncate text-[11px] font-mono uppercase tracking-wider text-white/60 sm:text-[12px]">
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
}
