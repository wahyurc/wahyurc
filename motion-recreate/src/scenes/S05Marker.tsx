// Scene 5 (9.00s – 11.40s): macro – mesh pencil cup, then a yellow highlighter
// marks "Ask for a new project" on the three.js setup page; glitchy dark card; yellow wipe.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../three/Stage";
import { Card, Lights, Particles, Pencil, PencilCup } from "../three/objects";
import { darkCardTex, setupPageTex } from "../three/textures";
import { C, eIn, eOut, lerp , useF } from "../lib";
import { Flash, Halftone, InfoBlock } from "../fx";

const Marker: React.FC<{ position: [number, number, number]; rotation: [number, number, number]; scale?: number }> = (p) => (
  <group {...p}>
    <mesh castShadow>
      <cylinderGeometry args={[0.14, 0.14, 2.2, 24]} />
      <meshStandardMaterial color={C.yellow} roughness={0.35} />
    </mesh>
    <mesh position={[0, -1.18, 0]}>
      <cylinderGeometry args={[0.145, 0.1, 0.18, 24]} />
      <meshStandardMaterial color="#2a2222" />
    </mesh>
    <mesh position={[0, -1.33, 0]}>
      <cylinderGeometry args={[0.04, 0.07, 0.14, 12]} />
      <meshStandardMaterial color="#f5d36b" />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.148, 0.148, 0.05, 24]} />
      <meshStandardMaterial color="#e2a10a" />
    </mesh>
  </group>
);

export const S05Marker: React.FC = () => {
  const f = useF();
  const a = lerp(f, [0, 14], [0, 1], eOut); // cup shot -> page shot
  const hl = lerp(f, [18, 46], [0, 1]);
  const markerX = -1.3 + hl * 2.9;
  const wipe = lerp(f, [50, 58], [0, 1], eIn);
  return (
    <AbsoluteFill>
      <Stage
        cam={{ pos: [-0.4 + a * 1.4 + wipe * 0.8, -3.2 + a * 1.0, 1.4 - a * 0.1], look: [0.2 + a * 0.8, 0.6 - a * 0.4, 0.3], fov: 40, roll: -0.35 }}
        bg="#f0d2bf"
        fog={[5, 14]}
      >
        <Lights dir={[-3, 4, 7]} intensity={2.4} />
        <mesh receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#efd5c3" />
        </mesh>
        <PencilCup mesh rotation={[Math.PI / 2, 0, 0]} position={[-1.8, 1.8, 0]} scale={0.8} />
        {/* setup page */}
        <mesh position={[0.6, 0.2, 0.01]} rotation={[0, 0, 0.12]} receiveShadow>
          <planeGeometry args={[4.8, 3]} />
          <meshStandardMaterial map={setupPageTex()} />
        </mesh>
        {/* highlighter stroke growing under "Ask for a new project" */}
        <mesh position={[-0.75 + (hl * 2.6) / 2 + 0.25, 0.27, 0.02]} rotation={[0, 0, 0.12]} scale={[Math.max(hl, 0.001), 1, 1]}>
          <planeGeometry args={[2.6, 0.22]} />
          <meshBasicMaterial color="#e8d24a" transparent opacity={0.65} />
        </mesh>
        {/* dark glitchy card */}
        <Card tex={darkCardTex()} w={2.4} h={1.6} position={[-1.2, -1.6, 0.05]} rotation={[0, 0, 0.5]} />
        <Marker position={[markerX - 0.15, 0.9 + hl * 0.32, 1.27]} rotation={[1.1, 0.25, 0.12]} />
        <Pencil position={[2.6, 1.5, 0.08]} rotation={[0, 0, 1.2]} color={C.red} len={1.4} />
        <Particles t={f / 24} count={140} spread={[8, 6, 2]} color="#fff" size={0.035} />
      </Stage>
      {/* glitch slices over the dark card */}
      {f % 5 < 2 && f > 8 && (
        <div style={{ position: "absolute", left: 80, top: 760 + ((f * 37) % 120), width: 520, height: 18, background: "rgba(255,255,255,.25)", transform: `translateX(${(f * 23) % 40}px)` }} />
      )}
      <InfoBlock lines={["Motion Graphic with Claude is the ebook by w4hy03. Every step is copy and paste,", "no coding. 24 chapters take you from installing Claude to the final render."]} x={60} y={760} o={lerp(f, [10, 16, 44, 50], [0, 0.7, 0.7, 0])} />
      {/* big blurred yellow marker sweeping across -> yellow fill */}
      <div style={{ position: "absolute", left: lerp(f, [48, 58], [2000, -400]), top: 200, width: 1400, height: 700, borderRadius: 400, background: C.yellow, filter: "blur(40px)", transform: "rotate(-20deg)" }} />
      <Flash color={C.yellow} o={wipe} blur={4} />
      <Halftone opacity={0.4} />
    </AbsoluteFill>
  );
};
