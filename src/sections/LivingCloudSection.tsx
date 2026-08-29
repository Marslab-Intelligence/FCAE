'use client';

import { useRef, type RefObject } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContainerScrollProgress } from '@/hooks/useContainerScrollProgress';
import { useLenisScrollTo } from '@/components/SmoothScrollProvider';
import { HudCard } from '@/components/HudCard';
import { chapter1Content, chapter2Content, chapter3Content, chapter4Content } from '@/data/livingCloud';
import { CHAPTER3_BENEFIT_POINTS, CHAPTER_COUNT } from '@/lib/livingCloudChapters';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LivingCloudScene = dynamic(() => import('@/components/three/LivingCloudScene'), {
  ssr: false,
});

const PIN_DISTANCE = `${CHAPTER_COUNT * 100}%`;

export function LivingCloudSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { progressRef, chapter, isActive, scrollTriggerRef } = useContainerScrollProgress(sectionRef, {
    distance: PIN_DISTANCE,
    chapters: CHAPTER_COUNT,
  });

  // One master timeline for ALL chapters' DOM content, scrubbed against the
  // same pinned range as the hook above (a second, non-pinning ScrollTrigger
  // on the same trigger/start/end — the established multi-trigger pattern
  // already used elsewhere in this codebase, e.g. CloudPillarsShowcase).
  //
  // Each chapter's tweens live at absolute position [index, index + 1) on
  // this timeline, so a chapter's own local 0-1 choreography is just
  // `index + localFraction`. This intentionally replaces giving each chapter
  // its own ScrollTrigger: a per-chapter trigger keyed off "top top" only
  // produces the correct range for chapter 0, since every chapter's content
  // div is absolutely positioned at the same spot (the pinned viewport) —
  // chapter 1+ would silently reuse chapter 0's scroll window.
  useGSAP(
    () => {
      const trigger = sectionRef.current;
      if (!trigger) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power1.inOut' },
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: `+=${PIN_DISTANCE}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      addChapter1Tweens(tl, 0);
      addChapter2Tweens(tl, 1);
      addChapter3Tweens(tl, 2);
      addChapter4Tweens(tl, 3);

      // Pin the timeline's total duration to exactly CHAPTER_COUNT units so
      // scrub maps cleanly even before later chapters add their own tweens.
      tl.to({}, { duration: 0.001 }, CHAPTER_COUNT);
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      id="living-cloud"
      className="relative w-full h-screen overflow-hidden bg-transparent"
    >
      <div className="absolute inset-0">
        <LivingCloudScene progressRef={progressRef} />
      </div>

      <Chapter1 />
      <Chapter2 />
      <Chapter3 />
      <Chapter4 />

      <ChapterNav chapter={chapter} isActive={isActive} scrollTriggerRef={scrollTriggerRef} />
    </section>
  );
}

function addChapter1Tweens(tl: gsap.core.Timeline, offset: number) {
  // Eyebrow + headline + subhead — open.
  tl.fromTo(
    '.ch1-intro',
    { opacity: 0, filter: 'blur(14px)', y: 24 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.1 },
    offset + 0
  );
  tl.to('.ch1-intro', { opacity: 0, filter: 'blur(8px)', y: -16, duration: 0.08 }, offset + 0.2);

  // HUD data panel: fade in -> tether -> corners -> frame draw -> kicker -> body wipe -> tags.
  tl.fromTo('.hud-card-1', { opacity: 0 }, { opacity: 1, duration: 0.04 }, offset + 0.26);
  tl.fromTo(
    '.ch1-tether',
    { scaleX: 0, opacity: 0 },
    { scaleX: 1, opacity: 1, duration: 0.04 },
    offset + 0.28
  );
  tl.fromTo(
    '.hud-card-1 .hud-corner',
    { opacity: 0, scale: 0.4 },
    { opacity: 1, scale: 1, duration: 0.05, stagger: 0.015 },
    offset + 0.3
  );
  tl.fromTo(
    '.hud-card-1 .hud-frame-rect',
    { strokeDashoffset: 1320 },
    { strokeDashoffset: 0, duration: 0.12, ease: 'none' },
    offset + 0.34
  );
  tl.fromTo('.hud-card-1 .hud-kicker', { opacity: 0 }, { opacity: 1, duration: 0.04 }, offset + 0.4);
  tl.fromTo(
    '.hud-card-1 .hud-body',
    { clipPath: 'inset(0% 0% 100% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14, ease: 'power2.out' },
    offset + 0.44
  );
  tl.fromTo(
    '.hud-card-1 .hud-tag',
    { opacity: 0, scale: 0.8, y: 6 },
    { opacity: 1, scale: 1, y: 0, duration: 0.05, stagger: 0.02 },
    offset + 0.56
  );
  tl.to('.hud-card-1', { opacity: 0, filter: 'blur(10px)', duration: 0.06 }, offset + 0.74);

  // Closer line + partner badges.
  tl.fromTo(
    '.ch1-closer',
    { opacity: 0, filter: 'blur(14px)', y: 20 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.12 },
    offset + 0.8
  );
  tl.fromTo('.ch1-badges', { opacity: 0, y: 10 }, { opacity: 0.7, y: 0, duration: 0.1 }, offset + 0.86);

  // Clean up before chapter 2's own headline takes the stage.
  tl.to(['.ch1-closer', '.ch1-badges'], { opacity: 0, duration: 0.05 }, offset + 1.0);
}

function addChapter2Tweens(tl: gsap.core.Timeline, offset: number) {
  tl.fromTo(
    '.ch2-headline',
    { opacity: 0, filter: 'blur(14px)', y: 24 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.1 },
    offset + 0
  );
  tl.to('.ch2-headline', { opacity: 0, filter: 'blur(8px)', y: -16, duration: 0.08 }, offset + 0.18);

  tl.fromTo('.hud-card-2', { opacity: 0 }, { opacity: 1, duration: 0.04 }, offset + 0.24);
  tl.fromTo(
    '.ch2-tether',
    { scaleX: 0, opacity: 0 },
    { scaleX: 1, opacity: 1, duration: 0.04 },
    offset + 0.26
  );
  tl.fromTo(
    '.hud-card-2 .hud-corner',
    { opacity: 0, scale: 0.4 },
    { opacity: 1, scale: 1, duration: 0.05, stagger: 0.015 },
    offset + 0.28
  );
  tl.fromTo(
    '.hud-card-2 .hud-frame-rect',
    { strokeDashoffset: 1320 },
    { strokeDashoffset: 0, duration: 0.12, ease: 'none' },
    offset + 0.32
  );
  tl.fromTo('.hud-card-2 .hud-kicker', { opacity: 0 }, { opacity: 1, duration: 0.04 }, offset + 0.38);
  tl.fromTo(
    '.hud-card-2 .hud-body',
    { clipPath: 'inset(0% 0% 100% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, ease: 'power2.out' },
    offset + 0.42
  );
  tl.to('.hud-card-2', { opacity: 0, filter: 'blur(10px)', duration: 0.06 }, offset + 0.76);

  tl.fromTo(
    '.ch2-closer',
    { opacity: 0, filter: 'blur(14px)', y: 20 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.12 },
    offset + 0.82
  );

  tl.to(['.ch2-closer'], { opacity: 0, duration: 0.05 }, offset + 1.0);
}

function addChapter3Tweens(tl: gsap.core.Timeline, offset: number) {
  tl.fromTo(
    '.ch3-headline',
    { opacity: 0, filter: 'blur(14px)', y: 24 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.1 },
    offset + 0
  );
  tl.to('.ch3-headline', { opacity: 0, filter: 'blur(8px)', y: -16, duration: 0.08 }, offset + 0.18);

  tl.fromTo('.hud-card-3', { opacity: 0 }, { opacity: 1, duration: 0.04 }, offset + 0.24);
  tl.fromTo(
    '.ch3-tether',
    { scaleX: 0, opacity: 0 },
    { scaleX: 1, opacity: 1, duration: 0.04 },
    offset + 0.26
  );
  tl.fromTo(
    '.hud-card-3 .hud-corner',
    { opacity: 0, scale: 0.4 },
    { opacity: 1, scale: 1, duration: 0.05, stagger: 0.015 },
    offset + 0.28
  );
  tl.fromTo(
    '.hud-card-3 .hud-frame-rect',
    { strokeDashoffset: 1320 },
    { strokeDashoffset: 0, duration: 0.12, ease: 'none' },
    offset + 0.32
  );
  tl.fromTo('.hud-card-3 .hud-kicker', { opacity: 0 }, { opacity: 1, duration: 0.04 }, offset + 0.38);
  tl.fromTo(
    '.hud-card-3 .hud-body',
    { clipPath: 'inset(0% 0% 100% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, ease: 'power2.out' },
    offset + 0.42
  );
  tl.to('.hud-card-3', { opacity: 0, filter: 'blur(10px)', duration: 0.06 }, offset + 0.6);

  // Benefits checklist — one line per CORE scan pass, synced against the
  // same CHAPTER3_BENEFIT_POINTS the 3D scan-sweep's flash trigger reads.
  tl.fromTo('.ch3-benefits', { opacity: 0 }, { opacity: 1, duration: 0.03 }, offset + 0.64);
  CHAPTER3_BENEFIT_POINTS.forEach((point, i) => {
    tl.fromTo(
      `.ch3-benefit-${i}`,
      { opacity: 0, filter: 'blur(6px)', x: -12 },
      { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.035 },
      offset + point
    );
  });
  tl.to('.ch3-benefits', { opacity: 0, duration: 0.03 }, offset + 0.88);

  // Fade-in finishes well before the chapter boundary (unlike the previous
  // 0.92 + 0.12 duration, which ran until 1.04 and fought the fade-out tween
  // below — starting at exactly 1.0 — for opacity every frame in between,
  // reading as blurry/illegible text). This leaves a clean ~0.07-unit hold
  // at full clarity before anything starts moving again.
  tl.fromTo(
    '.ch3-closer',
    { opacity: 0, filter: 'blur(14px)', y: 20 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.05 },
    offset + 0.88
  );

  tl.to(['.ch3-closer'], { opacity: 0, duration: 0.05 }, offset + 1.0);
}

function addChapter4Tweens(tl: gsap.core.Timeline, offset: number) {
  tl.fromTo(
    '.ch4-intro',
    { opacity: 0, filter: 'blur(14px)', y: 24 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.1 },
    offset + 0
  );
  tl.to('.ch4-intro', { opacity: 0, filter: 'blur(8px)', y: -16, duration: 0.06 }, offset + 0.16);

  // Outcome stat grid — staggers in as the camera completes its slow orbit.
  tl.fromTo('.ch4-stats', { opacity: 0 }, { opacity: 1, duration: 0.03 }, offset + 0.24);
  tl.fromTo(
    '.ch4-stat',
    { opacity: 0, y: 10, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 0.035, stagger: 0.03 },
    offset + 0.26
  );
  tl.to('.ch4-stats', { opacity: 0, duration: 0.04 }, offset + 0.56);

  // Pull quote.
  tl.fromTo(
    '.ch4-quote',
    { opacity: 0, filter: 'blur(10px)', y: 16 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.08 },
    offset + 0.62
  );
  tl.to('.ch4-quote', { opacity: 0, filter: 'blur(8px)', y: -12, duration: 0.06 }, offset + 0.82);

  // Final line — largest text in the section, holds through the pin release
  // and the handoff into Six Pillars rather than fading back out.
  tl.fromTo(
    '.ch4-final',
    { opacity: 0, filter: 'blur(16px)', y: 24 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.14 },
    offset + 0.9
  );
}

const CHAPTER_NAV_LABELS = ['Formation', 'Expansion', 'Intelligence', 'Outcome'];

/** Fixed desktop side nav — numbered chapter dots that jump via the existing Lenis instance. */
function ChapterNav({
  chapter,
  isActive,
  scrollTriggerRef,
}: {
  chapter: number;
  isActive: boolean;
  scrollTriggerRef: RefObject<ScrollTrigger | null>;
}) {
  const scrollTo = useLenisScrollTo();

  const goToChapter = (index: number) => {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const target = st.start + (index / CHAPTER_COUNT) * (st.end - st.start);
    scrollTo(target, { duration: 1.1 });
  };

  return (
    <div
      className={cn(
        'fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-500 lg:flex',
        isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {CHAPTER_NAV_LABELS.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => goToChapter(i)}
          aria-label={`Go to chapter ${i + 1}: ${label}`}
          aria-current={chapter === i ? 'step' : undefined}
          className={cn(
            'group flex items-center gap-3 rounded-full border text-xs font-semibold uppercase tracking-wide transition-all duration-300',
            chapter === i
              ? 'border-[#a5f3fc] bg-[#a5f3fc]/15 text-[#a5f3fc] shadow-[0_0_16px_rgba(165,243,252,0.5)]'
              : 'border-white/20 bg-black/40 text-white/50 hover:border-white/40 hover:text-white/80'
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            0{i + 1}
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-32 group-hover:pr-4 group-hover:opacity-100">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

function Chapter1() {
  return (
    <div className="absolute inset-0 z-20 px-6 pointer-events-none">
      <div className="ch1-intro absolute inset-x-6 top-[16%] flex flex-col items-center text-center opacity-0 sm:top-[18%]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#a5f3fc]">
          {chapter1Content.eyebrow}
        </p>
        <h2 className="eos-gradient-text mb-4 max-w-3xl text-fluid-hero font-extrabold text-balance">
          {chapter1Content.headline}
        </h2>
        <p className="max-w-xl text-fluid-body font-light text-white/85">{chapter1Content.subhead}</p>
      </div>

      <div className="absolute bottom-[10%] inset-x-6 sm:inset-x-auto sm:right-[8%] sm:w-full sm:max-w-sm">
        <div className="ch1-tether mb-3 h-px w-10 origin-left bg-linear-to-r from-[#a5f3fc] to-transparent opacity-0" />
        <HudCard
          className="hud-card-1 opacity-0"
          kicker={chapter1Content.cardKicker}
          body={chapter1Content.cardBody}
          tags={chapter1Content.cardTags}
        />
      </div>

      <p className="ch1-closer eos-gradient-text absolute inset-x-6 top-1/2 max-w-3xl -translate-y-1/2 text-center text-fluid-hero font-extrabold text-balance opacity-0 mx-auto">
        {chapter1Content.closer.line1}
        <br />
        <span className="text-[#a5f3fc] drop-shadow-[0_0_40px_rgba(165,243,252,0.8)]">
          {chapter1Content.closer.line2}
        </span>
      </p>

      <div className="ch1-badges absolute bottom-[6%] left-1/2 flex -translate-x-1/2 items-center gap-6 opacity-0">
        {chapter1Content.partnerBadges.map((badge) => (
          <Image
            key={badge.src}
            src={badge.src}
            alt={badge.alt}
            width={140}
            height={60}
            unoptimized
            className="h-8 w-auto object-contain opacity-80 sm:h-10"
          />
        ))}
      </div>
    </div>
  );
}

function Chapter2() {
  return (
    <div className="absolute inset-0 z-20 px-6 pointer-events-none">
      <h2 className="ch2-headline eos-gradient-text absolute inset-x-6 top-[20%] mx-auto max-w-3xl text-center text-fluid-hero font-extrabold text-balance opacity-0">
        {chapter2Content.headline}
      </h2>

      <div className="absolute bottom-[10%] inset-x-6 sm:inset-x-auto sm:left-[8%] sm:w-full sm:max-w-sm">
        <div className="ch2-tether mb-3 ml-auto h-px w-10 origin-right bg-linear-to-l from-[#a5f3fc] to-transparent opacity-0" />
        <HudCard
          className="hud-card-2 opacity-0"
          kicker={chapter2Content.cardKicker}
          body={chapter2Content.cardBody}
        />
      </div>

      <p className="ch2-closer eos-gradient-text absolute inset-x-6 top-1/2 max-w-3xl -translate-y-1/2 text-center text-fluid-hero font-extrabold text-balance opacity-0 mx-auto">
        {chapter2Content.closer.line1}
        <br />
        <span className="text-[#a5f3fc] drop-shadow-[0_0_40px_rgba(165,243,252,0.8)]">
          {chapter2Content.closer.line2}
        </span>
      </p>
    </div>
  );
}

function Chapter3() {
  return (
    <div className="absolute inset-0 z-20 px-6 pointer-events-none">
      <h2 className="ch3-headline eos-gradient-text absolute inset-x-6 top-[18%] mx-auto max-w-3xl text-center text-fluid-hero font-extrabold text-balance opacity-0">
        {chapter3Content.headline}
      </h2>

      <div className="absolute bottom-[10%] inset-x-6 sm:inset-x-auto sm:right-[8%] sm:w-full sm:max-w-sm">
        <div className="ch3-tether mb-3 h-px w-10 origin-left bg-linear-to-r from-[#a5f3fc] to-transparent opacity-0" />
        <HudCard
          className="hud-card-3 opacity-0"
          kicker={chapter3Content.cardKicker}
          body={chapter3Content.cardBody}
        />
      </div>

      {/* Same bottom-anchored slot as the HUD card above — they never appear
          simultaneously, and staying off dead-center keeps this list clear of
          the fragment labels orbiting the cloud, especially on narrow screens. */}
      <div className="ch3-benefits absolute bottom-[10%] inset-x-6 sm:inset-x-auto sm:right-[8%] sm:w-full sm:max-w-sm opacity-0">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a5f3fc] sm:text-left">
          CORE Intelligence
        </p>
        <ul className="space-y-2">
          {chapter3Content.benefits.map((benefit, i) => (
            <li
              key={benefit}
              className={`ch3-benefit-${i} flex items-center gap-2.5 rounded-lg border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white/85 backdrop-blur-sm opacity-0 sm:text-sm`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#a5f3fc]" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <p className="ch3-closer eos-gradient-text absolute inset-x-6 top-1/2 max-w-3xl -translate-y-1/2 text-center text-fluid-hero font-extrabold text-balance opacity-0 mx-auto">
        {chapter3Content.closer.line1}
        <br />
        <span className="text-[#a5f3fc] drop-shadow-[0_0_40px_rgba(165,243,252,0.8)]">
          {chapter3Content.closer.line2}
        </span>
      </p>
    </div>
  );
}

function Chapter4() {
  return (
    <div className="absolute inset-0 z-20 px-6 pointer-events-none">
      <div className="ch4-intro absolute inset-x-6 top-[16%] mx-auto flex max-w-3xl flex-col items-center text-center opacity-0">
        <h2 className="eos-gradient-text mb-4 text-fluid-hero font-extrabold text-balance">
          {chapter4Content.headline}
        </h2>
        <p className="max-w-xl text-fluid-body font-light text-white/85">{chapter4Content.subline}</p>
      </div>

      <div className="ch4-stats absolute top-1/2 inset-x-6 -translate-y-1/2 opacity-0 sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a5f3fc]">
          {chapter4Content.cardKicker}
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:gap-2.5 sm:grid-cols-2">
          {chapter4Content.stats.map((stat) => (
            <li
              key={stat}
              className="ch4-stat flex items-start gap-2.5 rounded-lg border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white/85 backdrop-blur-sm opacity-0 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a5f3fc]" />
              {stat}
            </li>
          ))}
        </ul>
      </div>

      <div className="ch4-quote absolute top-1/2 inset-x-6 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/50 px-6 py-6 text-center opacity-0 backdrop-blur-md sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:px-12 sm:py-10">
        <p className="font-display-serif text-fluid-h1 leading-snug text-white italic text-balance">
          &ldquo;{chapter4Content.pullQuote.quote}&rdquo;
        </p>
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[#a5f3fc]/80">
          {chapter4Content.pullQuote.attribution}
        </p>
      </div>

      <p className="ch4-final eos-gradient-text absolute inset-x-6 top-1/2 mx-auto max-w-4xl -translate-y-1/2 text-center text-[clamp(2.5rem,1.2rem+6vw,6rem)] leading-[1.05] font-extrabold text-balance opacity-0">
        {chapter4Content.final.line1}
        <br />
        <span className="text-[#a5f3fc] drop-shadow-[0_0_40px_rgba(165,243,252,0.8)]">
          {chapter4Content.final.line2}
        </span>
      </p>
    </div>
  );
}
