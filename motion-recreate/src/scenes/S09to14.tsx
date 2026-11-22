import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { Book, Card, Confetti, Lights, OpenBook, Particles, Pencil, PencilCup } from "../three/objects";
import { cloudTex, fileTex, folderTex, pageTex } from "../three/textures";
import { Room } from "../three/Room";
import { C, eBack, eIn, eOut, lerp, rand } from "../lib";
import { Bloom, Halftone } from "../fx";

/* Scene 9 + 10 (15.80s – 18.50s): orange sky with clouds; creator name reveal while an open
   book tumbles/flips; white panel slides up: "One ebook Teaches Full Production". */
export const S09Sky: React.FC = () => {
  const f = useCurrentFrame();
  const name = lerp(f, [2, 12, 30, 36], [0, 1, 1, 0]);
  const panel = lerp(f, [34, 44], [0, 1], eOut);
  const cards = (i: number) => lerp(f, [42 + i * 3, 48 + i * 3], [0, 1], eBack);
  const bullets = (i: number) => lerp(f, [48 + i * 4, 52 + i * 4], [0, 1], eOut);
  const pen = lerp(f, [56, 65], [0, 1], eIn);
  const bookY = lerp(f, [0, 34], [-0.3, 0.6], eOut);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [0, 0, 7 - f * 0.01], look: [0, 0.2, 0], fov: 40 }} bg="#f2b48c">
        <Lights dir={[2, 4, 6]} intensity={2} shadow={false} />
        {/* sky gradient backdrop */}
        <mesh position={[0, 0, -6]}>
          <planeGeometry args={[30, 18]} />
          <shaderMaterial
            uniforms={{}}
            vertexShader="varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
            fragmentShader="varying vec2 vUv; void main(){ vec3 top=vec3(0.95,0.48,0.2); vec3 bot=vec3(0.98,0.86,0.78); gl_FragColor=vec4(mix(bot,top,smoothstep(0.35,0.9,vUv.y)),1.); }"
          />
        </mesh>
        {/* clouds (parallax) */}
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[(rand(i) - 0.5) * 16 + f * 0.01 * (i % 3 + 1), (rand(i + 5) - 0.5) * 7, -2 - rand(i + 8) * 3]} scale={1 + rand(i + 2)}>
            <planeGeometry args={[2.4, 1.2]} />
            <meshBasicMaterial map={cloudTex()} transparent depthWrite={false} opacity={0.95} />
          </mesh>
        ))}
        <Particles t={f / 24} count={120} spread={[14, 8, 4]} color="#fff" size={0.05} />
        {/* tumbling open book with page flips */}
        <group position={[0.3, bookY, 1.5]} rotation={[0.2 + Math.sin(f / 9) * 0.2, -0.6 + f * 0.035, 0.2]}>
          <OpenBook flip={(f / 14) % 1} scale={0.55} left="white" right="white" flipTex="chart" />
        </group>
      </Stage>
      {/* creator reveal (name replaced with the user's handle) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: "Rubik", fontWeight: 800, fontSize: 150, letterSpacing: -4, color: "rgba(255,255,255,.95)", opacity: name, transform: `scale(${0.9 + name * 0.1})`, textShadow: "0 8px 30px rgba(200,90,30,.25)" }}>
        w4<span style={{ color: C.orange }}>h</span>y03
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", gap: 260, fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: C.orange, opacity: name }}>
        <span>@w4hy03</span><span>motion designer</span>
      </div>
      {/* bottom white panel */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 440, background: "#f9f3ee", transform: `translateY(${(1 - panel) * 460}px)` }}>
        <div style={{ position: "absolute", left: 92, top: 90, fontFamily: "Rubik", fontWeight: 800, fontSize: 70, lineHeight: "84px", color: "#1d1b33" }}>
          {["One ", "ebook", "Teaches Full", "Production"].map((w, i) => (
            <span key={i} style={{ display: i === 2 || i === 3 ? "block" : "inline", color: i === 1 ? C.orange : undefined, opacity: lerp(f, [36 + i * 2, 40 + i * 2], [0, 1]), filter: `blur(${lerp(f, [36 + i * 2, 40 + i * 2], [8, 0])}px)` }}>{w}</span>
          ))}
        </div>
        {[["4", "Remotion"], ["5", "three.js"], ["6", "Blender"]].map(([n, t], i) => (
          <div key={i} style={{
            position: "absolute", left: 760 + i * 6, top: 76 + i * 86, width: 470, height: 120, borderRadius: 14,
            background: `linear-gradient(180deg, ${C.orangeL}, ${C.orange})`, boxShadow: "0 10px 24px rgba(200,80,20,.3)",
            transform: `translateY(${(1 - cards(i)) * -80}px) scale(${cards(i)})`, opacity: cards(i), color: "#fff",
          }}>
            <div style={{ position: "absolute", left: 22, top: 30, width: 46, height: 52, background: "#fff", borderRadius: 4, color: C.orange, fontFamily: "Rubik", fontWeight: 800, fontSize: 30, textAlign: "center", lineHeight: "60px" }}>{n}</div>
            <div style={{ position: "absolute", left: 90, top: 26, fontFamily: "Rubik", fontWeight: 700, fontSize: 36 }}>{t}</div>
            <div style={{ position: "absolute", left: 90, top: 74, width: 300, height: 6, borderRadius: 3, background: "rgba(255,255,255,.5)" }} />
          </div>
        ))}
        {["24 chapters · 135 pages", "Malay + English", "Mac, Windows + phone"].map((t, i) => (
          <div key={i} style={{ position: "absolute", left: 1370, top: 110 + i * 70, fontFamily: "Inter", fontWeight: 600, fontSize: 34, color: "#2a2730", opacity: bullets(i), transform: `translateX(${(1 - bullets(i)) * 30}px)` }}>
            <span style={{ color: C.orange, marginRight: 18 }}>●</span>{t}
          </div>
        ))}
      </div>
      {/* pencil flying through the title */}
      <div style={{ position: "absolute", left: lerp(f, [56, 65], [980, 40]), top: lerp(f, [56, 65], [560, 820]), width: 260, height: 26, borderRadius: 13, background: `linear-gradient(90deg, ${C.yellow}, ${C.orangeL})`, transform: "rotate(-55deg)", opacity: pen > 0 && pen < 1 ? 1 : 0, filter: "blur(1px)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: lerp(f, [60, 65], [0, 0.9]) }} />
      <Halftone opacity={0.3} color="#f0a070" />
    </AbsoluteFill>
  );
};

/* Scene 11 (18.50s – 20.15s): giant orange halftone ring zooms, ghost word "Codes", a 3D
   folder "motion-graphic" pops a .pdf out; files (.pdf / .epub) fan & stack, then whip away. */
export const S11Folder: React.FC = () => {
  const f = useCurrentFrame();
  const ring = lerp(f, [0, 40], [0.75, 1.35], eOut);
  const pdf = lerp(f, [6, 14], [0, 1], eBack);
  const split = lerp(f, [26, 32], [0, 1], eOut);
  const whip = lerp(f, [34, 40], [0, 1], eIn);
  return (
    <AbsoluteFill style={{ background: "#fbf6ef" }}>
      {/* halftone ring */}
      <div style={{
        position: "absolute", left: 960 - 560, top: 540 - 560, width: 1120, height: 1120, borderRadius: "50%",
        border: "60px solid transparent",
        background: `radial-gradient(${C.orange} 45%, ${C.orangeD} 46%) border-box`,
        WebkitMask: "linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0)",
        transform: `scale(${ring}) rotate(${f * 1.5}deg)`, opacity: 1 - split,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,.2)",
      }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontFamily: "Rubik", fontWeight: 800, fontSize: 260, letterSpacing: -8, color: "#f7cdb4", opacity: lerp(f, [0, 8, 22, 28], [0, 0.85, 0.5, 0]), transform: `scale(${1 + f * 0.004})` }}>
        Codes
      </div>
      <Stage cam={{ pos: [whip * 6, 0, 6], look: [whip * 8, 0, 0], fov: 38 }} bg="#fbf6ef" style={{ mixBlendMode: "multiply", filter: `blur(${whip * 14}px)` }}>
        <Lights dir={[2, 4, 6]} intensity={2.2} shadow={false} />
        <group rotation={[0.25, -0.35 + split * 0.6, 0.1]} position={[0, 0, 0]} scale={1 - split * 0.2}>
          {/* back flap */}
          <mesh position={[0, 0.2, -0.05]} visible={split < 0.6}>
            <boxGeometry args={[2.0, 1.2, 0.05]} />
            <meshStandardMaterial color="#ffb54a" />
          </mesh>
          {/* files */}
          <Card tex={fileTex(".pdf")} w={1.5} h={1.0} depth={0.02} position={[0 - split * 0.8, 0.3 + pdf * 0.45 + split * 0.9, 0.05 + split * 0.4]} rotation={[0, 0, -split * 0.3]} />
          <Card tex={fileTex(".epub")} w={1.5} h={1.0} depth={0.02} position={[split * 0.2, split * 0.3, 0.07]} rotation={[0, 0, split * 0.1]} scale={split} />
          {/* front flap with label */}
          <Card tex={folderTex("motion-graphic")} w={2.1} h={1.05} depth={0.04} position={[0, -0.15 - split * 0.9, 0.12]} rotation={[-0.15 - split * 0.6, 0, 0]} />
          {/* orange card stack appears at the end */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Card key={i} tex={pageTex("orange", i)} w={0.9} h={0.66} depth={0.03} position={[0.9 + i * 0.06, 1.2 + i * 0.06, 0.2 + i * 0.04]} rotation={[0, 0, -0.4]} scale={lerp(f, [30 + i, 34 + i], [0, 1], eBack)} />
          ))}
        </group>
      </Stage>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: lerp(f, [8, 14, 24, 28], [0, 1, 1, 0]) }}>
        <path d="M 1300 560 C 1330 480, 1380 520, 1350 590 S 1300 650, 1270 620" stroke={C.orange} strokeWidth={8} fill="none" strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

/* Scene 14 (23.60s – 28.00s): end card in the room – orange line draws in, 3D title
   "Motion Graphic with Claude" builds with selection box, "Get it now" + cursor,
   the book slides in standing, confetti floats around it. */
const Title3D: React.FC<{ text: string; color?: string; size: number; italic?: boolean; o: number; y: number; accents?: number[] }> = ({ text, color = "#fff1e6", size, italic, o, y, accents = [] }) => (
  <div style={{ position: "absolute", left: 300, top: y, fontFamily: "Rubik", fontWeight: 900, fontStyle: italic ? "italic" : "normal", fontSize: size, letterSpacing: -1, whiteSpace: "nowrap" }}>
    {text.split("").map((ch, i) => {
      const k = Math.max(0, Math.min(1, o * (text.length + 3) - i));
      const col = accents.includes(i) ? C.orange : color;
      return (
        <span key={i} style={{
          display: "inline-block", color: col, opacity: k,
          transform: `translateY(${(1 - k) * 40}px) scale(${0.6 + 0.4 * k})`,
          textShadow: `0 1px 0 #f0c9ae, 0 2px 0 #eab89a, 0 3px 0 #e4a888, 0 4px 0 #dd9a78, 0 5px 0 #d58c6a, 0 14px 18px rgba(170,80,30,.35)`,
        }}>{ch === " " ? " " : ch}</span>
      );
    })}
  </div>
);

export const S14End: React.FC = () => {
  const f = useCurrentFrame();
  const line = lerp(f, [0, 16], [0, 1], eOut);
  const t1 = lerp(f, [6, 16], [0, 1]);
  const t2 = lerp(f, [10, 20], [0, 1]);
  const t3 = lerp(f, [14, 24], [0, 1]);
  const btn = lerp(f, [22, 28], [0, 1], eBack);
  const book = lerp(f, [20, 30], [0, 1], eOut);
  const sel = lerp(f, [12, 18], [0, 1], eOut);
  const ctr = lerp(f, [26, 40], [0, 1], Easing.bezier(0.22, 1, 0.36, 1));
  const press = interpolate(f, [41, 44, 48], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [-1.2 + f * 0.003, 2.7, 3.4 - f * 0.003], look: [0.5, 2.75, -2.6], fov: 44 }} bg="#f6e8dd" style={{ filter: "blur(0.6px)" }}>
        <Room showChair={false} flip={1}>
          <PencilCup position={[-2.5, 1.55, 0.3]} scale={0.6} color="#f3ddd0" />
          <mesh position={[2.3, 1.56, 0.9]} rotation={[-Math.PI / 2, 0, 0.6]}>
            <ringGeometry args={[0.25, 0.6, 3]} />
            <meshStandardMaterial color={C.orangeL} side={THREE.DoubleSide} />
          </mesh>
          <group position={[1.3 + (1 - book) * 4, 2.6, -0.6]} rotation={[0, -0.5 + (1 - book) * 1.2, 0.04]}>
            <Book scale={0.95} thickness={0.18} />
            <Confetti t={f / 24 + 3} count={44} area={[3.0, 2.4, 1.2]} center={[0.3, 0.3, -0.3]} seed={14} burst={0.6 + book * 0.4} size={0.45} />
          </group>
          <Particles t={f / 24} count={100} spread={[8, 4, 4]} color="#fff" size={0.04} />
          <Pencil position={[-2.6, 1.6, 1.4]} rotation={[-Math.PI / 2, 0, 0.3]} color="#fff" len={1.2} />
        </Room>
      </Stage>
      <Bloom x="55%" y="12%" o={0.6} />
      {/* drawing orange line that becomes the underline */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M 720 1080 C 720 900, 980 860, 960 760 S 760 700, 640 720" stroke={C.orange} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 - line * 900} opacity={lerp(f, [0, 2, 14, 18], [0, 1, 1, 0])} />
      </svg>
      <Title3D text="Motion" size={150} o={t1} y={300} accents={[1, 3]} />
      <Title3D text="Graphic" size={120} o={t2} y={455} />
      <Title3D text="with Claude" size={120} italic o={t3} y={585} accents={[5, 6, 7, 8, 9, 10]} />
      {/* selection box with handles around "Graphic" */}
      <div style={{ position: "absolute", left: 290, top: 470, width: 520, height: 140, border: `3px solid ${C.orangeL}`, opacity: sel * 0.9, transform: `scale(${0.9 + sel * 0.1})` }}>
        {[[-8, -8], [512, -8], [-8, 132], [512, 132]].map(([x, y], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 13, height: 13, background: "#fff", border: `2px solid ${C.orange}` }} />
        ))}
      </div>
      {/* underline with dot ends */}
      <div style={{ position: "absolute", left: 600, top: 745, width: lerp(f, [16, 24], [0, 410], eOut), height: 8, borderRadius: 4, background: C.orange }}>
        <div style={{ position: "absolute", left: -6, top: -4, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: `3px solid ${C.orange}` }} />
        <div style={{ position: "absolute", right: -6, top: -4, width: 16, height: 16, borderRadius: "50%", background: "#fff", border: `3px solid ${C.orange}` }} />
      </div>
      {/* Get it now button + cursor */}
      <div style={{ position: "absolute", left: 320, top: 800, width: 380, height: 110, borderRadius: 60, background: `linear-gradient(180deg, #ff8d4a, ${C.orangeD})`, color: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 52, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 30px rgba(200,80,20,.35), inset 0 4px 0 rgba(255,255,255,.3)", transform: `scale(${btn * (1 - 0.05 * press)})` }}>
        Get it now
      </div>
      <svg width={110} height={130} viewBox="0 0 26 30" style={{ position: "absolute", left: 588 - 8.5 + (1 - ctr) * 230 + press * 3, top: 862 - 8.7 + (1 - ctr) * 150 + press * 6, opacity: btn, filter: "drop-shadow(0 8px 8px rgba(160,60,10,.3))" }}>
        <path d="M2 2 L22 16 L13 17 L18 27 L14 29 L9 19 L3 25 Z" fill={C.orangeL} stroke="#fff" strokeWidth={0.8} />
      </svg>
      <Halftone opacity={0.4} />
    </AbsoluteFill>
  );
};
