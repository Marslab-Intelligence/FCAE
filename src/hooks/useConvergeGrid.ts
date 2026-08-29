'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Scatter has to be applied before the browser paints, otherwise the cards show
// for one frame in their settled grid position and then jump outward.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Deterministic pseudo-random in [0, 1). Index-seeded rather than Math.random so
 * a card's scatter position is identical on every render and between server and
 * client — a random layout would differ across a rerender and make cards jump.
 */
function rand(seed: number) {
  const v = Math.sin(seed * 127.1) * 43758.5453;
  return v - Math.floor(v);
}

// Hold the cards scattered through the first fifth of the pin and settled through
// the last fifth, easing only in between. Without the dead zones the converge is
// welded 1:1 to the wheel and reads as dragging rather than as its own beat.
const EASE_IN = 0.2;
const EASE_OUT = 0.8;

function scrubEase(p: number) {
  if (p <= EASE_IN) return 0;
  if (p >= EASE_OUT) return 1;
  const t = (p - EASE_IN) / (EASE_OUT - EASE_IN);
  return t * t * (3 - 2 * t);
}

interface ConvergeOptions {
  /**
   * Pin the section and play the converge in place, like the reference does.
   * Off by default: pinning adds `pinDistance` of extra page scroll (~1200px at
   * the default), and this grid is taller than a viewport, so its bottom row
   * would sit off-screen for the whole pinned sequence. Unpinned, the converge
   * plays as the section rises through the viewport and costs no extra height.
   */
  pin?: boolean;
  /** Extra scroll consumed by the pin. Only used when `pin` is true. */
  pinDistance?: string;
  /** ScrollTrigger start. Defaults differ between pinned and unpinned. */
  start?: string;
  /** ScrollTrigger end. Defaults differ between pinned and unpinned. */
  end?: string;
  /** Pointer influence radius in px. */
  repelRadius?: number;
  /** Peak pointer push in px. */
  repelStrength?: number;
}

interface Scatter {
  dx: number;
  dy: number;
  dz: number;
  rot: number;
  rotY: number;
  scale: number;
}

/**
 * Pins a section and scrubs its items from a scattered, tumbled, depth-offset
 * start into their natural grid position, with the pointer pushing settled cards
 * aside. Adapted from motion.page's LogoPhysics, but driven by CSS transforms via
 * ScrollTrigger instead of a WebGPU/rigid-body scene.
 *
 * No-ops entirely under prefers-reduced-motion, which leaves the cards in their
 * normal document position — the grid is the correct static fallback.
 */
export function useConvergeGrid(
  sectionRef: React.RefObject<HTMLElement | null>,
  gridRef: React.RefObject<HTMLElement | null>,
  itemSelector: string,
  options: ConvergeOptions = {}
) {
  // The radius has to comfortably exceed a card's own half-width or the pointer is
  // rarely inside any card's influence and the push reads as dead. These cards run
  // ~410px wide, so ~500px puts two or three of them in range at once.
  const {
    pin = false,
    pinDistance = '+=140%',
    // Unpinned, the converge runs from the section entering the viewport until it
    // is roughly centred — a long enough runway to read, and every row passes
    // through view while it plays.
    start = pin ? 'top top' : 'top bottom',
    end = pin ? pinDistance : 'center center',
    repelRadius = 520,
    repelStrength = 70,
  } = options;

  // Written by ScrollTrigger, read by the rAF loop. Keeping a single writer per
  // property avoids the two-systems-fighting-over-transform problem.
  const progressRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = Array.from(grid.querySelectorAll<HTMLElement>(itemSelector));
    if (items.length === 0) return;

    const spreadX = Math.min(window.innerWidth * 0.34, 420);
    const spreadY = 210;

    const scatter: Scatter[] = items.map((_, i) => ({
      dx: (rand(i + 11) - 0.5) * 2 * spreadX,
      // Biased upward so the settle reads as falling into place.
      dy: (rand(i + 41) - 0.5) * 2 * spreadY - 130,
      dz: -(80 + rand(i + 31) * 300),
      rot: (rand(i + 71) - 0.5) * 46,
      rotY: (rand(i + 91) - 0.5) * 44,
      scale: 0.68 + rand(i + 7) * 0.22,
    }));

    // Pointer-repulsion offset per card, eased toward its target each frame.
    const push = items.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));

    let pointerX = -9999;
    let pointerY = -9999;
    let pointerActive = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = grid.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      pointerActive = true;
    };
    const onPointerLeave = () => {
      pointerActive = false;
    };

    grid.addEventListener('pointermove', onPointerMove);
    grid.addEventListener('pointerleave', onPointerLeave);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        // Unpinned, measure against the grid rather than the section. The section
        // top clears the viewport bottom while the header still fills the screen,
        // so a section-triggered scrub spends its whole range with the cards below
        // the fold and finishes before any of them are visible.
        trigger: pin ? section : grid,
        start,
        end,
        pin,
        pinSpacing: pin,
        scrub: 0.3,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    }, section);

    let frame: number | null = null;

    const render = () => {
      const p = scrubEase(progressRef.current);
      const inv = 1 - p;

      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        const s = scatter[i];
        const pu = push[i];

        // Repulsion scales with settledness — pushing cards that haven't arrived
        // yet just fights the converge and looks like noise.
        if (pointerActive && p > 0.05) {
          // offsetLeft/Top are layout values, unaffected by the transform we're
          // about to write, so this can't feed back into itself.
          const cx = el.offsetLeft + el.offsetWidth / 2;
          const cy = el.offsetTop + el.offsetHeight / 2;
          const ddx = cx - pointerX;
          const ddy = cy - pointerY;
          const dist = Math.hypot(ddx, ddy);

          if (dist < repelRadius && dist > 0.01) {
            const falloff = 1 - dist / repelRadius;
            const force = falloff * falloff * repelStrength * p;
            pu.tx = (ddx / dist) * force;
            pu.ty = (ddy / dist) * force;
          } else {
            pu.tx = 0;
            pu.ty = 0;
          }
        } else {
          pu.tx = 0;
          pu.ty = 0;
        }

        pu.x += (pu.tx - pu.x) * 0.12;
        pu.y += (pu.ty - pu.y) * 0.12;

        const x = s.dx * inv + pu.x;
        const y = s.dy * inv + pu.y;
        const z = s.dz * inv;
        const rot = s.rot * inv;
        const rotY = s.rotY * inv;
        const scale = s.scale + (1 - s.scale) * p;

        el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateY(${rotY.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      }

      frame = requestAnimationFrame(render);
    };

    // Only burn frames while the section is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && frame === null) {
          frame = requestAnimationFrame(render);
        } else if (!entry.isIntersecting && frame !== null) {
          cancelAnimationFrame(frame);
          frame = null;
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(section);

    // Paint the scattered state immediately so there's no settled-then-jump flash.
    render();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      io.disconnect();
      grid.removeEventListener('pointermove', onPointerMove);
      grid.removeEventListener('pointerleave', onPointerLeave);
      ctx.revert();
      items.forEach((el) => {
        el.style.transform = '';
      });
    };
  }, [sectionRef, gridRef, itemSelector, pin, start, end, repelRadius, repelStrength]);
}
