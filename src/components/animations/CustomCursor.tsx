'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CustomCursorProps {
  enabled?: boolean;
  className?: string;
}

const HOVER_TARGETS = 'a, button, [role="button"], input, textarea, select, .cursor-pointer, [data-cursor-hover]';

/**
 * Zero-React-state custom cursor.
 * All position/scale updates go directly to the DOM element via useRef,
 * eliminating the 60-per-second setState calls that caused jank.
 */
export function CustomCursor({ enabled = true, className }: CustomCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const canUseRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fine = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    canUseRef.current = fine.matches && !reduced.matches;

    const updateCan = () => { canUseRef.current = fine.matches && !reduced.matches; };
    fine.addEventListener('change', updateCan);
    reduced.addEventListener('change', updateCan);
    return () => {
      fine.removeEventListener('change', updateCan);
      reduced.removeEventListener('change', updateCan);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    if (!dot) return;

    let rafId: number;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      if (!canUseRef.current) { rafId = requestAnimationFrame(animate); return; }

      currentX = lerp(currentX, targetX, 0.18);
      currentY = lerp(currentY, targetY, 0.18);
      dot.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const onMove = (e: MouseEvent) => {
      if (!canUseRef.current) return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        dot.style.opacity = '1';
      }
      const hovering = !!(e.target as Element)?.closest?.(HOVER_TARGETS);
      dot.style.scale = hovering ? '2' : '1';
    };
    const onLeave = () => { dot.style.opacity = '0'; visibleRef.current = false; };
    const onDown  = () => { dot.style.scale = '0.7'; dot.style.opacity = '0.6'; };
    const onUp    = () => { dot.style.scale = '1'; dot.style.opacity = '1'; };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [enabled]);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={cn(
        'fixed top-0 left-0 w-2 h-2 rounded-full bg-accent pointer-events-none z-9999 opacity-0',
        className
      )}
      style={{
        boxShadow: '0 0 12px 2px rgba(168, 85, 247, 0.5)',
        transition: 'scale 0.15s ease, opacity 0.2s ease',
        willChange: 'transform',
      }}
    />
  );
}

export function CursorFollower({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      el.style.opacity = '1';
    };
    const onLeave = () => { el.style.opacity = '0'; };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn('fixed top-0 left-0 pointer-events-none z-50 opacity-0', className)}
      style={{ willChange: 'transform', transition: 'opacity 0.2s' }}
    >
      {children}
    </div>
  );
}