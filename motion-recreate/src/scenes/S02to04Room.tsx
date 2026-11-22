import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../three/Stage";
import { Room } from "../three/Room";
import { Card, Cursor3D, Particles, Pencil } from "../three/objects";
import { pageTex, tagTex } from "../three/textures";
import { C, eBack, eIn, eOut, lerp } from "../lib";
import { Bloom, Flash, Halftone, InfoBlock, SpeedLines } from "../fx";

const INFO = ["Motion Graphic with Claude", "Ebook by w4hy03", "24 chapters · 135 pages", "Malay + English"];

/* Scene 2 (3.20s – 5.40s): whip into the study room, white page flies past, the big
   orange cursor rises from behind the desk and rushes into the lens. */
export const S02Room: React.FC = () => {
  const f = useCurrentFrame();
  const camX = lerp(f, [0, 53], [-1.8, -0.6]);
  const cur = lerp(f, [12, 50], [0, 1], eIn);
  const blur = lerp(f, [38, 50], [0, 14]) + lerp(f, [0, 5], [10, 0]);
  return (
    <AbsoluteFill>
      <Stage
        cam={{ pos: [camX, 2.5 + lerp(f, [0, 53], [0.3, 0]), 5.2 - lerp(f, [0, 53], [0, 0.6])], look: [0.2, 1.9, -2.6], fov: 40, roll: lerp(f, [0, 6], [-0.25, 0], eOut) }}
        bg="#f6e8dd"
        style={{ filter: `blur(${blur}px)` }}
      >
        <Room flip={lerp(f, [0, 20], [0, 1])} />
        <Particles t={f / 24} count={120} spread={[10, 6, 6]} color="#fff" size={0.04} />
        {/* a paper sheet whipping past the camera */}
        <Card tex={pageTex("white", 7)} w={1.4} h={2} position={[lerp(f, [6, 16], [-3, 3], eIn), 2.6, 3.6]} rotation={[0.2, 0.9, f * 0.1]} opacity={f > 5 && f < 17 ? 1 : 0} />
        <Cursor3D
          position={[0.25 - cur * 0.2, 1.35 + cur * 0.85, -1.4 + cur * 5.2]}
          rotation={[0.25, -0.15 + cur * 0.3, 0.35 - cur * 0.2]}
          scale={0.45 + cur * 0.9}
          color="#ff6a1a"
        />
      </Stage>
      <Bloom x="58%" y="25%" o={0.65} />
      <InfoBlock lines={INFO} o={lerp(f, [4, 10], [0, 0.85])} />
      <Halftone opacity={0.35} />
    </AbsoluteFill>
  );
};

/* Scene 3 (5.40s – 7.40s): close-up on the book stand, a glassy "Learn" pill appears,
   the cursor clicks it -> turns solid glowing orange with ring icon + flare. */
export const S03Learn: React.FC = () => {
  const f = useCurrentFrame();
  const appear = lerp(f, [0, 10], [0, 1], eOut);
  const clicked = f >= 22;
  const press = f >= 22 && f < 25 ? 0.94 : 1;
  const pulse = lerp(f, [22, 34], [0, 1], eOut);
  const exitRot = lerp(f, [38, 48], [0, -14], eIn);
  const camz = lerp(f, [0, 48], [-0.9, -1.25]);
  const flare = lerp(f, [22, 26, 40], [0, 1, 0]);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [-0.7 + f * 0.004, 2.45, camz], look: [-0.4, 2.2, -2.8], fov: 42, roll: lerp(f, [36, 48], [0, -0.15]) }} bg="#f6e8dd" style={{ filter: "blur(2.5px) saturate(1.1)" }}>
        <Room flip={1} showChair={false} />
      </Stage>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(255,140,80,.25), transparent 40%, rgba(255,120,60,.2))" }} />
      <InfoBlock lines={INFO} o={0.7} />
      {/* the Learn pill (3D via CSS perspective) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, perspective: 1400 }}>
        <div
          style={{
            position: "absolute",
            left: 560 - (clicked ? 30 : 0) + lerp(f, [0, 10], [-160, 0], eOut),
            top: 300 - lerp(f, [10, 30], [0, 70], eOut),
            width: 820, height: 230, borderRadius: 120,
            transform: `rotateX(18deg) rotateY(-12deg) rotateZ(${-4 + exitRot}deg) scale(${(clicked ? 1.25 : 1) * press * appear})`,
            transformStyle: "preserve-3d",
            background: clicked ? `linear-gradient(180deg, #ff8a3a, ${C.orangeD})` : "linear-gradient(180deg, rgba(255,240,230,.75), rgba(255,215,195,.55))",
            boxShadow: clicked
              ? "0 30px 60px rgba(200,70,10,.45), inset 0 6px 0 rgba(255,255,255,.35), inset 0 -10px 0 rgba(0,0,0,.12)"
              : "0 20px 40px rgba(200,100,60,.25), inset 0 4px 0 rgba(255,255,255,.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Rubik", fontWeight: 800, fontSize: 150, letterSpacing: -2,
            color: clicked ? "#fff" : "#ff7a3e",
            textShadow: clicked ? "0 0 30px rgba(255,255,255,.7)" : "0 6px 0 #fff, 0 0 20px rgba(255,120,60,.6)",
          }}
        >
          Learn
          {clicked && (
            <div style={{ marginLeft: 26, width: 90, height: 90, borderRadius: "50%", border: "10px solid #fff", boxShadow: "0 0 30px #fff", transform: `scale(${lerp(f, [22, 28], [0, 1], eBack)})` }} />
          )}
          {/* click ring pulse */}
          <div style={{ position: "absolute", right: 70, top: 70, width: 90, height: 90, borderRadius: "50%", border: "6px solid #fff", opacity: (1 - pulse) * (clicked ? 1 : 0), transform: `scale(${1 + pulse * 3})` }} />
        </div>
      </div>
      {/* the 2D/3D-ish cursor that clicks */}
      <svg width={260} height={300} viewBox="0 0 26 30" style={{
        position: "absolute",
        left: lerp(f, [4, 20], [1500, 1250], eOut) + (clicked ? 60 : 0),
        top: lerp(f, [4, 20], [700, 450], eOut) + (press < 1 ? 10 : 0),
        transform: `rotate(-12deg) rotateZ(${exitRot}deg)`,
        filter: "drop-shadow(0 16px 14px rgba(160,60,10,.35))",
      }}>
        <path d="M2 2 L22 16 L13 17 L18 27 L14 29 L9 19 L3 25 Z" fill={C.orange} stroke="#ffb183" strokeWidth={0.8} strokeLinejoin="round" />
      </svg>
      {/* lens flare at click */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: flare, background: "radial-gradient(circle at 54% 30%, #fff 0%, rgba(255,230,200,.7) 6%, transparent 22%)" }} />
      <div style={{ position: "absolute", left: 300, top: 330, width: 1300, height: 6, background: "linear-gradient(90deg, transparent, #fff, transparent)", opacity: flare * 0.8, filter: "blur(2px)" }} />
      <Halftone opacity={0.4} />
    </AbsoluteFill>
  );
};

/* Scene 4 (7.40s – 9.00s): pull back across the desk – book pages flip, tags & mini
   "Learn" button float, a pencil scribbles; speed lines + yellow pencil rush -> yellow flash. */
export const S04Pull: React.FC = () => {
  const f = useCurrentFrame();
  const k = lerp(f, [0, 30], [0, 1], eOut);
  const rush = lerp(f, [24, 36], [0, 1], eIn);
  return (
    <AbsoluteFill>
      <Stage
        cam={{ pos: [0.2 + k * 1.2 - rush * 1.5, 2.6 + k * 0.3, -0.6 + k * 4.2], look: [-0.2, 2.1, -2.7], fov: 42, roll: lerp(f, [0, 8], [0.2, 0], eOut) - rush * 0.3 }}
        bg="#f6e8dd"
        style={{ filter: `blur(${lerp(f, [0, 4], [8, 0]) + rush * 6}px)` }}
      >
        <Room flip={(f / 9) % 1} />
        <Particles t={f / 24} count={140} spread={[8, 5, 6]} color="#fff" size={0.04} />
        <Card tex={tagTex("For beginners", "Install to claude")} w={0.7} h={0.22} position={[-1.6, 2.7, -2.1]} rotation={[0, 0.3, 0.06]} scale={lerp(f, [2, 9], [0, 1], eBack)} />
        <Card tex={tagTex("Learn", "Step by step")} w={0.55} h={0.18} position={[-1.35, 2.35, -2.0]} rotation={[0, 0.3, -0.04]} scale={lerp(f, [5, 12], [0, 1], eBack)} />
        <Card tex={tagTex("For beginners", "Install to claude")} w={0.6} h={0.19} position={[1.2, 2.9, -2.3]} rotation={[0, -0.2, 0.05]} scale={lerp(f, [8, 15], [0, 1], eBack)} />
        <Pencil position={[-0.1, 2.3, -2.2]} rotation={[0.2, 0, -0.9 + Math.sin(f / 2) * 0.1]} color={C.orange} len={1.0} />
        {/* yellow pencil rushing at the lens */}
        <Pencil position={[-2.5 + rush * 3.2, 2.2 + rush * 0.3, -1.5 + rush * 5.5]} rotation={[0.3, 0, -1.2]} color={C.yellow} len={1.8} scale={1 + rush * 2} />
      </Stage>
      <Bloom x="60%" y="20%" o={0.6} />
      <SpeedLines o={lerp(f, [24, 28, 34], [0, 0.95, 0.6])} color="#fff4ea" cx={420} cy={560} seed={4} />
      <Flash color={C.yellow} o={lerp(f, [33, 37], [0, 1])} blur={6} />
      <Halftone opacity={0.35} />
    </AbsoluteFill>
  );
};
