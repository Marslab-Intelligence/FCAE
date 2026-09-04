'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
  /** Matches an element rendered with data-tour-id={targetSelector}. */
  targetSelector: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface GuidedTourHandle {
  start: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  /** Auto-start on every mount. Defaults to true. */
  autoStart?: boolean;
}

const AUTO_ADVANCE_MS = 3000;
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_EST_HEIGHT = 200;
const GAP = 16;

type Rect = { top: number; left: number; width: number; height: number };

function getTargetEl(selector: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tour-id="${selector}"]`);
}

function rectFromEl(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function computeTooltipPosition(rect: Rect, placement: TourStep['placement']) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceAbove = rect.top;
  const spaceBelow = vh - (rect.top + rect.height);
  const spaceLeft = rect.left;
  const spaceRight = vw - (rect.left + rect.width);

  let side: 'top' | 'bottom' | 'left' | 'right' = placement ?? 'bottom';
  const fits = {
    top: spaceAbove >= TOOLTIP_EST_HEIGHT + GAP,
    bottom: spaceBelow >= TOOLTIP_EST_HEIGHT + GAP,
    left: spaceLeft >= TOOLTIP_WIDTH + GAP,
    right: spaceRight >= TOOLTIP_WIDTH + GAP,
  };

  if (!fits[side]) {
    side = fits.bottom
      ? 'bottom'
      : fits.top
      ? 'top'
      : fits.right
      ? 'right'
      : fits.left
      ? 'left'
      : 'bottom';
  }

  let top = 0;
  let left = 0;

  if (side === 'top') {
    top = rect.top - GAP - TOOLTIP_EST_HEIGHT;
    left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
  } else if (side === 'bottom') {
    top = rect.top + rect.height + GAP;
    left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
  } else if (side === 'left') {
    top = rect.top + rect.height / 2 - TOOLTIP_EST_HEIGHT / 2;
    left = rect.left - GAP - TOOLTIP_WIDTH;
  } else {
    top = rect.top + rect.height / 2 - TOOLTIP_EST_HEIGHT / 2;
    left = rect.left + rect.width + GAP;
  }

  left = Math.min(Math.max(left, 12), vw - TOOLTIP_WIDTH - 12);
  top = Math.min(Math.max(top, 12), vh - TOOLTIP_EST_HEIGHT - 12);

  return { top, left, side };
}

export const GuidedTour = forwardRef<GuidedTourHandle, GuidedTourProps>(function GuidedTour(
  { steps, autoStart = true },
  ref
) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [clicking, setClicking] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const reducedMotion = usePrefersReducedMotion();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const finish = useCallback(() => {
    setActive(false);
    setShowTooltip(false);
    setRect(null);
  }, []);

  const start = useCallback(() => {
    setStepIndex(0);
    setShowTooltip(false);
    setActive(true);
  }, []);

  useImperativeHandle(ref, () => ({ start }), [start]);

  // Auto-start on every load (not just first visit).
  useEffect(() => {
    if (!mounted || !autoStart) return;
    const id = requestAnimationFrame(() => start());
    return () => cancelAnimationFrame(id);
  }, [mounted, autoStart, start]);

  // Drive each step: scroll target into view, measure it, glide the cursor,
  // "click", then reveal the tooltip.
  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) {
      finish();
      return;
    }

    const el = getTargetEl(step.targetSelector);
    const isVisible = el && el.offsetWidth > 0 && el.offsetHeight > 0;
    if (!el || !isVisible) {
      // Target isn't mounted, or hidden by a responsive layout — skip ahead.
      if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
      else finish();
      return;
    }

    setShowTooltip(false);
    setProgress(0);
    setPaused(false);

    el.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    const settleDelay = reducedMotion ? 0 : 380;
    settleTimerRef.current = setTimeout(() => {
      const nextRect = rectFromEl(el);
      setRect(nextRect);
      const targetCursor = {
        x: nextRect.left + nextRect.width / 2,
        y: nextRect.top + nextRect.height / 2,
      };
      setCursorPos(targetCursor);

      const arriveAfter = reducedMotion ? 0 : 700;
      const arriveTimer = setTimeout(() => {
        setClicking(true);
        const clickTimer = setTimeout(() => {
          setClicking(false);
          setShowTooltip(true);
        }, reducedMotion ? 0 : 220);
        settleTimerRef.current = clickTimer;
      }, arriveAfter);
      settleTimerRef.current = arriveTimer;
    }, settleDelay);

    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex, steps.length]);

  // Keep the spotlight glued to its target on resize/scroll.
  useEffect(() => {
    if (!active || !rect) return;
    const step = steps[stepIndex];
    let raf: number | null = null;

    const recompute = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = getTargetEl(step.targetSelector);
        if (el) setRect(rectFromEl(el));
      });
    };

    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  const goNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) finish();
    else setStepIndex((i) => i + 1);
  }, [stepIndex, steps.length, finish]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Auto-advance countdown, pausable on tooltip hover.
  useEffect(() => {
    if (!active || !showTooltip || paused) return;
    let raf: number;
    const start = performance.now() - progress * AUTO_ADVANCE_MS;
    const tick = (now: number) => {
      const pct = Math.min(1, (now - start) / AUTO_ADVANCE_MS);
      setProgress(pct);
      if (pct >= 1) {
        goNext();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, showTooltip, paused, stepIndex]);

  // Keyboard nav + focus trap.
  useEffect(() => {
    if (!active || !showTooltip) return;

    const focusables = () =>
      Array.from(
        tooltipRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    tooltipRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }
      if (e.key === 'Tab') {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, showTooltip, finish, goNext, goBack]);

  if (!mounted || !active || !rect) return null;

  const step = steps[stepIndex];
  const { top: tooltipTop, left: tooltipLeft, side } = computeTooltipPosition(rect, step.placement);
  const spotlight = {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  };

  return createPortal(
    <div className="fixed inset-0 z-9999" role="dialog" aria-modal="true" aria-label="Guided product tour">
      {/* Dimmed backdrop with a spotlight cutout, blocks all page interaction */}
      <div
        className="absolute inset-0"
        onClick={(e) => e.preventDefault()}
        style={{ cursor: 'default' }}
      >
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: 14,
            boxShadow:
              '0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px rgba(168,85,247,0.9), 0 0 28px 6px rgba(168,85,247,0.45)',
            pointerEvents: 'none',
            transition: reducedMotion
              ? 'none'
              : 'top 300ms ease, left 300ms ease, width 300ms ease, height 300ms ease',
          }}
        />
      </div>

      {/* Fake cursor */}
      {!reducedMotion && cursorPos && (
        <>
          {[0.16, 0.08, 0].map((delay, i) => (
            <motion.div
              key={i}
              className="pointer-events-none fixed top-0 left-0 z-10000"
              animate={{ x: cursorPos.x, y: cursorPos.y, opacity: i === 2 ? 1 : 0.25 - i * 0.05 }}
              transition={{ duration: 0.7, ease: [0.45, 0, 0.2, 1], delay }}
              style={{ willChange: 'transform' }}
            >
              <CursorIcon />
            </motion.div>
          ))}
          <motion.div
            className="pointer-events-none fixed top-0 left-0 z-10000"
            animate={{ x: cursorPos.x, y: cursorPos.y }}
            transition={{ duration: 0.7, ease: [0.45, 0, 0.2, 1] }}
          >
            <AnimatePresence>
              {clicking && (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0.7 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-accent/60"
                />
              )}
            </AnimatePresence>
            <motion.div animate={{ scale: clicking ? 0.8 : 1 }} transition={{ duration: 0.15 }}>
              <CursorIcon />
            </motion.div>
          </motion.div>
        </>
      )}

      {/* Tooltip card */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            ref={tooltipRef}
            tabIndex={-1}
            initial={reducedMotion ? false : { opacity: 0, y: side === 'top' ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{ position: 'fixed', top: tooltipTop, left: tooltipLeft, width: TOOLTIP_WIDTH }}
            className="z-10001 rounded-2xl border border-white/10 bg-[#0b0b12] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] p-4 outline-none"
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <button
                onClick={finish}
                aria-label="Skip tour"
                className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-text-dim hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
            <p className="text-xs text-text-dim leading-relaxed mb-3.5">{step.description}</p>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={finish}
                className="text-[11px] font-medium text-text-dim hover:text-white transition-colors cursor-pointer"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-text-dim hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={goNext}
                  className="relative w-7 h-7 rounded-lg flex items-center justify-center bg-accent text-white hover:bg-accent-glow transition-colors cursor-pointer"
                  aria-label="Next"
                >
                  <ArrowRight className="w-3.5 h-3.5 relative z-10" />
                  {!paused && (
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 28 28">
                      <circle
                        cx="14"
                        cy="14"
                        r="12.5"
                        fill="none"
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="2"
                        strokeDasharray={2 * Math.PI * 12.5}
                        strokeDashoffset={2 * Math.PI * 12.5 * (1 - progress)}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
});

function CursorIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: 'drop-shadow(0 3px 6px rgba(168,85,247,0.55))', transform: 'translate(-2px, -2px)' }}
    >
      <path
        d="M4 2.5L4 19.5L8.7 15.2L11.8 21.5L15 20L11.9 13.7L18.5 13.7L4 2.5Z"
        fill="white"
        stroke="#a855f7"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TourLauncherButtonProps {
  onClick: () => void;
  className?: string;
}

export function TourLauncherButton({ onClick, className }: TourLauncherButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:text-white transition-colors cursor-pointer',
        className
      )}
    >
      Take a tour
    </button>
  );
}
