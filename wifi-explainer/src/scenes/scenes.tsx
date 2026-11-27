import React from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { Lights, RBox } from "../three/parts";
import {
  Aquarium, BAND24, BAND5, Bed, BrickWall, Cabinet, Car, CellTower, ConcreteWall, Headphones, MeshNode, MetalPlate, Microwave, Mirror,
  Phone, Pulses, Road, Router, Shelf, Sofa, Speaker, Wave,
} from "../three/wifi";
import { C, SCENES, cue, eOut, eSoft, lerp, on, pop } from "../lib";
import { HeaderFade, Halftone, Title } from "../fx";
import { Big, Card, Pill, Steps, camPath, vis } from "../ui";

const Floor: React.FC<{ color?: string }> = ({ color = "#f1dfd0" }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
    <planeGeometry args={[60, 60]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

/* two-room cut-away house used in the hook: living room (left) | bedroom (right) */
const House: React.FC = () => (
  <group>
    <RBox size={[3.8, 0.12, 2.2]} r={0.03} color="#efd2bd" position={[0, 0.06, 0]} />
    <RBox size={[3.8, 1.5, 0.12]} r={0.02} color="#f6e6da" position={[0, 0.85, -1.04]} />
    <RBox size={[0.12, 1.5, 2.2]} r={0.02} color="#efd6c5" position={[-1.84, 0.85, 0]} />
    <RBox size={[0.12, 1.5, 2.2]} r={0.02} color="#efd6c5" position={[1.84, 0.85, 0]} />
    {/* interior wall with a door opening */}
    <RBox size={[0.14, 1.5, 1.2]} r={0.02} color="#e9c7b0" position={[0.1, 0.85, -0.44]} />
    <RBox size={[0.14, 0.4, 0.95]} r={0.02} color="#e9c7b0" position={[0.1, 1.4, 0.62]} />
    {/* window on back wall of the bedroom */}
    <mesh position={[1.0, 1.0, -0.97]}><planeGeometry args={[0.8, 0.6]} /><meshBasicMaterial color="#fffaf3" /></mesh>
    <Sofa position={[-1.0, 0.12, 0.35]} scale={0.5} />
    <Shelf position={[-0.9, 0.95, -0.82]} scale={0.8} />
    <Bed position={[1.05, 0.12, -0.15]} scale={0.55} />
  </group>
);

/* ===================== 1 · HOOK ===================== */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const tPindah = cue("pindah"), tHilang = cue("hilang"), tSatu = cue("satu", 7.5), t5G = cue("5g", 9);
  const move = lerp(t, [tPindah, tPindah + 1.2], [0, 1], eSoft);
  const bars = move < 0.3 ? 3 : move < 0.7 ? 1 : 0;
  const ph: [number, number, number] = [-0.45 + move * 1.55, 0.95, 0.45 - move * 0.25];
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [lerp(t, [0, 12], [0.2, -0.2], (x) => x), 4.6, 7.8], look: [0, 0.55, 0], fov: 40 }} bg="#f6ece3">
        <Lights dir={[3, 7, 5]} />
        <Floor />
        <House />
        <Router position={[-0.9, 0.99, -0.82]} scale={0.38} t={t} />
        <Pulses position={[-0.9, 1.05, -0.82]} t={t} color={BAND5} maxR={1.3} speed={0.7} />
        <Phone position={ph} rotation={[-0.25, 0, 0]} scale={0.28} bars={bars} warn={t > tHilang} />
      </Stage>
      <HeaderFade />
      <Title t={t} at={0.2} chip="KATANYA" title="WiFi 5 GHz lebih kencang" accent="5" out={tSatu - 0.1} y={170} />
      <Title t={t} at={tSatu} chip="PLOT TWIST" title="5 GHz ≠ 5G" accent="≠" y={170} />
      {/* signal meter in the bottom band */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", opacity: vis(t, 0.6, tSatu) }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "16px 30px", borderRadius: 26, background: "rgba(255,250,244,.96)", boxShadow: "0 12px 26px rgba(120,60,20,.16)", fontFamily: "Rubik", fontWeight: 900, fontSize: 40, color: C.ink }}>
          Sinyal WiFi
          <span style={{ display: "inline-flex", gap: 6, alignItems: "flex-end" }}>
            {[1, 2, 3].map((b) => <span key={b} style={{ width: 18, height: 14 + b * 12, borderRadius: 4, background: b <= bars ? C.coldD : "#e3d6ca" }} />)}
          </span>
          <span style={{ color: bars === 0 ? C.red : bars === 1 ? C.orangeD : "#3aa56b" }}>{bars === 0 ? "hilang!" : bars === 1 ? "lemah" : "penuh"}</span>
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center", gap: 26, alignItems: "center", opacity: vis(t, t5G - 0.6) }}>
        <Pill bg={BAND5} size={44}>📶 5 GHz = WiFi</Pill>
        <span style={{ fontFamily: "Rubik", fontWeight: 900, fontSize: 64, color: C.ink }}>≠</span>
        <Pill bg={C.ink} size={44}>📱 5G = seluler</Pill>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 2 · TERMS: 5G vs 5 GHz ===================== */
export const Terms: React.FC<{ t: number }> = ({ t }) => {
  const t5G = cue("5g", 12), tSed = cue("sedangkan", 15), tMirip = cue("namanya");
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 1.5, 8.6 - (t - SCENES.terms[0]) * 0.03], look: [0, 0.75, 0], fov: 40 }} bg="#f6ece3">
        <Lights dir={[3, 7, 5]} />
        <Floor />
        <group position={[-0.95, 0, -0.6]} scale={0.5}><CellTower t={t} /></group>
        <Phone position={[-0.05, 0.75, 0.6]} rotation={[0, 0.15, 0]} scale={0.34} bars={3} label="5G" />
        <Router position={[1.0, 0, 0.1]} rotation={[0, -0.35, 0]} scale={0.55} t={t} />
        <Pulses position={[0.95, 0.4, 0.1]} t={t} color={BAND5} maxR={1.0} speed={0.8} opacity={vis(t, tSed, 1e9) * 0.7} />
      </Stage>
      <HeaderFade />
      <Title t={t} at={SCENES.terms[0] + 0.15} chip="LURUSKAN DULU" title="Mirip nama, beda barang" accent="beda" y={170} />
      <Card t={t} at={t5G} title={<>5G</>} lines={["generasi ke-5", "jaringan seluler (HP)"]} color={C.ink} x={50} y={1080} w={440} />
      <Card t={t} at={tSed} title={<span style={{ color: BAND5 }}>5 GHz</span>} lines={["frekuensi gelombang", "radio dari router"]} color={BAND5} x={590} y={1080} w={440} />
      <div style={{ position: "absolute", left: 500, width: 80, top: 1130, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: 70, color: C.orange, opacity: on(t, tMirip, 0.3), transform: `scale(${pop(t, tMirip)})` }}>≠</div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 3 · TWO WAVES ===================== */
const L24 = 1.0, L5 = 0.48; // wavelength ratio 12.5 cm : 6 cm
const DimBracket: React.FC<{ x0: number; len: number; y: number; color: string; k: number }> = ({ x0, len, y, color, k }) => (
  <group visible={k > 0.01}>
    <mesh position={[x0 + (len * k) / 2, y, 0]}><boxGeometry args={[Math.max(0.001, len * k), 0.018, 0.018]} /><meshBasicMaterial color={color} /></mesh>
    <mesh position={[x0, y - 0.07, 0]}><boxGeometry args={[0.018, 0.16, 0.018]} /><meshBasicMaterial color={color} /></mesh>
    <mesh position={[x0 + len * k, y - 0.07, 0]}><boxGeometry args={[0.018, 0.16, 0.018]} /><meshBasicMaterial color={color} /></mesh>
  </group>
);
export const Waves: React.FC<{ t: number }> = ({ t }) => {
  const tDua = cue("dua", 23.5), t24 = cue("2,4", 24.5), t5 = cue("5", 26), tGetar = cue("bergetar"), tPendek = cue("pendek", 33);
  const t12 = cue("12"), t6 = cue("6", 40.5);
  const k24 = on(t, t24 - 0.2, 0.8), k5 = on(t, t5 - 0.2, 0.8);
  // waves start at the antenna (x = -0.95) and run right; the crest grid is aligned so brackets sit on whole wavelengths
  const x0 = -0.95, x1 = 1.65;
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0.15, 0.4, 8.8], look: [0.15, 0.05, 0], fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 6, 7]} shadow={false} />
        <Router position={[-1.08, -0.25, 0]} rotation={[0.25, 0.5, 0]} scale={0.36} t={t} />
        {k24 > 0 && <Wave from={x0} to={x0 + (x1 - x0) * k24} lambda={L24} amp={0.26} phase={t * Math.PI * 2 * 0.6} color={BAND24} y={1.05} r={0.04} />}
        {k5 > 0 && <Wave from={x0} to={x0 + (x1 - x0) * k5} lambda={L5} amp={0.18} phase={t * Math.PI * 2 * 1.25} color={BAND5} y={0.0} r={0.035} />}
        <DimBracket x0={x0 + L24 * 0.25} len={L24} y={1.45} color={BAND24} k={on(t, t12 - 0.4, 0.6)} />
        <DimBracket x0={x0 + L5 * 0.25} len={L5} y={0.32} color={BAND5} k={on(t, t6 - 0.4, 0.6)} />
      </Stage>
      <HeaderFade />
      <Title t={t} at={tDua - 0.4} chip="ROUTER DI RUMAH" title="Dua jenis gelombang" accent="Dua" y={170} />
      {/* vibrations per second */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 430, display: "flex", justifyContent: "center", gap: 18, opacity: vis(t, tGetar, tPendek - 0.2) }}>
        <Pill bg="rgba(255,250,244,.96)" color={BAND24} size={34}>2,4 miliar getaran/detik</Pill>
        <Pill bg="rgba(255,250,244,.96)" color={BAND5} size={34}>5 miliar getaran/detik</Pill>
      </div>
      <Big t={t} at={tPendek - 0.6} out={t12 - 0.6} y={430} size={46}>Frekuensi ↑ = gelombang <span style={{ color: C.orange }}>lebih pendek</span></Big>
      {/* wavelength legend in the bottom band */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1200, display: "flex", justifyContent: "center", gap: 18 }}>
        <div style={{ opacity: on(t, t24, 0.4), transform: `scale(${pop(t, t24)})` }}><Pill bg={BAND24} size={42}>2,4 GHz{t > t12 ? " ↔ ±12 cm" : ""}</Pill></div>
        <div style={{ opacity: on(t, t5, 0.4), transform: `scale(${pop(t, t5)})` }}><Pill bg={BAND5} size={42}>5 GHz{t > t6 ? " ↔ ±6 cm" : ""}</Pill></div>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 4 · ROADS: lanes & congestion ===================== */
export const Roads: React.FC<{ t: number }> = ({ t }) => {
  const tKarena = cue("karena", 44), tTol = cue("tol"), tSempit = cue("sempit", 52), tRT = cue("router", 53), tBT = cue("bluetooth"), tMW = cue("microwave"), tBerebut = cue("berebut");
  const fast = (i: number) => ((t * 1.6 + i * 2.3) % 12) - 9; // cars on the highway: few & quick
  const slow = (i: number) => ((t * 0.25 + i * 0.95) % 9.5) - 7.5; // narrow road: crowded & slow
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0.15, 5.2, 4.4], look: [0.15, 0, -2.4], fov: 42 }} bg="#f6ece3">
        <Lights dir={[3, 8, 4]} />
        <Floor color="#e9d8c6" />
        <Road position={[-0.75, 0.01, -3]} lanes={6} width={2.0} length={14} />
        <Road position={[1.25, 0.01, -3]} lanes={2} width={0.75} length={14} />
        {on(t, tTol - 0.3, 0.3) > 0 && [0, 1, 2].map((i) => <Car key={i} position={[-1.5 + i * 0.65, 0.01, fast(i)]} color={i === 1 ? C.cold : "#f4ede6"} scale={0.9} />)}
        {on(t, tSempit - 0.4, 0.3) > 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Car key={i} position={[i % 2 ? 1.08 : 1.42, 0.01, slow(i)]} color={["#f4ede6", C.orangeL, "#d9cdc1"][i % 3]} scale={0.38} />)}
        {/* the "devices" squeezing onto the narrow 2.4 GHz road */}
        <group position={[1.25, 0.05, -1.0]} scale={pop(t, tRT) * 0.42}><Router t={t} /></group>
        <group position={[1.25, 0.12, -2.3]} scale={pop(t, tBT) * 0.75}><Headphones /></group>
        <group position={[1.25, 0.2, -3.7]} scale={pop(t, tMW) * 0.5}><Microwave on={0.5 + 0.5 * Math.sin(t * 6)} /></group>
      </Stage>
      <HeaderFade />
      <Title t={t} at={SCENES.roads[0] + 0.2} chip="KENAPA 5 GHz KENCANG?" title="Soal lebar jalan" accent="lebar" y={170} />
      <Card t={t} at={tKarena} out={tTol - 0.1} title="5 GHz: jalur lebih banyak & lebar" lines={["dan masih jarang dipakai"]} color={BAND5} y={430} x={60} w={960} />
      <Card t={t} at={tTol} title={<span style={{ color: BAND5 }}>5 GHz</span>} lines={["tol lebar & sepi"]} color={BAND5} x={60} y={430} w={440} />
      <Card t={t} at={tSempit - 0.4} title={<span style={{ color: BAND24 }}>2,4 GHz</span>} lines={["jalan sempit & ramai"]} color={BAND24} x={580} y={430} w={440} />
      <Steps t={t} y={1120} items={[[tRT, "1", "router tetangga", BAND24], [tBT, "2", "perangkat Bluetooth", BAND24], [tMW, "3", "microwave yang menyala", BAND24]]} />
      <span style={{ display: "none" }}>{tBerebut}</span>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 5 · OBSTACLES + bass analogy ===================== */
export const Walls: React.FC<{ t: number }> = ({ t }) => {
  const tHarga = cue("harganya"), tBata = cue("bata"), tBeton = cue("beton"), tLogam = cue("logam", 66), tAir = cue("air", 67.5), tPesta = cue("pesta"), tBass = cue("bass", 74.5), t24 = cue("2,4", 76), tLambat = cue("lambat", 78);
  const party = t >= tPesta - 0.3;
  // which obstacle is on stage
  const ob = t < tBeton ? "brick" : t < tLogam ? "concrete" : t < tAir ? "metal" : "water";
  // amplitude after the obstacle (x > 0.2): 5 GHz loses more than 2.4 GHz; metal blocks/reflects
  const after = { brick: [0.62, 0.22], concrete: [0.5, 0.12], metal: [0.06, 0.04], water: [0.45, 0.12] }[ob] as number[];
  const pre = t < tBata - 0.2 ? [0.7, 0.3] : after; // before naming obstacles: generic wall
  const a24 = (x: number) => (x < 0.25 ? 1 : pre[0]);
  const a5 = (x: number) => (x < 0.25 ? 1 : pre[1]);
  const obK = (start: number) => pop(t, start);
  if (!party)
    return (
      <AbsoluteFill>
        <Stage cam={{ pos: [0.15, 1.2, 8.2], look: [0.15, 0.35, 0], fov: 40 }} bg="#f6ece3">
          <Lights dir={[2, 6, 7]} />
          <Floor />
          <Router position={[-1.2, 0, 0.2]} rotation={[0, 0.6, 0]} scale={0.42} t={t} />
          <Wave from={-1.05} to={1.7} lambda={L24} amp={0.24} phase={t * Math.PI * 2 * 0.6} color={BAND24} y={1.25} ampAt={a24} />
          <Wave from={-1.05} to={1.7} lambda={L5} amp={0.18} phase={t * Math.PI * 2 * 1.25} color={BAND5} y={0.55} ampAt={a5} />
          {/* reflected wave off metal */}
          {ob === "metal" && <Wave from={-0.9} to={0.05} lambda={L5} amp={0.12} phase={-t * Math.PI * 2 * 1.25} color={BAND5} y={0.25} opacity={0.7} />}
          <group position={[0.2, 0, 0]}>
            {ob === "brick" && <group scale={t < tBata - 0.2 ? 1 : obK(tBata)}><BrickWall size={[0.28, 1.9, 1.6]} position={[0, 0.95, 0]} /></group>}
            {ob === "concrete" && <group scale={obK(tBeton)}><ConcreteWall size={[0.32, 1.9, 1.6]} position={[0, 0.95, 0]} /></group>}
            {ob === "metal" && <group scale={obK(tLogam)}><MetalPlate size={[0.06, 1.9, 1.6]} position={[0, 0.95, 0]} /></group>}
            {ob === "water" && <group scale={obK(tAir)}><Aquarium position={[0, 0.55, 0]} t={t} scale={1.15} /></group>}
          </group>
        </Stage>
        <HeaderFade />
        <Title t={t} at={SCENES.walls[0] + 0.2} chip="TAPI ADA HARGANYA" title="5 GHz mudah teredam" accent="teredam" y={170} />
        <div style={{ position: "absolute", left: 60, right: 60, top: 430, display: "flex", justifyContent: "center", gap: 16, opacity: on(t, tHarga + 0.6, 0.4) }}>
          <Pill bg="rgba(255,250,244,.96)" color={BAND24} size={32}>2,4 GHz: masih kuat</Pill>
          <Pill bg="rgba(255,250,244,.96)" color={BAND5} size={32}>5 GHz: melemah</Pill>
        </div>
        <Steps t={t} y={1090} items={[[tBata, "▦", "bata & beton: menyerap", "#c9673f"], [tLogam, "◧", "logam: memantulkan", "#8f949a"], [tAir, "≈", "air (akuarium): menyerap", C.cold]]} />
        <Halftone opacity={0.3} />
      </AbsoluteFill>
    );
  // party analogy: neighbour's speaker -> wall -> your room; only the bass passes
  const tw = t;
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0.15, 1.2, 8.2], look: [0.15, 0.4, 0], fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 6, 7]} />
        <Floor />
        <Speaker position={[-1.08, 0.7, 0]} rotation={[0, 0.45, 0]} scale={0.56} pump={Math.max(0, Math.sin(tw * 9))} />
        <Wave from={-0.72} to={1.7} lambda={1.1} amp={0.3} phase={tw * Math.PI * 2 * 0.5} color={BAND24} y={1.3} ampAt={(x) => (x < 0.25 ? 1 : 0.75)} />
        <Wave from={-0.72} to={1.7} lambda={0.32} amp={0.12} phase={tw * Math.PI * 2 * 1.8} color={BAND5} y={0.5} ampAt={(x) => (x < 0.25 ? 1 : 0.05)} />
        <BrickWall size={[0.28, 2.0, 1.6]} position={[0.2, 1.0, 0]} />
      </Stage>
      <HeaderFade />
      <Title t={t} at={tPesta - 0.2} chip="ANALOGI" title="Pesta tetangga" accent="tetangga" y={170} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 430, display: "flex", justifyContent: "space-between", fontFamily: "Rubik", fontWeight: 900, fontSize: 34, color: C.ink, opacity: on(t, tPesta, 0.4) }}>
        <span>🎉 rumah tetangga</span><span>kamarmu 🛏️</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1110, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <div style={{ opacity: on(t, tBass - 0.4, 0.4) }}><Pill bg={BAND24} size={38}>🔊 bass tembus tembok</Pill></div>
        <div style={{ opacity: on(t, t24, 0.4), transform: `scale(${pop(t, t24)})` }}><Pill bg={C.ink} size={38}>2,4 GHz = si bass: <span style={{ color: C.orangeL }}>lebih jauh & tahan tembok</span></Pill></div>
      </div>
      <span style={{ display: "none" }}>{tLambat}</span>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 6 · TIPS on a floor plan ===================== */
const PlanWalls: React.FC = () => {
  const w = (x: number, z: number, sx: number, sz: number, k: number) => <RBox key={k} size={[sx, 0.5, sz]} r={0.02} color="#e9c7b0" position={[x, 0.25, z]} />;
  return (
    <group>
      <RBox size={[4.2, 0.06, 5.6]} r={0.02} color="#f3e2d2" position={[0, 0.03, 0]} />
      {/* rooms tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.05, 0.065, -1.4]}><planeGeometry args={[2.0, 2.7]} /><meshStandardMaterial color="#f6e9dd" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.05, 0.065, 1.4]}><planeGeometry args={[2.0, 2.7]} /><meshStandardMaterial color="#efe1d3" /></mesh>
      {[w(0, -2.8, 4.2, 0.1, 1), w(0, 2.8, 4.2, 0.1, 2), w(-2.1, 0, 0.1, 5.6, 3), w(2.1, 0, 0.1, 5.6, 4), w(-1.25, 0, 1.7, 0.1, 5), w(1.25, 0, 1.7, 0.1, 6), w(0, -1.9, 0.1, 1.8, 7), w(0, 1.9, 0.1, 1.8, 8)]}
      <Sofa position={[-1.1, 0.06, -1.2]} scale={0.55} />
      <Bed position={[1.1, 0.06, 1.6]} rotation={[0, Math.PI, 0]} scale={0.6} />
      <Bed position={[1.1, 0.06, -1.6]} scale={0.55} />
      <RBox size={[1.0, 0.4, 0.6]} r={0.03} color="#d9a77a" position={[-1.1, 0.26, 1.6]} />
    </group>
  );
};
export const Tips: React.FC<{ t: number }> = ({ t }) => {
  const tSatu = cue("satu", 84), tTaruh = cue("taruh"), tLemari = cue("lemari"), tDua = cue("dua", 89.5), tLogam = cue("logam", 91), tCermin = cue("cermin"), tAkua = cue("akuarium", 92.5);
  const tTiga = cue("tiga", 94), tMesh = cue("mesh"), tDekat = cue("dekat", 99), tJauh = cue("jauh", 101), tOto = cue("otomatis");
  const toCenter = lerp(t, [tTaruh, tTaruh + 1.2], [0, 1], eSoft);
  const rPos: [number, number, number] = [-1.75 + toCenter * 1.75, 0.35 + toCenter * 0.75, 2.4 - toCenter * 2.4];
  const clutter = lerp(t, [tAkua + 0.4, tAkua + 1.3], [0, 1], eSoft); // items slide away
  const phoneK = lerp(t, [tJauh - 0.4, tJauh + 0.6], [0, 1], eSoft);
  const meshOn = on(t, tMesh - 0.3, 0.5);
  const band = t < tJauh - 0.2 ? "5 GHz" : "2,4 GHz";
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 15.5, 5.0], look: [0, 0, 1.95], fov: 40 }} bg="#f6ece3">
        <Lights dir={[3, 9, 4]} />
        <Floor />
        <PlanWalls />
        {/* cabinet in the corner (router hidden inside at first) */}
        <Cabinet position={[-1.5, 0.95, 2.35]} scale={0.6} open={lerp(t, [tSatu, tSatu + 0.6], [0, 1])} />
        <Router position={rPos} scale={0.36} t={t} />
        {toCenter > 0.9 && <Shelf position={[0, 1.04, 0]} scale={0.6} />}
        <Pulses position={[rPos[0], 0.1, rPos[2]]} t={t} color={BAND24} maxR={1.0 + toCenter * 1.8} speed={0.5} opacity={0.6} />
        {/* clutter around the router: metal cabinet, mirror, aquarium */}
        <group position={[0.75 + clutter * 1.0, 0, 0.55]} scale={pop(t, tLogam) * 0.45}><MetalPlate size={[0.06, 1.6, 1.2]} position={[0, 0.8, 0]} rotation={[0, 0.5, 0]} /></group>
        <group position={[-0.75 - clutter * 1.0, 0, 0.55]} scale={pop(t, tCermin) * 0.45}><Mirror position={[0, 0.7, 0]} rotation={[0, -0.6, 0]} /></group>
        <group position={[0, 0, -0.85 - clutter * 1.2]} scale={pop(t, tAkua) * 0.45}><Aquarium position={[0, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} t={t} /></group>
        {/* mesh satellites */}
        {meshOn > 0 && [[-1.4, -2.2], [1.4, 2.2]].map(([x, z], i) => (
          <group key={i}>
            <MeshNode position={[x, 0.06, z]} scale={0.95 * pop(t, tMesh - 0.3 + i * 0.15)} t={t} />
            <Pulses position={[x, 0.1, z]} t={t + i} color={C.coldD} maxR={1.8} speed={0.5} opacity={0.7 * meshOn} />
          </group>
        ))}
        {/* phone near (5 GHz) -> far (2.4 GHz) */}
        {t > tDekat - 0.5 && <Phone position={[0.55 + phoneK * 1.0, 0.5, 0.4 + phoneK * 1.9]} rotation={[-1.2, 0, 0]} scale={0.3} bars={band === "5 GHz" ? 3 : 2} />}
      </Stage>
      <HeaderFade />
      <Title t={t} at={SCENES.tips[0] + 0.2} chip="BIAR WIFI LANCAR" title="3 tips posisi router" accent="3" y={170} />
      <div style={{ position: "absolute", left: 70, top: 430, opacity: vis(t, tLemari - 0.3, tDua) }}><Pill bg={C.red} size={34}>✕ jangan di dalam lemari</Pill></div>
      <div style={{ position: "absolute", right: 70, top: 430, opacity: vis(t, tDekat, 1e9) }}><Pill bg={band === "5 GHz" ? BAND5 : BAND24} size={36}>📱 {t < tJauh - 0.2 ? "dekat" : "jauh"} → {band}</Pill></div>
      <div style={{ position: "absolute", right: 70, top: 500, opacity: vis(t, tOto, 1e9), transform: `scale(${pop(t, tOto)})` }}><Pill bg="#3aa56b" size={32}>✓ otomatis di router modern</Pill></div>
      <Steps t={t} y={1050} items={[
        [tSatu, "1", "di tengah rumah & agak tinggi"],
        [tDua, "2", "jauh dari logam, cermin, akuarium"],
        [tTiga, "3", "rumah besar/bertingkat? mesh"],
      ]} />
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* ===================== 7 · OUTRO + CTA ===================== */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const tBukan = cue("bukan", 107), tKarakter = cue("karakter"), tKalau = cue("kalau", 112), tBuff = cue("buffering"), tKirim = cue("kirim"), tLike = cue("like", 118), tKomen = cue("komentar", 119), tFollow = cue("follow", 122);
  const cta = lerp(t, [tKalau - 0.6, tKalau + 0.4], [0, 1], eSoft);
  const heart = lerp(t, [tLike - 0.2, tLike + 0.9], [0, 1], eSoft); // heart travels back to the router
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 2.6, 6.4], look: [0, 0.4 - cta * 1.05, 0], fov: 40 }} bg="#f6ece3">
        <Lights dir={[2, 7, 5]} />
        <Floor />
        <group rotation={[0, t * 0.25, 0]} position={[0, 0, 0]}><Router scale={0.95} t={t} /></group>
        <Pulses position={[0, 0.6, 0]} t={t} color={BAND24} maxR={2.6} speed={0.45} opacity={0.5} />
        <Pulses position={[0, 0.6, 0]} t={t + 0.3} color={BAND5} maxR={1.6} speed={0.7} opacity={0.6} />
      </Stage>
      <HeaderFade />
      <div style={{ position: "absolute", left: 60, right: 60, top: 190, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: 62, lineHeight: 1.12, color: C.ink, opacity: lerp(t, [tKalau - 0.8, tKalau - 0.3], [1, 0]) }}>
        <div style={{ opacity: on(t, tBukan - 0.2, 0.4) }}>Bukan WiFi-nya yang <span style={{ color: C.red }}>lemah</span></div>
        <div style={{ opacity: on(t, tKarakter - 0.6, 0.4) }}>tapi <span style={{ color: BAND24 }}>karakter</span> <span style={{ color: BAND5 }}>gelombangnya</span> beda</div>
      </div>
      {/* CTA column (band 980–1340) */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1000, display: "flex", flexDirection: "column", gap: 18, alignItems: "center", fontFamily: "Rubik" }}>
        <div style={{ opacity: on(t, tBuff, 0.3), transform: `scale(${pop(t, tBuff)})`, padding: "12px 28px", borderRadius: 999, background: "#3aa56b", color: "#fff", fontWeight: 900, fontSize: 40 }}>▶ tanpa buffering ✓ sinyal diterima</div>
        <div style={{ opacity: on(t, tKirim, 0.3), transform: `scale(${pop(t, tKirim)})`, display: "flex", alignItems: "center", gap: 14, padding: "14px 30px", borderRadius: 999, background: "#fff", boxShadow: "0 12px 26px rgba(120,60,20,.18)", fontWeight: 900, fontSize: 42, color: C.ink }}>
          <span style={{ color: C.red, fontSize: 48 }}>♥</span> kirim balik sinyalnya
        </div>
        <div style={{ opacity: on(t, tKomen, 0.3), transform: `scale(${pop(t, tKomen)})`, padding: "14px 28px", borderRadius: 28, background: C.ink, color: "#fff", fontWeight: 800, fontSize: 38 }}>💬 Router di rumahmu ditaruh di mana?</div>
        <div style={{ opacity: on(t, tFollow, 0.3), transform: `scale(${pop(t, tFollow)})`, padding: "14px 40px", borderRadius: 999, background: C.orange, color: "#fff", fontWeight: 900, fontSize: 44, boxShadow: "0 14px 30px rgba(200,80,20,.35)" }}>+ Follow @w4hy03</div>
      </div>
      {/* heart flying up to the router */}
      <div style={{ position: "absolute", left: 520, top: 1080 - heart * 420, fontSize: 70, color: C.red, opacity: heart > 0 && heart < 1 ? 1 : 0, transform: `scale(${1 - heart * 0.5})` }}>♥</div>
      <Halftone opacity={0.3} />
      <span style={{ display: "none" }}>{String(eOut)}{THREE.REVISION}</span>
    </AbsoluteFill>
  );
};
