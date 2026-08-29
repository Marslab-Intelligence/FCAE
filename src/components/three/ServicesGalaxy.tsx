'use client';

/**
 * ServicesGalaxy — Compact 3D Floating Card Gallery
 *
 * Features:
 *   • Small compact cards (175px) with crisp, 100% visible text.
 *   • Zoom-out boundary limit (maxDistance = 18.5) so cards stop at container edges.
 *   • Smooth floating micro-animation on each card.
 *   • Drag-to-rotate ONLY (no auto-spin).
 *   • 100% transparent canvas blending into website background.
 */

import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export type GalaxyService = {
  id: string;
  title: string;
  desc: string;
  accent: string; // hex
  icon: LucideIcon;
  href: string;
};

function rgba(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const RADIUS_X = 6.8;
const RADIUS_Z = 4.2;

function WorldGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.14;
      groupRef.current.rotation.x += delta * 0.06;
      groupRef.current.rotation.z += delta * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Wireframe Globe */}
      <mesh rotation={[0.4, 0.25, 0.6]}>
        <sphereGeometry args={[3.2, 36, 36]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.12} />
      </mesh>

      {/* Outer Tilted Wireframe Shell */}
      <mesh rotation={[-0.5, 0.75, -0.3]}>
        <sphereGeometry args={[5.6, 24, 24]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.04} />
      </mesh>

      {/* Tilted Ring 1 */}
      <mesh rotation={[Math.PI / 3.4, Math.PI / 5.2, 0.35]}>
        <torusGeometry args={[4.8, 0.012, 16, 120]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.22} />
      </mesh>

      {/* Tilted Ring 2 */}
      <mesh rotation={[-Math.PI / 3.6, -Math.PI / 2.8, 0.75]}>
        <torusGeometry args={[5.4, 0.012, 16, 120]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function Card({
  service,
  index,
  total,
  onSelect,
}: {
  service: GalaxyService;
  index: number;
  total: number;
  onSelect: (s: GalaxyService) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const { basePos, phase } = useMemo(() => {
    // Elliptical ring positioning with staggered heights so cards never stack
    const angle = (index / total) * Math.PI * 2 + 0.2;
    const heights = [1.1, -1.1, 1.3, -1.3, 0.7, -0.7];
    return {
      basePos: new THREE.Vector3(
        Math.cos(angle) * RADIUS_X,
        heights[index % heights.length],
        Math.sin(angle) * RADIUS_Z
      ),
      phase: index * 1.05,
    };
  }, [index, total]);

  useFrame(({ camera, clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      // Gentle floating micro-animation
      group.current.position.x = basePos.x;
      group.current.position.z = basePos.z;
      group.current.position.y = basePos.y + Math.sin(t * 1.2 + phase) * 0.2;
      group.current.lookAt(camera.position);
    }
  });

  const Icon = service.icon;
  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();

  return (
    <group ref={group} position={basePos}>
      {/* Invisible raycasting mesh */}
      <mesh
        onClick={(e) => {
          stop(e);
          onSelect(service);
        }}
        onPointerOver={(e) => {
          stop(e);
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          stop(e);
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[1.6, 2.0]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Html
        transform
        distanceFactor={9}
        position={[0, 0, 0.02]}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: 130,
            transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <div
            className="rounded-xl border p-2.5 backdrop-blur-xl cursor-pointer pointer-events-auto transition-all duration-300"
        onClick={() => window.location.assign(service.href)}
            style={{
              background:
                'linear-gradient(180deg, rgba(11,17,32,0.92) 0%, rgba(5,8,22,0.96) 100%)',
              borderColor: hovered ? rgba(service.accent, 0.6) : 'rgba(255,255,255,0.14)',
              boxShadow: hovered
                ? `0 16px 40px ${rgba(service.accent, 0.35)}, 0 0 25px ${rgba(service.accent, 0.25)}`
                : '0 8px 20px rgba(0,0,0,0.55)',
            }}
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center mb-1.5"
              style={{ background: rgba(service.accent, 0.18), color: service.accent }}
            >
              <Icon size={13} strokeWidth={2} />
            </div>
            <h3 className="font-display font-bold text-[11px] text-white mb-0.5 leading-tight">
              {service.title}
            </h3>
            <p className="text-[9px] leading-snug line-clamp-2" style={{ color: '#94a3b8' }}>
              {service.desc}
            </p>
            <div
              className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold"
              style={{ color: service.accent }}
            >
              Explore service <ArrowRight size={10} />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function Scene({
  services,
  onSelect,
  controlsRef,
}: {
  services: GalaxyService[];
  onSelect: (s: GalaxyService) => void;
  controlsRef: React.RefObject<React.ElementRef<typeof OrbitControls> | null>;
}) {
  return (
    <>
      <WorldGlobe />

      {services.map((s, i) => (
        <Card key={s.id} service={s} index={i} total={services.length} onSelect={onSelect} />
      ))}

      {/* OrbitControls: Manual drag-to-rotate in all directions (NO auto-spin) */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableRotate={true}
        enableZoom={false}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={true}
        autoRotateSpeed={0.3}
        rotateSpeed={1.0}
        minDistance={11.5}
        maxDistance={18.5}
        minPolarAngle={0.01}
        maxPolarAngle={Math.PI - 0.01}
        target={[0, 0, 0]}
      />
    </>
  );
}


export default function ServicesGalaxy({ services }: { services: GalaxyService[] }) {
  const router = useRouter();
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls> | null>(null);

  const handleSelect = (s: GalaxyService) => {
    router.push(s.href);
  };

  return (
    <div
      className="relative w-full bg-transparent"
      style={{ height: 'clamp(520px, 75vh, 720px)' }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 16], fov: 42, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Scene services={services} onSelect={handleSelect} controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
