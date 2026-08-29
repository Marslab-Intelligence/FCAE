'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 25, className }: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const styles = Array.from({ length: number }).map(() => ({
        top: -5,
        left: `${Math.floor(Math.random() * 100)}%`,
        animationDelay: `${(Math.random() * 1.5 + 0.2).toFixed(2)}s`,
        animationDuration: `${Math.floor(Math.random() * 8 + 4)}s`,
      }));
      setMeteorStyles(styles);
    });
    return () => cancelAnimationFrame(id);
  }, [number]);

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-215 animate-meteor rounded-full bg-slate-300 shadow-[0_0_0_1px_#ffffff10]',
            className
          )}
          style={style}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-12.5 -translate-y-1/2 bg-linear-to-r from-accent/80 via-purple-400/40 to-transparent" />
        </span>
      ))}
    </>
  );
}
