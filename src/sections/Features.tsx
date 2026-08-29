'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import StudioLights from '@/components/three/StudioLights';
import MacbookModel from '@/components/three/MacbookModel';
import useMacbookStore from '@/store/macbookStore';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { Shield, Cpu, TrendingUp, RefreshCw, Clock, GripVertical, Sparkles, MousePointer, ChevronRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
      return;
    }
    originalWarn(...args);
  };
}

const cloudFeatures = [
  {
    id: 1,
    code: '01 // OPERATE',
    tag: 'cloud-ops',
    icon: Cpu,
    highlight: 'Operate: Automated Deployment',
    text: 'Keep applications running without disruption. Reliable cloud operations, monitoring & GitOps orchestration.',
    styles: 'left-3 sm:left-6 lg:left-8 right-auto top-[20%] lg:top-[22%]',
  },
  {
    id: 2,
    code: '02 // OPTIMIZE',
    tag: 'finops',
    icon: TrendingUp,
    highlight: 'Optimize: Cost & Performance',
    text: 'Reduce costs and improve performance with real-time rightsizing, savings plan reviews & spend analytics.',
    styles: 'right-3 sm:right-6 lg:right-8 left-auto top-[32%] lg:top-[34%]',
  },
  {
    id: 3,
    code: '03 // GOVERN',
    tag: 'security',
    icon: Shield,
    highlight: 'Govern: Threat & Security Scan',
    text: 'Continuous intrusion detection, automated compliance scanning & instant security risk mitigation.',
    styles: 'left-3 sm:left-6 lg:left-8 right-auto top-[46%] lg:top-[48%]',
  },
  {
    id: 4,
    code: '04 // TRANSFORM',
    tag: 'continuity',
    icon: RefreshCw,
    highlight: 'Transform: Continuity & DR',
    text: 'Strategic technology modernization with automated backups, cross-region failover & zero-data-loss.',
    styles: 'right-3 sm:right-6 lg:right-8 left-auto top-[58%] lg:top-[60%]',
  },
  {
    id: 5,
    code: '05 // CORE ENGINE',
    tag: 'sla',
    icon: Clock,
    highlight: 'CORE Engine: SLA Response',
    text: 'Operational intelligence & 24/7 dedicated engineers with response time guarantees from 15 mins.',
    styles: 'left-3 sm:left-6 lg:left-8 right-auto top-[72%] lg:top-[74%]',
  },
];

import { Group, Box3, Vector3 } from 'three';

const featureSequence = [
  '/videos/feature-1.mp4',
  '/videos/feature-2.mp4',
  '/videos/feature-3.mp4',
  '/videos/feature-4.mp4',
  '/videos/feature-5.mp4',
];

/**
 * Share of the canvas the laptop should occupy on each axis. Deliberately
 * short of the edges: the model rotates, so it needs headroom, and a subject
 * that touches the frame reads as cramped rather than as the focus.
 */
const FILL_WIDTH = 0.38;
const FILL_HEIGHT = 0.38;
/** Guard rails in case the model fails to measure. */
const MIN_SCALE = 0.05;
const MAX_SCALE = 0.18;

function LaptopContainer({ targetRotation }: { targetRotation: React.MutableRefObject<number> }) {
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  // Canvas dimensions in world units — this is the box the model has to fit,
  // and it dynamically adapts to screen size and aspect ratio.
  const viewport = useThree((state) => state.viewport);

  // Measured once the GLTF has loaded: how large the model is at scale 1.
  const naturalRef = useRef<{ w: number; h: number; cx: number; cy: number } | null>(null);
  const [scale, setScale] = useState(0.09);

  useFrame(() => {
    // Measure on the first frame after the model exists, then fit it to the canvas.
    if (!naturalRef.current && modelRef.current) {
      const box = new Box3().setFromObject(modelRef.current);
      const size = box.getSize(new Vector3());
      const centre = box.getCenter(new Vector3());
      if (size.x > 0 && size.y > 0) {
        naturalRef.current = {
          w: size.x / scale,
          h: size.y / scale,
          cx: centre.x / scale,
          cy: centre.y / scale,
        };
      }
    }

    const natural = naturalRef.current;
    if (natural) {
      // Dynamically scale based on viewport size and aspect ratio
      const isMobile = viewport.width < 10;
      const targetFillW = isMobile ? 0.38 : FILL_WIDTH;
      const targetFillH = isMobile ? 0.40 : FILL_HEIGHT;

      const fit = Math.min(
        (viewport.width * targetFillW) / natural.w,
        (viewport.height * targetFillH) / natural.h,
      );
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, fit));
      if (Math.abs(next - scale) > 0.001) setScale(next);

      // Center the model on its measured bounding box and position naturally in viewport below header text
      if (modelRef.current) {
        modelRef.current.position.set(-natural.cx * scale, -natural.cy * scale - 1.3, 0);
      }
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = gsap.utils.interpolate(
        groupRef.current.rotation.y,
        targetRotation.current,
        0.1
      );
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        <MacbookModel scale={scale} />
      </group>
    </group>
  );
}

export function Features() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetRotation = useRef<number>(0);
  const { setTexture } = useMacbookStore();

  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [isHoveringDropZone, setIsHoveringDropZone] = useState(false);

  useEffect(() => {
    // Preload videos
    featureSequence.forEach((src) => {
      const v = document.createElement('video');
      Object.assign(v, { src, muted: true, playsInline: true, preload: 'auto' });
      v.load();
    });

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Set initial invisible + offset state for feature cards
    gsap.set('.box', { opacity: 0, y: 60 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          if (draggedCardId === null) {
            targetRotation.current = self.progress * Math.PI * 2;
          }
        },
      },
    });

    const stepDuration = 1 / cloudFeatures.length;

    cloudFeatures.forEach((_, index) => {
      const boxClass = `.box${index + 1}`;
      const videoPath = featureSequence[index];
      const startTime = index * stepDuration;

      timeline.call(() => {
        if (draggedCardId === null && activeCardId === null) {
          setTexture(videoPath);
        }
      }, [], startTime);

      // Animate card from bottom (invisible) -> up to arranged position
      timeline.to(
        boxClass,
        {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: 'power2.out',
        },
        startTime
      );
    });

  }, { scope: containerRef, dependencies: [draggedCardId, activeCardId] });

  const handleSelectFeature = (featureId: number, index: number) => {
    setActiveCardId(featureId);
    setTexture(featureSequence[index]);
    targetRotation.current = index * (Math.PI * 0.4);
  };

  const handleDropOnLaptop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHoveringDropZone(false);
    try {
      const featureIdStr = e.dataTransfer.getData('text/plain');
      const featureId = parseInt(featureIdStr, 10);
      if (!isNaN(featureId)) {
        const featureIndex = cloudFeatures.findIndex((f) => f.id === featureId);
        if (featureIndex !== -1) {
          handleSelectFeature(featureId, featureIndex);
        }
      }
    } catch {
      /* ignore invalid data */
    }
  };

  return (
    <section ref={containerRef} id="features" className="relative w-full h-[320vh] bg-transparent">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-225 h-225 rounded-full bg-linear-to-b from-accent/10 via-purple-900/10 to-transparent blur-3xl" />
      </div>

      {/* Sticky Viewport Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-10">
        
        {/* Header (Positioned above 3D canvas - z-25) */}
        <div className="absolute top-0 left-0 right-0 pt-8 sm:pt-10 lg:pt-12 px-6 max-w-4xl mx-auto text-center pointer-events-none z-25">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Drag & Drop Showcase
          </div>
          <h2 className="font-display font-semibold text-fluid-h2 text-white">
            The OOGT Framework: <span className="stellar-gradient-text">Cloud Operations Center</span>
          </h2>
          <p className="text-fluid-body text-white/70 mt-2 max-w-2xl mx-auto font-medium">
            Drag any cloud operation card onto the 3D Laptop to highlight its dedicated telemetry state.
          </p>
        </div>

        {/* 3D Canvas & Drop Zone (Full Viewport Overlay - z-10) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsHoveringDropZone(true);
          }}
          onDragLeave={() => setIsHoveringDropZone(false)}
          onDrop={handleDropOnLaptop}
          className="absolute inset-0 w-full h-full flex items-center justify-center z-10"
        >
          {/* Interactive Drop Target Overlay when dragging */}
          {draggedCardId !== null && (
            <div
              className={cn(
                'absolute z-30 w-72 h-72 md:w-96 md:h-96 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 backdrop-blur-md pointer-events-auto',
                isHoveringDropZone
                  ? 'border-accent bg-accent/20 scale-110 shadow-[0_0_60px_rgba(168,85,247,0.6)]'
                  : 'border-white/30 bg-black/50 animate-pulse'
              )}
            >
              <MousePointer className="w-8 h-8 text-accent mb-2 animate-bounce" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {isHoveringDropZone ? 'Release to Load State' : 'Drop Card Here'}
              </span>
              <span className="text-xs text-text-dim mt-1">
                Syncs 3D Macbook Texture & Telemetry
              </span>
            </div>
          )}

          <Canvas
            id="f-canvas"
            className="w-full h-full"
            camera={{ position: [0, 0, 11.5], fov: 42 }}
          >
            <ambientLight intensity={1.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <StudioLights />
            <Suspense fallback={null}>
              <LaptopContainer targetRotation={targetRotation} />
            </Suspense>
          </Canvas>
        </div>

        {/* Feature Cards: Split into dedicated Left Rail and Right Rail Docks */}
        <div className="absolute inset-0 z-20 pointer-events-none flex justify-between p-2 sm:p-5 lg:p-8 pt-14 lg:pt-16 pb-10">
          {/* Left Dock Rail (Cards 1, 3, 5) */}
          <div className="flex flex-col justify-between h-[64vh] max-h-[calc(100vh-160px)] my-auto gap-2 sm:gap-3 pointer-events-none">
            {cloudFeatures.filter((_, i) => i % 2 === 0).map((feature) => {
              const index = feature.id - 1;
              const Icon = feature.icon;
              const isBeingDragged = draggedCardId === feature.id;
              const isHighlightedOnly = (draggedCardId !== null && isBeingDragged) || (draggedCardId === null && activeCardId === feature.id);
              const isDimmed = draggedCardId !== null && !isBeingDragged;

              return (
                <div
                  key={feature.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(feature.id));
                    setDraggedCardId(feature.id);
                  }}
                  onDragEnd={() => {
                    setDraggedCardId(null);
                    setIsHoveringDropZone(false);
                  }}
                  onClick={() => handleSelectFeature(feature.id, index)}
                  className={cn(
                    'box box' + (index + 1),
                    'w-56 sm:w-68 md:w-76 lg:w-84 xl:w-92 max-w-[calc(42vw-1rem)]',
                    'p-2.5 sm:p-3 rounded-2xl border backdrop-blur-2xl transition-all duration-300 pointer-events-auto shadow-2xl cursor-grab active:cursor-grabbing select-none group relative overflow-hidden',
                    isHighlightedOnly
                      ? 'bg-neutral-950/95 border-accent scale-105 shadow-[0_0_40px_rgba(139,92,247,0.5)] z-50 ring-2 ring-accent/60 opacity-100'
                      : isDimmed
                      ? 'opacity-15 scale-95 border-white/5 blur-[1px] grayscale pointer-events-none'
                      : 'bg-slate-950/85 border-white/10 hover:border-accent/40 hover:bg-neutral-950/90 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)]'
                  )}
                >
                  {/* Glowing Left Indicator Edge */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 bottom-0 w-1 transition-all duration-300',
                      isHighlightedOnly ? 'bg-accent shadow-[0_0_12px_#8b5cf6]' : 'bg-white/10 group-hover:bg-accent/60'
                    )}
                  />

                  {/* Eyebrow Header */}
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-widest text-white/40 uppercase mb-0.5 pl-1">
                    <span>{feature.code}</span>
                    {isHighlightedOnly ? (
                      <span className="text-accent flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" /> SYNCED
                      </span>
                    ) : (
                      <span className="text-white/30 group-hover:text-accent/80 transition-colors flex items-center gap-1">
                        <GripVertical className="w-3 h-3" /> DRAG
                      </span>
                    )}
                  </div>

                  {/* Icon & Highlight Title */}
                  <div className="flex items-start gap-2 sm:gap-2.5 pl-1">
                    <div
                      className={cn(
                        'w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 mt-0.5',
                        isHighlightedOnly
                          ? 'bg-accent text-white shadow-[0_0_20px_rgba(139,92,247,0.8)] scale-110'
                          : 'bg-accent/15 border border-accent/30 text-accent group-hover:bg-accent/25'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-xs sm:text-sm text-white leading-tight tracking-tight truncate">
                        {feature.highlight}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-white/60 leading-normal mt-0.5 line-clamp-2">
                        {feature.text}
                      </p>
                    </div>
                  </div>

                  {/* Micro Action Footer */}
                  <div className="mt-1.5 pt-1 border-t border-white/5 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/40 group-hover:text-accent transition-colors pl-1">
                    <span>Syncs 3D Macbook State</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Dock Rail (Cards 2, 4) */}
          <div className="flex flex-col justify-around h-[48vh] max-h-[calc(100vh-220px)] my-auto gap-2 sm:gap-3 pointer-events-none">
            {cloudFeatures.filter((_, i) => i % 2 === 1).map((feature) => {
              const index = feature.id - 1;
              const Icon = feature.icon;
              const isBeingDragged = draggedCardId === feature.id;
              const isHighlightedOnly = (draggedCardId !== null && isBeingDragged) || (draggedCardId === null && activeCardId === feature.id);
              const isDimmed = draggedCardId !== null && !isBeingDragged;

              return (
                <div
                  key={feature.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(feature.id));
                    setDraggedCardId(feature.id);
                  }}
                  onDragEnd={() => {
                    setDraggedCardId(null);
                    setIsHoveringDropZone(false);
                  }}
                  onClick={() => handleSelectFeature(feature.id, index)}
                  className={cn(
                    'box box' + (index + 1),
                    'w-56 sm:w-68 md:w-76 lg:w-84 xl:w-92 max-w-[calc(42vw-1rem)]',
                    'p-2.5 sm:p-3 rounded-2xl border backdrop-blur-2xl transition-all duration-300 pointer-events-auto shadow-2xl cursor-grab active:cursor-grabbing select-none group relative overflow-hidden',
                    isHighlightedOnly
                      ? 'bg-neutral-950/95 border-accent scale-105 shadow-[0_0_40px_rgba(139,92,247,0.5)] z-50 ring-2 ring-accent/60 opacity-100'
                      : isDimmed
                      ? 'opacity-15 scale-95 border-white/5 blur-[1px] grayscale pointer-events-none'
                      : 'bg-slate-950/85 border-white/10 hover:border-accent/40 hover:bg-neutral-950/90 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)]'
                  )}
                >
                  {/* Glowing Left Indicator Edge */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 bottom-0 w-1 transition-all duration-300',
                      isHighlightedOnly ? 'bg-accent shadow-[0_0_12px_#8b5cf6]' : 'bg-white/10 group-hover:bg-accent/60'
                    )}
                  />

                  {/* Eyebrow Header */}
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-widest text-white/40 uppercase mb-0.5 pl-1">
                    <span>{feature.code}</span>
                    {isHighlightedOnly ? (
                      <span className="text-accent flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" /> SYNCED
                      </span>
                    ) : (
                      <span className="text-white/30 group-hover:text-accent/80 transition-colors flex items-center gap-1">
                        <GripVertical className="w-3 h-3" /> DRAG
                      </span>
                    )}
                  </div>

                  {/* Icon & Highlight Title */}
                  <div className="flex items-start gap-2 sm:gap-2.5 pl-1">
                    <div
                      className={cn(
                        'w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 mt-0.5',
                        isHighlightedOnly
                          ? 'bg-accent text-white shadow-[0_0_20px_rgba(139,92,247,0.8)] scale-110'
                          : 'bg-accent/15 border border-accent/30 text-accent group-hover:bg-accent/25'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-xs sm:text-sm text-white leading-tight tracking-tight truncate">
                        {feature.highlight}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-white/60 leading-normal mt-0.5 line-clamp-2">
                        {feature.text}
                      </p>
                    </div>
                  </div>

                  {/* Micro Action Footer */}
                  <div className="mt-1.5 pt-1 border-t border-white/5 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/40 group-hover:text-accent transition-colors pl-1">
                    <span>Syncs 3D Macbook State</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}