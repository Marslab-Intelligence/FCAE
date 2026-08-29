'use client';

/**
 * Plan3DScene — Real-Time 3D Live Animated Background for Managed Cloud Plans
 * 
 * Features:
 *   • Real WebGL 3D Canvas via @react-three/fiber.
 *   • Smooth 3D scene camera & geometry interpolation triggered ONLY when activeIndex changes during scroll.
 *   • Live continuous 3D ambient floating & rotation animation.
 *   • 4 distinct 3D plan themes:
 *       - 0 Foundation: Electric Cyan Wireframe Cyber Sphere & Orbital Telemetry Rings
 *       - 1 Care: Neon Emerald 3D Performance Matrix Wave & Mint Energy Field
 *       - 2 Assure: Golden Amber 3D Hexagonal Defense Lattice & Shield Rings
 *       - 3 Elite: Cosmic Purple 3D Hyperdrive Torus Knot & Starfield Vortex
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const THEME_CONFIGS = [
  {
    // Foundation (Plan 0)
    primaryColor: new THREE.Color('#00f0ff'),
    secondaryColor: new THREE.Color('#3b82f6'),
    ambientColor: new THREE.Color('#030712'),
    rotSpeedX: 0.12,
    rotSpeedY: 0.25,
    cameraPosZ: 14,
    cameraPosY: 1,
  },
  {
    // Care (Plan 1)
    primaryColor: new THREE.Color('#10b981'),
    secondaryColor: new THREE.Color('#14b8a6'),
    ambientColor: new THREE.Color('#021c15'),
    rotSpeedX: 0.22,
    rotSpeedY: 0.15,
    cameraPosZ: 12,
    cameraPosY: -1,
  },
  {
    // Assure (Plan 2)
    primaryColor: new THREE.Color('#f59e0b'),
    secondaryColor: new THREE.Color('#ea580c'),
    ambientColor: new THREE.Color('#180903'),
    rotSpeedX: 0.15,
    rotSpeedY: -0.28,
    cameraPosZ: 15,
    cameraPosY: 2,
  },
  {
    // Elite (Plan 3)
    primaryColor: new THREE.Color('#a855f7'),
    secondaryColor: new THREE.Color('#ec4899'),
    ambientColor: new THREE.Color('#0f0319'),
    rotSpeedX: 0.35,
    rotSpeedY: 0.45,
    cameraPosZ: 11,
    cameraPosY: 0,
  },
];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function ParticleStarfield({ activeIndex }: { activeIndex: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const targetColor = useRef(new THREE.Color('#00f0ff'));

  const count = 1800;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pseudoRandom(i * 3 + 1) - 0.5) * 35;
      pos[i * 3 + 1] = (pseudoRandom(i * 3 + 2) - 0.5) * 35;
      pos[i * 3 + 2] = (pseudoRandom(i * 3 + 3) - 0.5) * 35;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const config = THEME_CONFIGS[activeIndex % THEME_CONFIGS.length];
    targetColor.current.lerp(config.primaryColor, delta * 3);

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.color.copy(targetColor.current);

    // Continuous 3D Live drift
    pointsRef.current.rotation.y += delta * 0.05;
    pointsRef.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function PlanGeometryGroup({
  index,
  activeIndex,
  children,
}: {
  index: number;
  activeIndex: number;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(activeIndex === index ? 1 : 0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = activeIndex === index ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 3.5);

    if (progress.current < 0.005) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
      const s = THREE.MathUtils.lerp(0.65, 1, progress.current);
      groupRef.current.scale.set(s, s, s);

      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            if (mat && 'opacity' in mat) {
              const baseOpacity = (mat as THREE.Material & { baseOpacity?: number }).baseOpacity ?? (mat as THREE.Material & { opacity: number }).opacity;
              if ((mat as THREE.Material & { baseOpacity?: number }).baseOpacity === undefined) {
                (mat as THREE.Material & { baseOpacity?: number }).baseOpacity = baseOpacity;
              }
              (mat as THREE.Material & { opacity: number }).opacity = baseOpacity * progress.current;
            }
          });
        }
      });
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function Central3DGeometries({ activeIndex }: { activeIndex: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const wireframeMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const curPrimary = useRef(new THREE.Color('#00f0ff'));
  const curSecondary = useRef(new THREE.Color('#3b82f6'));

  useFrame(({ camera }, delta) => {
    const config = THEME_CONFIGS[activeIndex % THEME_CONFIGS.length];

    // Smooth color interpolation
    curPrimary.current.lerp(config.primaryColor, delta * 3.5);
    curSecondary.current.lerp(config.secondaryColor, delta * 3.5);

    if (wireframeMatRef.current) wireframeMatRef.current.color.copy(curPrimary.current);
    if (glowMatRef.current) glowMatRef.current.color.copy(curSecondary.current);

    // Smooth camera transition on scroll
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, config.cameraPosZ, delta * 2.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, config.cameraPosY, delta * 2.5);
    camera.lookAt(0, 0, 0);

    // Continuous 3D rotation & floating motion
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * config.rotSpeedX;
      groupRef.current.rotation.y += delta * config.rotSpeedY;
      groupRef.current.position.y = Math.sin(Date.now() * 0.0012) * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic 3D Geometric Mesh Layers based on active plan */}
      
      {/* 0: Foundation Plan — Cyber Sphere & Orbital Rings */}
      <PlanGeometryGroup index={0} activeIndex={activeIndex}>
        <mesh>
          <sphereGeometry args={[3.2, 28, 28]} />
          <meshBasicMaterial ref={wireframeMatRef} wireframe transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[4.8, 0.03, 16, 100]} />
          <meshBasicMaterial ref={glowMatRef} transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
          <torusGeometry args={[5.6, 0.015, 16, 100]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
        </mesh>
      </PlanGeometryGroup>

      {/* 1: Care Plan — Performance Matrix Grid & Wave Lattice */}
      <PlanGeometryGroup index={1} activeIndex={activeIndex}>
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <boxGeometry args={[4.5, 4.5, 4.5]} />
          <meshBasicMaterial ref={wireframeMatRef} wireframe transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[-Math.PI / 6, 0, Math.PI / 3]}>
          <cylinderGeometry args={[4.0, 4.0, 1.5, 24, 6, true]} />
          <meshBasicMaterial ref={glowMatRef} wireframe transparent opacity={0.3} />
        </mesh>
      </PlanGeometryGroup>

      {/* 2: Assure Plan — 3D Hexagonal Defense Lattice */}
      <PlanGeometryGroup index={2} activeIndex={activeIndex}>
        <mesh>
          <icosahedronGeometry args={[3.8, 1]} />
          <meshBasicMaterial ref={wireframeMatRef} wireframe transparent opacity={0.45} />
        </mesh>
        <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
          <octahedronGeometry args={[5.4, 0]} />
          <meshBasicMaterial ref={glowMatRef} wireframe transparent opacity={0.25} />
        </mesh>
      </PlanGeometryGroup>

      {/* 3: Elite Plan — Hyperdrive Torus Knot & Starfield Ring */}
      <PlanGeometryGroup index={3} activeIndex={activeIndex}>
        <mesh>
          <torusKnotGeometry args={[2.8, 0.8, 120, 16]} />
          <meshBasicMaterial ref={wireframeMatRef} wireframe transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[6.2, 0.04, 16, 120]} />
          <meshBasicMaterial ref={glowMatRef} transparent opacity={0.6} />
        </mesh>
      </PlanGeometryGroup>
    </group>
  );
}

function SceneLighting({ activeIndex }: { activeIndex: number }) {
  const pointLightRef = useRef<THREE.PointLight>(null);
  const targetLightColor = useRef(new THREE.Color('#00f0ff'));

  useFrame((_, delta) => {
    const config = THEME_CONFIGS[activeIndex % THEME_CONFIGS.length];
    targetLightColor.current.lerp(config.primaryColor, delta * 3);
    if (pointLightRef.current) {
      pointLightRef.current.color.copy(targetLightColor.current);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight ref={pointLightRef} position={[10, 10, 10]} intensity={2.5} />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ffffff" />
    </>
  );
}

export default function Plan3DScene({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <SceneLighting activeIndex={activeIndex} />
        <ParticleStarfield activeIndex={activeIndex} />
        <Central3DGeometries activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}
