'use client';

import { forwardRef } from 'react';

/**
 * Shared SVG displacement filter for the hover-scoped fluid-glass cursor lens
 * (see GlassLensCursor + PricingCard in Pricing.tsx). Render once per page —
 * every lens instance references the same filter id via backdrop-filter,
 * which bends the *actual* rendered content behind it (no WebGL involved).
 */
export function GlassLensFilterDefs() {
  return (
    <svg aria-hidden focusable="false" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <filter id="fluid-glass-lens" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.011" numOctaves="2" seed="14" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="5" result="softMap" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="60" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

interface GlassLensCursorProps {
  tint: string;
  size?: number;
}

export const GlassLensCursor = forwardRef<HTMLDivElement, GlassLensCursorProps>(function GlassLensCursor(
  { tint, size = 130 },
  ref
) {
  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: '9999px',
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 280ms ease',
        transform: 'translate3d(-9999px, -9999px, 0)',
        willChange: 'transform',
        backdropFilter: 'url(#fluid-glass-lens) saturate(1.4) brightness(1.45) contrast(1.05)',
        WebkitBackdropFilter: 'blur(1px) saturate(1.4) brightness(1.45) contrast(1.05)',
        background: `${tint}0a`,
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow:
          'inset 0 1px 1px rgba(255,255,255,0.45), inset 0 -10px 20px rgba(0,0,0,0.18), 0 12px 28px -8px rgba(0,0,0,0.5)',
        zIndex: 20,
      }}
    />
  );
});
