import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { Lights, Pipe, routedPath } from "../three/parts";
import { Building, Chip, DataCube, Laptop, MemChip, PCB, RoundTable, SODIMM, SoC, Worker } from "../three/hw";
import { C, cue, eOut, eSoft, lerp, on, pop } from "../lib";
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
      <div style={{ fontWeight: 900, fontSize: 40, color: C.ink }}>{title}</div>
      {lines.map((l, i) => <div key={i} style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 27, color: "#6d5a4d", marginTop: 4 }}>{l}</div>)}
    </div>
  );
};

const Big: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode; y?: number; size?: number }> = ({ t, at, out = 1e9, children, y = 1180, size = 64 }) => (
  <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: size, lineHeight: 1.08, color: C.ink, opacity: Math.min(on(t, at, 0.3), lerp(t, [out - 0.3, out], [1, 0])), transform: `scale(${pop(t, at)})`, textShadow: "0 4px 0 rgba(255,255,255,.8)" }}>
    {children}
  </div>
);

/* ===================== 1 · HOOK (0 – 13.05) ===================== */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const t16 = cue("16"), tAI = cue("menjalankan"), tCepat = cue("cepat"), t32 = cue("32"), tJaw = cue("jawabannya"), tSiapa = cue("siapa", 10);
  const pMac = lerp(t, [tAI, tAI + 2.4], [0, 1], eSoft), pGam = lerp(t, [tAI, tAI + 7], [0, 0.42], (x) => x);
  const cam = camPath(t, [[0, [0.3, 6.6, 12.2], [0, 0.2, -0.2]], [13, [-0.5, 5.8, 11.0], [0, 0.3, -0.2]]]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 40 }} bg="#f6ece3">
        <Lights dir={[3, 7, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#f3e2d4" />
        </mesh>
        <Laptop position={[-0.85, 0, 1.15]} rotation={[0, 0.18, 0]} scale={0.72} body="#dcdee1" screen="#262220" progress={pMac} barColor={C.cold} open={lerp(t, [0, 0.8], [0.2, 1], eOut)} />
        <Laptop position={[0.95, 0, -1.3]} rotation={[0, -0.18, 0]} scale={0.72} body="#3a3330" lid="#2f2927" rgb screen="#1d1917" progress={pGam} barColor={C.orange} open={lerp(t, [0.2, 1.0], [0.2, 1], eOut)} />
      </Stage>
      <HeaderFade />
      {/* capacity tags */}
      <div style={{ position: "absolute", left: 110, top: 1150, transform: `scale(${pop(t, t16)})`, fontFamily: "Rubik", fontWeight: 900, fontSize: 96, color: C.ink }}>16<span style={{ fontSize: 44 }}> GB</span></div>
      <div style={{ position: "absolute", right: 110, top: 480, transform: `scale(${pop(t, t32)})`, fontFamily: "Rubik", fontWeight: 900, fontSize: 96, color: C.ink, textAlign: "right" }}>32<span style={{ fontSize: 44 }}> GB</span></div>
      <div style={{ position: "absolute", left: 110, top: 1268, opacity: on(t, tAI, 0.3), fontFamily: "Rubik", fontWeight: 800, fontSize: 40, color: C.coldD }}>
        AI {Math.round(pMac * 100)}% {pMac >= 1 && <span style={{ color: "#3aa56b" }}>✓ selesai</span>}
      </div>
      <div style={{ position: "absolute", right: 110, top: 600, opacity: on(t, tAI, 0.3), fontFamily: "Rubik", fontWeight: 800, fontSize: 40, color: C.orangeD, textAlign: "right" }}>AI {Math.round(pGam * 100)}%</div>
      <Title t={t} at={0.2} chip="KOK BISA?" title="16 GB vs 32 GB" accent="16" out={tJaw - 0.1} y={170} />
      <Title t={t} at={tJaw} chip="JAWABANNYA" title="Bukan soal besar RAM" accent="besar" y={170} />
      <Big t={t} at={tSiapa} y={410} size={56}>tapi <span style={{ color: C.orange }}>siapa</span> yang bisa memakainya</Big>
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
    [13.05, [0, 13, 10.5], [0, 0, 0.6]],
    [tCPU - 0.2, [0.4, 9.5, 8.0], [0, 0, 0.2]],
    [tCPU + 1.0, [-0.6, 4.6, 1.8], [-1.7, 0.9, -2.3]],
    [tGPU + 0.8, [2.9, 4.4, 2.4], [1.7, 0.7, -1.4]],
    [tVRAM + 0.6, [1.9, 4.8, 2.0], [1.7, 0.1, -1.4]],
    [tRAM + 1.2, [-0.2, 4.4, 7.6], [-1.6, 0.1, 3.4]],
    [28.6, [0.2, 6.0, 8.6], [-0.6, 0.0, 2.2]],
  ]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 42 }} bg="#f6ece3">
        <Lights dir={[3, 9, 6]} />
        <Board t={t} cpuK={pop(t, tCPU)} gpuK={pop(t, tGPU)} vramGlow={on(t, tGudang, 0.5)} ramGlow={on(t, tRAM, 0.5)} />
      </Stage>
      <HeaderFade />
      <Title t={t} at={13.1} chip="ANALOGI" title="Laptop gaming = kantor" accent="kantor" y={170} out={tCPU} />
      <Spec t={t} at={tCPU} out={tGPU} title="Prosesor (CPU)" lines={["si otak", "gedung pertama"]} color={C.orange} y={200} />
      <Spec t={t} at={tGPU} out={tGudang - 0.1} title="Kartu grafis (GPU)" lines={["si mata", "gedung sebelah"]} color={C.cold} y={200} />
      <Spec t={t} at={tGudang} out={tRAM - 0.1} title="VRAM · 8 GB" lines={["gudang arsip kecil milik GPU", "contoh: RTX 5060 Laptop, GDDR7"]} color={C.coldD} y={200} />
      <Spec t={t} at={tRAM} title="RAM · 32 GB" lines={["gudang arsip utama", "contoh: 2 × 16 GB SO-DIMM"]} color={C.orangeD} y={200} />
      <Big t={t} at={tLain - 0.6} y={1220} size={52}>…ada di <span style={{ color: C.orange }}>tempat lain lagi</span></Big>
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
  const travel = lerp(t, [tKirim, tSempit + 0.4], [0, 1], (x) => x);
  const queue = t > tSebagian - 0.3;
  const cam = camPath(t, [[28.6, [0.2, 6.0, 8.6], [-0.6, 0.0, 2.2]], [tKirim, [1.0, 9.6, 9.6], [0.4, 0.0, 0.2]], [41, [0.9, 10.2, 10.2], [0.5, 0, 0.0]]]);
  return (
    <AbsoluteFill>
      <Stage cam={{ ...cam, fov: 42 }} bg="#f6ece3">
        <Lights dir={[3, 9, 6]} />
        <Board t={t} cpuK={1} gpuK={1} vramGlow={on(t, t8, 0.5)} ramGlow={0.4} vramFill={on(t, t8 - 0.2, 1.0)} pcieGlow={on(t, tKirim, 0.3)} gpuGlow={on(t, tButuh, 0.4) * (0.5 + 0.5 * Math.sin(t * 6))} />
        {/* original document stays in RAM; its copy lifts off and crawls through PCIe */}
        <DataCube position={[-0.9, 0.12, 3.45]} scale={2} />
        {t > tSalin - 0.1 && !queue && (() => {
          const p = travel > 0 ? pcie.getPointAt(Math.min(1, travel)) : new THREE.Vector3(-0.9 + lift * 0.45, 0.12 + lift * 0.5, 3.45);
          return <DataCube position={[p.x, travel > 0 ? 0.35 : p.y, p.z]} scale={2} tint={0.35} />;
        })()}
        {queue && Array.from({ length: 9 }).map((_, i) => {
          const u = Math.min(0.97, ((t - tSebagian) * 0.06 + i * 0.1) % 1);
          const p = pcie.getPointAt(u);
          return <DataCube key={i} position={[p.x, 0.3, p.z]} scale={1.6} tint={0.5} />;
        })}
      </Stage>
      <HeaderFade />
      <Title t={t} at={tButuh - 0.3} chip="MASALAHNYA" title="Data harus disalin dulu" accent="disalin" y={170} out={tKalau - 0.1} />
      <Big t={t} at={tSempit - 0.4} out={tKalau} y={1210} size={50}>lewat jalur <span style={{ color: C.coldD }}>PCIe</span> yang jauh lebih <span style={{ color: C.orange }}>sempit</span></Big>
      <Title t={t} at={tKalau} chip="KALAU DATANYA > 8 GB" title="VRAM penuh" accent="penuh" y={170} />
      <Big t={t} at={tLambat - 0.5} y={1210} size={50}>sebagian lewat <span style={{ color: C.red }}>jalur lambat</span> 🐢</Big>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 4 · SoC + one table (41.0 – 55.5) ===================== */
export const SocScene: React.FC<{ t: number }> = ({ t }) => {
  const tApple = cue("apple"), tM5 = cue("m5"), tSatuChip = cue("chip", 45), tMem = cue("memorinya"), tMm = cue("milimeter"), tMeja = cue("meja", 50), tData = cue("data", 52), tBaca = cue("dibaca"), tTanpa = cue("tanpa", 54);
  const table = t >= tMeja - 0.3;
  const memK = lerp(t, [tMem, tMem + 1.0], [0, 1], eSoft);
  if (!table) {
    const cam = camPath(t, [[41.0, [0, 9, 5.5], [0, 0, 0]], [tSatuChip, [0.4, 6.0, 4.6], [-0.2, 0, 0]], [tMm, [1.2, 3.4, 2.6], [0.6, 0.1, 0]], [tMeja, [1.4, 2.8, 2.2], [0.7, 0.1, 0]]]);
    return (
      <AbsoluteFill>
        <Stage cam={{ ...cam, fov: 40 }} bg="#f6ece3">
          <Lights dir={[2, 8, 5]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#f1dfd0" />
          </mesh>
          <SoC memK={memK} glowK={on(t, tSatuChip, 0.5)} rotation={[0, 0, 0]} scale={1} />
        </Stage>
      <HeaderFade />
        <Title t={t} at={tApple - 0.2} chip="APPLE SILICON · M5" title="Satu chip" accent="Satu" y={170} />
        <Spec t={t} at={tSatuChip} out={tMeja} title="CPU + GPU" lines={["dalam satu die", "M5: CPU 10 inti, GPU 10 inti"]} color={C.orange} y={430} />
        <Spec t={t} at={tMem} out={tMeja} title="Memori terpadu" lines={["di paket yang sama", "hingga 32 GB · 153 GB/s"]} color={C.cold} y={1130} />
        {/* millimetre dimension marker */}
        <div style={{ position: "absolute", left: 600, top: 930, opacity: on(t, tMm, 0.3) * lerp(t, [tMeja - 0.5, tMeja - 0.3], [1, 0]), display: "flex", alignItems: "center", gap: 10, fontFamily: "Rubik", fontWeight: 900, fontSize: 44, color: C.ink }}>
          <span style={{ display: "inline-block", width: lerp(t, [tMm, tMm + 0.5], [0, 150], eOut), height: 6, background: C.orange, borderLeft: "6px solid #1f1a17", borderRight: "6px solid #1f1a17" }} />
          ± mm
        </div>
        <span style={{ display: "none" }}>{tM5}</span>
        <Halftone opacity={0.3} />
      </AbsoluteFill>
    );
  }
  const place = lerp(t, [tData, tData + 1.0], [0, 1], eSoft);
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
        {/* GPU reading beam */}
        <mesh position={[0.65, 0.8, 0]} rotation={[0, 0, Math.PI / 2.6]} visible={scan > 0.05}>
          <coneGeometry args={[0.35, 1.2, 24, 1, true]} />
          <meshBasicMaterial color={C.cold} transparent opacity={0.25 * scan} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </Stage>
      <HeaderFade />
      <Title t={t} at={tMeja - 0.2} chip="UNIFIED MEMORY" title="Satu meja, dipakai bersama" accent="bersama" y={170} />
      <Big t={t} at={tTanpa} y={1160} size={60}>
        <span style={{ display: "inline-block", padding: "12px 30px", borderRadius: 999, background: C.ink, color: "#fff" }}>0 salinan ✕</span>
      </Big>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 6 · OUTRO (68.2 – 78) ===================== */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const tPenting = cue("penting", 69), tSiapa = cue("siapa", 71), tBersama = cue("bersama", 73), tFollow = cue("follow");
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 5.2, 5.4], look: [0, 0.3, 0], fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 8, 5]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#f1dfd0" />
        </mesh>
        <group rotation={[0, t * 0.15, 0]} scale={0.9}>
          <SoC memK={1} glowK={0.5 + 0.5 * Math.sin(t * 3) * on(t, tBersama, 0.3)} />
        </group>
      </Stage>
      <HeaderFade />
      <div style={{ position: "absolute", left: 60, right: 60, top: 200, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: 70, lineHeight: 1.1, color: C.ink }}>
        <div style={{ opacity: on(t, tPenting - 0.3, 0.4) }}>Bukan cuma <span style={{ color: C.orange }}>seberapa besar</span></div>
        <div style={{ opacity: on(t, tSiapa - 0.2, 0.4) }}>tapi <span style={{ color: C.coldD }}>siapa</span> yang bisa</div>
        <div style={{ opacity: on(t, tBersama - 0.4, 0.4), transform: `scale(${pop(t, tBersama - 0.4)})` }}>memakainya <span style={{ color: C.orange }}>bersama</span></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", transform: `scale(${pop(t, tFollow - 0.2)})`, opacity: on(t, tFollow - 0.2, 0.2) }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "20px 44px", borderRadius: 999, background: C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 54, boxShadow: "0 14px 30px rgba(200,80,20,.35)" }}>+ Follow @w4hy03</span>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};
