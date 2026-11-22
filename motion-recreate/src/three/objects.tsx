import React, { useMemo } from "react";
import * as THREE from "three";
import { C, rand } from "../lib";
import { coverTex, dotSprite, pageTex } from "./textures";

type V3 = [number, number, number];
type P = { position?: V3; rotation?: V3; scale?: number | V3 };

/* ---------- 3D cursor arrow (extruded + beveled) ---------- */
const cursorShape = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.lineTo(0.62, -0.52);
  sh.lineTo(0.27, -0.55);
  sh.lineTo(0.45, -0.95);
  sh.lineTo(0.3, -1.02);
  sh.lineTo(0.12, -0.62);
  sh.lineTo(-0.12, -0.85);
  sh.closePath();
  return sh;
})();
export const cursorGeo = new THREE.ExtrudeGeometry(cursorShape, {
  depth: 0.18, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 6,
});
// pivot = arrow tip: shape tip is at (0,0); centre the extrusion depth only
cursorGeo.translate(0, 0, -0.09);

export const Cursor3D: React.FC<P & { color?: string }> = ({ color = C.orange, ...p }) => (
  <mesh geometry={cursorGeo} {...p} castShadow>
    <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
  </mesh>
);

/* ---------- closed book with cover texture ---------- */
export const Book: React.FC<P & { thickness?: number }> = ({ thickness = 0.14, ...p }) => {
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: "#fff6ea", roughness: 0.9 });
    const spine = new THREE.MeshStandardMaterial({ color: C.orangeD, roughness: 0.6 });
    const front = new THREE.MeshStandardMaterial({ map: coverTex(), roughness: 0.55 });
    return [side, spine, side, side, front, spine];
  }, []);
  return (
    <mesh {...p} material={mats} castShadow receiveShadow>
      <boxGeometry args={[1.5, 2, thickness]} />
    </mesh>
  );
};

/* ---------- textured flat card / page ---------- */
export const Card: React.FC<P & { tex: THREE.Texture; w: number; h: number; opacity?: number; depth?: number }> = ({
  tex, w, h, opacity = 1, depth = 0.02, ...p
}) => (
  <group {...p}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[w, h, depth]} />
      <meshStandardMaterial color="#f7efe6" transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, 0, depth / 2 + 0.002]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} transparent opacity={opacity} roughness={0.7} />
    </mesh>
  </group>
);

/* ---------- open ebook with a flipping page ---------- */
export const OpenBook: React.FC<P & { flip: number; left?: any; right?: any; flipTex?: any }> = ({
  flip, left = "white", right = "orange", flipTex = "chart", ...p
}) => {
  const L = pageTex(left);
  const R = pageTex(right);
  const F = pageTex(flipTex);
  // flip: 0 = page lying on right, 1 = lying on left
  const a = -Math.PI * flip;
  return (
    <group {...p}>
      <mesh position={[0, 0, -0.04]} receiveShadow castShadow>
        <boxGeometry args={[2.2, 1.5, 0.06]} />
        <meshStandardMaterial color={C.orangeD} />
      </mesh>
      <mesh position={[-0.53, 0, 0]} receiveShadow>
        <planeGeometry args={[1.04, 1.42]} />
        <meshStandardMaterial map={L} />
      </mesh>
      <mesh position={[0.53, 0, 0]} receiveShadow>
        <planeGeometry args={[1.04, 1.42]} />
        <meshStandardMaterial map={R} />
      </mesh>
      <group rotation={[0, a, 0]} position={[0, 0, 0.01]}>
        <mesh position={[0.52, 0, 0.004 + Math.sin(flip * Math.PI) * 0.02]} castShadow>
          <planeGeometry args={[1.04, 1.42]} />
          <meshStandardMaterial map={F} />
        </mesh>
        {/* back side of the turning page shows the next left page (not mirrored) */}
        <mesh position={[0.52, 0, 0.003 + Math.sin(flip * Math.PI) * 0.02]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.04, 1.42]} />
          <meshStandardMaterial map={L} />
        </mesh>
      </group>
    </group>
  );
};

/* ---------- pencil ---------- */
export const Pencil: React.FC<P & { color?: string; len?: number }> = ({ color = C.orange, len = 1.6, ...p }) => (
  <group {...p}>
    <mesh castShadow>
      <cylinderGeometry args={[0.05, 0.05, len, 6]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, len / 2 + 0.09, 0]}>
      <coneGeometry args={[0.05, 0.18, 6]} />
      <meshStandardMaterial color="#f3d2a8" />
    </mesh>
    <mesh position={[0, len / 2 + 0.165, 0]}>
      <coneGeometry args={[0.018, 0.04, 6]} />
      <meshStandardMaterial color="#2a2020" />
    </mesh>
    <mesh position={[0, -len / 2 - 0.04, 0]}>
      <cylinderGeometry args={[0.052, 0.052, 0.08, 12]} />
      <meshStandardMaterial color="#ffc7c0" />
    </mesh>
  </group>
);

/* ---------- pencil cup with pencils ---------- */
export const PencilCup: React.FC<P & { burst?: number; color?: string; mesh?: boolean }> = ({
  burst = 0, color = "#d38b5d", mesh = false, ...p
}) => (
  <group {...p}>
    <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.38, 0.32, 0.8, 28, 1, true]} />
      <meshStandardMaterial color={mesh ? "#6d5a52" : color} side={THREE.DoubleSide} wireframe={false} metalness={mesh ? 0.5 : 0} roughness={0.6} />
    </mesh>
    {Array.from({ length: 9 }).map((_, i) => {
      const ang = (i / 9) * Math.PI * 2;
      const tilt = 0.18 + burst * (0.9 + rand(i) * 0.5);
      const cols = [C.orange, C.red, C.yellow, "#ff8a3d", C.orangeD];
      return (
        <group key={i} position={[Math.cos(ang) * 0.14, 0.45, Math.sin(ang) * 0.14]} rotation={[Math.sin(ang) * tilt, 0, -Math.cos(ang) * tilt]}>
          <Pencil color={cols[i % 5]} len={1.1 + rand(i + 9) * 0.3} position={[0, 0.45, 0]} scale={0.9} />
        </group>
      );
    })}
  </group>
);

/* ---------- floating sparkle particles ---------- */
export const Particles: React.FC<{ count?: number; spread?: V3; t: number; color?: string; size?: number; seed?: number }> = ({
  count = 220, spread = [12, 7, 6], t, color = "#ffffff", size = 0.06, seed = 1,
}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand(i + seed) - 0.5) * spread[0];
      arr[i * 3 + 1] = (rand(i * 3.1 + seed) - 0.5) * spread[1];
      arr[i * 3 + 2] = (rand(i * 7.7 + seed) - 0.5) * spread[2];
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count, seed, spread[0], spread[1], spread[2]]);
  return (
    <points geometry={geo} position={[0, t * 0.15, 0]} rotation={[0, t * 0.03, 0]}>
      <pointsMaterial map={dotSprite()} color={color} size={size} transparent depthWrite={false} sizeAttenuation />
    </points>
  );
};

/* ---------- confetti (stars / triangles / slivers) ---------- */
const starShape = (() => {
  const sh = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? 0.07 : 0.2;
    const a = (i / 8) * Math.PI * 2;
    i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return sh;
})();
const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.04, bevelEnabled: false });
const triGeo = new THREE.ConeGeometry(0.14, 0.05, 3);
const slivGeo = new THREE.BoxGeometry(0.28, 0.06, 0.03);

export const Confetti: React.FC<{ t: number; count?: number; area?: V3; center?: V3; seed?: number; burst?: number; size?: number }> = ({
  t, count = 60, area = [8, 5, 3], center = [0, 0, 0], seed = 3, burst = 1, size = 1,
}) => {
  const cols = [C.orange, C.red, C.purple, C.yellow, "#ff8a3d", "#7a8a6a"];
  return (
    <group position={center}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rand(i + seed), r2 = rand(i * 2.7 + seed), r3 = rand(i * 5.3 + seed);
        const geo = i % 3 === 0 ? starGeo : i % 3 === 1 ? triGeo : slivGeo;
        const x = (r1 - 0.5) * area[0] * burst;
        const y = (r2 - 0.5) * area[1] * burst + Math.sin(t * 1.3 + i) * 0.08;
        const z = (r3 - 0.5) * area[2];
        return (
          <mesh key={i} geometry={geo} position={[x, y, z]} rotation={[t * (r1 - 0.5) * 2, t * (r2 - 0.5) * 3, r3 * 6 + t * 0.6]} scale={(0.6 + r3 * 0.8) * size}>
            <meshStandardMaterial color={cols[i % cols.length]} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ---------- little rounded cube ---------- */
export const Cube: React.FC<P & { color?: string; size?: number }> = ({ color = C.orange, size = 0.3, ...p }) => (
  <mesh {...p} castShadow>
    <boxGeometry args={[size, size, size]} />
    <meshStandardMaterial color={color} roughness={0.4} />
  </mesh>
);

/* ---------- common warm studio lights ---------- */
export const Lights: React.FC<{ dir?: V3; intensity?: number; shadow?: boolean }> = ({ dir = [4, 8, 6], intensity = 2.2, shadow = true }) => (
  <>
    <ambientLight intensity={0.9} color="#ffe9d6" />
    <hemisphereLight args={["#fff4e8", "#e8b48c", 0.8]} />
    <directionalLight
      position={dir}
      intensity={intensity}
      color="#fff1e0"
      castShadow={shadow}
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.0005}
    />
  </>
);

/* ---------- pencil whose pivot is its graphite tip, pointing from `dir` back to the tip ---------- */
export const TipPencil: React.FC<{ position: V3; dir: V3; color?: string; len?: number; scale?: number }> = ({
  position, dir, color = C.orange, len = 1.0, scale = 1,
}) => {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...dir).normalize());
  return (
    <group position={position} quaternion={q} scale={scale}>
      <Pencil color={color} len={len} position={[0, -(len / 2 + 0.185), 0]} />
    </group>
  );
};
