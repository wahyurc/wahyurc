import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { Lights, Pipe, routedPath } from "../three/parts";
import { Building, Chip, DataCube, Laptop, MemChip, PCB, RoundTable, SODIMM, SoC, Worker } from "../three/hw";
import { C, SCENES, cue, eOut, eSoft, lerp, on, pop } from "../lib";
import { HeaderFade, Halftone, Title } from "../fx";

type V3 = [number, number, number];
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** camera path through keyframes [time, pos, look] with eased segments */
const camPath = (t: number, keys: [number, V3, V3][]) => {
  if (t <= keys[0][0]) return { pos: keys[0][1], look: keys[0][2] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0, l0] = keys[i], [t1, p1, l1] = keys[i + 1];
    if (t <= t1) { const k = lerp(t, [t0, t1], [0, 1], eSoft); return { pos: mix(p0, p1, k), look: mix(l0, l1, k) }; }
  }
  const l = keys[keys.length - 1]; return { pos: l[1], look: l[2] };
};

/** small spec card (like a lab annotation), top-left under the title */
const Spec: React.FC<{ t: number; at: number; out?: number; title: string; lines: string[]; color: string; y?: number }> = ({ t, at, out = 1e9, title, lines, color, y = 560 }) => {
  const k = Math.min(on(t, at, 0.35), lerp(t, [out - 0.3, out], [1, 0]));
  return (
    <div style={{ position: "absolute", left: 70, top: y, opacity: k, transform: `translateX(${(1 - k) * -30}px)`, padding: "18px 24px", borderRadius: 20, background: "rgba(255,250,244,.94)", boxShadow: "0 14px 30px rgba(120,60,20,.16)", borderLeft: `10px solid ${color}`, fontFamily: "Rubik" }}>
      <div style={{ fontWeight: 900, fontSize: 48, color: C.ink }}>{title}</div>
      {lines.map((l, i) => <div key={i} style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 31, color: "#6d5a4d", marginTop: 6 }}>{l}</div>)}
    </div>
  );
};

const Big: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode; y?: number; size?: number }> = ({ t, at, out = 1e9, children, y = 1180, size = 64 }) => (
  <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: size, lineHeight: 1.08, color: C.ink, opacity: Math.min(on(t, at, 0.3), lerp(t, [out - 0.3, out], [1, 0])), transform: `scale(${pop(t, at)})`, textShadow: "0 4px 0 rgba(255,255,255,.8)" }}>
    {children}
  </div>
);

/** numbered step chips that build up one by one (clear, readable explanation) */
const Steps: React.FC<{ t: number; items: [number, string, string][]; out?: number; y?: number }> = ({ t, items, out = 1e9, y = 1060 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: y, display: "flex", flexDirection: "column", gap: 14, opacity: lerp(t, [out - 0.3, out], [1, 0]) }}>
    {items.map(([at, n, txt], i) => {
      const k = on(t, at, 0.4);
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity: k, transform: `translateX(${(1 - k) * -40}px)` }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: n === "!" ? C.red : C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
          <div style={{ padding: "10px 20px", borderRadius: 16, background: "rgba(255,250,244,.95)", fontFamily: "Rubik", fontWeight: 800, fontSize: 38, color: C.ink, boxShadow: "0 8px 20px rgba(120,60,20,.14)" }}>{txt}</div>
        </div>
      );
    })}
  </div>
);

/** legend comparing lane widths */
const LaneKey: React.FC<{ t: number; at: number; out?: number }> = ({ t, at, out = 1e9 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 470, opacity: Math.min(on(t, at, 0.4), lerp(t, [out - 0.3, out], [1, 0])), display: "flex", flexDirection: "column", gap: 12, padding: "18px 24px", borderRadius: 20, background: "rgba(255,250,244,.95)", boxShadow: "0 10px 24px rgba(120,60,20,.14)", fontFamily: "Rubik", fontWeight: 800, fontSize: 32, color: C.ink }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ width: 160, height: 26, borderRadius: 13, background: C.cold }} />GPU ↔ VRAM: lebar, cepat</div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ width: 160, height: 8, borderRadius: 4, background: "#7fc6ff", margin: "9px 0" }} />RAM → GPU (PCIe): sempit</div>
  </div>
);

/* ===================== 1 · HOOK =====================
   Layout bands (no overlaps): title 170–360 · subtitle 390–450 · laptops 470–1120 · stat cards 1150–1350 · captions 1390+ */
const StatCard: React.FC<{ t: number; at: number; side: "left" | "right"; name: string; ram: string; pct: number; done?: boolean; color: string; tag: string }> = ({ t, at, side, name, ram, pct, done, color, tag }) => (
  <div style={{ position: "absolute", top: 1150, [side]: 60, width: 455, opacity: on(t, at, 0.4), transform: `translateY(${(1 - on(t, at, 0.4)) * 30}px)`, padding: "18px 22px", borderRadius: 24, background: "rgba(255,250,244,.96)", boxShadow: "0 14px 30px rgba(120,60,20,.16)", fontFamily: "Rubik" } as React.CSSProperties}>
    <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 10, background: tag, color: "#fff", fontWeight: 800, fontSize: 28 }}>{name}</div>
    <div style={{ fontWeight: 900, fontSize: 64, color: C.ink, marginTop: 6 }}>{ram}<span style={{ fontSize: 30, marginLeft: 8 }}>RAM</span></div>
    <div style={{ height: 14, borderRadius: 7, background: "#efe2d6", marginTop: 10, overflow: "hidden" }}><div style={{ width: `${pct * 100}%`, height: "100%", background: color }} /></div>
    <div style={{ fontWeight: 800, fontSize: 30, color, marginTop: 8 }}>AI {Math.round(pct * 100)}% {done && <span style={{ color: "#3aa56b" }}>✓ selesai</span>}</div>
  </div>
);

export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const tMac = cue("macbook"), tAI = cue("menjalankan"), tLap = cue("laptop", 4), tJaw = cue("jawabannya"), tSiapa = cue("siapa", 10);
  const pMac = lerp(t, [tAI, tAI + 2.6], [0, 1], eSoft), pGam = lerp(t, [tAI, tAI + 8], [0, 0.42], (x) => x);
  const cam = camPath(t, [[0, [0.2, 6.2, 11.0], [0.05, 0.1, -0.1]], [SCENES.hook[1], [-0.2, 5.8, 10.4], [0.05, 0.2, -0.1]]]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 40 }} bg="#f6ece3">
        <Lights dir={[3, 7, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#f3e2d4" />
        </mesh>
        <Laptop position={[-0.85, 0, 0.95]} rotation={[0, 0.18, 0]} scale={0.66} body="#8e9095" lid="#85878c" screen="#262220" progress={pMac} barColor={C.cold} open={lerp(t, [0, 0.8], [0.2, 1], eOut)} />
        <Laptop position={[0.9, 0, -1.25]} rotation={[0, -0.18, 0]} scale={0.66} body="#3a3330" lid="#2f2927" rgb t={t} screen="#1d1917" progress={pGam} barColor={C.orange} open={lerp(t, [0.2, 1.0], [0.2, 1], eOut)} />
      </Stage>
      <HeaderFade />
      <StatCard t={t} at={tMac} side="left" name="MacBook" ram="16 GB" pct={pMac} done={pMac >= 1} color={C.coldD} tag="#7d7f84" />
      <StatCard t={t} at={tLap} side="right" name="Laptop gaming" ram="32 GB" pct={pGam} color={C.orangeD} tag={C.ink} />
      <Title t={t} at={0.2} chip="KOK BISA?" title="16 GB vs 32 GB" accent="16" out={tJaw - 0.1} y={170} />
      <Title t={t} at={tJaw} chip="JAWABANNYA" title="Bukan soal besar RAM" accent="besar" y={170} />
      <Big t={t} at={tSiapa} y={390} size={48}>tapi <span style={{ color: C.orange }}>siapa</span> yang bisa memakainya</Big>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* board layout used by OFFICE and COPY scenes */
const CPU_P: V3 = [-1.7, 0.04, -2.3];
const GPU_P: V3 = [1.7, 0.04, -1.4];
const VRAM_P: V3[] = [[0.75, 0.04, -2.35], [2.65, 0.04, -2.35], [0.75, 0.04, -0.45], [2.65, 0.04, -0.45]];
const RAM_P: V3[] = [[-1.6, 0.04, 2.9], [-1.6, 0.04, 4.05]];

const Board: React.FC<{ t: number; cpuK: number; gpuK: number; vramGlow: number; ramGlow: number; vramFill?: number; pcieGlow?: number; gpuGlow?: number; children?: React.ReactNode }> = ({
  t, cpuK, gpuK, vramGlow, ramGlow, vramFill = 0, pcieGlow = 0, gpuGlow = 0, children,
}) => {
  const pcie = useMemo(() => routedPath([[-0.45, 0.07, 3.45], [0.4, 0.07, 3.45], [0.4, 0.07, 0.6], [1.7, 0.07, 0.6], [1.7, 0.07, -0.55]], 0.25), []);
  return (
    <group>
      <PCB size={[7.5, 10]} position={[0, -0.04, 0.6]} />
      <Chip title="CPU" sub="prosesor" size={1.25} position={CPU_P} />
      <Building w={0.95} d={0.95} h={1.7} lit="#ffb56b" k={cpuK} position={[CPU_P[0], 0.19, CPU_P[2]]} />
      <Chip title="GPU" sub="kartu grafis" size={1.2} position={GPU_P} glow={C.cold} glowK={gpuGlow} />
      <Building w={0.9} d={0.9} h={1.3} lit="#9fd2ff" k={gpuK} position={[GPU_P[0], 0.19, GPU_P[2]]} />
      {VRAM_P.map((p, i) => <MemChip key={i} position={p} w={0.62} d={0.46} label="VRAM" glow={vramFill > 0.95 ? C.red : C.cold} glowK={vramGlow} fill={vramFill} />)}
      {RAM_P.map((p, i) => <SODIMM key={i} position={p} label="16 GB" glowK={ramGlow} />)}
      {/* wide VRAM lanes */}
      {VRAM_P.map((p, i) => (
        <mesh key={i} position={[(p[0] + GPU_P[0]) / 2, 0.05, (p[2] + GPU_P[2]) / 2]} rotation={[0, -Math.atan2(p[2] - GPU_P[2], p[0] - GPU_P[0]), 0]}>
          <boxGeometry args={[Math.hypot(p[0] - GPU_P[0], p[2] - GPU_P[2]), 0.01, 0.28]} />
          <meshStandardMaterial color={C.cold} transparent opacity={0.25 + vramGlow * 0.4} emissive={C.cold} emissiveIntensity={vramGlow * 0.6} />
        </mesh>
      ))}
      {/* narrow PCIe lane from system RAM to the GPU */}
      <Pipe curve={pcie} r={0.035} color={pcieGlow > 0 ? "#7fc6ff" : C.trace} closed={false} />
      {children}
      {/* expose the path for children via context-free prop drilling */}
      <group userData={{ pcie }} />
    </group>
  );
};

/* ===================== 2 · OFFICE (13.05 – 28.6) ===================== */
export const Office: React.FC<{ t: number }> = ({ t }) => {
  const tKantor = cue("kantor"), tCPU = cue("prosesor", 15), tGPU = cue("kartu", 18), tGudang = cue("gudang", 21), tVRAM = cue("vram", 23), tRAM = cue("gudang", 25), tLain = cue("lain", 28);
  const cam = camPath(t, [
    [SCENES.office[0], [0, 13, 10.5], [0, 0, 0.6]],
    [tCPU - 0.2, [0.4, 9.5, 8.0], [0, 0, 0.2]],
    [tCPU + 1.0, [-0.6, 4.6, 1.8], [-1.7, 0.9, -2.3]],
    [tGPU + 0.8, [2.9, 4.4, 2.4], [1.7, 0.7, -1.4]],
    [tVRAM + 0.6, [1.9, 4.8, 2.0], [1.7, 0.1, -1.4]],
    [tRAM + 1.2, [-0.2, 4.4, 7.6], [-1.6, 0.1, 3.4]],
    [SCENES.office[1], [0.2, 6.0, 8.6], [-0.6, 0.0, 2.2]],
  ]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 42 }} bg="#f6ece3">
        <Lights dir={[3, 9, 6]} />
        <Board t={t} cpuK={pop(t, tCPU)} gpuK={pop(t, tGPU)} vramGlow={on(t, tGudang, 0.5)} ramGlow={on(t, tRAM, 0.5)} />
      </Stage>
      <HeaderFade />
      <Title t={t} at={SCENES.office[0] + 0.1} chip="ANALOGI" title="Laptop gaming = kantor" accent="kantor" y={170} out={tCPU} />
      <Spec t={t} at={tCPU} out={tGPU} title="Prosesor (CPU)" lines={["si otak", "gedung pertama"]} color={C.orange} y={200} />
      <Spec t={t} at={tGPU} out={tGudang - 0.1} title="Kartu grafis (GPU)" lines={["si mata", "gedung sebelah"]} color={C.cold} y={200} />
      <Spec t={t} at={tGudang} out={tRAM - 0.1} title="VRAM · 8 GB" lines={["gudang arsip kecil milik GPU", "contoh: RTX 5060 Laptop, GDDR7"]} color={C.coldD} y={200} />
      <Spec t={t} at={tRAM} title="RAM · 32 GB" lines={["gudang arsip utama", "contoh: 2 × 16 GB SO-DIMM"]} color={C.orangeD} y={200} />
      {/* big capacity numbers when each storage is introduced */}
      <Big t={t} at={tVRAM} out={tRAM - 0.1} y={1170} size={110}><span style={{ color: C.coldD }}>8 GB</span></Big>
      <Big t={t} at={cue("32", 25)} y={1170} size={110}><span style={{ color: C.orangeD }}>32 GB</span></Big>
      <Halftone opacity={0.3} />
      <span style={{ display: "none" }}>{tKantor}</span>
    </AbsoluteFill>
  );
};

/* ===================== 3 · COPY over PCIe (28.6 – 41.0) ===================== */
export const Copy: React.FC<{ t: number }> = ({ t }) => {
  const tButuh = cue("butuh"), tSalin = cue("disalin", 31), tKirim = cue("dikirim"), tSempit = cue("sempit"), tKalau = cue("kalau", 36), t8 = cue("8", 37), tSebagian = cue("sebagian"), tLambat = cue("lambat");
  const pcie = useMemo(() => routedPath([[-0.45, 0.07, 3.45], [0.4, 0.07, 3.45], [0.4, 0.07, 0.6], [1.7, 0.07, 0.6], [1.7, 0.07, -0.55]], 0.25), []);
  const lift = on(t, tSalin, 0.5);
  const travel = lerp(t, [tKirim, tKalau - 0.3], [0, 1], (x) => x);
  const queue = t > tSebagian - 0.3;
  const cam = camPath(t, [[SCENES.copy[0], [0.2, 6.0, 8.6], [-0.6, 0.0, 2.2]], [tKirim, [1.0, 9.6, 9.6], [0.4, 0.0, 0.2]], [SCENES.copy[1], [0.9, 10.2, 10.2], [0.5, 0, 0.0]]]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 42 }} bg="#f6ece3">
        <Lights dir={[3, 9, 6]} />
        <Board t={t} cpuK={1} gpuK={1} vramGlow={on(t, t8, 0.5)} ramGlow={0.4} vramFill={on(t, t8 - 0.2, 1.0)} pcieGlow={on(t, tKirim, 0.3)} gpuGlow={on(t, tButuh, 0.4) * (0.5 + 0.5 * Math.sin(t * 6))} />
        {/* original document stays in RAM; its copy lifts off and crawls through PCIe */}
        <DataCube position={[-0.9, 0.12, 3.45]} scale={2} />
        {t > tSalin - 0.1 && !queue && (() => {
          const p = travel > 0 ? pcie.getPointAt(Math.min(0.999, travel)) : new THREE.Vector3(-0.9 + lift * 0.45, 0.12 + lift * 0.5, 3.45);
          return <DataCube position={[p.x, travel > 0 ? 0.35 : p.y, p.z]} scale={2} tint={0.35} />;
        })()}
        {queue && Array.from({ length: 9 }).map((_, i) => {
          const u = Math.min(0.97, Math.max(0.001, (Math.max(0, t - tSebagian) * 0.06 + i * 0.1) % 1));
          const p = pcie.getPointAt(u);
          return <DataCube key={i} position={[p.x, 0.3, p.z]} scale={1.6} tint={0.5} />;
        })}
      </Stage>
      <HeaderFade />
      <Title t={t} at={tButuh - 0.3} chip="MASALAHNYA" title="Data harus disalin dulu" accent="disalin" y={170} out={tKalau - 0.1} />
      <Steps t={t} items={[[tSalin, "1", "Data disalin dari RAM"], [tKirim, "2", "Dikirim lewat PCIe (sempit)"]]} out={tKalau} />
      <LaneKey t={t} at={tSempit - 0.3} out={tKalau} />
      <Title t={t} at={tKalau} chip="KALAU DATANYA > 8 GB" title="VRAM penuh" accent="penuh" y={170} />
      <Steps t={t} items={[[t8, "!", "VRAM 8 GB sudah penuh"], [tSebagian, "→", "sisanya antre di PCIe 🐢"]]} />
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 4 · SoC (chip, naming, memory on package) ===================== */
/** 3D dimension marker measuring the gap between the die edge and a memory package */
const DimMarker: React.FC<{ k: number; x0: number; x1: number; z: number; y?: number }> = ({ k, x0, x1, z, y = 0.26 }) => {
  if (k <= 0.001) return null;
  const len = (x1 - x0) * k, mid = x0 + len / 2;
  const mat = <meshBasicMaterial color={C.ink} />;
  return (
    <group>
      {/* extension (witness) lines dropping onto both edges */}
      <mesh position={[x0, y - 0.05, z]}><boxGeometry args={[0.008, 0.12, 0.008]} />{mat}</mesh>
      <mesh position={[x1, y - 0.05, z]} scale={[1, k, 1]}><boxGeometry args={[0.008, 0.12, 0.008]} />{mat}</mesh>
      {/* dimension line with arrowheads */}
      <mesh position={[mid, y, z]}><boxGeometry args={[Math.max(0.001, len), 0.008, 0.008]} /><meshBasicMaterial color={C.orangeD} /></mesh>
      <mesh position={[x0 + 0.02, y, z]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.018, 0.04, 12]} /><meshBasicMaterial color={C.orangeD} /></mesh>
      <mesh position={[x0 + len - 0.02, y, z]} rotation={[0, 0, -Math.PI / 2]} visible={k > 0.95}><coneGeometry args={[0.018, 0.04, 12]} /><meshBasicMaterial color={C.orangeD} /></mesh>
    </group>
  );
};

// die right edge and memory-package left edge (see SoC in hw.tsx): die x -0.45 ± 0.95, memory x 1.05 ± 0.375
const DIE_EDGE = 0.5, MEM_EDGE = 0.675;

export const SocScene: React.FC<{ t: number }> = ({ t }) => {
  const tApple = cue("apple"), tDirombak = cue("dirombak"), tSatu = cue("chip", 50), tSoC = cue("soc", 51), tMem = cue("memorinya"), tMm = cue("milimeter");
  const memK = lerp(t, [tMem, tMem + 1.2], [0, 1], eSoft);
  const dimK = lerp(t, [tMm - 0.2, tMm + 0.6], [0, 1], eOut);
  const cam = camPath(t, [
    [SCENES.soc[0], [0, 9.5, 6.0], [0, 0, 0]],
    [tSatu, [0.2, 6.6, 5.0], [-0.2, 0, 0]],
    [tMem + 0.4, [0.8, 4.6, 3.6], [0.3, 0.05, 0]],
    [tMm + 0.4, [0.75, 2.2, 1.25], [0.58, 0.15, 0]],
    [SCENES.soc[1], [0.75, 2.1, 1.2], [0.58, 0.15, 0]],
  ]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 8, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#f1dfd0" />
        </mesh>
        <SoC memK={memK} glowK={on(t, cue("prosesor", 46), 0.6)} />
        <DimMarker k={dimK} x0={DIE_EDGE} x1={MEM_EDGE} z={0} />
      </Stage>
      <HeaderFade />
      <Title t={t} at={tApple - 0.2} chip="APPLE SILICON · M5" title={t < tSoC - 0.2 ? "Semuanya dirombak" : "Satu chip = SoC"} accent={t < tSoC - 0.2 ? "dirombak" : "SoC"} y={170} />
      <Spec t={t} at={tSatu - 1.2} out={tSoC - 0.1} title="Satu chip berisi:" lines={["CPU · GPU · NPU", "dan bagian penting lainnya"]} color={C.orange} y={430} />
      {/* SoC definition badge */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 430, opacity: Math.min(on(t, tSoC, 0.4), lerp(t, [tMem - 0.4, tMem], [1, 0])), transform: `scale(${pop(t, tSoC)})`, padding: "22px 26px", borderRadius: 26, background: C.ink, color: "#fff", fontFamily: "Rubik", textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 72, letterSpacing: 2, color: C.orangeL }}>SoC</div>
        <div style={{ fontWeight: 800, fontSize: 42, marginTop: 4 }}>System on a Chip</div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 28, marginTop: 8, color: "#e9dcd0" }}>seluruh sistem inti dalam satu chip</div>
      </div>
      <Spec t={t} at={tMem} title="Memori di paket yang sama" lines={["bukan di slot terpisah", "M5: hingga 32 GB · 153 GB/s"]} color={C.cold} y={430} />
      {/* label for the 3D dimension marker (kept in a fixed band, never on top of other text) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", opacity: on(t, tMm, 0.4), transform: `scale(${pop(t, tMm)})` }}>
        <span style={{ display: "inline-block", padding: "12px 26px", borderRadius: 999, background: "rgba(255,250,244,.96)", border: `4px solid ${C.orangeD}`, fontFamily: "Rubik", fontWeight: 900, fontSize: 44, color: C.ink }}>↔ jaraknya cuma beberapa mm</span>
      </div>
      <span style={{ display: "none" }}>{tDirombak}</span>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 5 · ONE TABLE = unified memory ===================== */
export const TableScene: React.FC<{ t: number }> = ({ t }) => {
  const tMeja = cue("meja", 59), tData = cue("data", 61), tBaca = cue("dibaca"), tTanpa = cue("tanpa", 63), tUni = cue("inilah", 65);
  const place = lerp(t, [tData, tData + 1.2], [0, 1], eSoft);
  const scan = on(t, tBaca, 0.6);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 5.4, 8.4 - on(t, tMeja, 3) * 0.6], look: [0, 0.55, 0], fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 8, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#f1dfd0" />
        </mesh>
        <RoundTable scale={0.8} />
        <Worker color={C.orange} label="CPU" position={[-1.35, 0, 0.1]} rotation={[0, Math.PI / 2.4, 0]} scale={1.15} nod={Math.sin(t * 4) * on(t, tData, 0.3) * (1 - place)} />
        <Worker color={C.cold} label="GPU" position={[1.35, 0, 0.1]} rotation={[0, -Math.PI / 2.4, 0]} scale={1.15} nod={scan * Math.sin(t * 5)} />
        <DataCube position={[-0.95 + place * 0.95, 0.47 + Math.sin(place * Math.PI) * 0.4, 0]} scale={2.2} tint={scan * 0.4} />
        <mesh position={[0.65, 0.8, 0]} rotation={[0, 0, Math.PI / 2.6]} visible={scan > 0.05}>
          <coneGeometry args={[0.35, 1.2, 24, 1, true]} />
          <meshBasicMaterial color={C.cold} transparent opacity={0.25 * scan} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </Stage>
      <HeaderFade />
      <Title t={t} at={SCENES.table[0] + 0.2} chip="HASILNYA" title="Satu meja, dipakai bersama" accent="bersama" y={170} />
      <Steps t={t} items={[[tData, "1", "CPU menaruh data di meja"], [tBaca, "2", "GPU langsung membacanya"]]} y={440} />
      <Big t={t} at={tTanpa} out={tUni - 0.1} y={1180} size={58}>
        <span style={{ display: "inline-block", padding: "12px 30px", borderRadius: 999, background: C.ink, color: "#fff" }}>0 salinan ✕</span>
      </Big>
      <Big t={t} at={tUni} y={1150} size={52}>
        <span style={{ display: "inline-block", padding: "14px 30px", borderRadius: 24, background: C.cold, color: "#fff" }}>Memori terpadu<br /><span style={{ fontSize: 38 }}>(Unified Memory)</span></span>
      </Big>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 6 · NPU ===================== */
// NPU block position on the die texture (see dieTex in hw.tsx) mapped to the SoC die plane
const NPU_POS: V3 = [-1.025, 0.175, 0.45];
const TaskIcon: React.FC<{ t: number; at: number; icon: string; text: string; x: number }> = ({ t, at, icon, text, x }) => (
  <div style={{ position: "absolute", left: x, top: 1060, width: 300, textAlign: "center", opacity: on(t, at, 0.4), transform: `scale(${pop(t, at)})` }}>
    <div style={{ width: 120, height: 120, margin: "0 auto", borderRadius: 32, background: "rgba(255,250,244,.96)", boxShadow: "0 10px 24px rgba(120,60,20,.16)", fontSize: 68, lineHeight: "120px" }}>{icon}</div>
    <div style={{ marginTop: 10, fontFamily: "Rubik", fontWeight: 800, fontSize: 30, color: C.ink, lineHeight: 1.15, whiteSpace: "pre-line" }}>{text}</div>
  </div>
);
const PowerBar: React.FC<{ label: string; w: number; color: string; k: number }> = ({ label, w, color, k }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Rubik", fontWeight: 800, fontSize: 32, color: C.ink }}>
    <span style={{ width: 90 }}>{label}</span>
    <span style={{ height: 26, width: 520 * w * k, borderRadius: 13, background: color }} />
  </div>
);

export const NpuScene: React.FC<{ t: number }> = ({ t }) => {
  const tNPU = cue("npu", 70), tKhusus = cue("khusus"), tWajah = cue("mengenali"), tSuara = cue("membersihkan"), tTeks = cue("mengubah");
  const tHemat = cue("hemat", 80), tNE = cue("namanya"), tM5 = cue("chip", 88), tAks = cue("akselerator");
  const glow = on(t, tNPU, 0.6) * (0.65 + 0.35 * Math.sin(t * 4));
  const showTasks = t < tHemat - 0.4;
  const cam = camPath(t, [
    [SCENES.npu[0], [0, 7.0, 5.2], [-0.3, 0, 0]],
    [tNPU + 0.6, [-0.7, 3.2, 3.0], [-0.9, 0.1, 0.3]],
    [tM5, [-0.6, 3.6, 3.4], [-0.7, 0.1, 0.2]],
    [SCENES.npu[1], [0.2, 5.6, 4.6], [-0.3, 0, 0]],
  ]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 8, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#f1dfd0" />
        </mesh>
        <SoC memK={1} glowK={0.2 + on(t, tAks, 0.6) * 0.6} />
        {/* NPU block lights up */}
        <mesh position={NPU_POS}>
          <boxGeometry args={[0.52, 0.03, 0.2]} />
          <meshStandardMaterial color={C.yellow} emissive={C.yellow} emissiveIntensity={glow * 1.2} transparent opacity={0.35 + glow * 0.5} />
        </mesh>
      </Stage>
      <HeaderFade />
      <Title t={t} at={SCENES.npu[0] + 0.2} chip="ANGGOTA BARU" title="NPU" accent="NPU" sub={t > tNPU ? "Neural Processing Unit" : undefined} y={170} />
      <Spec t={t} at={tKhusus} out={tHemat - 0.4} title="Prosesor khusus AI" lines={["dipakai untuk tugas AI sehari-hari"]} color={C.yellow} y={470} />
      {showTasks && <>
        <TaskIcon t={t} at={tWajah} icon="🖼️" text={"kenali wajah\ndi foto"} x={40} />
        <TaskIcon t={t} at={tSuara} icon="🎙️" text={"suara bersih\nsaat video call"} x={390} />
        <TaskIcon t={t} at={tTeks} icon="💬" text={"ucapan\njadi teks"} x={740} />
      </>}
      {/* power comparison (illustrative, not measured) */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 470, opacity: Math.min(on(t, tHemat - 0.3, 0.4), lerp(t, [tNE - 0.4, tNE], [1, 0])), padding: "20px 24px", borderRadius: 22, background: "rgba(255,250,244,.96)", boxShadow: "0 12px 26px rgba(120,60,20,.15)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontFamily: "Rubik", fontWeight: 900, fontSize: 38, color: C.ink }}>Daya untuk tugas AI ringan</div>
        <PowerBar label="CPU" w={0.8} color={C.orange} k={on(t, tHemat - 0.1, 0.6)} />
        <PowerBar label="GPU" w={1.0} color={C.cold} k={on(t, tHemat, 0.6)} />
        <PowerBar label="NPU" w={0.28} color={C.yellow} k={on(t, tHemat + 0.2, 0.6)} />
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, color: "#8a7a6d" }}>ilustrasi perbandingan, bukan hasil ukur</div>
      </div>
      <Spec t={t} at={tNE} out={tM5 - 0.2} title="Di Mac: Neural Engine" lines={["nama NPU buatan Apple"]} color={C.yellow} y={470} />
      <Spec t={t} at={tM5} title="Chip M5" lines={["Neural Engine 16 inti", "+ akselerator AI di tiap inti GPU"]} color={C.orange} y={470} />
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 9 · OUTRO + CTA ===================== */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const tPenting = cue("penting", 121), tSiapa = cue("siapa", 124), tBersama = cue("bersama", 125), tLike = cue("like", 127), tKomen = cue("komentar", 128), tFollow = cue("follow", 133);
  const cta = t > tLike - 0.4;
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 5.6, 6.2], look: [0, 0.2, cta ? 0.9 : 0.3], fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 8, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#f1dfd0" />
        </mesh>
        <group rotation={[0, t * 0.15, 0]} scale={0.8} position={[0, 0, cta ? -1.2 : 0]}>
          <SoC memK={1} glowK={0.5 + 0.5 * Math.sin(t * 3) * on(t, tBersama, 0.3)} />
        </group>
      </Stage>
      <HeaderFade />
      <div style={{ position: "absolute", left: 60, right: 60, top: 190, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: 64, lineHeight: 1.1, color: C.ink, opacity: lerp(t, [tLike - 0.6, tLike - 0.2], [1, 0]) }}>
        <div style={{ opacity: on(t, tPenting - 0.3, 0.4) }}>Bukan cuma <span style={{ color: C.orange }}>seberapa besar</span></div>
        <div style={{ opacity: on(t, tSiapa - 0.2, 0.4) }}>tapi <span style={{ color: C.coldD }}>siapa</span> yang bisa</div>
        <div style={{ opacity: on(t, tBersama - 0.4, 0.4) }}>memakainya <span style={{ color: C.orange }}>bersama</span></div>
      </div>
      {/* CTA stack: like -> comment question -> follow, each on its spoken word */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 980, display: "flex", flexDirection: "column", gap: 22, alignItems: "center", fontFamily: "Rubik" }}>
        <div style={{ opacity: on(t, tLike, 0.3), transform: `scale(${pop(t, tLike)})`, display: "flex", alignItems: "center", gap: 14, padding: "16px 34px", borderRadius: 999, background: "#fff", boxShadow: "0 12px 26px rgba(120,60,20,.18)", fontWeight: 900, fontSize: 46, color: C.ink }}>
          <span style={{ color: C.red, fontSize: 52 }}>♥</span> Like kalau baru tahu
        </div>
        <div style={{ opacity: on(t, tKomen, 0.3), transform: `scale(${pop(t, tKomen)})`, padding: "16px 30px", borderRadius: 30, background: C.ink, color: "#fff", fontWeight: 800, fontSize: 40, position: "relative" }}>
          💬 Laptopmu sudah punya <span style={{ color: C.yellow }}>NPU</span>?
        </div>
        <div style={{ opacity: on(t, tFollow, 0.3), transform: `scale(${pop(t, tFollow)})`, padding: "16px 40px", borderRadius: 999, background: C.orange, color: "#fff", fontWeight: 900, fontSize: 46, boxShadow: "0 14px 30px rgba(200,80,20,.35)" }}>+ Follow @w4hy03</div>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};
