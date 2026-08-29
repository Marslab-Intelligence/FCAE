'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MagneticProps {
  children: React.ReactElement;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0)';
      element.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    };

    const handleMouseEnter = () => {
      element.style.transition = 'transform 0.1s ease-out';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn('inline-block', className)}>
      {children}
    </div>
  );
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  once?: boolean;
  trigger?: 'parent' | 'self';
}

export function ScrollReveal({
  children,
  className,
  y = 50,
  opacity = 0,
  duration = 1,
  delay = 0,
  stagger = 0,
  once = true,
  trigger = 'parent',
}: ScrollRevealProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const elements = trigger === 'parent' ? [parent] : Array.from(childRefs.current).filter(Boolean) as HTMLElement[];

    elements.forEach((el) => {
      const childElements = trigger === 'parent' ? Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]')) : [el];

      childElements.forEach((child, childIndex) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: parent,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: once ? 'play none none reverse' : 'play none none reverse',
            once,
          },
        });

        tl.fromTo(
          child,
          { y, opacity },
          {
            y: 0,
            opacity: 1,
            duration,
            delay: delay + (stagger ? childIndex * stagger : 0),
            ease: 'power3.out',
          }
        );
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === parent) st.kill();
      });
    };
  }, [y, opacity, duration, delay, stagger, once, trigger]);

  const setChildRef = (index: number) => (el: HTMLDivElement | null) => {
    childRefs.current[index] = el;
  };

  return (
    <div ref={parentRef} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        // Use the child's ref if it's a DOM element, otherwise just pass data-reveal
        const childProps: Record<string, unknown> = { 'data-reveal': true };
        if (typeof child.type !== 'string') {
          // For custom components, we can't forward ref easily
          return React.cloneElement(child as React.ReactElement, childProps);
        }
        // For DOM elements, we can use the ref
        return React.cloneElement(child as React.ReactElement, {
          ...childProps,
          ref: setChildRef(index),
        } as React.HTMLAttributes<HTMLDivElement>);
      })}
    </div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const rate = (rect.top - window.innerHeight) * speed;
      element.style.transform = `translate3d(0, ${rate}px, 0)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return <div ref={ref} className={cn('relative', className)}>{children}</div>;
}

interface FloatingProps {
  children: React.ReactNode;
  amplitude?: number;
  frequency?: number;
  className?: string;
}

export function Floating({ children, amplitude = 10, frequency = 1, className }: FloatingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const startTime = Date.now();
    let animationId: number;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const y = Math.sin(elapsed * frequency) * amplitude;
      const x = Math.cos(elapsed * frequency * 0.7) * amplitude * 0.5;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [amplitude, frequency]);

  return <div ref={ref} className={cn('will-change-transform', className)}>{children}</div>;
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}

export function StaggerChildren({ children, stagger = 0.1, delay = 0, className }: StaggerChildrenProps) {
  return (
    <motion.div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        // Wrap all children in motion.div to ensure they get animation props
        if (typeof child.type === 'string') {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + index * stagger, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {child}
            </motion.div>
          );
        }
        // For custom components, wrap them in motion.div
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + index * stagger, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}