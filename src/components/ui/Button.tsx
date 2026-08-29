'use client';

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      asChild: _asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      // stellar-ai: primary is a solid white pill with black label; the old
      // violet gradient + glow shadow is replaced by the flat minimal treatment.
      primary: 'bg-white text-black font-semibold hover:bg-white/90',
      secondary: 'liquid-glass text-white/90 hover:text-white',
      ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
      outline: 'bg-transparent text-white/80 border border-white/15 hover:bg-white/5 hover:border-white/30',
      link: 'bg-transparent text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5 h-9',
      md: 'px-6 py-3 text-base gap-2 h-11',
      lg: 'px-8 py-4 text-lg gap-2.5 h-13',
      xl: 'px-10 py-5 text-xl gap-3 h-15',
    };

    const iconSizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-full',
          'transition-all duration-300 ease-out',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className={cn('animate-spin', iconSizes[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className={cn('shrink-0', iconSizes[size])}>{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className={cn('shrink-0', iconSizes[size])}>{rightIcon}</span>
        ) : variant === 'primary' && !isLoading && !rightIcon ? (
          <ArrowRight className={cn('shrink-0 transition-transform duration-300', iconSizes[size])} />
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      href,
      ...props
    },
    ref
  ) => {
    const variants = {
      // stellar-ai: mirrors the Button variants above so <Button> and
      // <LinkButton> stay visually identical.
      primary: 'bg-white text-black font-semibold hover:bg-white/90',
      secondary: 'liquid-glass text-white/90 hover:text-white',
      ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
      outline: 'bg-transparent text-white/80 border border-white/15 hover:bg-white/5 hover:border-white/30',
      link: 'bg-transparent text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5 h-9',
      md: 'px-6 py-3 text-base gap-2 h-11',
      lg: 'px-8 py-4 text-lg gap-2.5 h-13',
      xl: 'px-10 py-5 text-xl gap-3 h-15',
    };

    const iconSizes = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6',
    };

    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-full',
          'transition-all duration-300 ease-out',
          'active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {leftIcon ? (
          <span className={cn('shrink-0', iconSizes[size])}>{leftIcon}</span>
        ) : null}
        {children}
        {!rightIcon && variant === 'primary' ? (
          <ArrowRight className={cn('shrink-0 transition-transform duration-300', iconSizes[size])} />
        ) : rightIcon ? (
          <span className={cn('shrink-0', iconSizes[size])}>{rightIcon}</span>
        ) : null}
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';