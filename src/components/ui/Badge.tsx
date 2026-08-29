'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'lime' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    // stellar-ai: badges lose their saturated fills in favour of neutral
    // white-alpha chips; only the semantic states keep a colour cue.
    const variants = {
      default: 'bg-white/5 text-white/70 border border-white/10',
      accent: 'bg-white/5 text-violet-300 border-white/10',
      lime: 'bg-white/5 text-cyan-300 border-white/10',
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      outline: 'bg-transparent text-white/60 border-white/15',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-3 py-1 text-sm gap-1.5',
      lg: 'px-4 py-1.5 text-base gap-2',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'accent' && 'bg-accent',
              variant === 'lime' && 'bg-lime',
              variant === 'success' && 'bg-green-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'default' && 'bg-white/30',
              variant === 'outline' && 'bg-white/30'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';