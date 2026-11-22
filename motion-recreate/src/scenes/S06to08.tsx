import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import fontJson from "../three/helvetiker_bold.typeface.json";
import { Stage } from "../three/Stage";
import { Card, Cursor3D, Lights, Particles, Pencil, PencilCup, Confetti } from "../three/objects";
import { coverTex, pageTex, stickyTex } from "../three/textures";
import { C, eBack, eIn, eOut, lerp, rand } from "../lib";
import { Halftone, InfoBlock, SpeedLines } from "../fx";

/* rounded play-triangle */
const triGeo = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(-0.3, 0.32); sh.lineTo(0.38, 0); sh.lineTo(-0.3, -0.32); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 5 });
  g.center();
  return g;
})();

/* Scene 6 (11.40s – 13.25s): flat-lay of the open ebook (Storyboard ch.13 + cover),
   sticky note, play triangle, cursor, clips, scissors, confetti; orange streak, papers fly at lens. */
export const S06FlatLay: React.FC = () => {
  const f = useCurrentFrame();
  const fly = lerp(f, [32, 44], [0, 1], eIn);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0.2 - f * 0.004, -0.3 + f * 0.004, 8.2 - f * 0.02 - fly * 2], look: [0.2, 0, 0], fov: 38, roll: 0.05 + f * 0.0015 }} bg="#efcfb9">
        <Lights dir={[-4, 5, 8]} intensity={2.5} />
        <mesh receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#eecdb8" />
        </mesh>
        {/* white paper sheets */}
        <Card tex={pageTex("white", 11)} w={2.2} h={1.6} position={[-1.2, 2.9, 0.01]} rotation={[0, 0, 0.1]} />
        <Card tex={pageTex("code", 12)} w={1.4} h={1.9} position={[-3.6, 0.4, 0.01]} rotation={[0, 0, 0.12]} />
        <Card tex={pageTex("white", 13)} w={1.6} h={2.2} position={[0.4, -2.6, 0.01]} rotation={[0, 0, -0.02]} />
        {/* open book: storyboard + cover */}
        <group position={[0, 0, 0.05]}>
          <mesh castShadow receiveShadow position={[0, 0, -0.03]}>
            <boxGeometry args={[3.8, 2.6, 0.05]} />
            <meshStandardMaterial color="#d34b10" />
          </mesh>
          <mesh position={[-0.92, 0, 0.01]}>
            <planeGeometry args={[1.8, 2.5]} />
            <meshStandardMaterial map={pageTex("story")} />
          </mesh>
          <mesh position={[0.92, 0, 0.01]}>
            <planeGeometry args={[1.8, 2.5]} />
            <meshStandardMaterial map={coverTex()} />
          </mesh>
        </group>
        {/* sticky note */}
        <Card tex={stickyTex("24 chapters\nstep by step", "#fff09a")} w={1.3} h={1.0} position={[2.6, -0.2, 0.05]} rotation={[0, 0, 0.12]} />
        {/* play triangle + cursor */}
        <mesh geometry={triGeo} position={[1.3, 2.1, 0.3]} rotation={[0.2, 0.1, -0.3 + f * 0.01]} castShadow>
          <meshStandardMaterial color={C.orange} />
        </mesh>
        <Cursor3D position={[0.9, 1.0, 0.1]} rotation={[0.1, 0.1, 0.5]} scale={0.45} />
        <Cursor3D position={[2.6, 1.5, 0.08]} rotation={[0.2, 0.3, 0.2]} scale={0.3} color="#ff8a4a" />
        <PencilCup mesh rotation={[Math.PI / 2, 0, 0]} position={[-2.3, 1.9, 0]} scale={0.6} />
        <Pencil position={[2.0, 1.3, 0.08]} rotation={[0, 0, 1.4]} color={C.yellow} len={1.1} />
        <Pencil position={[-1.8, -1.6, 0.08]} rotation={[0, 0, 1.9]} color={C.red} len={1.8} />
        {/* paper clips & scissors */}
        {[[0.3, -1.6], [1.6, -1.5], [-0.6, -2.0]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.04]} rotation={[0, 0, i]} scale={[1, 2.2, 1]}>
            <torusGeometry args={[0.07, 0.012, 8, 24]} />
            <meshStandardMaterial color={C.orangeD} metalness={0.4} />
          </mesh>
        ))}
        {[0, 1].map((i) => (
          <mesh key={i} position={[0.1 + i * 0.32, -1.45, 0.05]}>
            <torusGeometry args={[0.13, 0.04, 12, 28]} />
            <meshStandardMaterial color={C.red} />
          </mesh>
        ))}
        <mesh position={[-0.1, -2.2, 0.03]} rotation={[0, 0, 1.5]}>
          <boxGeometry args={[1.2, 0.35, 0.04]} />
          <meshStandardMaterial color="#2a2524" />
        </mesh>
        <Confetti t={f / 24} count={70} area={[9, 6, 0.4]} center={[0, 0, 0.1]} seed={6} />
        <Particles t={f / 24} count={260} spread={[10, 7, 1]} color="#fff7ef" size={0.05} />
        {/* papers flying into the camera */}
        {[0, 1, 2].map((i) => (
          <Card key={i} tex={pageTex("white", 20 + i)} w={1.8} h={1.3} position={[-1 + i * 1.3, -0.5 + i * 0.4, 0.2 + fly * (5 + i)]} rotation={[fly * 1.2, fly * (i - 1), fly * 2]} opacity={fly > 0 ? 1 : 0} />
        ))}
      </Stage>
      {/* orange streak whoosh */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M 1900 300 C 1500 360, 1200 330, 1000 420 S 600 600, 380 640" stroke={C.orange} strokeWidth={22} fill="none" strokeLinecap="round"
          strokeDasharray="2000" strokeDashoffset={lerp(f, [20, 30], [2000, 0])} opacity={lerp(f, [20, 22, 34, 38], [0, 1, 1, 0])} />
      </svg>
      <InfoBlock lines={["Motion Graphic with Claude, step by step", "HyperFrames · Remotion · three.js · Blender"]} x={70} y={480} o={0.6} />
      <InfoBlock lines={["What you need", "Claude and a Pro plan", "the Claude desktop app", "Mac or Windows, or a phone"]} x={1660} y={460} o={0.6} />
      <Halftone opacity={0.4} />
    </AbsoluteFill>
  );
};

/* ---------- 3D inflated "code" ---------- */
const font = new FontLoader().parse(fontJson as any);
const letterGeo = (ch: string) => {
  const g = new TextGeometry(ch, { font, size: 1.2, depth: 0.45, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.09, bevelSegments: 8 });
  g.center();
  return g;
};

const NOTES: [string, string, number, number, number][] = [
  ["need to\ncode?", C.orange, -1.0, -1.0, 0.6],
  ["hire an\neditor?", "#f6b26b", -2.4, -0.4, 0.8],
  ["Learn After\nEffects?", "#ffcf3f", 1.9, -1.2, 0.5],
  ["Learn After\nEffects?", "#f7a35c", -2.6, 1.4, -0.5],
  ["need to\ncode?", "#ffd84a", 0.4, 1.4, -0.8],
  ["", "#ffd25a", 3.3, 0.4, -0.3],
  ["", "#f39a5a", -4.0, 0.3, -1],
  ["hire an\neditor?", "#fdc163", 3.4, -1.0, 0.2],
];

/* Scene 7 (13.25s – 15.50s): orange ribbon swoops through floating sticky notes,
   blobs inflate into chunky 3D "code", white line strikes through, then everything spins away. */
export const S07Code: React.FC = () => {
  const f = useCurrentFrame();
  const geos = useMemo(() => ["c", "o", "d", "e"].map(letterGeo), []);
  const ribbon = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, -1, 1), new THREE.Vector3(-3.5, -1.6, 2), new THREE.Vector3(-3.8, -0.6, 2.4), new THREE.Vector3(-1, -0.2, 0),
      new THREE.Vector3(2, 0.4, -1), new THREE.Vector3(5, 0.9, -2),
    ]);
    return new THREE.TubeGeometry(curve, 200, 0.05, 8, false);
  }, []);
  const draw = Math.floor(lerp(f, [0, 22], [0, 1]) * ribbon.index!.count);
  ribbon.setDrawRange(0, draw);
  const blob = lerp(f, [24, 30], [0, 1], eBack);
  const morph = lerp(f, [28, 34], [0, 1], eOut);
  const spin = lerp(f, [42, 54], [0, 1], eIn);
  const cols = ["#f4a88a", C.orange, C.yellow, C.red];
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [lerp(f, [0, 42], [-1.2, 0.4]), 0.2, lerp(f, [0, 42], [8, 7]) - spin * 3], look: [0, 0, 0], fov: 40, roll: spin * 2.4 }} bg="#f5ebe3" style={{ filter: `blur(${spin * 10}px)` }}>
        <ambientLight intensity={1.2} />
        <hemisphereLight args={["#fff", "#f0c0a0", 1]} />
        <directionalLight position={[2, 5, 6]} intensity={2.5} />
        <pointLight position={[-3, 2, 4]} intensity={20} color="#fff2e0" />
        <mesh geometry={ribbon}>
          <meshStandardMaterial color={C.orange} side={THREE.DoubleSide} />
        </mesh>
        {NOTES.map(([t, col, x, y, z], i) => {
          const inn = lerp(f, [4 + i * 1.5, 14 + i * 1.5], [0, 1], eOut);
          return (
            <Card key={i} tex={stickyTex(t, col)} w={0.95} h={0.72}
              position={[x * (0.6 + 0.4 * inn) + Math.sin(f / 12 + i) * 0.08, y + Math.cos(f / 10 + i) * 0.06, z + (1 - inn) * 4]}
              rotation={[0.1 * Math.sin(i), -0.3 + rand(i) * 0.6, (rand(i + 4) - 0.5) * 0.5]}
              opacity={inn} />
          );
        })}
        {/* blobs -> letters */}
        {geos.map((g, i) => {
          const x = -2.1 + i * 1.4;
          return (
            <group key={i} position={[x, i === 2 ? 0.25 : 0, 0]} rotation={[0, -0.15 + Math.sin(f / 16 + i) * 0.05, 0]}>
              <mesh scale={blob * (1 - morph) * 0.75}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshPhysicalMaterial color={cols[i]} roughness={0.25} clearcoat={1} />
              </mesh>
              <mesh geometry={g} scale={morph}>
                <meshPhysicalMaterial color={cols[i]} roughness={0.22} clearcoat={1} clearcoatRoughness={0.1} />
              </mesh>
            </group>
          );
        })}
        <Particles t={f / 24} count={80} spread={[12, 6, 6]} color="#ffd9c2" size={0.06} />
      </Stage>
      {/* white strike line arc */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M 640 600 Q 1000 380 1500 470" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="1000"
          strokeDashoffset={lerp(f, [34, 42], [1000, 0])} opacity={1 - spin} />
      </svg>
      <Halftone opacity={0.3} />
    </AbsoluteFill>
  );
};

/* Scene 8 (15.50s – 15.80s): orange halftone flash with burst, then white radial burst + arc */
export const S08Burst: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 4)
    return (
      <AbsoluteFill style={{ backgroundColor: C.orange, backgroundImage: "radial-gradient(#ffb98a 30%, transparent 34%)", backgroundSize: "14px 14px" }}>
        <SpeedLines o={1} color="#fff6ee" cx={900} cy={520} seed={f + 2} />
        <div style={{ position: "absolute", left: 640, top: 280, fontFamily: "Rubik", fontWeight: 900, fontSize: 340, color: "#e8501a", textShadow: "0 0 0 #fff, 6px 6px 0 #c63c0c", transform: `rotate(-12deg) scale(${1 + f * 0.1})`, opacity: 0.8 }}>code</div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ background: "#f9f3ec" }}>
      <SpeedLines o={0.8} color="#ece2d8" cx={960} cy={540} seed={11} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M 1100 250 A 300 300 0 0 1 1100 850" stroke={C.orange} strokeWidth={5} fill="none" opacity={0.8} />
      </svg>
      <div style={{ position: "absolute", left: 880, top: 440, width: 150, height: 200, background: "#fff", borderRadius: 6, boxShadow: "0 10px 30px rgba(0,0,0,.12)", transform: `rotate(${10 + f * 8}deg) scale(${0.6 + f * 0.1})` }} />
    </AbsoluteFill>
  );
};
