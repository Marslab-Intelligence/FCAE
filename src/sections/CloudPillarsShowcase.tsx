'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import { Cloud, Cpu, DollarSign, Shield, Activity, GitBranch, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const cloudPillars = [
  {
    id: 'p1',
    serviceId: 'cloud-ops',
    title: 'Cloud Operations',
    subtitle: '24/7 Ops & Monitoring',
    desc: 'Day-to-day cloud management so your team can focus on product, not infrastructure.',
    icon: Cloud,
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    accentColor: '#06b6d4',
  },
  {
    id: 'p2',
    serviceId: 'devops',
    title: 'DevOps & Platform',
    subtitle: 'CI/CD & Kubernetes',
    desc: 'Automated CI/CD pipelines, IaC, Kubernetes management, and platform tooling.',
    icon: GitBranch,
    iconBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentColor: '#a855f7',
  },
  {
    id: 'p3',
    serviceId: 'finops',
    title: 'FinOps & Cost Intelligence',
    subtitle: 'Cut Waste & Rightsize',
    desc: 'Cut cloud waste, rightsizing resources, and aligning infrastructure spend with ROI.',
    icon: DollarSign,
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentColor: '#f59e0b',
  },
  {
    id: 'p4',
    serviceId: 'security',
    title: 'Security Governance',
    subtitle: 'Compliance & Threat Defense',
    desc: 'Strengthen security posture, achieve ISO/SOC2 compliance, and automate policy.',
    icon: Shield,
    iconBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accentColor: '#f43f5e',
  },
  {
    id: 'p5',
    serviceId: 'core-engine',
    title: 'SID CORE Operations Engine',
    subtitle: 'Central Command Center',
    desc: 'Unified operational intelligence across security, cost, reliability, and automation.',
    icon: Sparkles,
    iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    accentColor: '#6366f1',
    isCenter: true,
  },
  {
    id: 'p6',
    serviceId: 'architecture',
    title: 'Cloud Architecture',
    subtitle: 'Multi-Cloud System Design',
    desc: 'Scalable, resilient, cost-efficient cloud architecture designed for high throughput.',
    icon: Cpu,
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentColor: '#10b981',
  },
  {
    id: 'p7',
    serviceId: 'continuity',
    title: 'Business Continuity',
    subtitle: 'DR Planning & Auto Failover',
    desc: 'Disaster recovery planning, live failover testing, and backup automation.',
    icon: Activity,
    iconBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    accentColor: '#3b82f6',
  },
];

const pillarPositions = [
  { id: 'p1', left: 1, bottom: 68, rotate: -3.5, scale: 1.02, startX: 240, startY: 30 },
  { id: 'p2', right: 1, bottom: 68, rotate: 3.5, scale: 0.98, startX: -240, startY: 30 },
  { id: 'p3', right: 3, bottom: 35, rotate: -2.5, scale: 1.05, startX: -260, startY: 0 },
  { id: 'p4', right: 0, bottom: 2, rotate: 4.0, scale: 0.96, startX: -240, startY: -30 },
  { id: 'p5', left: 50, bottom: 20, rotate: 0, scale: 1.05, startX: 0, startY: 0 },
  { id: 'p6', left: 3, bottom: 35, rotate: 2.5, scale: 1.04, startX: 260, startY: 0 },
  { id: 'p7', left: 0, bottom: 2, rotate: -4.0, scale: 0.97, startX: 240, startY: -30 },
];

export function CloudPillarsShowcase() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const isMobile = window.innerWidth <= 1024;
      if (isMobile) return;

      // ScrollTrigger timeline that pins section full screen and holds while cards spread outwards to left and right
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top top',
          end: '+=1200',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Command center card entrance
      tl.fromTo(
        '.pillar-card.p5',
        { scale: 0.85, opacity: 0.6 },
        { scale: 1.05, opacity: 1, duration: 0.4, ease: 'power2.out' },
        0
      );

      // Outer 6 cards slide out to left and right sides of the page
      pillarPositions.forEach((item) => {
        if (item.id === 'p5') return;

        const selector = `.${item.id}`;
        tl.fromTo(
          selector,
          {
            x: item.startX,
            y: item.startY,
            scale: 0.7,
            opacity: 0,
            rotateZ: 0,
          },
          {
            x: 0,
            y: 0,
            scale: item.scale,
            opacity: 1,
            rotateZ: item.rotate,
            duration: 1.2,
            ease: 'power2.out',
          },
          0.1
        );
      });

      // Text Narrative reveal towards end of scroll hold
      tl.fromTo(
        '.pillars-narrative',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' },
        0.8
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="cloud-pillars-showcase"
      ref={sectionRef}
      className="relative z-20 w-full min-h-screen py-6 flex flex-col items-center justify-center bg-transparent"
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="text-center max-w-3xl px-6 mb-2 pt-4">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#a5f3fc] mb-2">
            WHAT WE DO
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight eos-gradient-text">
            Six Pillars of Managed Cloud
          </h2>
          <p className="mt-3 text-sm lg:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Every SID engagement draws from the same core service catalog — scoped to the tier that fits your operation.
          </p>
        </div>

        {/* 3D Floating Pillars Stage */}
        <div className="pillars-wrapper relative w-full max-w-7xl 2xl:max-w-[100rem] h-130 lg:h-155 mx-auto my-2 flex items-center justify-center">
          {cloudPillars.map((pillar) => {
            if (pillar.isCenter) {
              return (
                <div key={pillar.id} className={`pillar-card p5`}>
                  <div className="liquid-glass relative group overflow-hidden rounded-2xl border border-[#a5f3fc]/30 bg-black/80 shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(165,243,252,0.2)] transition-transform duration-300 hover:scale-[1.03]">
                    <Image
                      src="/performance5.jpg"
                      alt="SID CORE Command Center"
                      width={600}
                      height={300}
                      className="w-full h-48 lg:h-72 object-cover object-center opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent p-5 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#a5f3fc]/20 border border-[#a5f3fc]/40 text-[10px] font-semibold tracking-wider text-[#a5f3fc] uppercase">
                          COMMAND CENTER
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg lg:text-xl text-white">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-2 mt-1">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            const IconComponent = pillar.icon;
            return (
              <div key={pillar.id} className={`pillar-card ${pillar.id}`}>
                <Link
                  href={`/services#${pillar.serviceId}`}
                  className="liquid-glass group block p-4 lg:p-5 rounded-2xl bg-[#0a0c1a]/85 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:border-[#a5f3fc]/50 hover:bg-[#10142b]/95 transition-all duration-300 pointer-events-auto"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center border shrink-0',
                        pillar.iconBg
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm lg:text-base text-white leading-snug group-hover:text-[#a5f3fc] transition-colors">
                        {pillar.title}
                      </h3>
                      <span className="text-[11px] text-white/50 font-mono block">
                        {pillar.subtitle}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                    {pillar.desc}
                  </p>
                  <div className="mt-3 flex items-center text-xs font-semibold text-[#a5f3fc] opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    Explore service <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footer Narrative */}
        <div className="pillars-narrative mx-auto max-w-4xl px-6 pb-4 space-y-3 text-center">
          <p className="text-sm lg:text-base text-white/80 leading-relaxed font-light">
            Powered by the CORE (Cloud Operations & Reliability Engine), SID provides real-time operational intelligence across availability, incidents, costs, security, and governance — ensuring every cloud decision is data-driven.
          </p>
        </div>
      </div>
    </section>
  );
}
