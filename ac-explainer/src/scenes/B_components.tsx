import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { AirStream, AxialFan, Coil, Drop, Flow, IndoorUnit, Lights, OutdoorUnit, softSprite, heatColor } from "../three/parts";
import { LOOP_CAM, LoopDiagram, NODES, NODE_SCREEN, LABEL_OFF } from "../three/shared";
import { C, cue, eIn, eOut, eSoft, lerp, on, pop, rand } from "../lib";
import { Gauge, Halftone, Label, Thermo, Title } from "../fx";

/* =============== 1 · EVAPORATOR (41.5 – 65.9s) =============== */
export const Evap: React.FC<{ t: number }> = ({ t }) => {
  const tEv = cue("evaporator"), tUdara = cue("udara", 44), tKipas = cue("kipas", 46), tSaring = cue("disaring"), tKisi = cue("kisi", 48.5);
  const tUap = cue("menguap", 52), tSerap = cue("menyerap", 53), tSejuk = cue("sejuk", 56), tEmbun = cue("mengembun"), tSelang = cue("selang"), tKering = cue("kering", 64);
  const cut = on(t, cue("unit", 43), 0.8);
  const cam = lerp(t, [41.5, tKisi, tEmbun, 65.9], [0, 0.4, 0.8, 1], (x) => x);
  const evapFlow = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-1.15, 0.12, 0.12), new THREE.Vector3(1.15, 0.12, 0.12), new THREE.Vector3(1.15, -0.02, 0.18), new THREE.Vector3(-1.15, -0.02, 0.18)]), []);
  const dripT = t - tEmbun;
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0.8 - cam * 1.3, 0.7 - cam * 0.5, 7.4 - cam * 0.8], look: [0, -0.25, 0], fov: 42 }} bg="#f6ebe2">
        <Lights dir={[2, 5, 6]} />
        <IndoorUnit t={t} louver={1} glow={1} cut={cut} fan={t * on(t, tKipas, 0.8) * 9} frost={on(t, tKisi, 0.6)} />
        {/* warm air sucked in from the top */}
        <AirStream t={t} color={C.orange} position={[0, 1.6, 0]} dir={[0, -1, 0]} len={1.2} spread={2.2} count={70} size={0.12} opacity={0.85 * on(t, tUdara, 0.5)} speed={0.55} />
        {/* dust stopped by the filter */}
        {t > tSaring && Array.from({ length: 18 }).map((_, i) => (
          <mesh key={i} position={[-1.05 + rand(i) * 2.1, 0.33 + rand(i + 4) * 0.04, 0.05 + rand(i + 2) * 0.1]} scale={on(t, tSaring + rand(i) * 0.6, 0.3)}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#8a7766" />
          </mesh>
        ))}
        {/* refrigerant inside the coil: cold liquid -> vapour bubbles absorbing heat */}
        <Flow curve={evapFlow} t={t} count={60} speed={0.12} size={0.1} colorAt={(u) => heatColor(u * 0.45)} opacity={on(t, tUap - 0.6, 0.5)} />
        {/* cool air out of the louver */}
        <AirStream t={t} color={C.cold} position={[0, -0.55, 0.45]} dir={[0, -0.6, 1]} len={2.2} spread={2.2} count={90} size={0.13} opacity={0.9 * on(t, tSejuk - 0.4, 0.5)} speed={0.6} />
        {/* condensation drops -> tray -> hose */}
        {t > tEmbun && Array.from({ length: 10 }).map((_, i) => {
          const ph = (dripT * 0.7 + rand(i)) % 1;
          return <Drop key={i} position={[-1.0 + i * 0.22, 0.0 - ph * 0.12, 0.25]} scale={0.35 * on(t, tEmbun + i * 0.08, 0.3)} />;
        })}
        <mesh position={[1.45, -0.6, 0.0]} rotation={[0, 0, 0.25]} visible={t > tSelang - 0.5}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
          <meshStandardMaterial color="#ece6df" />
        </mesh>
        {t > tSelang && Array.from({ length: 5 }).map((_, i) => {
          const ph = ((t - tSelang) * 0.9 + i / 5) % 1;
          return <Drop key={"h" + i} position={[1.6 + ph * 0.1, -1.2 - ph * 0.8, 0]} scale={0.3} />;
        })}
      </Stage>
      <Title t={t} at={41.6} chip="01 · UNIT DALAM" title="Evaporator" accent="Evaporator" />
      <Label t={t} at={tUdara} x={130} y={700} text="udara kamar hangat" color={C.orange} out={tSejuk} />
      <Label t={t} at={tKipas} x={950} y={1150} text="kipas" color={C.ink} align="right" out={tUap} />
      <Label t={t} at={tSaring} x={950} y={800} text="filter (disaring)" color="#7f97a8" align="right" out={tUap} />
      <Label t={t} at={tKisi} x={130} y={980} text="kisi logam dingin" color={C.cold} out={tSejuk} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 560, textAlign: "center", opacity: on(t, tUap, 0.3) * lerp(t, [tEmbun - 0.4, tEmbun], [1, 0]) }}>
        <span style={{ display: "inline-block", padding: "14px 26px", borderRadius: 20, background: C.ink, color: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 42 }}>
          refrigeran <span style={{ color: C.coldL }}>menguap</span> → <span style={{ color: C.orangeL }}>serap panas</span>
        </span>
      </div>
      <Label t={t} at={tSejuk} x={950} y={1250} text="udara sejuk keluar" color={C.cold} align="right" out={tEmbun} />
      <Label t={t} at={tEmbun} x={130} y={760} text="uap air mengembun" color={C.coldD} out={tKering - 0.2} />
      <Label t={t} at={tSelang} x={950} y={1270} text="dibuang lewat selang" color={C.coldD} align="right" out={tKering} />
      {/* drier room badge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", transform: `scale(${pop(t, tKering - 0.6)})` }}>
        <span style={{ display: "inline-block", padding: "16px 30px", borderRadius: 999, background: C.cold, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 48, boxShadow: "0 10px 24px rgba(40,120,200,.3)" }}>
          💧 kamar lebih kering
        </span>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* =============== 2 · KOMPRESOR (65.9 – 79.1s) =============== */
export const Komp: React.FC<{ t: number }> = ({ t }) => {
  const tK = cue("kompresor"), tJantung = cue("jantung"), tGas = cue("gas", 71), tHisap = cue("dihisap"), tMampat = cue("dimampatkan");
  const tTek = cue("tekanannya", 74), tSuhu = cue("suhunya", 75), tLonjak = cue("melonjak"), tLuar = cue("bahkan", 77);
  const squeeze = on(t, tMampat, 0.4);
  const stroke = 0.5 + 0.5 * Math.sin((t - tMampat) * 5.5);
  const pistonY = -0.55 + squeeze * stroke * 0.55;
  const heat = lerp(t, [tMampat, tLonjak + 0.4], [0.15, 1], (x) => x);
  const beat = t > tJantung && t < tGas ? 1 + 0.06 * Math.max(0, Math.sin((t - tJantung) * 9)) : 1;
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [1.2, 0.6, 8.6], look: [0, 0.05, 0], fov: 40 }} bg="#f6ebe2">
        <Lights dir={[2, 5, 6]} />
        <group scale={beat}>
          {/* outer shell (transparent) */}
          <mesh>
            <capsuleGeometry args={[0.95, 1.2, 12, 40]} />
            <meshPhysicalMaterial color="#5b544f" transparent opacity={0.22} roughness={0.2} clearcoat={1} depthWrite={false} />
          </mesh>
          {/* cylinder chamber */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 1.4, 40, 1, true]} />
            <meshStandardMaterial color="#b8b0a8" metalness={0.5} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {/* piston */}
          <mesh position={[0, pistonY, 0]}>
            <cylinderGeometry args={[0.53, 0.53, 0.22, 40]} />
            <meshStandardMaterial color="#6f6862" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, pistonY - 0.45, 0]}>
            <boxGeometry args={[0.12, 0.7, 0.12]} />
            <meshStandardMaterial color="#5a544f" />
          </mesh>
          {/* gas molecules squeezed above the piston */}
          {Array.from({ length: 46 }).map((_, i) => {
            const top = 0.82, bottom = pistonY + 0.13;
            const y = bottom + rand(i) * (top - bottom);
            const a = rand(i + 3) * Math.PI * 2, r = Math.sqrt(rand(i + 5)) * 0.48;
            const jig = Math.sin(t * (6 + heat * 10) + i) * 0.02 * (1 + heat * 2);
            return (
              <mesh key={i} position={[Math.cos(a) * r + jig, y, Math.sin(a) * r]}>
                <sphereGeometry args={[0.055, 10, 10]} />
                <meshStandardMaterial color={heatColor(heat)} emissive={heatColor(heat)} emissiveIntensity={0.35} />
              </mesh>
            );
          })}
          {/* suction (cold) and discharge (hot) pipes */}
          <mesh position={[-1.1, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.9, 16]} />
            <meshStandardMaterial color={C.coldD} />
          </mesh>
          <mesh position={[1.1, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.9, 16]} />
            <meshStandardMaterial color={C.red} />
          </mesh>
        </group>
        <AirStream t={t} color={C.cold} position={[-1.9, 0.7, 0]} dir={[1, 0, 0]} len={0.9} spread={0.1} count={20} size={0.12} opacity={on(t, tHisap, 0.3)} speed={0.9} />
        <AirStream t={t} color={C.red} position={[1.0, 0.7, 0]} dir={[1, 0, 0]} len={1.2} spread={0.1} count={20} size={0.14} opacity={on(t, tTek, 0.3)} speed={1.1} />
      </Stage>
      <Title t={t} at={65.95} chip="02 · UNIT LUAR" title="Kompresor" accent="Kompresor" sub={t > tJantung ? "jantung sistem AC ♥" : undefined} />
      <Label t={t} at={tGas} x={110} y={760} text="gas dingin dihisap" color={C.cold} />
      <Label t={t} at={tMampat} x={110} y={1260} text="dimampatkan" color={C.ink} dark />
      <Gauge x={760} y={1080} level={lerp(t, [tTek, tTek + 1.2], [0.15, 0.9], eOut)} label="Tekanan ↑" o={on(t, tTek, 0.3)} />
      <Thermo x={60} y={980} level={lerp(t, [tSuhu, tLonjak + 0.5], [0.2, 1], eOut)} o={on(t, tSuhu, 0.3)} scale={0.8} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", transform: `scale(${pop(t, tLuar)})` }}>
        <span style={{ display: "inline-block", padding: "14px 26px", borderRadius: 20, background: C.red, color: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 40 }}>
          lebih panas dari udara luar ☀
        </span>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* =============== 3 · KONDENSOR (79.1 – 94.0s) =============== */
export const Kond: React.FC<{ t: number }> = ({ t }) => {
  const tKo = cue("kondensor"), tGas = cue("gas", 81), tKisi = cue("kisi", 82.5), tKipas = cue("kipas", 84), tTiup = cue("meniupkan"), tBebas = cue("bebas");
  const tHangat = cue("hangat", 89), tLepas = cue("lepas", 91), tCair = cue("cair", 93);
  const coilCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) { const y = 0.5 - i * 0.2; pts.push(new THREE.Vector3(i % 2 ? 0.95 : -0.95, y, -0.2), new THREE.Vector3(i % 2 ? -0.95 : 0.95, y, -0.2)); }
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05);
  }, []);
  const fan = t * (2 + on(t, tKipas, 1) * 14);
  const liquid = on(t, tLepas, 1.2);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [lerp(t, [79.1, 94], [2.0, -0.8], (x) => x), 0.5, 7.6], look: [0, 0, 0], fov: 42 }} bg="#f7ebe1">
        <Lights dir={[2, 5, 6]} />
        <OutdoorUnit fan={fan} cut={on(t, tKisi, 0.6) * 0.8} hot={on(t, tGas, 0.6) * (1 - liquid * 0.6)} />
        {/* refrigerant snaking through the condenser coil: hot gas -> cooler liquid */}
        <Flow curve={coilCurve} t={t} count={90} speed={0.1} size={0.1 + liquid * 0.06} colorAt={(u) => heatColor(1 - u * (0.35 + liquid * 0.45))} opacity={on(t, tGas, 0.5)} />
        {/* hot air blown out by the big fan */}
        <AirStream t={t} color={C.orange} position={[-0.35, 0, 0.6]} dir={[0, 0.15, 1]} len={3} spread={1.1} count={90} size={0.16} opacity={0.85 * on(t, tTiup, 0.5)} speed={0.8} />
        <AirStream t={t + 2} color={C.red} position={[-0.35, 0, 0.6]} dir={[0.1, 0.2, 1]} len={3} spread={0.9} count={40} size={0.12} opacity={0.6 * on(t, tTiup, 0.5)} speed={0.9} />
      </Stage>
      <Title t={t} at={79.15} chip="03 · UNIT LUAR" title="Kondensor" accent="Kondensor" />
      <Label t={t} at={tGas} x={110} y={760} text="gas panas masuk kisi" color={C.red} out={tLepas} />
      <Label t={t} at={tKipas} x={970} y={1240} text="kipas besar" color={C.ink} align="right" out={tHangat + 1} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", transform: `scale(${pop(t, tBebas - 0.3)})`, opacity: lerp(t, [tLepas - 0.4, tLepas], [1, 0]) }}>
        <span style={{ display: "inline-block", padding: "14px 26px", borderRadius: 20, background: C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 42 }}>panas dibuang ke udara bebas</span>
      </div>
      <Label t={t} at={tHangat - 0.3} x={110} y={1240} text="angin unit luar = hangat" color={C.orange} out={tLepas} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", transform: `scale(${pop(t, tLepas)})` }}>
        <span style={{ display: "inline-block", padding: "14px 30px", borderRadius: 20, background: C.ink, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 52 }}>
          <span style={{ color: C.orangeL }}>gas</span> → <span style={{ color: C.coldL }}>cair</span>
        </span>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* =============== 4 · KATUP EKSPANSI (94.0 – 112.0s) =============== */
const nozzleGeo = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = -2.2 + (i / 60) * 4.4;
    const r = 0.36 - 0.29 * Math.exp(-((x - 0.1) ** 2) / 0.05);
    pts.push(new THREE.Vector2(r, x));
  }
  const g = new THREE.LatheGeometry(pts, 48);
  g.rotateZ(-Math.PI / 2);
  return g;
})();

export const Katup: React.FC<{ t: number }> = ({ t }) => {
  const tKa = cue("katup"), tKap = cue("kapiler"), tCairan = cue("cairan", 98), tCelah = cue("celah"), tSempit = cue("sempit");
  const tTurun = cue("turun", 103), tAnjlok = cue("anjlok"), tDingin = cue("dingin", 107), tEvap = cue("evaporator", 108), tSiklus = cue("siklus", 109), tUlang = cue("berulang");
  const toLoop = on(t, tSiklus - 0.2, 0.8);
  const drop = on(t, tTurun, 1.4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - toLoop }}>
        <Stage cam={{ pos: [0.3, 1.2, 8.8], look: [0, 0, 0], fov: 42 }} bg="#f6ebe2" shadows={false}>
          <Lights shadow={false} />
          <mesh geometry={nozzleGeo}>
            <meshPhysicalMaterial color="#d8cfc6" transparent opacity={0.35} roughness={0.15} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {/* liquid squeezing through the throat, then spraying out cold */}
          {Array.from({ length: 70 }).map((_, i) => {
            const u = (rand(i) + (t - 94) * 0.25) % 1;
            const x = -2.1 + u * 4.2;
            const throat = Math.exp(-((x - 0.1) ** 2) / 0.05);
            const rr = (0.3 - 0.27 * throat) * Math.sqrt(rand(i + 2)) * (x > 0.25 ? 1 + (x - 0.25) * 0.4 : 1);
            const a = rand(i + 5) * Math.PI * 2;
            const k = x < 0.1 ? 0.75 : Math.max(0, 0.75 - (x - 0.1) * (0.6 + drop * 0.6));
            return (
              <mesh key={i} position={[x, Math.cos(a) * rr, Math.sin(a) * rr]} scale={x > 0.2 ? 0.7 : 1}>
                <sphereGeometry args={[0.05, 10, 10]} />
                <meshStandardMaterial color={heatColor(k)} emissive={heatColor(k)} emissiveIntensity={0.3} />
              </mesh>
            );
          })}
          {/* cold mist after the throat */}
          <AirStream t={t} color={C.coldL} position={[0.4, 0, 0]} dir={[1, 0, 0]} len={1.8} spread={0.5} count={50} size={0.18} opacity={0.75 * on(t, tAnjlok - 0.5, 0.6)} speed={0.8} />
          {/* coiled capillary tube (small, on the side) */}
          <group position={[-1.3, -1.1, 0]} scale={pop(t, tKap)} visible={t > tKap - 0.1 && t < tCairan + 1.5}>
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh key={i} position={[i * 0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.28, 0.018, 8, 40]} />
                <meshStandardMaterial color={C.copper} metalness={0.5} />
              </mesh>
            ))}
          </group>
        </Stage>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toLoop }}>
        <Stage cam={{ ...LOOP_CAM, pos: [Math.sin(t * 0.3) * 0.5, 0, 8.6 + (1 - toLoop) * 2] }} bg="#f7ece3" shadows={false}>
          <Lights shadow={false} />
          <LoopDiagram t={t} nodes={[1, 1, 1, 1]} speed={0.12} glowAll={on(t, tUlang, 0.5)} />
        </Stage>
        {NODES.map((nd, i) => (
          <div key={nd.key} style={{ position: "absolute", left: NODE_SCREEN[i].x + LABEL_OFF[i].dx, top: NODE_SCREEN[i].y + LABEL_OFF[i].dy, transform: `translate(-50%,-50%)`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: nd.color, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>{nd.n}</div>
            <div style={{ padding: "6px 14px", borderRadius: 12, background: "#fffaf5", fontFamily: "Rubik", fontWeight: 700, fontSize: 30, color: C.ink }}>{nd.label}</div>
          </div>
        ))}
        {/* rotating cycle arrow */}
        <svg width={260} height={260} viewBox="-130 -130 260 260" style={{ position: "absolute", left: 410, top: 830, transform: `rotate(${(t - tSiklus) * 120}deg)`, opacity: on(t, tUlang, 0.4) }}>
          <path d="M 0 -90 A 90 90 0 1 1 -88 -20" fill="none" stroke={C.orange} strokeWidth={18} strokeLinecap="round" />
          <polygon points="-110,-30 -66,-34 -92,6" fill={C.orange} />
        </svg>
        <Title t={t} at={tSiklus - 0.1} chip="TERUS-MENERUS" title="Siklus berulang" accent="berulang" y={150} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - toLoop }}>
        <Title t={t} at={94.05} chip="04 · PENURUN TEKANAN" title="Katup ekspansi" accent="ekspansi" sub={t > tKap - 0.3 ? "atau pipa kapiler" : undefined} />
        <Label t={t} at={tCairan} x={110} y={1220} text="cairan bertekanan tinggi" color={C.orange} />
        <Label t={t} at={tCelah} x={540} y={780} text="celah sangat sempit" color={C.ink} dark />
        <Gauge x={700} y={1060} level={lerp(t, [tTurun, tTurun + 1.0], [0.9, 0.12], eOut)} label="Tekanan ↓" o={on(t, tTurun - 0.2, 0.3)} />
        <Thermo x={70} y={900} level={lerp(t, [tAnjlok, tAnjlok + 1], [0.75, 0.05], eOut)} o={on(t, tAnjlok - 0.3, 0.3)} scale={0.8} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1250, textAlign: "center", transform: `scale(${pop(t, tDingin)})` }}>
          <span style={{ display: "inline-block", padding: "14px 26px", borderRadius: 20, background: C.cold, color: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 40 }}>dingin lagi → kembali ke evaporator</span>
        </div>
      </AbsoluteFill>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

export const _u = { AxialFan, Coil, eSoft, tEvapUnused: 0 };
