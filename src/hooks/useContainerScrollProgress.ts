'use client';

import { useRef, useState, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ContainerScrollProgressOptions {
  /** Total pinned scroll distance, e.g. "320%" of the container's own height. */
  distance?: string;
  /** Number of discrete chapters the 0-1 progress range is divided into. */
  chapters?: number;
}

/**
 * Pins `containerRef` for `distance` of extra scroll and tracks progress 0-1
 * through that pin as a high-frequency ref (for driving R3F/useFrame without
 * React re-renders) plus a low-frequency `chapter` index in React state that
 * only changes when progress crosses a chapter boundary.
 */
export function useContainerScrollProgress(
  containerRef: RefObject<HTMLElement | null>,
  { distance = '300%', chapters = 3 }: ContainerScrollProgressOptions = {}
) {
  const progressRef = useRef(0);
  const [chapter, setChapter] = useState(0);
  const chapterRef = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: `+=${distance}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: () => setIsActive(true),
        onEnterBack: () => setIsActive(true),
        onLeave: () => setIsActive(false),
        onLeaveBack: () => setIsActive(false),
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const nextChapter = Math.min(chapters - 1, Math.floor(self.progress * chapters));
          if (nextChapter !== chapterRef.current) {
            chapterRef.current = nextChapter;
            setChapter(nextChapter);
          }
        },
      });

      scrollTriggerRef.current = st;

      return () => {
        st.kill();
        scrollTriggerRef.current = null;
      };
    },
    { scope: containerRef, dependencies: [distance, chapters] }
  );

  return { progressRef, chapter, isActive, scrollTriggerRef };
}
