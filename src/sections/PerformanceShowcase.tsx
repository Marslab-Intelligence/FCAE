'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const performanceImages = [
  { id: 'p1', src: '/performance1.png', alt: 'Operational Monitoring Dashboard' },
  { id: 'p2', src: '/performance2.png', alt: 'Cloud Cost Intelligence & FinOps' },
  { id: 'p3', src: '/performance3.png', alt: 'Security Governance & Compliance' },
  { id: 'p4', src: '/performance4.png', alt: 'Incident Assistance & SLA Tracker' },
  { id: 'p5', src: '/performance5.jpg', alt: '3D Center Workstation' },
  { id: 'p6', src: '/performance6.png', alt: 'DevOps & Pipeline Automation' },
  { id: 'p7', src: '/performance7.png', alt: 'Architecture Topology & DR' },
];

const performanceImgPositions = [
  { id: 'p1', left: 5, bottom: 65 },
  { id: 'p2', right: 10, bottom: 60 },
  { id: 'p3', right: -5, bottom: 45 },
  { id: 'p4', right: -10, bottom: 0 },
  { id: 'p5', left: 20, bottom: 50 },
  { id: 'p6', left: 2, bottom: 30 },
  { id: 'p7', left: -5, bottom: 0 },
];

export function PerformanceShowcase() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      // Text Animation
      gsap.fromTo(
        '.performance-content p',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: '.performance-content',
            start: 'top 85%',
            end: 'top 40%',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      const isMobile = window.innerWidth <= 1024;
      if (isMobile) return;

      // Image Positioning Timeline
      const tl = gsap.timeline({
        defaults: { duration: 2, ease: 'power1.inOut', overwrite: 'auto' },
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Position Each Performance Image dynamically on scroll
      performanceImgPositions.forEach((item) => {
        if (item.id === 'p5') return;

        const selector = `.${item.id}`;
        const vars: Record<string, string> = {};

        if (typeof item.left === 'number') vars.left = `${item.left}%`;
        if (typeof item.right === 'number') vars.right = `${item.right}%`;
        if (typeof item.bottom === 'number') vars.bottom = `${item.bottom}%`;

        tl.to(selector, vars, 0);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="performance" ref={sectionRef} className="relative z-20 w-full overflow-hidden py-16 flex flex-col items-center bg-transparent">
      {/* Title */}
      <div className="text-center max-w-3xl px-6 mb-8">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#a5f3fc] mb-2">
          OPERATIONAL EXCELLENCE
        </p>
        <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight eos-gradient-text">
          OOGT Service Maturity Model
        </h2>
      </div>

      {/* Floating 3D Showcase Window Grid */}
      <div className="performance-wrapper relative w-full max-w-7xl 2xl:max-w-[100rem] h-[55vh] lg:h-[80vh] mx-auto my-4 flex items-center justify-center">
        {performanceImages.map((item, index) => (
          <img
            key={index}
            src={item.src}
            className={`performance-img ${item.id}`}
            alt={item.alt}
          />
        ))}
      </div>

      {/* Narrative Description */}
      <div className="performance-content mx-auto max-w-4xl px-6 mt-8 space-y-4 text-center">
        <p className="text-sm lg:text-base text-white/80 leading-relaxed font-light">
          SID Managed Cloud delivers engineering excellence through the{' '}
          <span className="text-white font-semibold underline decoration-[#a5f3fc]/50">
            OOGT (Operate, Optimize, Govern, Transform)
          </span>{' '}
          framework. Each stage builds upon the last — from reliable day-to-day operations to full strategic technology transformation.
        </p>
        <p className="text-sm lg:text-base text-white/80 leading-relaxed font-light">
          Powered by the CORE (Cloud Operations & Reliability Engine), SID provides real-time operational intelligence, reporting, and visibility across availability, incidents, costs, security, governance, and strategic planning.
        </p>
      </div>
    </section>
  );
}
