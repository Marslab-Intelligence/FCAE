'use client';

import React, { useEffect } from 'react';
import { useGLTF, useVideoTexture } from '@react-three/drei';
import useMacbookStore from '@/store/macbookStore';
import { Color, Mesh, SRGBColorSpace, LinearFilter, Object3D, Material } from 'three';

const noChangeParts = [
  'Object_84',
  'Object_37',
  'Object_34',
  'Object_12',
  'Object_80',
  'Object_35',
  'Object_36',
  'Object_13',
  'Object_125',
  'Object_76',
  'Object_33',
  'Object_42',
  'Object_58',
  'Object_52',
  'Object_21',
  'Object_10',
];

export default function MacbookModel(props: Record<string, unknown>) {
  const { color, texture } = useMacbookStore();
  const gltf = useGLTF('/models/macbook-transformed.glb');
  const { nodes, materials, scene } = gltf as unknown as { nodes: Record<string, Mesh>; materials: Record<string, Material>; scene: Object3D };

  const screen = useVideoTexture(texture, {
    unsuspend: 'canplay',
    muted: true,
    loop: true,
    start: true,
  });

  useEffect(() => {
    if (screen) {
      // eslint-disable-next-line react-hooks/immutability
      screen.colorSpace = SRGBColorSpace;
      screen.minFilter = LinearFilter;
      screen.magFilter = LinearFilter;
      screen.generateMipmaps = false;
      screen.needsUpdate = true;
    }
  }, [screen, texture]);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        if (!noChangeParts.includes(child.name)) {
          if (child.material) {
            child.material = child.material.clone();
            child.material.color = new Color(color);
          }
        }
      }
    });
  }, [color, scene]);

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_10.geometry} material={materials.PaletteMaterial001} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_16.geometry} material={materials.zhGRTuGrQoJflBD} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_20.geometry} material={materials.PaletteMaterial002} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_22.geometry} material={materials.lmWQsEjxpsebDlK} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_30.geometry} material={materials.LtEafgAVRolQqRw} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_32.geometry} material={materials.iyDJFXmHelnMTbD} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_34.geometry} material={materials.eJObPwhgFzvfaoZ} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_38.geometry} material={materials.nDsMUuDKliqGFdU} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_42.geometry} material={materials.CRQixVLpahJzhJc} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_48.geometry} material={materials.YYwBgwvcyZVOOAA} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_54.geometry} material={materials.SLGkCohDDelqXBu} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_58.geometry} material={materials.WnHKXHhScfUbJQi} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_66.geometry} material={materials.fNHiBfcxHUJCahl} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_74.geometry} material={materials.LpqXZqhaGCeSzdu} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_82.geometry} material={materials.gMtYExgrEUqPfln} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_96.geometry} material={materials.PaletteMaterial003} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_107.geometry} material={materials.JvMFZolVCdpPqjj} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_123.geometry} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <mesh geometry={nodes.Object_127.geometry} material={materials.ZCDwChwkbBfITSW} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

useGLTF.preload('/models/macbook-transformed.glb');
