'use client';

import { createContext, useContext, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/hooks/useLenis';

const HEADER_OFFSET = -100;

type ScrollToFn = ReturnType<typeof useLenis>['scrollTo'];

const LenisScrollContext = createContext<ScrollToFn | null>(null);

/**
 * Reuses the single Lenis instance `SmoothScrollProvider` already owns.
 * `useLenis()` creates a brand new physical Lenis instance on every call, so
 * anything wanting programmatic smooth-scroll (e.g. the Living Cloud chapter
 * nav) must consume this instead of calling `useLenis()` again — a second
 * instance would run its own rAF loop and fight the first for scroll state.
 */
export function useLenisScrollTo() {
  const scrollTo = useContext(LenisScrollContext);
  if (!scrollTo) {
    throw new Error('useLenisScrollTo must be used within SmoothScrollProvider');
  }
  return scrollTo;
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { scrollTo } = useLenis();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      scrollTo(target as HTMLElement, {
        offset: HEADER_OFFSET,
        onComplete: () => {
          ScrollTrigger.refresh();
          // A big programmatic jump can land a trigger's element already inside the
          // viewport but a few pixels shy of its own independent start threshold
          // (the anchor offset and each row's "top 85%" are separate calculations
          // that don't always align pixel-perfectly). Refresh alone won't "round up"
          // a near-miss, so explicitly play anything already visible that hasn't run yet.
          ScrollTrigger.getAll().forEach((st) => {
            const el = st.trigger as HTMLElement | null;
            if (!el || st.progress > 0) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              st.animation?.play();
            }
          });
        },
      });
      window.history.pushState(null, '', hash);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [scrollTo]);

  return <LenisScrollContext.Provider value={scrollTo}>{children}</LenisScrollContext.Provider>;
}
