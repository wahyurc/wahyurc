import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame } from "remotion";
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
          position={[0.05 - cur * 0.35, 1.6 + cur * 1.1, -1.4 + cur * 5.2]}
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
   the cursor glides onto it and clicks -> crossfades to solid glowing orange with ring icon + flare.
   The cursor lives INSIDE the button's 3D transform, so its tip is always exactly on the target. */
const BTN_W = 820, BTN_H = 230;
const TARGET = { x: 640, y: 128 }; // click point in button-local px (right part of the pill)
const TIP = { x: 10, y: 10 }; // arrow tip offset inside the 130x150 cursor svg

export const S03Learn: React.FC = () => {
  const f = useCurrentFrame();
  const appear = lerp(f, [0, 12], [0, 1], eOut);
  // cursor travel: starts off to the lower right, eases onto the target, arrives at f18
  const travel = lerp(f, [3, 18], [0, 1], Easing.bezier(0.22, 1, 0.36, 1));
  // press: smooth dip 19 -> 22 -> 26 (no hard steps)
  const press = interpolate(f, [19, 22, 26], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });
  const on = lerp(f, [21, 26], [0, 1], eOut); // click state crossfade
  const grow = spring({ frame: f - 21, fps: 24, config: { damping: 12, stiffness: 140, mass: 0.6 } });
  const pulse = lerp(f, [22, 36], [0, 1], eOut);
  const rise = lerp(f, [0, 34], [0, 60], Easing.inOut(Easing.sin));
  const exit = lerp(f, [36, 48], [0, 1], Easing.in(Easing.sin));
  const flare = interpolate(f, [21, 25, 40], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = appear * (1 + 0.18 * grow) * (1 - 0.05 * press);
  const textCol = interpolateColors(on, [0, 1], ["#ff7a3e", "#ffffff"]);
  const ringW = 112 * on;
  const curX = TARGET.x - TIP.x + (1 - travel) * 520 + press * 6;
  const curY = TARGET.y - TIP.y + (1 - travel) * 420 + press * 10;
  return (
    <AbsoluteFill>
      <Stage cam={{ pos: [-0.7 + f * 0.004, 2.45, lerp(f, [0, 48], [-0.9, -1.25], Easing.inOut(Easing.sin))], look: [-0.4, 2.2, -2.8], fov: 42, roll: -0.15 * exit }} bg="#f6e8dd" style={{ filter: "blur(2.5px) saturate(1.1)" }}>
        <Room flip={1} showChair={false} />
      </Stage>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(255,140,80,.25), transparent 40%, rgba(255,120,60,.2))" }} />
      <InfoBlock lines={INFO} o={0.7} />
      <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
        <div
          style={{
            position: "absolute",
            left: 540 + lerp(f, [0, 12], [-160, 0], eOut) - exit * 120,
            top: 300 - rise + exit * 40,
            width: BTN_W, height: BTN_H,
            transformOrigin: `${TARGET.x}px ${TARGET.y}px`,
            transform: `rotateX(18deg) rotateY(-12deg) rotateZ(${-4 - exit * 14}deg) scale(${scale})`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* glass state */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 120, opacity: 1 - on, background: "linear-gradient(180deg, rgba(255,240,230,.78), rgba(255,215,195,.55))", boxShadow: "0 20px 40px rgba(200,100,60,.25), inset 0 4px 0 rgba(255,255,255,.8)" }} />
          {/* solid orange state */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 120, opacity: on, background: `linear-gradient(180deg, #ff8a3a, ${C.orangeD})`, boxShadow: "0 30px 60px rgba(200,70,10,.45), inset 0 6px 0 rgba(255,255,255,.35), inset 0 -10px 0 rgba(0,0,0,.12)" }} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Rubik", fontWeight: 800, fontSize: 150, letterSpacing: -2, color: textCol,
            textShadow: `0 6px 0 rgba(255,255,255,${1 - on}), 0 0 ${20 + 10 * on}px rgba(255,${120 + 135 * on},${60 + 195 * on},.65)`,
          }}>
            Learn
            <div style={{ width: ringW, height: 90, marginLeft: 26 * on, position: "relative" }}>
              <div style={{ position: "absolute", left: 11, top: 0, width: 90, height: 90, borderRadius: "50%", border: "10px solid #fff", boxShadow: "0 0 30px #fff", boxSizing: "border-box", opacity: on, transform: `scale(${on})` }} />
            </div>
          </div>
          {/* click ripple exactly at the cursor tip */}
          <div style={{ position: "absolute", left: TARGET.x - 45, top: TARGET.y - 45, width: 90, height: 90, borderRadius: "50%", border: "6px solid #fff", opacity: f >= 22 ? (1 - pulse) * 0.9 : 0, transform: `scale(${1 + pulse * 2.6})` }} />
          {/* cursor (same transform space as the button => tip always on target) */}
          <svg width={130} height={150} viewBox="0 0 26 30" style={{
            position: "absolute", left: curX, top: curY, opacity: lerp(f, [3, 7], [0, 1]),
            transform: "translateZ(40px)", filter: "drop-shadow(0 16px 14px rgba(160,60,10,.35))",
          }}>
            <path d="M2 2 L22 16 L13 17 L18 27 L14 29 L9 19 L3 25 Z" fill={C.orange} stroke="#ffb183" strokeWidth={0.8} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: flare, background: "radial-gradient(circle at 56% 28%, #fff 0%, rgba(255,230,200,.7) 6%, transparent 22%)" }} />
      <div style={{ position: "absolute", left: 300, top: 300, width: 1300, height: 6, background: "linear-gradient(90deg, transparent, #fff, transparent)", opacity: flare * 0.8, filter: "blur(2px)" }} />
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
