'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowLeft } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { maturityJourney } from '@/lib/maturity-journey';

const SLIDE_DURATION = 6000;
const TICK = 100;

const images = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1768839720936-87ce3adf2d08?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1758873268998-2f77c2d38862?auto=format&fit=crop&w=1600&q=80',
];

const accentText = ['text-blue-400', 'text-emerald-400', 'text-amber-400', 'text-purple-400'];
const accentBar = ['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400'];
const accentWash = [
  'from-blue-950/50 via-black/50 to-black/80',
  'from-emerald-950/50 via-black/50 to-black/80',
  'from-amber-950/50 via-black/50 to-black/80',
  'from-purple-950/50 via-black/50 to-black/80',
];

const slides = maturityJourney.map((step, i) => ({ ...step, image: images[i] }));

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, rotateY: dir > 0 ? 65 : -65, scale: 0.92 }),
  center: { opacity: 1, rotateY: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, rotateY: dir > 0 ? -65 : 65, scale: 0.92 }),
};

const reducedSlideVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export function JourneyStory() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const elapsedRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const goTo = useCallback((nextIndex: number) => {
    setIndex((current) => {
      const wrapped = ((nextIndex % slides.length) + slides.length) % slides.length;
      setDirection(wrapped > current || (current === slides.length - 1 && wrapped === 0) ? 1 : -1);
      return wrapped;
    });
    setFinished(false);
  }, []);

  const next = useCallback(() => {
    setIndex((current) => {
      if (current === slides.length - 1) {
        setFinished(true);
        return current;
      }
      setDirection(1);
      return current + 1;
    });
  }, []);

  const prev = useCallback(() => {
    if (index === 0) return;
    setDirection(-1);
    setIndex(index - 1);
    setFinished(false);
  }, [index]);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [index]);

  useEffect(() => {
    if (paused || finished || reducedMotion) return;
    const id = window.setInterval(() => {
      elapsedRef.current += TICK;
      if (elapsedRef.current >= SLIDE_DURATION) {
        next();
      }
    }, TICK);
    return () => window.clearInterval(id);
  }, [index, paused, finished, reducedMotion, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const restart = () => {
    setDirection(-1);
    setIndex(0);
    setFinished(false);
  };

  const step = slides[index];

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-black select-none"
      style={{ perspective: '1600px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
    >
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1.5 p-4 pt-5">
        {slides.map((s, i) => (
          <button
            key={s.plan}
            onClick={() => goTo(i)}
            className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden"
            aria-label={`Go to step ${i + 1}: ${s.plan}`}
          >
            <div
              className={cn('h-full w-full rounded-full origin-left', accentBar[i])}
              style={
                i < index || finished
                  ? { transform: 'scaleX(1)' }
                  : i > index
                    ? { transform: 'scaleX(0)' }
                    : {
                        transform: reducedMotion ? 'scaleX(1)' : 'scaleX(0)',
                        animation: reducedMotion ? undefined : `journeyFill ${SLIDE_DURATION}ms linear forwards`,
                        animationPlayState: paused ? 'paused' : 'running',
                      }
              }
            />
          </button>
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-display font-bold text-white/90 hover:text-white tracking-tight transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </Link>
        <Link href="/plans" className="text-sm text-white/70 hover:text-white transition-colors">
          Skip to pricing
        </Link>
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={reducedMotion ? reducedSlideVariants : slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reducedMotion ? 0.3 : 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <div className="living-image relative h-full w-full">
              <Image
                src={step.image}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className={cn('absolute inset-0 bg-linear-to-b', accentWash[index])} />
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={cn('text-sm font-bold uppercase tracking-[0.2em] mb-4', accentText[index])}
            >
              Step 0{index + 1} · {step.plan}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="font-display font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight leading-tight text-white max-w-4xl mb-6"
            >
              {step.focus}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed"
            >
              {step.desc}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-6 bg-bg/95 backdrop-blur-xl"
          >
            <h2 className="font-display font-bold text-3xl md:text-5xl text-text mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-text-muted max-w-xl mb-8">
              From Foundation to Elite — see which tier fits where you are today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <LinkButton href="/plans" size="lg">
                View plans
              </LinkButton>
              <button
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 h-11 rounded-full bg-white/5 text-text border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 font-medium"
              >
                Watch again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!finished && (
        <>
          <button
            aria-label="Previous step"
            onClick={prev}
            disabled={index === 0}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-20 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity disabled:hover:opacity-0"
          >
            <ChevronLeft className="w-8 h-8 text-white/70" />
          </button>
          <button
            aria-label="Next step"
            onClick={next}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-20 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white/70" />
          </button>
          <button
            aria-label={paused ? 'Resume' : 'Pause'}
            onClick={(e) => {
              e.stopPropagation();
              setPaused((p) => !p);
            }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            {paused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
          </button>
        </>
      )}
    </div>
  );
}
