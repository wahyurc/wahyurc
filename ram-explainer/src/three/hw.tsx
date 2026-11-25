// Detailed, clay-styled computer hardware (procedural; no brand logos)
import React, { useMemo } from "react";
import * as THREE from "three";
import { C, rand } from "../lib";
import { RBox, roundedBoxGeo } from "./parts";

type V3 = [number, number, number];
type P = { position?: V3; rotation?: V3; scale?: number | V3 };

/* ---------------- canvas texture helper ---------------- */
const texCache = new Map<string, THREE.CanvasTexture>();
export const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
  if (texCache.has(key)) return texCache.get(key)!;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!; draw(g, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  texCache.set(key, t); return t;
};

/* ---------------- PCB with routed copper traces, vias and pads ---------------- */
export const pcbTex = () =>
  canvasTex("pcb", 2048, 2048, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#de8152"); grd.addColorStop(1, "#cf6f42");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    // fine silkscreen grid
    g.strokeStyle = "rgba(255,220,190,.07)"; g.lineWidth = 1;
    for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    // traces: orthogonal runs with 45° doglegs, in bundles
    g.lineCap = "round"; g.lineJoin = "round";
    for (let b = 0; b < 70; b++) {
      const n = 3 + Math.floor(rand(b) * 7), gap = 10 + rand(b + 1) * 6;
      let x = rand(b + 2) * w, y = rand(b + 3) * h;
      const horiz = rand(b + 4) > 0.5, len1 = 150 + rand(b + 5) * 500, len2 = 120 + rand(b + 6) * 400;
      const dir = rand(b + 7) > 0.5 ? 1 : -1;
      g.strokeStyle = b % 5 === 0 ? "rgba(255,214,160,.85)" : "rgba(246,180,130,.75)";
      g.lineWidth = b % 7 === 0 ? 6 : 3;
      for (let i = 0; i < n; i++) {
        const o = i * gap;
        g.beginPath();
        if (horiz) { g.moveTo(x, y + o); g.lineTo(x + len1, y + o); g.lineTo(x + len1 + 60 + o, y + o + dir * (60 + o)); g.lineTo(x + len1 + 60 + o, y + o + dir * (60 + o + len2)); }
        else { g.moveTo(x + o, y); g.lineTo(x + o, y + len1); g.lineTo(x + o + dir * (60 + o), y + len1 + 60 + o); g.lineTo(x + o + dir * (60 + o + len2), y + len1 + 60 + o); }
        g.stroke();
      }
    }
    // vias
    for (let i = 0; i < 900; i++) {
      const x = rand(i * 3.1) * w, y = rand(i * 7.3) * h, r = 3 + rand(i) * 4;
      g.fillStyle = "#f8cf9a"; g.beginPath(); g.arc(x, y, r + 2, 0, 7); g.fill();
      g.fillStyle = "#9c4824"; g.beginPath(); g.arc(x, y, r * 0.5, 0, 7); g.fill();
    }
    // SMD pads
    for (let i = 0; i < 260; i++) {
      const x = rand(i * 5.7) * w, y = rand(i * 9.1) * h;
      g.fillStyle = "#f3d3a8"; g.fillRect(x, y, 10, 6); g.fillRect(x + 18, y, 10, 6);
    }
    // silkscreen labels
    g.fillStyle = "rgba(255,245,235,.55)"; g.font = "600 22px Inter";
    ["C214", "R88", "U12", "L3", "Q7", "C51", "R301", "U4", "J2", "TP9"].forEach((t, i) => g.fillText(t, rand(i * 2.3) * w, rand(i * 4.9) * h));
  });

export const PCB: React.FC<P & { size: [number, number] }> = ({ size, ...p }) => (
  <group {...p}>
    <RBox size={[size[0], 0.08, size[1]]} r={0.03} color="#c9653a" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0415, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial map={pcbTex()} roughness={0.55} metalness={0.05} />
    </mesh>
    {/* gold mounting holes */}
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
      <mesh key={i} position={[sx * (size[0] / 2 - 0.25), 0.045, sz * (size[1] / 2 - 0.25)]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.13, 32]} />
        <meshStandardMaterial color={C.gold} metalness={0.6} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

/* ---------------- chip label texture ---------------- */
const labelTex = (key: string, title: string, sub: string, bg = "#3b3431") =>
  canvasTex("lbl-" + key, 512, 512, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 6; g.strokeRect(20, 20, w - 40, h - 40);
    g.fillStyle = "rgba(255,240,230,.85)"; g.font = "800 64px Inter"; g.textAlign = "center"; g.fillText(title, w / 2, h / 2 + 10);
    g.fillStyle = "rgba(255,240,230,.45)"; g.font = "500 30px Inter"; g.fillText(sub, w / 2, h / 2 + 60);
    g.beginPath(); g.arc(60, 60, 14, 0, 7); g.fillStyle = "rgba(255,255,255,.25)"; g.fill();
  });

/** BGA chip: substrate + heat-spreader + SMD capacitors around it */
export const Chip: React.FC<P & { size?: number; title: string; sub?: string; caps?: boolean; glow?: string; glowK?: number }> = ({
  size = 1, title, sub = "", caps = true, glow, glowK = 0, ...p
}) => (
  <group {...p}>
    <RBox size={[size * 1.15, 0.05, size * 1.15]} r={0.02} color="#a8471f" position={[0, 0.025, 0]} />
    <RBox size={[size, 0.09, size]} r={0.025} color="#3b3431" position={[0, 0.095, 0]} rough={0.35} emissive={glow} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.142, 0]}>
      <planeGeometry args={[size * 0.9, size * 0.9]} />
      <meshStandardMaterial map={labelTex(title + sub, title, sub)} emissive={glow ?? "#000"} emissiveIntensity={glowK * 0.4} />
    </mesh>
    {caps && Array.from({ length: 16 }).map((_, i) => {
      const side = i % 4, k = Math.floor(i / 4), off = -size * 0.42 + k * size * 0.28, e = size * 0.66;
      const pos: V3 = side === 0 ? [off, 0.07, -e] : side === 1 ? [off, 0.07, e] : side === 2 ? [-e, 0.07, off] : [e, 0.07, off];
      return (
        <mesh key={i} position={pos} rotation={[0, side > 1 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[size * 0.08, 0.04, size * 0.04]} />
          <meshStandardMaterial color={i % 3 ? "#a8774f" : "#d9d2c7"} />
        </mesh>
      );
    })}
  </group>
);

/* ---------------- "office building" rising out of a chip ---------------- */
const windowsTex = (key: string, lit: string) =>
  canvasTex("win-" + key, 256, 512, (g, w, h) => {
    g.fillStyle = "#f3e6da"; g.fillRect(0, 0, w, h);
    for (let y = 16; y < h - 8; y += 28) for (let x = 14; x < w - 8; x += 30) {
      g.fillStyle = rand(x * 0.37 + y * 1.3) > 0.3 ? lit : "#d9c9bb";
      g.fillRect(x, y, 20, 16);
    }
  });
export const Building: React.FC<P & { w: number; d: number; h: number; lit: string; k?: number }> = ({ w, d, h, lit, k = 1, ...p }) => {
  const tex = windowsTex(lit, lit);
  return (
    <group {...p}>
      <group scale={[1, Math.max(0.001, k), 1]}>
        <mesh position={[0, h / 2, 0]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.18} roughness={0.6} />
        </mesh>
        <RBox size={[w * 1.08, 0.08, d * 1.08]} r={0.03} color="#e9d6c4" position={[0, h + 0.04, 0]} />
      </group>
    </group>
  );
};

/* ---------------- memory package (VRAM / LPDDR) ---------------- */
export const MemChip: React.FC<P & { w?: number; d?: number; label?: string; glow?: string; glowK?: number; fill?: number }> = ({ w = 0.5, d = 0.36, label = "MEM", glow, glowK = 0, fill = 0, ...p }) => (
  <group {...p}>
    <RBox size={[w, 0.07, d]} r={0.02} color="#2f2a28" position={[0, 0.035, 0]} emissive={glow} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0715, 0]}>
      <planeGeometry args={[w * 0.92, d * 0.86]} />
      <meshStandardMaterial map={labelTex("m" + label, label, "", "#2f2a28")} emissive={glow ?? "#000"} emissiveIntensity={glowK * 0.5} />
    </mesh>
    {fill > 0 && (
      <mesh position={[0, 0.075 + fill * 0.12, 0]}>
        <boxGeometry args={[w * 0.9, fill * 0.24, d * 0.85]} />
        <meshStandardMaterial color={C.cold} transparent opacity={0.55} emissive={C.cold} emissiveIntensity={0.4} />
      </mesh>
    )}
  </group>
);

/* ---------------- SO-DIMM RAM stick ---------------- */
export const SODIMM: React.FC<P & { label?: string; glowK?: number }> = ({ label = "16 GB", glowK = 0, ...p }) => (
  <group {...p}>
    <RBox size={[2.2, 0.05, 0.9]} r={0.02} color="#a8471f" position={[0, 0.025, 0]} />
    {/* memory chips */}
    {[0, 1, 2, 3].map((i) => (
      <MemChip key={i} position={[-0.78 + i * 0.52, 0.05, -0.05]} w={0.42} d={0.34} label="DDR5" glow={C.cold} glowK={glowK} />
    ))}
    {/* label sticker */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.056, 0.3]}>
      <planeGeometry args={[1.0, 0.16]} />
      <meshStandardMaterial map={canvasTex("sticker" + label, 512, 80, (g, w, h) => {
        g.fillStyle = "#f4efe8"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2420"; g.font = "800 44px Inter"; g.fillText(label + " SO-DIMM", 18, 56);
      })} />
    </mesh>
    {/* gold edge contacts */}
    {Array.from({ length: 40 }).map((_, i) => (
      <mesh key={i} position={[-1.0 + i * 0.05 + (i > 19 ? 0.06 : 0), 0.053, 0.41]}>
        <boxGeometry args={[0.03, 0.006, 0.08]} />
        <meshStandardMaterial color={C.gold} metalness={0.7} roughness={0.25} />
      </mesh>
    ))}
  </group>
);

/* ---------------- data "document" cube ---------------- */
const docTex = () => canvasTex("doc", 128, 128, (g) => {
  g.fillStyle = "#fffaf3"; g.fillRect(0, 0, 128, 128);
  g.fillStyle = C.orange; g.fillRect(14, 14, 60, 12);
  g.fillStyle = "#d8cec3"; for (let i = 0; i < 6; i++) g.fillRect(14, 38 + i * 13, 100 - (i % 3) * 18, 6);
});
export const DataCube: React.FC<P & { color?: string; tint?: number }> = ({ color = "#fffaf3", tint = 0, ...p }) => (
  <group {...p}>
    <mesh geometry={roundedBoxGeo(0.28, 0.06, 0.36, 0.02)} castShadow>
      <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color(C.cold), tint).getStyle()} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.032, 0]}>
      <planeGeometry args={[0.25, 0.33]} />
      <meshStandardMaterial map={docTex()} />
    </mesh>
  </group>
);

/* ---------------- laptops (no logos) ---------------- */
/** per-key RGB keyboard texture (rainbow across the keys); scrolled over time for a wave effect */
const rgbKeysTex = () => {
  const t = canvasTex("kb-rgb", 1024, 192, (g, w, h) => {
    g.fillStyle = "#151211"; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 28; c++) {
      const hue = (c / 28) * 360 + r * 12;
      g.fillStyle = `hsl(${hue}, 95%, 60%)`; g.fillRect(4 + c * 36.5, 6 + r * 37, 30, 30);
      g.fillStyle = "rgba(20,16,14,.55)"; g.fillRect(9 + c * 36.5, 11 + r * 37, 20, 20);
    }
  });
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(0.5, 1);
  return t;
};

export const Laptop: React.FC<P & { open?: number; body?: string; lid?: string; rgb?: boolean; screen?: string; progress?: number; barColor?: string; t?: number }> = ({
  open = 1, body = "#d9dbde", lid, rgb = false, screen = "#1f1b19", progress = 0, barColor = C.orange, t = 0, ...p
}) => {
  const kb = rgb ? rgbKeysTex() : null;
  if (kb) kb.offset.x = (t * 0.12) % 1;
  return (
  <group {...p}>
    <RBox size={[2.6, 0.1, 1.8]} r={0.05} color={body} rough={0.35} />
    {/* keyboard + trackpad */}
    {kb && (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.053, -0.15]}>
        <planeGeometry args={[2.2, 0.8]} />
        <meshStandardMaterial map={kb} emissiveMap={kb} emissive="#ffffff" emissiveIntensity={1.1} roughness={0.4} />
      </mesh>
    )}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.052, -0.15]} visible={!kb}>
      <planeGeometry args={[2.2, 0.8]} />
      <meshStandardMaterial map={canvasTex("kb" + body, 512, 192, (g, w, h) => {
        g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, 0, w, h);
        for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { g.fillStyle = "rgba(40,34,30,.85)"; g.fillRect(6 + c * 36, 6 + r * 37, 30, 30); }
      })} transparent />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.052, 0.55]}>
      <planeGeometry args={[0.9, 0.5]} />
      <meshStandardMaterial color={new THREE.Color(body).multiplyScalar(0.92).getStyle()} />
    </mesh>
    {rgb && (
      <mesh position={[0, 0.02, 0.91]}>
        <boxGeometry args={[2.3, 0.02, 0.01]} />
        <meshBasicMaterial color={`hsl(${(t * 90) % 360}, 95%, 60%)`} />
      </mesh>
    )}
    {/* lid, hinged at the back edge: open=1 -> tilted back ~15°, open=0 -> closed flat */}
    <group position={[0, 0.06, -0.88]} rotation={[Math.PI / 2 * (1 - open) - 0.26 * open, 0, 0]}>
      <RBox size={[2.6, 1.75, 0.07]} r={0.04} color={lid ?? body} position={[0, 0.875, 0]} rough={0.35} />
      <mesh position={[0, 0.9, 0.037]}>
        <planeGeometry args={[2.42, 1.52]} />
        <meshBasicMaterial color={screen} />
      </mesh>
      {/* progress bar on the screen */}
      <mesh position={[0, 0.62, 0.039]}>
        <planeGeometry args={[1.9, 0.14]} />
        <meshBasicMaterial color="#4a403b" />
      </mesh>
      <mesh position={[-0.95 + (1.9 * progress) / 2, 0.62, 0.04]} scale={[Math.max(0.001, progress), 1, 1]}>
        <planeGeometry args={[1.9, 0.14]} />
        <meshBasicMaterial color={barColor} />
      </mesh>
    </group>
  </group>
  );
};

/* ---------------- SoC package: one die (CPU + GPU) + 2 memory packages ---------------- */
const dieTex = () => canvasTex("die", 1024, 768, (g, w, h) => {
  g.fillStyle = "#2c2724"; g.fillRect(0, 0, w, h);
  // CPU cluster (warm) left, GPU array (cool) right, caches between
  const blk = (x: number, y: number, bw: number, bh: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, bw, bh); g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = 3; g.strokeRect(x, y, bw, bh); };
  for (let i = 0; i < 4; i++) blk(40 + (i % 2) * 150, 60 + Math.floor(i / 2) * 170, 130, 150, "#e8743a");
  for (let i = 0; i < 6; i++) blk(40 + (i % 3) * 100, 420 + Math.floor(i / 3) * 120, 88, 100, "#f3a56c");
  blk(360, 60, 120, 640, "#8a6f5c");
  for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) blk(510 + c * 240, 60 + r * 130, 220, 112, "#5fa9e6");
  g.fillStyle = "rgba(255,255,255,.75)"; g.font = "800 46px Inter";
  g.fillText("CPU", 120, 395); g.fillText("GPU", 690, 745 - 18);
});
export const SoC: React.FC<P & { memK?: number; glowK?: number }> = ({ memK = 1, glowK = 0, ...p }) => (
  <group {...p}>
    {/* substrate */}
    <RBox size={[3.2, 0.08, 2.4]} r={0.04} color="#a8471f" position={[0, 0.04, 0]} />
    {/* solder-ball hint on the edge */}
    {Array.from({ length: 30 }).map((_, i) => (
      <mesh key={i} position={[-1.5 + i * 0.104, -0.01, 1.18]}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial color="#d7d2cb" metalness={0.6} roughness={0.3} />
      </mesh>
    ))}
    {/* the single die */}
    <RBox size={[1.9, 0.08, 1.4]} r={0.02} color="#2c2724" position={[-0.45, 0.12, 0]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.45, 0.162, 0]}>
      <planeGeometry args={[1.8, 1.32]} />
      <meshStandardMaterial map={dieTex()} emissiveMap={dieTex()} emissive="#ffffff" emissiveIntensity={0.15 + glowK * 0.4} />
    </mesh>
    {/* two unified-memory packages, millimetres away */}
    {[-0.55, 0.55].map((z) => (
      <group key={z} position={[1.05 + (1 - memK) * 2.5, 0.08 + (1 - memK) * 1.5, z * 0.85]}>
        <MemChip w={0.75} d={0.62} label="LPDDR" glow={C.cold} glowK={glowK} />
      </group>
    ))}
  </group>
);

/* ---------------- round meeting table ---------------- */
export const RoundTable: React.FC<P> = (p) => (
  <group {...p}>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.3, 1.3, 0.1, 64]} />
      <meshStandardMaterial color="#e9c49e" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.553, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.1, 1.16, 64]} />
      <meshStandardMaterial color={C.orange} />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.12, 0.2, 0.5, 24]} />
      <meshStandardMaterial color="#c59a74" />
    </mesh>
  </group>
);

/** little worker figure (CPU = orange, GPU = blue) */
export const Worker: React.FC<P & { color: string; label: string; nod?: number }> = ({ color, label, nod = 0, ...p }) => (
  <group {...p}>
    <mesh position={[0, 0.35, 0]} castShadow>
      <capsuleGeometry args={[0.18, 0.35, 8, 20]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.8 + nod * 0.03, 0]} rotation={[nod * 0.3, 0, 0]} castShadow>
      <sphereGeometry args={[0.17, 24, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.82 + nod * 0.03, 0.15]}>
      <planeGeometry args={[0.22, 0.08]} />
      <meshBasicMaterial map={canvasTex("wk" + label, 128, 48, (g) => { g.fillStyle = "#fff"; g.fillRect(0, 0, 128, 48); g.fillStyle = "#1f1a17"; g.font = "800 34px Inter"; g.textAlign = "center"; g.fillText(label, 64, 36); })} />
    </mesh>
  </group>
);

export const useNoop = () => useMemo(() => 0, []);
