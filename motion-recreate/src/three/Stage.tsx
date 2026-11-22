import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { H, W } from "../lib";

type V3 = [number, number, number];

export type CamSpec = { pos: V3; look: V3; fov?: number; roll?: number };

const CamRig: React.FC<CamSpec> = ({ pos, look, fov = 35, roll = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(...look);
    camera.fov = fov;
    camera.near = 0.05;
    camera.far = 200;
    camera.updateProjectionMatrix();
  });
  return null;
};

export const Stage: React.FC<{
  cam: CamSpec;
  bg?: string;
  fog?: [number, number];
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ cam, bg = "#f3dcc8", fog, children, style }) => (
  <ThreeCanvas
    width={W}
    height={H}
    style={{ position: "absolute", inset: 0, ...style }}
    shadows
    gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    camera={{ fov: cam.fov ?? 35, position: cam.pos }}
  >
    <color attach="background" args={[bg]} />
    {fog ? <fog attach="fog" args={[bg, fog[0], fog[1]]} /> : null}
    <CamRig {...cam} />
    {children}
  </ThreeCanvas>
);
