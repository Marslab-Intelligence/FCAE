'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Cloud, Cpu, DollarSign, Shield, Activity, GitBranch, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvergeGrid } from '@/hooks/useConvergeGrid';

// Lazy, client-only: the 3D gallery pulls in three/drei, so it must never SSR
// and shouldn't weigh down the initial bundle.
const ServicesGalaxy = dynamic(() => import('@/components/three/ServicesGalaxy'), {
  ssr: false,
  loading: () => null,
});

const services = [
  {
    id: 'cloud-ops',
    icon: Cloud,
    title: 'Cloud Operations',
    desc: 'Day-to-day cloud management so your team can focus on product, not infrastructure. 24/7 monitoring, incident response, and change management.',
    color: 'from-blue-500/15 to-indigo-500/10 border-blue-500/25',
    iconBg: 'bg-blue-500/20 text-blue-400',
    accent: '#3b82f6',
    featured: true,
  },
  {
    id: 'architecture',
    icon: Cpu,
    title: 'Cloud Architecture',
    desc: 'Scalable, resilient, cost-efficient cloud design.',
    color: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/25',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    accent: '#10b981',
  },
  {
    id: 'finops',
    icon: DollarSign,
    title: 'FinOps & Cost Optimization',
    desc: 'Cut cloud waste and align spend with business value.',
    color: 'from-amber-500/15 to-orange-500/10 border-amber-500/25',
    iconBg: 'bg-amber-500/20 text-amber-400',
    accent: '#f59e0b',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security Governance',
    desc: 'Strengthen posture, achieve compliance, reduce risk.',
    color: 'from-red-500/15 to-rose-500/10 border-red-500/25',
    iconBg: 'bg-red-500/20 text-red-400',
    accent: '#ef4444',
  },
  {
    id: 'continuity',
    icon: Activity,
    title: 'Business Continuity',
    desc: 'DR planning, testing, and automated failover.',
    color: 'from-cyan-500/15 to-sky-500/10 border-cyan-500/25',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
    accent: '#06b6d4',
  },
  {
    id: 'devops',
    icon: GitBranch,
    title: 'DevOps & Platform Engineering',
    desc: 'CI/CD pipelines, Kubernetes management, and platform automation.',
    color: 'from-purple-500/15 to-pink-500/10 border-purple-500/25',
    iconBg: 'bg-purple-500/20 text-purple-400',
    accent: '#8b5cf6',
    // Six cards where the first spans two columns leaves seven cells across three
    // rows — so the last card sat alone with two empty cells beside it. Spanning
    // the full width turns that ragged tail into a deliberate closing row.
    wide: true,
  },
];

const galaxyServices = services.map((s) => ({
  id: s.id,
  title: s.title,
  desc: s.desc,
  accent: s.accent,
  icon: s.icon,
  href: `/services#${s.id}`,
}));

export function ServicesOverview() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Use the 3D gallery only where it makes sense: a precise pointer, a wide
  // enough screen, motion allowed, and WebGL2 present. Everywhere else (touch,
  // mobile, reduced-motion) we render the classic converge grid. Starts false so
  // SSR and first paint match; the effect upgrades capable clients after mount.
  const [use3D, setUse3D] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const capable = window.matchMedia('(min-width: 640px)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let webgl2 = false;
      try {
        webgl2 = !!document.createElement('canvas').getContext('webgl2');
      } catch {
        webgl2 = false;
      }
      setUse3D(capable && !reduced && webgl2);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Cards start scattered and scroll-scrub into the grid as the section rises.
  // The framer-motion drop variants this replaces animated the same `transform`
  // the scrub now owns — running both would have had two systems overwriting each
  // other every frame. Pass `{ pin: true }` for the reference's pinned, play-in-
  // place version; it costs ~1200px of extra page scroll.
  useConvergeGrid(sectionRef, gridRef, '[data-converge]');

  return (
    <section
      ref={sectionRef}
      /* stellar-ai: flat section plane, ambient glow removed */
      className="stellar-section"
      aria-labelledby="services-overview-heading"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="stellar-eyebrow"
          >
            What We Do
          </motion.p>
          <h2
            id="services-overview-heading"
            className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight text-white"
          >
            Six pillars of managed cloud
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/55 max-w-2xl leading-relaxed">
            Every SID engagement draws from the same core service catalog — scoped to the tier that fits your operation.
          </p>
        </div>

        {use3D ? (
          /* Desktop: the rotating wireframe globe with the service cards
             orbiting it. Restored after the stellar-ai redesign — it stays the
             signature visual of this section. */
          <div className="w-full relative">
            <ServicesGalaxy services={galaxyServices} />
          </div>
        ) : (
          /* Fallback: classic converge grid. `relative` makes this the offset
             parent the repulsion maths measures against; `perspective` gives the
             scattered cards' translateZ an actual sense of depth. */
          <div
            ref={gridRef}
            className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-distant"
          >
            {services.map((service) => (
              <div
                key={service.id}
                data-converge
                className={cn(
                  'will-change-transform',
                  service.featured && 'lg:col-span-2',
                  service.wide && 'md:col-span-2 lg:col-span-3'
                )}
              >
                {/* stellar-ai: per-service colour gradients + icon tints give way
                    to a uniform glass panel with a violet glyph. */}
                <Link
                  href={`/services#${service.id}`}
                  className="liquid-glass group relative flex flex-col justify-between h-full p-8 rounded-3xl transition-colors duration-300 hover:bg-white/[0.07]"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <service.icon className="w-6 h-6 text-violet-300" strokeWidth={1.25} />
                    </div>
                    <h3 className="font-display font-semibold text-xl md:text-2xl text-white mb-2">{service.title}</h3>
                    <p className="text-sm md:text-base text-white/55 leading-relaxed max-w-md">{service.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-white/70 mt-8 group-hover:text-white transition-colors">
                    Explore service
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
