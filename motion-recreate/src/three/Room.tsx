// Shared 3D study-room set (used by scenes 2, 3, 4, 14)
import React from "react";
import * as THREE from "three";
import { C } from "../lib";
import { dotsTex, pageTex } from "./textures";
import { Card, OpenBook, PencilCup, TipPencil } from "./objects";

/** hand-writing motion on the right page: write a line left->right, lift, return, next line */
const writePose = (t: number) => {
  const dur = 0.85;
  const n = Math.floor(t / dur), p = (t / dur) % 1;
  const line = n % 3;
  const w = p < 0.78 ? p / 0.78 : 1 - (p - 0.78) / 0.22; // write, then glide back
  const ease = w * w * (3 - 2 * w);
  const writing = p < 0.78;
  const x = 0.13 + 0.42 * ease;
  const y = 0.22 - line * 0.11 + (writing ? Math.sin(t * 46) * 0.008 : 0);
  const z = writing ? 0.004 : 0.004 + Math.sin(((p - 0.78) / 0.22) * Math.PI) * 0.06;
  return { x, y, z, wob: Math.sin(t * 9) * 0.04 };
};

export const Room: React.FC<{ flip?: number; showChair?: boolean; writeT?: number; children?: React.ReactNode }> = ({ flip = 1, showChair = true, writeT, children }) => (
  <group>
    <ambientLight intensity={1.1} color="#ffeadb" />
    <hemisphereLight args={["#fff6ee", "#e3b090", 0.9]} />
    <directionalLight position={[3, 7, 6]} intensity={2.2} color="#fff3e6" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
      shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0005} />
    <pointLight position={[0, 3, -3]} intensity={6} color="#fff0e0" distance={10} />

    {/* floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#f6e7dc" roughness={0.9} />
    </mesh>
    {/* back wall + bright window */}
    <mesh position={[0, 4, -4]} receiveShadow>
      <planeGeometry args={[30, 8]} />
      <meshStandardMaterial color="#f2d6c6" />
    </mesh>
    <mesh position={[0.6, 3.9, -3.98]}>
      <planeGeometry args={[5.6, 3.6]} />
      <meshBasicMaterial color="#fffaf5" />
    </mesh>
    {[-1.2, 0.6, 2.4].map((x) => (
      <mesh key={x} position={[x, 3.9, -3.95]}>
        <boxGeometry args={[0.07, 3.6, 0.05]} />
        <meshStandardMaterial color="#f3ddd0" />
      </mesh>
    ))}
    <mesh position={[0.6, 4.4, -3.95]}>
      <boxGeometry args={[5.6, 0.07, 0.05]} />
      <meshStandardMaterial color="#f3ddd0" />
    </mesh>
    {/* window sill / ledge */}
    <mesh position={[0, 2.0, -3.85]} castShadow receiveShadow>
      <boxGeometry args={[14, 0.12, 0.35]} />
      <meshStandardMaterial color="#f7e3d6" />
    </mesh>
    {/* left wall & pillar */}
    <mesh position={[-5, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[20, 8]} />
      <meshStandardMaterial color="#e8b99f" />
    </mesh>
    <mesh position={[-3.4, 4, -3.7]} castShadow>
      <boxGeometry args={[0.6, 8, 0.6]} />
      <meshStandardMaterial color="#e9c0a8" />
    </mesh>
    {/* wall decoration grid (orange/yellow squares) */}
    <group position={[4.4, 5, -3.97]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[(i % 4) * 0.32, -Math.floor(i / 4) * 0.32, 0]}>
          <planeGeometry args={[0.22, 0.22]} />
          <meshBasicMaterial color={[C.orange, C.yellow, "#ffb38a", "#f4c9b4"][(i * 7) % 4]} />
        </mesh>
      ))}
    </group>

    {/* desk */}
    <group position={[0, 0, -2.6]}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.1, 1.6]} />
        <meshStandardMaterial color="#fbefe6" />
      </mesh>
      {[[-2.05, -0.7], [2.05, -0.7], [-2.05, 0.7], [2.05, 0.7]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.75, z]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.5, 10]} />
          <meshStandardMaterial color="#eedfd4" />
        </mesh>
      ))}
      {/* book stand with open ebook */}
      <group position={[-0.4, 1.55, -0.1]}>
        <mesh position={[0, 0.03, 0.25]} castShadow>
          <boxGeometry args={[1.8, 0.06, 0.25]} />
          <meshStandardMaterial color="#e9a77f" />
        </mesh>
        <group position={[0, 0.62, 0]} rotation={[-0.22, 0, 0]}>
          <mesh position={[0, 0, -0.05]} castShadow>
            <boxGeometry args={[1.7, 1.15, 0.05]} />
            <meshStandardMaterial color="#e9a77f" />
          </mesh>
          <OpenBook flip={flip} scale={0.72} left="story" right="white" flipTex="chart" />
          {writeT !== undefined && (() => {
            const w = writePose(writeT);
            return <TipPencil position={[w.x, w.y, w.z + 0.02]} dir={[0.45 + w.wob, -0.35, 0.82]} color={C.orange} len={0.9} scale={0.8} />;
          })()}
        </group>
      </group>
      {/* small monitor / tablet */}
      <group position={[0.95, 1.95, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.55, 0.06]} />
          <meshStandardMaterial color="#efe6dd" />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[0.6, 0.45]} />
          <meshBasicMaterial map={pageTex("code")} />
        </mesh>
      </group>
      <PencilCup position={[1.65, 1.55, 0.1]} scale={0.38} color="#f1d9cb" />
      {/* plant */}
      <group position={[-1.75, 1.55, -0.2]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.24, 16]} />
          <meshStandardMaterial color="#f7e9de" />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.3) * 0.08, 0.38, Math.sin(i * 1.3) * 0.08]} rotation={[Math.sin(i) * 0.4, 0, Math.cos(i) * 0.4]}>
            <coneGeometry args={[0.05, 0.4, 6]} />
            <meshStandardMaterial color="#8fb06a" />
          </mesh>
        ))}
      </group>
      {/* mug, orange triangle, lamp */}
      <mesh position={[1.25, 1.66, 0.45]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 20]} />
        <meshStandardMaterial color={C.orange} />
      </mesh>
      <mesh position={[0.45, 1.62, 0.5]} rotation={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.12, 0.14, 3]} />
        <meshStandardMaterial color={C.yellow} />
      </mesh>
      <group position={[2.0, 1.55, 0.3]}>
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
          <meshStandardMaterial color={C.orange} />
        </mesh>
        <mesh position={[0.2, 0.72, 0]} rotation={[0, 0, -0.8]}>
          <coneGeometry args={[0.13, 0.2, 18, 1, true]} />
          <meshStandardMaterial color={C.orange} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Card tex={pageTex("white", 4)} w={0.5} h={0.7} position={[-1.0, 1.56, 0.5]} rotation={[-Math.PI / 2, 0, 0.3]} />
    </group>

    {/* chair with dotted backrest */}
    {showChair && (
      <group position={[2.6, 0, -1.4]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[1.0, 0.12, 1.0]} />
          <meshStandardMaterial color={C.orange} />
        </mesh>
        <mesh position={[0, 1.65, -0.45]} castShadow>
          <boxGeometry args={[1.0, 1.1, 0.12]} />
          <meshStandardMaterial map={dotsTex()} />
        </mesh>
        {[[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.5, z]}>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshStandardMaterial color="#f0e2d8" />
          </mesh>
        ))}
      </group>
    )}
    {children}
  </group>
);
