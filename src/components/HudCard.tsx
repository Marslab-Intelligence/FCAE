'use client';

import { cn } from '@/lib/utils';

interface HudCardProps {
  kicker: string;
  body: string;
  tags?: readonly string[];
  className?: string;
}

const CORNERS = [
  { key: 'tl', classes: 'top-0 left-0 border-t-2 border-l-2 rounded-tl-sm' },
  { key: 'tr', classes: 'top-0 right-0 border-t-2 border-r-2 rounded-tr-sm' },
  { key: 'bl', classes: 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm' },
  { key: 'br', classes: 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm' },
] as const;

/**
 * A sci-fi "HUD data panel" — not a plain glass card. Its corner brackets,
 * hand-drawn SVG border, and clip-path text wipe are choreographed by the
 * caller's own GSAP scroll timeline (selectors: .hud-tether, .hud-corner,
 * .hud-frame-rect, .hud-kicker, .hud-body, .hud-tag).
 */
export function HudCard({ kicker, body, tags, className }: HudCardProps) {
  return (
    <div className={cn('hud-card relative w-full max-w-md', className)}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 400 260"
        preserveAspectRatio="none"
        fill="none"
      >
        <rect
          className="hud-frame-rect"
          x="1"
          y="1"
          width="398"
          height="258"
          rx="6"
          stroke="#a5f3fc"
          strokeWidth="1.2"
          strokeDasharray="1320"
          strokeDashoffset="1320"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {CORNERS.map((corner) => (
        <span
          key={corner.key}
          className={cn('hud-corner absolute h-4 w-4 border-[#a5f3fc] opacity-0', corner.classes)}
        />
      ))}

      <div className="relative bg-black/30 px-6 py-6 backdrop-blur-sm sm:px-8 sm:py-7">
        <p className="hud-kicker mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a5f3fc]">
          {kicker}
        </p>
        <p className="hud-body text-sm leading-relaxed text-white/80 sm:text-base">{body}</p>
        {tags && tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="hud-tag rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/80 opacity-0"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
