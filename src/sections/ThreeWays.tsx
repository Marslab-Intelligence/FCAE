'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import { Monitor, Smartphone, Code2, Download, Check, ExternalLink, Terminal, Copy } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const products = [
  {
    id: 'desktop',
    title: 'Desktop App',
    subtitle: 'The visual animation studio',
    icon: Monitor,
    accent: 'from-accent to-purple-600',
    badge: 'macOS · Windows · Linux',
    features: [
      { label: 'Visual Timeline', value: 'Multi-track editor' },
      { label: 'Live Preview', value: 'Instant feedback' },
      { label: 'Export', value: 'GSAP · Framer Motion · CSS' },
      { label: 'Team Sync', value: 'Real-time collaboration' },
      { label: 'Version History', value: 'Git-like branching' },
      { label: 'Plugin System', value: 'Custom effects API' },
    ],
    cta: { label: 'Download for Mac', variant: 'primary' as const, rightIcon: Download },
    secondaryCta: { label: 'Windows & Linux', variant: 'secondary' as const },
  },
  {
    id: 'wordpress',
    title: 'WordPress Plugin',
    subtitle: 'Animations for every site',
    icon: Smartphone,
    accent: 'from-lime to-green-600',
    badge: 'WP 6.0+ · PHP 8.0+',
    features: [
      { label: 'Block Editor', value: 'Native Gutenberg blocks' },
      { label: 'Theme Builder', value: 'FSE compatible' },
      { label: 'WooCommerce', value: 'Product animations' },
      { label: 'Performance', value: 'Zero runtime overhead' },
      { label: 'ACF Support', value: 'Custom fields animated' },
      { label: 'Multisite', value: 'Network activated' },
    ],
    cta: { label: 'Get the Plugin', variant: 'primary' as const, rightIcon: ExternalLink },
    secondaryCta: { label: 'View on WordPress.org', variant: 'ghost' as const },
  },
  {
    id: 'sdk',
    title: 'SDK & CLI',
    subtitle: 'Code-first animation power',
    icon: Code2,
    accent: 'from-blue-500 to-cyan-500',
    badge: 'npm · pnpm · yarn',
    features: [
      { label: 'TypeScript', value: 'Full type safety' },
      { label: 'Tree-shaking', value: '~3kb core bundle' },
      { label: 'Framework Agnostic', value: 'React · Vue · Svelte · Solid' },
      { label: 'Headless', value: 'Bring your own renderer' },
      { label: 'DevTools', value: 'Time-travel debugging' },
      { label: 'CI/CD Ready', value: 'Automated testing' },
    ],
    cta: { label: 'Install Package', variant: 'outline' as const, rightIcon: Terminal },
    npmCommand: 'npm i @motionforge/core gsap',
  },
];

export function ThreeWays() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelector('.section-header'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        section.querySelectorAll('.product-card'),
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section.querySelector('.products-grid'),
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
      aria-labelledby="three-ways-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-linear-to-r from-accent/5 via-transparent to-lime/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="section-header text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-sm font-medium text-white/55 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            One engine, three doors
          </motion.span>
          <h2
            id="three-ways-heading"
            className="font-display font-semibold text-fluid-h2 tracking-tight leading-tight text-white mb-4"
          >
            Same power.{' '}
            <span className="text-gradient-accent">Your workflow.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            Whether you design visually, build WordPress sites, or write code — MotionForge meets you where you work.
          </p>
        </div>

        <div className="products-grid grid md:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              className="product-card relative group"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-accent/30 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] transition-all duration-500 h-full flex flex-col">
                <div className="relative h-32 bg-linear-to-br" style={{ background: `var(--${product.accent.replace('from-', '').replace('to-', '')})` }}>
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10">
                    <product.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-white tracking-wider uppercase hidden sm:block">{product.badge}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                      <product.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="font-display font-semibold text-2xl md:text-3xl tracking-tight text-white mb-2">
                    {product.title}
                  </h3>
                  <p className="text-white/55 mb-6 leading-relaxed">{product.subtitle}</p>

                  <div className="features-list flex-1 space-y-4 mb-8">
                    {product.features.map((feature) => (
                      <div
                        key={feature.label}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300 group-hover:border-accent/20"
                      >
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-lime shrink-0" />
                          <div>
                            <div className="font-medium text-white">{feature.label}</div>
                            <div className="text-sm text-white/55">{feature.value}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cta-section space-y-3 pt-4 border-t border-white/10">
                    {product.npmCommand ? (
                      <>
                        <div className="relative rounded-xl bg-black/50 border border-white/10 p-4 font-mono text-sm overflow-hidden">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                          </div>
                          <code className="text-lime whitespace-nowrap">{product.npmCommand}</code>
                          <button
                            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Copy command"
                          >
                            <Copy className="w-4 h-4 text-white/55" />
                          </button>
                        </div>
                        <Button
                          variant={product.cta.variant}
                          size="lg"
                          className="w-full"
                          rightIcon={product.cta.rightIcon ? <product.cta.rightIcon className="w-5 h-5" /> : undefined}
                        >
                          {product.cta.label}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant={product.cta.variant}
                          size="lg"
                          className="w-full"
                          rightIcon={product.cta.rightIcon ? <product.cta.rightIcon className="w-5 h-5" /> : undefined}
                        >
                          {product.cta.label}
                        </Button>
                        {product.secondaryCta && (
                          <Button
                            variant={product.secondaryCta.variant}
                            size="lg"
                            className="w-full"
                          >
                            {product.secondaryCta.label}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}