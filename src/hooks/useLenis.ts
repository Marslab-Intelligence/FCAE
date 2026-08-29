'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface LenisOptions {
  lerp?: number;
  duration?: number;
  easing?: (t: number) => number;
  smooth?: boolean;
  mouseMultiplier?: number;
  smoothTouch?: boolean;
  touchMultiplier?: number;
  infinite?: boolean;
}

// Module-level so the identity is stable. As an inline default it was a fresh
// closure on every render, and since `easing` is an effect dependency that tore
// down and rebuilt Lenis each render — the scroll would reset mid-gesture.
const DEFAULT_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export function useLenis(options: LenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  const {
    lerp = 0.1,
    duration = 1.2,
    easing = DEFAULT_EASING,
    touchMultiplier = 2,
    infinite = false,
  } = options;

  useEffect(() => {
    const lenis = new Lenis({
      lerp,
      duration,
      easing,
      touchMultiplier,
      infinite,
    });
    lenisRef.current = lenis;
    const frameId = requestAnimationFrame(() => {
      setLenisInstance(lenis);
    });

    lenis.on('scroll', () => ScrollTrigger.update());

    function raf(time: number) {
      lenisRef.current?.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [lerp, duration, easing, touchMultiplier, infinite]);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: { offset?: number; immediate?: boolean; duration?: number; easing?: (t: number) => number; onComplete?: () => void }
    ) => {
      lenisRef.current?.scrollTo(target, options);
    },
    []
  );

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  return { lenis: lenisInstance, scrollTo, stop, start };
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
}
