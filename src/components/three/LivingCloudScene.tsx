'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Code2, Shield, TrendingUp, User, type LucideIcon } from 'lucide-react';
import * as THREE from 'three';
import type { RefObject } from 'react';
import { CHAPTER3_BENEFIT_POINTS, CHAPTER_COUNT, chapterProgress, smoothstep } from '@/lib/livingCloudChapters';
import { chapter2Content } from '@/data/livingCloud';

const ROLE_NODES: { label: string; Icon: LucideIcon }[] = [
  { label: 'Architects', Icon: User },
  { label: 'Engineers', Icon: Code2 },
  { label: 'Specialists', Icon: Shield },
  { label: 'Advisors', Icon: TrendingUp },
];

const PARTICLE_COUNT_DESKTOP = 700;
const PARTICLE_COUNT_MOBILE = 220;

function subscribeToResize(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getIsMobileSnapshot() {
  return window.innerWidth < 640;
}

function getIsMobileServerSnapshot() {
  return false;
}

/**
 * `window.innerWidth` is external mutable state, so this reads it via
 * `useSyncExternalStore` rather than `useState` + effect — the effect version
 * calls `setState` unconditionally on mount, which this repo's
 * react-hooks/set-state-in-effect rule flags as a cascading-render risk.
 * This also picks up resize/orientation changes for free, which the old
 * mount-only effect never did.
 */
function useIsMobile() {
  return useSyncExternalStore(subscribeToResize, getIsMobileSnapshot, getIsMobileServerSnapshot);
}

interface ParticleData {
  starts: Float32Array;
  targets: Float32Array;
  seeds: Float32Array;
}

function ParticleField({ progressRef, count }: { progressRef: RefObject<number>; count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const dataRef = useRef<ParticleData | null>(null);

  // Random particle layout is generated once on mount (not during render) to
  // stay pure per this repo's react-hooks/purity rule — see meteors.tsx for
  // the same pattern.
  useEffect(() => {
    const starts = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Scattered starfield-like origin: random within a wide shell.
      const r = 10 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starts[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      starts[i * 3 + 2] = r * Math.cos(phi);

      // Target: jittered points on a sphere shell — the cloud silhouette.
      const tr = 2.3 + Math.random() * 0.5;
      const tt = Math.random() * Math.PI * 2;
      const tp = Math.acos(2 * Math.random() - 1);
      targets[i * 3] = tr * Math.sin(tp) * Math.cos(tt);
      targets[i * 3 + 1] = tr * Math.sin(tp) * Math.sin(tt);
      targets[i * 3 + 2] = tr * Math.cos(tp);

      seeds[i] = Math.random() * 0.6;
    }

    dataRef.current = { starts, targets, seeds };

    const geo = pointsRef.current?.geometry;
    geo?.setAttribute('position', new THREE.BufferAttribute(starts.slice(), 3));
  }, [count]);

  useFrame(() => {
    const data = dataRef.current;
    const geo = pointsRef.current?.geometry;
    if (!data || !geo) return;
    const p = chapterProgress(progressRef.current ?? 0, 0);
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const seed = data.seeds[i];
      const local = smoothstep(seed, 1, p);
      const ix = i * 3;
      posAttr.array[ix] = THREE.MathUtils.lerp(data.starts[ix], data.targets[ix], local);
      posAttr.array[ix + 1] = THREE.MathUtils.lerp(data.starts[ix + 1], data.targets[ix + 1], local);
      posAttr.array[ix + 2] = THREE.MathUtils.lerp(data.starts[ix + 2], data.targets[ix + 2], local);
    }
    posAttr.needsUpdate = true;

    if (pointsRef.current) {
      const settle = 1 - smoothstep(0.85, 1, chapterProgress(progressRef.current ?? 0, 3));
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(0.9, 0.35, smoothstep(0.5, 1, p)) * settle;
      pointsRef.current.rotation.y += 0.0009;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.055}
        color="#a5f3fc"
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CloudCore({
  progressRef,
  flashRef,
}: {
  progressRef: RefObject<number>;
  flashRef: RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterProgress(progressRef.current ?? 0, 0);
    const formAmount = smoothstep(0.45, 1, p);

    if (groupRef.current) {
      const s = THREE.MathUtils.lerp(0.001, 1, formAmount);
      groupRef.current.scale.setScalar(s);
    }
    if (innerRef.current) innerRef.current.rotation.y += delta * 0.18;
    if (innerRef.current) innerRef.current.rotation.x += delta * 0.08;
    if (outerRef.current) outerRef.current.rotation.y -= delta * 0.1;
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      // A brief brightness bump on each chapter-3 scan pass — "CORE lighting up."
      mat.opacity = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(0, 0.25, formAmount) + (flashRef.current ?? 0) * 0.35,
        0,
        0.6
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={innerRef} rotation={[0.3, 0.2, 0]}>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial color="#a5f3fc" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={outerRef} rotation={[-0.4, 0.6, 0.2]}>
        <icosahedronGeometry args={[2.6, 0]} />
        <meshBasicMaterial color="#c7d2fe" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function RoleNodes({
  progressRef,
  isMobile,
}: {
  progressRef: RefObject<number>;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  const basePositions = useMemo(
    () =>
      ROLE_NODES.map((_, i) => {
        const angle = (i / ROLE_NODES.length) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 3.6, Math.sin(angle * 0.7) * 0.9, Math.sin(angle) * 3.6);
      }),
    []
  );

  useFrame(({ clock, camera }) => {
    const total = progressRef.current ?? 0;
    const p1 = chapterProgress(total, 0);
    const p2 = chapterProgress(total, 1);
    // Appear once the cloud has formed in chapter 1, then step aside early in
    // chapter 2 so the 9 capability fragments become the visual focus.
    const nodesIn = smoothstep(0.6, 1, p1) * (1 - smoothstep(0, 0.3, p2));
    const t = clock.getElapsedTime();

    // Html (without `transform`) ignores the group's scale, so gate its
    // mount/unmount off a threshold instead of relying on scale to hide it —
    // the mesh dot below still uses scale for its own smooth pop-in.
    const shouldShow = nodesIn > 0.05;
    if (shouldShow !== visibleRef.current) {
      visibleRef.current = shouldShow;
      setVisible(shouldShow);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06;
    }

    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      node.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, nodesIn));
      node.lookAt(camera.position);
      node.position.y = basePositions[i].y + Math.sin(t * 0.8 + i * 1.4) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      {ROLE_NODES.map(({ label, Icon }, i) => (
        <group
          key={label}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          position={basePositions[i]}
        >
          <mesh>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#a5f3fc" />
          </mesh>
          {visible && !isMobile && (
            <Html center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-md">
                <Icon className="h-3 w-3 text-[#a5f3fc]" strokeWidth={2} />
                {label}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

/** The 9 capability fragments that expand outward from the core cloud like a small solar system. */
function Fragments({
  progressRef,
  isMobile,
}: {
  progressRef: RefObject<number>;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const fragRefs = useRef<(THREE.Group | null)[]>([]);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const labels = chapter2Content.fragments;

  // Fibonacci-sphere distribution — an even, organic "solar system" spread
  // rather than a flat ring.
  const directions = useMemo(() => {
    const n = labels.length;
    return labels.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      return new THREE.Vector3(Math.cos(theta) * radiusAtY, y * 0.7, Math.sin(theta) * radiusAtY);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ clock, camera }) => {
    const total = progressRef.current ?? 0;
    const p2 = chapterProgress(total, 1);
    const p3 = chapterProgress(total, 2);
    const spread = smoothstep(0, 0.5, p2);
    const retract = smoothstep(0, 0.6, p3);
    // Fully re-absorbed into the core well before chapter 3 ends, clearing
    // the stage for chapter 4's camera pull-back + skyline.
    const fadeOut = smoothstep(0.5, 0.85, p3);
    const fadeIn = smoothstep(0, 0.3, p2) * (1 - fadeOut);
    // Tighter orbit on narrow viewports so fragments stay in frame.
    const expandedRadius = THREE.MathUtils.lerp(2.3, isMobile ? 4.0 : 5.6, spread);
    const radius = THREE.MathUtils.lerp(expandedRadius, 2.3, retract);
    const t = clock.getElapsedTime();

    const shouldShow = fadeIn > 0.05;
    if (shouldShow !== visibleRef.current) {
      visibleRef.current = shouldShow;
      setVisible(shouldShow);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
    }

    fragRefs.current.forEach((frag, i) => {
      if (!frag) return;
      const dir = directions[i];
      frag.position.set(
        dir.x * radius,
        dir.y * radius + Math.sin(t * 0.6 + i) * 0.2,
        dir.z * radius
      );
      frag.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, fadeIn));
      frag.lookAt(camera.position);
    });
  });

  return (
    <group ref={groupRef}>
      {labels.map((label, i) => (
        <group
          key={label}
          ref={(el) => {
            fragRefs.current[i] = el;
          }}
        >
          <mesh>
            <icosahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#a5f3fc" wireframe transparent opacity={0.8} />
          </mesh>
          {visible && !isMobile && (
            <Html center distanceFactor={11} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
              <div className="max-w-30 whitespace-normal rounded-md border border-white/10 bg-black/60 px-2 py-1 text-center text-[9px] font-medium leading-tight text-white/85 backdrop-blur-md">
                {label}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

/** A dimmed, motionless second cloud — "traditional support," standing still while the fragments orbit. */
function TraditionalCloud({ progressRef }: { progressRef: RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  useFrame(() => {
    const total = progressRef.current ?? 0;
    const p2 = chapterProgress(total, 1);
    const p3 = chapterProgress(total, 2);
    const fadeIn = smoothstep(0, 0.35, p2);
    const fadeOut = smoothstep(0.5, 0.85, p3);
    const amount = fadeIn * (1 - fadeOut);

    const shouldShow = amount > 0.05;
    if (shouldShow !== visibleRef.current) {
      visibleRef.current = shouldShow;
      setVisible(shouldShow);
    }

    if (groupRef.current) {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, amount));
    }
  });

  return (
    <group ref={groupRef} position={[-5.5, -1.3, -3]}>
      <mesh rotation={[0.3, 0.5, 0]}>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshBasicMaterial color="#6b7280" wireframe transparent opacity={0.3} />
      </mesh>
      {visible && (
        <Html center distanceFactor={11} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/40">
            Traditional Support
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Dollies the camera back during chapter 2 so the wider fragment orbit stays
 * in frame, then continues pulling back and slowly arcing sideways during
 * chapter 4 — "camera pulls back and slowly orbits" — while always facing
 * the cloud.
 */
function CameraRig({ progressRef }: { progressRef: RefObject<number> }) {
  useFrame(({ camera }) => {
    const total = progressRef.current ?? 0;
    const c2 = chapterProgress(total, 1);
    const c4 = chapterProgress(total, 3);

    const radius = THREE.MathUtils.lerp(9, 12.5, c2) + c4 * 3.5;
    const angle = c4 * 0.5;

    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const SKYLINE_HEIGHTS = [0.7, 1.2, 0.9, 1.7, 1.1, 1.4, 0.8];

/** A skyline/bar-chart silhouette that rises beneath the cloud in chapter 4 — the cloud "lifting" it. */
function Skyline({ progressRef }: { progressRef: RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const total = progressRef.current ?? 0;
    const p4 = chapterProgress(total, 3);
    const growth = smoothstep(0.05, 0.65, p4);

    if (groupRef.current) {
      groupRef.current.visible = growth > 0.01;
    }

    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      const h = Math.max(0.001, SKYLINE_HEIGHTS[i] * growth);
      bar.scale.y = h;
      bar.position.y = -3.4 + h / 2;
    });
  });

  const n = SKYLINE_HEIGHTS.length;
  const spacing = 0.55;

  return (
    <group ref={groupRef}>
      {SKYLINE_HEIGHTS.map((h, i) => (
        <mesh
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          position={[(i - (n - 1) / 2) * spacing, -3.4, 0]}
        >
          <boxGeometry args={[0.32, 1, 0.32]} />
          <meshBasicMaterial color="#a5f3fc" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Writes a shared, decaying "flash" value into `flashRef` each time total
 * scroll progress crosses one of CHAPTER3_BENEFIT_POINTS — the same
 * breakpoints the DOM GSAP timeline uses to reveal each benefit line, so the
 * 3D flash and the DOM reveal land on the same scroll position without the
 * two ever having to talk to each other directly.
 */
function CoreFlashController({
  progressRef,
  flashRef,
}: {
  progressRef: RefObject<number>;
  flashRef: RefObject<number>;
}) {
  const prevTotalRef = useRef(0);
  const pointsAbs = useMemo(
    () => CHAPTER3_BENEFIT_POINTS.map((p) => (2 + p) / CHAPTER_COUNT),
    []
  );

  useFrame(() => {
    const total = progressRef.current ?? 0;
    const prev = prevTotalRef.current;
    for (const point of pointsAbs) {
      if (prev < point && total >= point) {
        flashRef.current = 1;
      }
    }
    prevTotalRef.current = total;
    flashRef.current *= 0.9;
  });

  return null;
}

/** A thin glowing ring that sweeps the core's surface during chapter 3 — "CORE continuously observes." */
function ScanSweep({
  progressRef,
  flashRef,
}: {
  progressRef: RefObject<number>;
  flashRef: RefObject<number>;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const total = progressRef.current ?? 0;
    const p3 = chapterProgress(total, 2);
    const visible = smoothstep(0, 0.08, p3) * (1 - smoothstep(0.9, 1, p3));
    const t = clock.getElapsedTime();

    if (ringRef.current) {
      ringRef.current.position.y = Math.sin(t * 0.9) * 2.0;
      ringRef.current.scale.setScalar(visible);
    }
    if (materialRef.current) {
      const flash = flashRef.current ?? 0;
      materialRef.current.opacity = THREE.MathUtils.clamp(0.35 + flash * 0.6, 0, 1) * visible;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.4, 0.015, 8, 64]} />
      <meshBasicMaterial ref={materialRef} color="#a5f3fc" transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

function Scene({ progressRef }: { progressRef: RefObject<number> }) {
  const flashRef = useRef(0);
  const isMobile = useIsMobile();

  return (
    <>
      <CameraRig progressRef={progressRef} />
      <CoreFlashController progressRef={progressRef} flashRef={flashRef} />
      <ParticleField
        progressRef={progressRef}
        count={isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP}
      />
      <CloudCore progressRef={progressRef} flashRef={flashRef} />
      <RoleNodes progressRef={progressRef} isMobile={isMobile} />
      <Fragments progressRef={progressRef} isMobile={isMobile} />
      <TraditionalCloud progressRef={progressRef} />
      <ScanSweep progressRef={progressRef} flashRef={flashRef} />
      <Skyline progressRef={progressRef} />
    </>
  );
}

export default function LivingCloudScene({ progressRef }: { progressRef: RefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 45, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <Scene progressRef={progressRef} />
    </Canvas>
  );
}
