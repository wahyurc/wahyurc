import React from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { AirStream, IndoorUnit, Lights, OutdoorUnit, RBox, Wrench, roundedBoxGeo } from "../three/parts";
import { LOOP_CAM, LoopDiagram, MiniHouse, NODE_SCREEN, LABEL_OFF } from "../three/shared";
import { C, cue, eIn, eOut, eSoft, lerp, on, pop, rand } from "../lib";
import { Halftone, Label, Title } from "../fx";

/* =============== TIPS (126.55 – 157.0s) =============== */
const Badge: React.FC<{ t: number; at: number; n: string; text: string; out: number }> = ({ t, at, n, text, out }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 200, opacity: Math.min(on(t, at, 0.3), lerp(t, [out - 0.3, out], [1, 0])), display: "flex", alignItems: "center", gap: 24 }}>
    <div style={{ width: 130, height: 130, borderRadius: 36, background: C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 90, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(t, at)}) rotate(${lerp(t, [at, at + 0.4], [-12, -4], eOut)}deg)`, boxShadow: "0 12px 26px rgba(200,80,20,.35)" }}>{n}</div>
    <div style={{ fontFamily: "Rubik", fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: C.ink, letterSpacing: -1, transform: `translateX(${(1 - on(t, at + 0.1, 0.5)) * 40}px)`, opacity: on(t, at + 0.1, 0.5) }}>{text}</div>
  </div>
);

const FilterPanel: React.FC<{ dirt: number; position?: [number, number, number]; rotation?: [number, number, number] }> = ({ dirt, ...p }) => (
  <group {...p}>
    <RBox size={[2.2, 1.3, 0.08]} r={0.03} color="#f3ece4" />
    <mesh position={[0, 0, 0.05]}>
      <planeGeometry args={[2.0, 1.1, 30, 16]} />
      <meshStandardMaterial color="#8fb0c6" wireframe />
    </mesh>
    {Array.from({ length: 110 }).map((_, i) => (
      <mesh key={i} position={[-0.98 + rand(i) * 1.96, -0.53 + rand(i + 2) * 1.06, 0.07]} scale={dirt * (0.6 + rand(i + 5) * 0.9)}>
        <circleGeometry args={[0.028, 10]} />
        <meshStandardMaterial color={i % 3 ? "#8a7563" : "#a8927d"} />
      </mesh>
    ))}
  </group>
);

export const Tips: React.FC<{ t: number }> = ({ t }) => {
  const t0 = cue("supaya", 126), tSatu = cue("satu", 131), tBersih = cue("bersihkan"), tDebu = cue("debu", 134), tBerat = cue("berat", 137), tListrik = cue("listrik", 138);
  const tDua = cue("dua", 139.5), tHalangi = cue("halangi"), tRuang = cue("ruang", 142), tLancar = cue("lancar", 144.5);
  const tTiga = cue("tiga", 145.5), tTeknisi = cue("teknisi"), tKisi = cue("kisi", 148.5), tCukup = cue("cukup", 150.5);
  const tDan = cue("dan", 151.5), tTutup = cue("tutup"), tBocor = cue("bocor");
  const phase = t < tSatu - 0.2 ? 0 : t < tDua - 0.2 ? 1 : t < tTiga - 0.2 ? 2 : t < tDan - 0.1 ? 3 : 4;
  const clean = lerp(t, [tBersih + 0.2, tBersih + 1.4], [1, 0], eOut);
  const dirtAgain = on(t, tDebu - 0.3, 0.6);
  const dirt = t < tDebu - 0.3 ? clean : dirtAgain;
  const boxesAway = on(t, tRuang, 0.8, eIn);
  const door = lerp(t, [tTutup, tTutup + 0.9], [1.3, 0], eSoft);
  return (
    <AbsoluteFill>
      {phase === 0 && (
        <AbsoluteFill>
          <Stage cam={{ pos: [0, 0.2, 5], look: [0, 0, 0], fov: 40 }} bg="#f7ece3" shadows={false}>
            <Lights shadow={false} />
            <IndoorUnit t={t} louver={1} glow={1} position={[0, -0.1, 0]} scale={0.9} rotation={[0.1, Math.sin(t * 0.8) * 0.06, 0]} />
            <AirStream t={t} color={C.cold} position={[0, -0.5, 0.4]} dir={[0, -0.6, 1]} len={1.8} spread={2} count={60} size={0.12} opacity={0.8} />
          </Stage>
          <Title t={t} at={t0 - 0.1} chip="TIPS PERAWATAN" title="Biar dingin & awet" accent="awet" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1190, textAlign: "center", transform: `scale(${pop(t, cue("tiga", 129))})` }}>
            <span style={{ display: "inline-block", padding: "14px 30px", borderRadius: 999, background: C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 48 }}>3 kebiasaan sederhana</span>
          </div>
        </AbsoluteFill>
      )}
      {phase === 1 && (
        <AbsoluteFill>
          <Stage cam={{ pos: [0, 0.3, 6.6], look: [0, -0.1, 0], fov: 42 }} bg="#f7ece3" shadows={false}>
            <Lights shadow={false} />
            <FilterPanel dirt={dirt} rotation={[0.15, Math.sin(t * 0.7) * 0.06, 0]} />
            {/* dust washing off */}
            <AirStream t={t} color="#9d8672" position={[0, -0.3, 0.2]} dir={[0, -1, 0.2]} len={1.4} spread={2} count={50} size={0.09} opacity={lerp(t, [tBersih + 0.1, tBersih + 0.4, tBersih + 1.4, tBersih + 1.8], [0, 0.9, 0.9, 0])} speed={0.9} />
            {/* airflow: free when clean, blocked when dirty */}
            <AirStream t={t} color={C.cold} position={[0, 0, -1.4]} dir={[0, 0, 1]} len={t < tDebu ? 3 : 1.25} spread={1.8} count={60} size={0.12} opacity={0.8} speed={t < tDebu ? 0.7 : 0.25} />
          </Stage>
          <Badge t={t} at={tSatu} n="1" text="Bersihkan filter rutin" out={tDua - 0.2} />
          <Label t={t} at={tDebu} x={110} y={1180} text="❌ filter penuh debu" color={C.red} />
          <Label t={t} at={cue("tertahan")} x={970} y={1270} text="udara tertahan" color={C.coldD} align="right" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", opacity: on(t, tBerat - 0.3, 0.3) }}>
            <span style={{ display: "inline-block", padding: "12px 24px", borderRadius: 18, background: C.ink, color: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 40 }}>
              AC kerja lebih berat <span style={{ color: C.yellow, display: "inline-block", transform: `scale(${pop(t, tListrik)})` }}>⚡ listrik ↑</span>
            </span>
          </div>
        </AbsoluteFill>
      )}
      {phase === 2 && (
        <AbsoluteFill>
          <Stage cam={{ pos: [1.0, 0.8, 8.8], look: [0, -0.15, 0], fov: 42 }} bg="#f7ebe1">
            <Lights />
            <OutdoorUnit fan={t * 12} position={[0, -0.1, 0]} scale={0.95} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#efd2bd" />
            </mesh>
            {/* clutter in front of the unit, cleared on "ruang" */}
            {[[-0.6, -0.55, 1.0], [0.3, -0.55, 1.1], [-0.15, 0.1, 1.05], [0.75, -0.55, 0.9]].map(([x, y, z], i) => (
              <RBox key={i} size={[0.7, 0.7, 0.6]} r={0.05} color={i % 2 ? "#c99a6b" : "#d8ad80"}
                position={[x + (x < 0 ? -1 : 1) * boxesAway * 3, y, z + boxesAway * 0.5]} rotation={[0, rand(i) * 0.4 + boxesAway, 0]} />
            ))}
            <AirStream t={t} color={C.orange} position={[-0.33, -0.1, 0.5]} dir={[0, 0.15, 1]} len={0.4 + boxesAway * 2.6} spread={1} count={70} size={0.15} opacity={0.85} speed={0.3 + boxesAway * 0.6} />
          </Stage>
          <Badge t={t} at={tDua} n="2" text="Jangan halangi unit luar" out={tTiga - 0.2} />
          <Label t={t} at={tHalangi} x={110} y={1230} text="❌ panas terperangkap" color={C.red} out={tRuang} />
          <Label t={t} at={tRuang + 0.3} x={110} y={1230} text="✅ beri ruang" color="#3aa56b" />
          <Label t={t} at={tLancar - 0.3} x={970} y={1300} text="panas terbuang lancar" color={C.orange} align="right" />
        </AbsoluteFill>
      )}
      {phase === 3 && (
        <AbsoluteFill>
          <Stage cam={{ pos: [0, 0.3, 8.2], look: [0, -0.1, 0], fov: 42 }} bg="#f7ece3" shadows={false}>
            <Lights shadow={false} />
            <IndoorUnit t={t} louver={0.6} cut={1} fan={t * 4} frost={0.2} position={[0, 0.35, 0]} rotation={[0.12, 0, 0]} scale={0.9} />
            {/* adjustable wrench, gently tightening */}
            <Wrench position={[0.55, -0.55, 1.0]} rotation={[0.1, 0, -0.35 + Math.sin(t * 2.5) * 0.1]} scale={pop(t, tTeknisi) * 0.72} open={0.5 + Math.sin(t * 2) * 0.3} />
          </Stage>
          <Badge t={t} at={tTiga} n="3" text="Servis berkala ke teknisi" out={tDan - 0.1} />
          <Label t={t} at={tKisi} x={110} y={1180} text="✨ kisi-kisi bersih" color={C.cold} />
          <Label t={t} at={tCukup - 0.6} x={970} y={1280} text="refrigeran cukup" color={C.orange} align="right" />
        </AbsoluteFill>
      )}
      {phase === 4 && (
        <AbsoluteFill>
          <Stage cam={{ pos: [0.3, 1.5, 8.4], look: [0.3, 1.15, 0], fov: 44 }} bg="#f6e8dd">
            <Lights />
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#f6e7dc" />
            </mesh>
            <mesh position={[0, 2, -0.1]} receiveShadow>
              <planeGeometry args={[20, 6]} />
              <meshStandardMaterial color="#f2ddd0" />
            </mesh>
            {/* door frame + door swinging shut */}
            <group position={[-0.5, 0, 0]}>
              <RBox size={[1.3, 2.4, 0.15]} r={0.04} color="#e9c3a8" position={[0, 1.2, -0.05]} opacity={0.0001} />
              <mesh position={[0, 1.2, -0.04]}>
                <planeGeometry args={[1.2, 2.3]} />
                <meshBasicMaterial color="#fff8ee" />
              </mesh>
              <group position={[-0.6, 0, 0]} rotation={[0, door, 0]}>
                <RBox size={[1.2, 2.3, 0.08]} r={0.03} color={C.orange} position={[0.6, 1.15, 0]} />
                <mesh position={[1.05, 1.15, 0.07]}>
                  <sphereGeometry args={[0.05, 12, 12]} />
                  <meshStandardMaterial color={C.yellow} metalness={0.5} />
                </mesh>
              </group>
            </group>
            {/* window */}
            <group position={[1.15, 1.7, -0.05]}>
              <mesh>
                <planeGeometry args={[0.9, 0.9]} />
                <meshBasicMaterial color="#fffaf3" />
              </mesh>
              <mesh position={[0.22 - door * 0.17, 0, 0.04]}>
                <boxGeometry args={[0.45, 0.88, 0.04]} />
                <meshStandardMaterial color="#cfe7f7" transparent opacity={0.8} />
              </mesh>
            </group>
            {/* cold air stays inside (escapes while open) */}
            <AirStream t={t} color={C.cold} position={[0, 1.1, 1.2]} dir={[-0.5, 0, -1]} len={door > 0.3 ? 2.0 : 0.9} spread={2.6} count={70} size={0.14} opacity={0.85} speed={door > 0.3 ? 0.6 : 0.15} />
          </Stage>
          <Title t={t} at={tDan} chip="BONUS" title="Tutup pintu & jendela" accent="Tutup" />
          <Label t={t} at={tBocor - 0.3} x={110} y={1250} text="dingin tidak bocor" color={C.cold} />
        </AbsoluteFill>
      )}
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* =============== PENUTUP (157.0 – 167.9s) =============== */
export const Penutup: React.FC<{ t: number }> = ({ t }) => {
  const tEmpat = cue("empat", 158), tV = [cue("menyerap"), cue("memampatkan", 159.5), cue("membuang", 160.5), cue("mengembang", 161.5)];
  const tSetiap = cue("setiap", 162.5), tPanas = cue("panas", 165), tKeluar = cue("keluar", 166.5);
  const toHouse = on(t, tSetiap - 0.2, 0.8);
  const verbs = ["menyerap", "memampatkan", "membuang", "mengembang"];
  const cols = [C.cold, C.red, C.orange, C.coldD];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - toHouse }}>
        <Stage cam={{ ...LOOP_CAM, pos: [Math.sin(t * 0.4) * 0.5, 0, 8.6] }} bg="#f7ece3" shadows={false}>
          <Lights shadow={false} />
          <LoopDiagram t={t} nodes={[1, 1, 1, 1]} speed={0.1} glowAll={0.5} />
        </Stage>
        {verbs.map((v, i) => (
          <div key={v} style={{ position: "absolute", left: NODE_SCREEN[i].x + LABEL_OFF[i].dx, top: NODE_SCREEN[i].y + LABEL_OFF[i].dy, transform: `translate(-50%,-50%) scale(${pop(t, tV[i])})`, padding: "12px 22px", borderRadius: 18, background: cols[i], color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 40, boxShadow: "0 10px 22px rgba(0,0,0,.15)" }}>
            {i + 1}. {v}
          </div>
        ))}
        <Title t={t} at={tEmpat - 0.4} chip="INGAT" title="4 langkahnya" accent="4" y={150} out={tSetiap} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toHouse }}>
        <Stage cam={{ pos: [0.3, 0.3, 12.2 - toHouse * 0.6], look: [0.3, -0.25, 0], fov: 40 }} bg="#f7ebe1">
          <Lights />
          <group rotation={[0.16, -0.28 + Math.sin(t * 0.4) * 0.04, 0]} position={[0, -0.2, 0]}>
            <MiniHouse t={t} flow={1} outHeat={1} />
          </group>
        </Stage>
        <div style={{ position: "absolute", left: 70, right: 70, top: 210, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: 70, lineHeight: 1.1, color: C.ink }}>
          <div style={{ opacity: on(t, tSetiap, 0.4) }}>Setiap hembusan <span style={{ color: C.cold }}>sejuk</span></div>
          <div style={{ opacity: on(t, tPanas - 0.2, 0.4) }}>= <span style={{ color: C.orange }}>panas kamarmu</span></div>
          <div style={{ opacity: on(t, tKeluar - 0.4, 0.4), transform: `scale(${pop(t, tKeluar - 0.4)})` }}>yang diantar keluar 🚚</div>
        </div>
      </AbsoluteFill>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* =============== SHARE (167.9 – 180s) =============== */
const planeGeo = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0.5); sh.lineTo(0.35, -0.4); sh.lineTo(0, -0.2); sh.lineTo(-0.35, -0.4); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 });
  g.center();
  return g;
})();

export const Share: React.FC<{ t: number }> = ({ t }) => {
  const tTeman = cue("teman", 169), tDingin = cue("dingin", 170.8), tFilter = cue("filternya"), tKirim = cue("kirimkan"), tSejuk = cue("kesejukan");
  const press = lerp(t, [tKirim, tKirim + 0.15, tKirim + 0.35], [1, 0.9, 1]);
  const fly = lerp(t, [tKirim + 0.25, tKirim + 2.2], [0, 1], eIn);
  const end = on(t, tSejuk - 0.8, 0.6);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 0.2, 9.6], look: [0, 0.35, 0], fov: 40 }} bg="#f7ece3" shadows={false}>
        <Lights shadow={false} />
        {/* phone */}
        <group rotation={[0.1, Math.sin(t * 0.6) * 0.06, 0]} position={[0, -0.1 + (1 - on(t, 168, 0.6)) * -2, 0]} scale={1 - end * 0.25}>
          <mesh geometry={roundedBoxGeo(1.7, 3.3, 0.18, 0.2)}>
            <meshStandardMaterial color="#2a2522" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[1.5, 3.05]} />
            <meshBasicMaterial color="#fff4ea" />
          </mesh>
          {/* mini AC on the phone screen */}
          <IndoorUnit t={t} louver={1} glow={1} position={[0, 0.75, 0.2]} scale={0.45} />
          <AirStream t={t} color={C.cold} position={[0, 0.55, 0.3]} dir={[0, -1, 0.2]} len={0.9} spread={0.9} count={30} size={0.08} />
        </group>
        {/* paper plane carrying the cool breeze */}
        <group position={[0.2 + fly * 2.5, 0.2 + fly * 3.5, 0.6 + fly * 1.0]} rotation={[0.4, 0.3, -0.6 - fly * 0.3]} scale={0.6 * on(t, tKirim + 0.2, 0.3)}>
          <mesh geometry={planeGeo}>
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <AirStream t={t} color={C.cold} position={[0, -0.4, 0]} dir={[0, -1, 0]} len={1.4} spread={0.3} count={30} size={0.12} />
        </group>
      </Stage>
      <Title t={t} at={168.0} chip="PSST…" title="Punya teman yang…" accent="teman" out={tKirim} />
      <Label t={t} at={tDingin - 0.4} x={90} y={720} text="🥶 AC disetel paling dingin" color={C.cold} out={tKirim} />
      <Label t={t} at={tFilter} x={990} y={1240} text="filternya belum pernah dicuci 😬" color="#8a7563" align="right" out={tKirim} size={30} />
      {/* share button */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", opacity: on(t, tKirim - 0.3, 0.3), transform: `scale(${press * pop(t, tKirim - 0.3)})` }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "20px 40px", borderRadius: 999, background: C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 52, boxShadow: "0 14px 30px rgba(200,80,20,.35)" }}>
          ➤ Kirim ke dia
        </span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 230, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: 80, lineHeight: 1.08, color: C.ink, opacity: on(t, tKirim + 0.6, 0.5) }}>
        Kirim sedikit<br /><span style={{ color: C.cold }}>kesejukan ❄</span>
      </div>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

export const _x = { eOut, eSoft, LOOP_CAM };
