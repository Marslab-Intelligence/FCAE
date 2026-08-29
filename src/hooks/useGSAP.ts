'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useGSAP() {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctx.current = gsap.context(() => {});
    return () => ctx.current?.revert();
  }, []);

  return ctx;
}

export function useScrollTrigger(
  trigger: string | Element,
  animation: gsap.TweenVars | ((self: ScrollTrigger) => gsap.TweenVars),
  options?: ScrollTrigger.Vars
) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(trigger, {
        scrollTrigger: {
          trigger,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
          ...options,
        },
        ...(typeof animation === 'function' ? animation({} as ScrollTrigger) : animation),
      });
    });

    return () => ctx.revert();
  }, [trigger, animation, options]);
}

export function useReveal(
  selector: string,
  options: {
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    ease?: string;
    start?: string;
    end?: string;
  } = {}
) {
  const {
    y = 40,
    opacity = 0,
    duration = 0.8,
    stagger = 0.1,
    ease = 'power3.out',
    start = 'top 85%',
    end = 'bottom 15%',
  } = options;

  useEffect(() => {
    // Own the context locally and revert it in cleanup. Previously this pushed into a
    // context created by a separate effect and never cleaned up, so every re-run left
    // its ScrollTriggers alive and stacked another set on the same elements.
    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray(selector) as Element[];
      elements.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y, opacity },
          {
            y: 0,
            opacity: 1,
            duration,
            ease,
            delay: i * stagger,
            scrollTrigger: {
              trigger: el,
              start,
              end,
              // One-shot. With 'play none none reverse' the reveal ran backwards on
              // scroll-up and left rows sitting at opacity 0 once you were back at the
              // top of the page — content that had already been read would vanish.
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [selector, y, opacity, duration, stagger, ease, start, end]);
}

export function useParallax(
  selector: string,
  speed = 0.5,
  options: { start?: string; end?: string } = {}
) {
  const { start, end } = options;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray(selector) as Element[];
      elements.forEach((el) => {
        gsap.to(el, {
          yPercent: -100 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: start || 'top bottom',
            end: end || 'bottom top',
            scrub: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, [selector, speed, start, end]);
}

export function useMagnetic(
  strength = 0.3,
  options: { area?: number; ease?: string } = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const { area = 150, ease = 'power3.out' } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);

      if (distance < area) {
        gsap.to(el, {
          x: x * strength,
          y: y * strength,
          duration: 0.3,
          ease,
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, area, ease]);

  return ref;
}

export function useCounter(
  end: number,
  options: { duration?: number; ease?: string; start?: number; decimals?: number } = {}
) {
  const { duration = 2, ease = 'power2.out', start = 0, decimals = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          // gsap.fromTo(target, fromVars, toVars): the counter object is the target.
          // This previously passed the object as the target AND {value: end} as the
          // "from" vars, leaving no end value in toVars — so the number never counted.
          const counter = { value: start };
          gsap.fromTo(
            counter,
            { value: start },
            {
              value: end,
              duration,
              ease,
              onUpdate: () => {
                el.textContent = counter.value.toFixed(decimals);
              },
            }
          );
        },
        once: true,
      });
    });

    return () => ctx.revert();
  }, [end, duration, ease, start, decimals]);

  return ref;
}

export function useTextReveal(
  selector: string,
  options: {
    split?: 'chars' | 'words' | 'lines';
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    ease?: string;
    start?: string;
  } = {}
) {
  const { split = 'words', y = 50, opacity = 0, duration = 0.8, stagger = 0.03, ease = 'power3.out', start = 'top 85%' } = options;

  useEffect(() => {
    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray(selector) as Element[];
      elements.forEach((el) => {
        const text = new SplitText(el, { type: split });
        splits.push(text);
        const targets = split === 'chars' ? text.chars : split === 'words' ? text.words : text.lines;

        gsap.fromTo(
          targets,
          { y, opacity },
          {
            y: 0,
            opacity: 1,
            duration,
            ease,
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: 'play none none none',
              once: true,
            },
            stagger,
          }
        );
      });
    });

    return () => {
      ctx.revert();
      // Put the original markup back. SplitText replaces innerHTML with per-word spans,
      // and gsap's revert doesn't undo that — leaving React's virtual DOM out of sync
      // with the real DOM, which breaks the next render of this subtree.
      splits.forEach((s) => s.revert());
    };
  }, [selector, split, y, opacity, duration, stagger, ease, start]);
}

export function useHoverScale(scale = 1.02, duration = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseEnter = () => {
      gsap.to(el, { scale, duration, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      gsap.to(el, { scale: 1, duration, ease: 'power2.out' });
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scale, duration]);

  return ref;
}

export function useGlow(intensity = 1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseEnter = () => {
      gsap.to(el, {
        boxShadow: `0 0 ${40 * intensity}px -10px rgba(168, 85, 247, ${0.4 * intensity})`,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, { boxShadow: 'none', duration: 0.3 });
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return ref;
}

class SplitText {
  chars: Element[] = [];
  words: Element[] = [];
  lines: Element[] = [];
  private element: Element;
  private originalHTML: string;

  revert() {
    this.element.innerHTML = this.originalHTML;
    this.chars = [];
    this.words = [];
    this.lines = [];
  }

  constructor(element: Element, options: { type: string }) {
    const text = element.textContent || '';
    this.element = element;
    this.originalHTML = element.innerHTML;
    element.innerHTML = '';

    if (options.type.includes('words') || options.type.includes('chars')) {
      const words = text.split(' ');
      words.forEach((word, wi) => {
        const wordEl = document.createElement('span');
        wordEl.style.display = 'inline-block';
        wordEl.style.opacity = '0';
        wordEl.style.transform = 'translateY(50px)';
        this.words.push(wordEl);

        if (options.type.includes('chars')) {
          word.split('').forEach((char) => {
            const charEl = document.createElement('span');
            charEl.style.display = 'inline-block';
            charEl.textContent = char;
            charEl.style.opacity = '0';
            charEl.style.transform = 'translateY(50px)';
            this.chars.push(charEl);
            wordEl.appendChild(charEl);
          });
        } else {
          wordEl.textContent = word;
        }

        element.appendChild(wordEl);
        if (wi < words.length - 1) {
          const space = document.createTextNode(' ');
          element.appendChild(space);
        }
      });
    }

    if (options.type.includes('lines')) {
      const lines = text.split('\n');
      lines.forEach((line) => {
        const lineEl = document.createElement('div');
        lineEl.style.opacity = '0';
        lineEl.style.transform = 'translateY(50px)';
        lineEl.textContent = line;
        this.lines.push(lineEl);
        element.appendChild(lineEl);
      });
    }
  }
}

if (typeof window !== 'undefined') {
  (window as unknown as { SplitText: typeof SplitText }).SplitText = SplitText;
}