'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { Zap, Layers, Code, MousePointer, Wand2, GitBranch } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const featureCards = [
  {
    icon: Zap,
    label: 'VISUAL BUILDER',
    title: 'Pick a thing. Make it move.',
    description: 'Select any element on your page and animate it instantly. No selectors, no guessing — just click, choose, and watch it come alive.',
    image: 'https://picsum.photos/seed/visual-builder/600/340.jpg',
    accent: 'from-accent to-purple-600',
  },
  {
    icon: Layers,
    label: 'TIMELINE EDITOR',
    title: 'Every keyframe. One view.',
    description: 'See your entire animation sequence at a glance. Scrub, trim, and rearrange keyframes visually. Complex sequences become child\'s play.',
    image: 'https://picsum.photos/seed/timeline-editor/600/340.jpg',
    accent: 'from-lime to-green-600',
  },
  {
    icon: Code,
    label: 'CODE EXPORT',
    title: 'Clean GSAP. Zero bloat.',
    description: 'Copy production-ready GSAP code with a click. Tree-shakeable, framework-agnostic, and optimized. Your bundle stays light.',
    image: 'https://picsum.photos/seed/code-export/600/340.jpg',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MousePointer,
    label: 'INTERACTIONS',
    title: 'Hover. Click. Drag. Scroll.',
    description: 'Build rich micro-interactions without writing event handlers. Magnetic buttons, parallax reveals, drag-to-scroll — all visual.',
    image: 'https://picsum.photos/seed/interactions/600/340.jpg',
    accent: 'from-orange-500 to-red-500',
  },
  {
    icon: Wand2,
    label: 'EFFECTS LIBRARY',
    title: '45+ effects. One click.',
    description: 'Fade, slide, flip, morph, draw, split, stagger, blur, glow. The effects designers reach for, pre-built and customizable.',
    image: 'https://picsum.photos/seed/effects-library/600/340.jpg',
    accent: 'from-pink-500 to-rose-500',
  },
  {
    icon: GitBranch,
    label: 'TEAM WORKFLOWS',
    title: 'Design → Develop. Seamless.',
    description: 'Hand off animations with specs, code, and preview links. Version control for motion. Designers animate, developers ship.',
    image: 'https://picsum.photos/seed/team-workflows/600/340.jpg',
    accent: 'from-indigo-500 to-purple-600',
  },
];

export function FeatureCards() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // First 3 cards - stacked sticky scroll
      const stickyCards = section.querySelectorAll('.sticky-card');
      stickyCards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 80, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 70%',
              end: 'top 20%',
              scrub: 1,
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Parallax effect on image
        const img = card.querySelector('.card-image');
        if (img) {
          gsap.to(img, {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });
        }
      });

      // Next 3 cards - horizontal grid scroll reveal
      const gridCards = section.querySelectorAll('.grid-card');
      gsap.fromTo(
        gridCards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section.querySelector('.grid-cards'),
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative section-y overflow-hidden"
      aria-labelledby="feature-cards-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-linear-to-r from-accent/5 via-transparent to-lime/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-sm font-medium text-white/55 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            Deep dive into features
          </motion.span>
          <h2
            id="feature-cards-heading"
            className="font-display font-semibold text-fluid-h2 tracking-tight leading-tight text-white mb-4"
          >
            Features that{' '}
            <span className="text-gradient-lime">just work</span>
          </h2>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            Every tool you need. None of the bloat. Built for how modern teams actually build.
          </p>
        </div>

        {/* First 3 cards - Sticky Stack */}
        <div className="space-y-8 mb-14 lg:mb-16">
          {featureCards.slice(0, 3).map((card, index) => (
            <motion.article
              key={card.label}
              className="sticky-card relative group"
              style={{ zIndex: 3 - index }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                <div
                  className="card-image relative h-56 md:h-64 lg:h-72 overflow-hidden"
                  style={{ transform: 'translateZ(0)' }}
                >
                  <div className="living-image relative h-full w-full" style={{ animationDelay: `${index * -2.7}s` }}>
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="living-image-sheen" style={{ animationDelay: `${index * -1.6}s` }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10">
                    <span className="text-xs font-semibold text-white tracking-wider uppercase">{card.label}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br', cardBadges[card.label] || 'bg-accent/20')}>
                      <card.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white/55 tracking-wider uppercase">{card.label}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight text-white mb-4">
                    {card.title}
                  </h3>

                  <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Next 3 cards - Grid */}
        <div className="grid-cards grid md:grid-cols-3 gap-6 lg:gap-8">
          {featureCards.slice(3, 6).map((card, index) => (
            <motion.article
              key={card.label}
              className="grid-card group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-accent/30 hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] transition-all duration-500 h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <div className="living-image relative h-full w-full" style={{ animationDelay: `${index * -2.7}s` }}>
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="living-image-sheen" style={{ animationDelay: `${index * -1.6}s` }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br', card.accent)}>
                      <card.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-semibold text-white/55 tracking-wider uppercase">{card.label}</span>
                  </div>

                  <h3 className="font-display font-semibold text-xl md:text-2xl tracking-tight leading-snug text-white mb-3 flex-1">
                    {card.title}
                  </h3>

                  <p className="text-white/55 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

const cardBadges: Record<string, string> = {
  'VISUAL BUILDER': 'bg-accent/20',
  'TIMELINE EDITOR': 'bg-lime/20',
  'CODE EXPORT': 'bg-blue-500/20',
  'INTERACTIONS': 'bg-orange-500/20',
  'EFFECTS LIBRARY': 'bg-pink-500/20',
  'TEAM WORKFLOWS': 'bg-indigo-500/20',
};