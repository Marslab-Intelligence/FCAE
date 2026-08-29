'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Gauge, Lock, Rocket } from 'lucide-react';
import { CircularCarousel, type CarouselItem } from '@/components/ui/circular-carousel';
import { cn } from '@/lib/utils';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Plan3DScene = dynamic(() => import('@/components/three/Plan3DScene'), {
  ssr: false,
});

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface PlanDetail {
  id: string;
  name: string;
  category: string;
  title: string;
  description: string;
  supportWindow: string;
  p1Response: string;
  fairUsage: string;
  tag: string;
  accentText: string;
  accentBg: string;
  badgeBg: string;
  borderColor: string;
  icon: typeof ShieldCheck;
}

const PLAN_DETAILS: PlanDetail[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    category: 'RELIABLE OPERATIONS',
    title: 'Keep every environment running, without disruption',
    description: 'Reliable cloud support and access to FCAE expertise—monitoring, incident assistance, and cost visibility on a 9×5 support window.',
    supportWindow: '9 × 5',
    p1Response: '1 hour',
    fairUsage: '15/mo',
    tag: 'Operate Stage',
    accentText: 'text-cyan-400',
    accentBg: 'from-cyan-500/30 via-blue-500/20 to-transparent',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    borderColor: 'border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)]',
    icon: ShieldCheck,
  },
  {
    id: 'care',
    name: 'Care',
    category: 'COST & PERFORMANCE OPTIMIZATION',
    title: 'Maximize operational efficiency and cloud cost savings',
    description: 'Proactive workload rightsizing, performance optimization, savings plan reviews, and spend analytics with 12×5 support coverage.',
    supportWindow: '12 × 5',
    p1Response: '45 mins',
    fairUsage: '25/mo',
    tag: 'Optimize Stage',
    accentText: 'text-emerald-400',
    accentBg: 'from-emerald-500/30 via-teal-500/20 to-transparent',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    borderColor: 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    icon: Gauge,
  },
  {
    id: 'assure',
    name: 'Assure',
    category: 'GOVERNANCE & SECURITY RISK MITIGATION',
    title: 'Full threat monitoring, compliance, and governance',
    description: 'Continuous intrusion detection, automated compliance scanning, risk mitigation, and dedicated Service Delivery Manager guidance.',
    supportWindow: '16 × 6',
    p1Response: '30 mins',
    fairUsage: '40/mo',
    tag: 'Govern Stage',
    accentText: 'text-amber-400',
    accentBg: 'from-amber-500/30 via-orange-500/20 to-transparent',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    borderColor: 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    icon: Lock,
  },
  {
    id: 'elite',
    name: 'Elite',
    category: 'STRATEGIC MODERNIZATION & TRANSFORMATION',
    title: '24×7 dedicated engineering with zero-downtime SLAs',
    description: 'Strategic technology modernization with automated backups, cross-region failover, executive leadership escalation, and unlimited P1 response.',
    supportWindow: '24 × 7',
    p1Response: '15 mins',
    fairUsage: 'Unlimited',
    tag: 'Transform Stage',
    accentText: 'text-purple-400',
    accentBg: 'from-purple-500/30 via-pink-500/20 to-transparent',
    badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    borderColor: 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.25)]',
    icon: Rocket,
  },
];

const PLAN_BG_KEYS = ['foundation', 'care', 'assure', 'elite'] as const;

/** Dynamic, plan-themed animated background overlay that cross-fades seamlessly as a fluid gradient */
function PlanBackground({ planId }: { planId: string }) {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-transparent"
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
      }}
    >
      {PLAN_BG_KEYS.map((key) => {
        const isActive = planId === key;
        return (
          <motion.div
            key={key}
            initial={{ opacity: key === 'foundation' ? 1 : 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {key === 'foundation' && (
              <div className="absolute inset-0 w-full h-full bg-transparent">
                {/* Foundation: Electric Blue & Cyan Operational Tech Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.35),rgba(14,165,233,0.18)_40%,transparent_80%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                
                {/* Animated Cyan Pulse Orbs */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-lg h-128 rounded-full bg-cyan-500/25 blur-3xl"
                />
                <motion.div
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.25, 0.6, 0.25] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1/4 right-1/4 w-136 h-136 rounded-full bg-blue-600/25 blur-3xl"
                />

                {/* SVG Operational HUD Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <circle cx="50%" cy="50%" r="380" stroke="url(#blueGrad)" strokeWidth="1.5" fill="none" strokeDasharray="6 6" />
                  <circle cx="50%" cy="50%" r="240" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.3" />
                </svg>
              </div>
            )}

            {key === 'care' && (
              <div className="absolute inset-0 w-full h-full bg-transparent">
                {/* Care: Neon Emerald & Teal Performance Growth Matrix */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.35),rgba(20,184,166,0.18)_40%,transparent_80%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[24px_24px] opacity-25 mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Animated Emerald Aura Orbs */}
                <motion.div
                  animate={{ y: [0, -35, 0], opacity: [0.35, 0.75, 0.35] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/3 left-1/3 w-136 h-136 rounded-full bg-emerald-500/30 blur-3xl"
                />
                <motion.div
                  animate={{ y: [0, 35, 0], opacity: [0.25, 0.6, 0.25] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1/3 right-1/3 w-lg h-128 rounded-full bg-teal-400/25 blur-3xl"
                />

                {/* SVG Performance Growth Curves */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,320 Q400,120 800,320 T1600,320" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.45" />
                  <path d="M0,370 Q400,220 800,370 T1600,370" stroke="#14b8a6" strokeWidth="1.5" fill="none" opacity="0.35" />
                </svg>
              </div>
            )}

            {key === 'assure' && (
              <div className="absolute inset-0 w-full h-full bg-transparent">
                {/* Assure: Golden Amber & Cyber Threat Fortress Shield */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.35),rgba(234,88,12,0.18)_40%,transparent_80%)]" />
                
                {/* Shield Dot Pattern Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Animated Golden Amber Pulse Orbs */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 right-1/3 w-xl h-144 rounded-full bg-amber-500/30 blur-3xl"
                />
                <motion.div
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.25, 0.6, 0.25] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1/4 left-1/3 w-lg h-128 rounded-full bg-orange-600/25 blur-3xl"
                />

                {/* SVG Security Polygon Shield Sweep */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="500,80 620,140 620,260 500,320 380,260 380,140" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.35" />
                  <polygon points="500,40 670,120 670,290 500,370 330,290 330,120" stroke="#ea580c" strokeWidth="1" fill="none" opacity="0.25" strokeDasharray="4 4" />
                </svg>
              </div>
            )}

            {key === 'elite' && (
              <div className="absolute inset-0 w-full h-full bg-transparent">
                {/* Elite: Cosmic Royal Purple & Warp Speed Nebula */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.4),rgba(236,72,153,0.2)_40%,transparent_80%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.07)_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Animated Cosmic Purple Supernova Orbs */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 w-160 h-160 rounded-full bg-purple-600/35 blur-3xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none"
                >
                  <div className="w-184 h-184 rounded-full border border-purple-500/40 border-dashed" />
                  <div className="absolute w-xl h-144 rounded-full border border-pink-500/25" />
                </motion.div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function PlanInteractiveShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const currentPlan = PLAN_DETAILS[activeIndex];

  // Transform PLAN_DETAILS for CircularCarousel component
  const carouselItems: CarouselItem[] = PLAN_DETAILS.map((p) => ({
    id: p.id,
    title: `${p.name} Plan`,
    description: p.title,
    tag: p.tag,
  }));

  // GSAP ScrollTrigger Pinned Scroll Logic:
  // Pins section statically on screen as user scrolls, cycles through 4 plans, then unpins at the end.
  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const trigger = ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top top',
        end: '+=1600',
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const index = Math.min(
            PLAN_DETAILS.length - 1,
            Math.floor(self.progress * PLAN_DETAILS.length)
          );
          setActiveIndex(index);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full min-h-screen pt-nav pb-10 flex flex-col items-center justify-center bg-transparent overflow-hidden"
      id="plan-interactive-showcase"
    >
      {/* Top and Bottom Ultra-Fluid Gradient Edge Blending */}
      <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-transparent via-black/20 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-linear-to-t from-transparent via-black/20 to-transparent z-10 pointer-events-none" />

      {/* Dynamic Plan-Themed 2D Background Overlay */}
      <PlanBackground planId={currentPlan.id} />

      {/* Real-Time 3D Live WebGL Animated Canvas Background */}
      <Plan3DScene activeIndex={activeIndex} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 flex flex-col items-center text-center w-full">
        {/* Eyebrow & Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-semibold text-accent mb-2"
        >
          <Sparkles className="w-3 h-3" /> Interactive Plan Showcase
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-fluid-h3 font-semibold text-white drop-shadow-md"
        >
          Explore the 4 Managed Cloud Plans
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-1 text-xs md:text-sm text-white/70 max-w-xl font-medium"
        >
          Scroll down to cycle through Foundation, Care, Assure, and Elite tiers before continuing.
        </motion.p>

        {/* Static Container */}
        <div className="mt-5 w-full flex flex-col items-center gap-4 select-none">
          {/* Top Pill Tab Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-2xl shadow-2xl"
          >
            {PLAN_DETAILS.map((plan, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={plan.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer',
                    isActive
                      ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  {plan.name}
                </button>
              );
            })}
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlan.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={cn(
                'relative w-full max-w-2xl rounded-2xl border bg-black/75 p-4 sm:p-5 md:p-6 backdrop-blur-2xl shadow-2xl text-left overflow-hidden',
                currentPlan.borderColor
              )}
            >
              {/* Ambient accent gradient glow inside card */}
              <div
                className={cn(
                  'absolute -top-24 -right-24 w-60 h-60 rounded-full bg-linear-to-br blur-3xl pointer-events-none opacity-30',
                  currentPlan.accentBg
                )}
              />

              {/* Category label */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className={cn('text-[11px] font-mono tracking-widest font-semibold uppercase', currentPlan.accentText)}>
                  {currentPlan.category}
                </span>
                <span className={cn('px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider', currentPlan.badgeBg)}>
                  {currentPlan.tag}
                </span>
              </div>

              {/* Card Headline */}
              <h3 className="font-display font-semibold text-lg md:text-xl text-white tracking-tight leading-snug">
                {currentPlan.title}
              </h3>

              {/* Card Description */}
              <p className="mt-1.5 text-xs text-white/70 leading-relaxed max-w-xl">
                {currentPlan.description}
              </p>

              {/* Hairline Divider */}
              <div className="my-4 h-px w-full bg-white/15" />

              {/* 3 Metric Columns */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <span className="text-[9px] md:text-[10px] font-mono tracking-wider text-white/50 uppercase block mb-0.5">
                    SUPPORT WINDOW
                  </span>
                  <span className="font-display text-xs sm:text-sm md:text-base font-bold text-white">
                    {currentPlan.supportWindow}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-mono tracking-wider text-white/50 uppercase block mb-0.5">
                    P1 RESPONSE
                  </span>
                  <span className="font-display text-xs sm:text-sm md:text-base font-bold text-white">
                    {currentPlan.p1Response}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-mono tracking-wider text-white/50 uppercase block mb-0.5">
                    FAIR USAGE
                  </span>
                  <span className="font-display text-xs sm:text-sm md:text-base font-bold text-white">
                    {currentPlan.fairUsage}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
                <Link href={`/plans/${currentPlan.id}`} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-full bg-white text-black text-xs font-semibold transition hover:bg-white/90 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer">
                    Explore {currentPlan.name} Tier <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <Link href={`/build?plan=${currentPlan.id}`} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium transition hover:bg-white/20 flex items-center justify-center gap-1.5 cursor-pointer">
                    Customize in Builder
                  </button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 3D Circular Deck View */}
          <div className="mt-2 w-full max-w-lg">
            <CircularCarousel
              items={carouselItems}
              activeIndex={activeIndex}
              onActiveChange={(idx) => setActiveIndex(idx)}
              autoPlay={false}
              enableMouseWheel={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlanInteractiveShowcase;
