import React from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { AirStream, Drop, IndoorUnit, Lights, RoomShell, softSprite } from "../three/parts";
import { LOOP_CAM, LoopDiagram, MiniHouse, NODES, NODE_SCREEN, LABEL_OFF, loopCurve } from "../three/shared";
import { C, cue, eIn, eOut, eSoft, lerp, on, pop, rand } from "../lib";
import { Bloom, Halftone, Label, Thermo, Title } from "../fx";

/* =============== HOOK (0 – 17.3s) =============== */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const tOn = cue("nyalakan"), tSejuk = cue("sejuk"), tTidak = cue("tidak"), tPindah = cue("memindahkan");
  const tLuar = cue("luar", 14), tBagaimana = cue("bagaimana");
  const shot2 = t >= tPindah - 0.25;
  const warm = lerp(t, [tOn + 0.3, tSejuk + 0.6], [1, 0.15]);
  const louver = on(t, tOn, 0.6);
  if (!shot2) {
    const dolly = lerp(t, [0, tPindah], [0, 1], (x) => x);
    return (
      <AbsoluteFill>
        <Stage cam={{ pos: [0, 2.1 + dolly * 0.2, 5.8 - dolly * 0.8], look: [0, 2.3, -2.5], fov: 50 }} bg="#f6e8dd">
          <Lights dir={[2, 6, 5]} />
          <RoomShell warm={warm} />
          <IndoorUnit t={t} louver={louver} glow={louver} position={[0, 3.2, -2.55]} scale={0.8} />
          {/* hot air hanging in the room before AC starts */}
          <AirStream t={t} color={C.orange} position={[-0.4, 0.8, -1.2]} dir={[0.2, 1, 0.3]} len={2.4} spread={3.2} count={70} size={0.16} opacity={0.75 * warm} speed={0.15} />
          {/* cold stream out of the louver */}
          <AirStream t={t} color={C.cold} position={[0, 2.85, -2.2]} dir={[0, -0.7, 1]} len={3} spread={1.8} count={90} size={0.15} opacity={0.85 * louver} speed={0.5} />
          {/* sofa-ish block + plant for scale */}
          <mesh position={[0.6, 0.35, -1.8]} castShadow>
            <boxGeometry args={[2.0, 0.7, 0.8]} />
            <meshStandardMaterial color={C.orange} />
          </mesh>
          <mesh position={[0.6, 0.9, -2.15]} castShadow>
            <boxGeometry args={[2.0, 0.6, 0.2]} />
            <meshStandardMaterial color={C.orangeL} />
          </mesh>
        </Stage>
        <Bloom x="75%" y="38%" o={0.55 * warm + 0.2} color={warm > 0.5 ? "255,220,170" : "230,245,255"} />
        <Thermo x={890} y={930} level={0.15 + warm * 0.75} o={lerp(t, [0.4, 1.0], [0, 1])} scale={0.85} />
        <div style={{ position: "absolute", left: 828, top: 1220, width: 180, textAlign: "center", fontFamily: "Rubik", fontWeight: 800, fontSize: 30, color: warm > 0.5 ? C.red : C.coldD, opacity: lerp(t, [0.4, 1.0], [0, 1]) }}>
          {warm > 0.5 ? "PANAS" : "SEJUK"}
        </div>
        <Title t={t} at={tTidak - 0.2} chip="FAKTA" title="AC tidak membuat dingin" accent="tidak" />
        <Halftone opacity={0.35} />
      </AbsoluteFill>
    );
  }
  const zoom = lerp(t, [tPindah - 0.25, tPindah + 0.8], [0, 1], eSoft);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0.2 + zoom * 0.1, 0.4, 12.5 - zoom * 1.0], look: [0.3, -0.1, 0], fov: 40, roll: lerp(t, [tPindah - 0.25, tPindah + 0.3], [0.2, 0], eOut) }} bg="#f7ebe1">
        <Lights dir={[3, 5, 6]} />
        <group rotation={[0.16, -0.28 + Math.sin(t * 0.4) * 0.04, 0]} position={[0, -0.2, 0]}>
          <MiniHouse t={t} flow={on(t, tPindah + 0.2, 0.6)} outHeat={on(t, tLuar, 0.5)} />
        </group>
      </Stage>
      <Title t={t} at={tPindah - 0.1} chip="YANG SEBENARNYA" title="AC memindahkan panas" accent="panas" />
      <Label t={t} at={cue("dalam", tPindah)} x={150} y={1150} text="dari dalam kamar" color={C.orange} />
      <Label t={t} at={tLuar} x={950} y={1080} text="ke luar rumah" color={C.red} align="right" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: 80, color: C.ink, opacity: on(t, tBagaimana, 0.3), transform: `scale(${pop(t, tBagaimana)})`, textShadow: "0 4px 0 #fff" }}>
        Bagaimana caranya<span style={{ color: C.orange }}>?</span>
      </div>
      <Halftone opacity={0.35} />
    </AbsoluteFill>
  );
};

/* =============== ANALOGI (17.3 – 31.35s) =============== */
const Arm: React.FC = () => (
  <group rotation={[0, 0, -0.08]}>
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
      <capsuleGeometry args={[0.42, 2.6, 12, 32]} />
      <meshStandardMaterial color="#f0c3a1" roughness={0.65} />
    </mesh>
    <mesh position={[1.75, 0.05, 0]} castShadow>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshStandardMaterial color="#efbd99" roughness={0.65} />
    </mesh>
    <mesh position={[-1.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
      <meshStandardMaterial color={C.orange} />
    </mesh>
  </group>
);

export const Analogi: React.FC<{ t: number }> = ({ t }) => {
  const tBasah = cue("basah"), tAngin = cue("angin"), tDingin = cue("terasa", 20), tUap = cue("menguap"), tPanas = cue("panas", 24);
  const tAC = cue("memakai"), tPipa = cue("pipa", 29);
  const wet = on(t, tBasah, 0.5);
  const evap = lerp(t, [tUap, tUap + 2.5], [0, 1], (x) => x);
  const toPipe = on(t, tAC, 0.8);
  const curve = React.useMemo(() => loopCurve(2.0, 1.2, 0.4), []);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 0.4, 10.5 - toPipe * 2.5], look: [0, 0.1, 0], fov: 40 }} bg="#f7ece3" shadows={false}>
        <Lights shadow={false} />
        <group scale={(1 - toPipe) * 0.72} position={[0, -0.2, 0]}>
          <Arm />
          {Array.from({ length: 14 }).map((_, i) => {
            const x = -1.3 + (i % 7) * 0.45 + rand(i) * 0.1, z = i < 7 ? 0.36 : 0.2, y = i < 7 ? 0.25 : 0.4;
            const s = wet * (1 - evap) * (0.6 + rand(i + 3) * 0.6);
            return <Drop key={i} position={[x, y, z]} scale={s} rotation={[0.3, 0, 0]} />;
          })}
          {/* vapour carrying heat away */}
          <AirStream t={t} color="#ffffff" position={[0, 0.5, 0.2]} dir={[0, 1, 0.1]} len={2.2} spread={2.6} count={50} size={0.2} opacity={0.8 * on(t, tUap, 0.5) * (1 - toPipe)} speed={0.45} />
          <AirStream t={t + 3} color={C.orange} position={[0, 0.5, 0.25]} dir={[0, 1, 0.1]} len={2.2} spread={2.4} count={40} size={0.13} opacity={0.95 * on(t, tPanas, 0.4) * (1 - toPipe)} speed={0.45} />
        </group>
        {/* the same idea, inside a closed pipe */}
        <group scale={toPipe} position={[0, -0.2, 0]}>
          <mesh>
            <tubeGeometry args={[curve, 160, 0.09, 12, true]} />
            <meshStandardMaterial color={C.copper} transparent opacity={0.55} />
          </mesh>
          {Array.from({ length: 40 }).map((_, i) => {
            const u = (i / 40 + t * 0.12) % 1;
            const p = curve.getPointAt(u);
            return (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.055, 10, 10]} />
                <meshBasicMaterial color={u < 0.5 ? C.cold : C.orange} />
              </mesh>
            );
          })}
        </group>
      </Stage>
      {/* wind lines */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: on(t, tAngin, 0.3) * (1 - toPipe) }}>
        {[0, 1, 2, 3].map((i) => {
          const x = ((t - tAngin) * 700 + i * 260) % 1400 - 300;
          return <path key={i} d={`M ${x} ${820 + i * 70} q 120 -30 240 0 t 240 0`} stroke="#9fd2ff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />;
        })}
      </svg>
      <Title t={t} at={17.4} chip="ANALOGI" title="Kulit basah + angin" accent="angin" out={tAC - 0.1} />
      <Label t={t} at={tDingin} x={150} y={1220} text="terasa dingin" color={C.cold} out={tAC} />
      <Label t={t} at={tUap} x={930} y={640} text="air menguap" color={C.coldD} align="right" out={tAC} />
      <Label t={t} at={tPanas} x={930} y={720} text="membawa panas" color={C.orange} align="right" out={tAC} />
      <Title t={t} at={tAC} chip="PRINSIP YANG SAMA" title="Terus-menerus di pipa tertutup" accent="pipa" />
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* =============== REFRIGERAN + LOOP (31.35 – 41.5s) =============== */
export const Loop: React.FC<{ t: number }> = ({ t }) => {
  const tRef = cue("refrigeran"), tDidih = cue("mendidih"), tLing = cue("lingkaran"), tEmpat = cue("empat", 39), tPenting = cue("penting");
  const pipeIn = lerp(t, [31.4, 32.4], [0.3, 1], eSoft);
  const nodes = [0, 1, 2, 3].map((i) => pop(t, tEmpat + i * 0.25));
  return (
    <AbsoluteFill>
      <Stage cam={{ ...LOOP_CAM, pos: [Math.sin(t * 0.3) * 0.6, 0.2, 8.6] }} bg="#f7ece3" shadows={false}>
        <Lights shadow={false} />
        <LoopDiagram t={t} nodes={nodes} pipeIn={pipeIn} speed={lerp(t, [tLing, tLing + 1], [0.04, 0.1])} />
        {/* boiling bubbles at very low temperature */}
        <group position={[0, 0, 0.3]} visible={t > tDidih && t < tLing}>
          {Array.from({ length: 24 }).map((_, i) => (
            <mesh key={i} position={[(rand(i) - 0.5) * 1.6, -0.6 + (((t - tDidih) * 0.9 + rand(i + 5)) % 1) * 1.4, (rand(i + 2) - 0.5) * 0.4]}>
              <sphereGeometry args={[0.04 + rand(i + 9) * 0.05, 12, 12]} />
              <meshPhysicalMaterial color={C.coldL} transparent opacity={0.8} roughness={0.1} clearcoat={1} />
            </mesh>
          ))}
        </group>
      </Stage>
      <Title t={t} at={tRef - 0.3} chip="BINTANG UTAMA" title="Refrigeran" accent="Refrigeran" sub="cairan pendingin khusus" out={tDidih + 1.9} y={150} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", opacity: on(t, tDidih, 0.3) * lerp(t, [tLing - 0.4, tLing], [1, 0]) }}>
        <div style={{ display: "inline-block", padding: "18px 30px", borderRadius: 24, background: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 46, color: C.coldD, boxShadow: "0 12px 26px rgba(40,100,160,.18)" }}>
          mendidih di suhu<br />sangat rendah
        </div>
      </div>
      {NODES.map((nd, i) => (
        <div key={nd.key} style={{ position: "absolute", left: NODE_SCREEN[i].x + LABEL_OFF[i].dx, top: NODE_SCREEN[i].y + LABEL_OFF[i].dy, transform: `translate(-50%,-50%) scale(${nodes[i]})`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: nd.color, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>{nd.n}</div>
          <div style={{ padding: "6px 14px", borderRadius: 12, background: "#fffaf5", fontFamily: "Rubik", fontWeight: 700, fontSize: 30, color: C.ink, boxShadow: "0 6px 14px rgba(120,60,20,.15)" }}>{nd.label}</div>
        </div>
      ))}
      <Title t={t} at={tLing - 0.2} chip="SATU LINGKARAN" title="4 komponen" accent="4" y={150} />
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

export const _unused = { THREE, softSprite, eIn, tPenting: 0 };
