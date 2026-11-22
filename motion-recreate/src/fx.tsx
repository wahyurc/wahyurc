import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, lerp, eOut, rand } from "./lib";

/** halftone dot clusters in the corners (present through most of the film) */
export const Halftone: React.FC<{ opacity?: number; color?: string }> = ({ opacity = 0.35, color = "#e2a27e" }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity,
      backgroundImage: `radial-gradient(${color} 1.4px, transparent 1.8px)`,
      backgroundSize: "9px 9px",
      WebkitMaskImage:
        "radial-gradient(ellipse 30% 35% at 0% 100%, #000 0%, transparent 100%), radial-gradient(ellipse 28% 30% at 100% 0%, #000 0%, transparent 100%), radial-gradient(ellipse 22% 25% at 100% 100%, #000 0%, transparent 100%)",
    }}
  />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.28 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(150,70,30,${strength}) 100%)`,
    }}
  />
);

/** warm light bloom from top-right window */
export const Bloom: React.FC<{ x?: string; y?: string; o?: number }> = ({ x = "70%", y = "15%", o = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      mixBlendMode: "screen",
      opacity: o,
      background: `radial-gradient(circle at ${x} ${y}, rgba(255,245,230,.9) 0%, rgba(255,220,190,.25) 25%, transparent 50%)`,
    }}
  />
);

/** subtle per-frame grain */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.07,
        backgroundImage: "radial-gradient(#000 0.7px, transparent 0.9px)",
        backgroundSize: "3px 3px",
        backgroundPosition: `${(f * 7) % 3}px ${(f * 5) % 3}px`,
      }}
    />
  );
};

/** comic speed lines converging to a point */
export const SpeedLines: React.FC<{ o: number; color?: string; cx?: number; cy?: number; seed?: number }> = ({
  o, color = "#fff", cx = 960, cy = 540, seed = 1,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: o }}>
    {Array.from({ length: 46 }).map((_, i) => {
      const a = (i / 46) * Math.PI * 2 + rand(i + seed) * 0.1;
      const r0 = 380 + rand(i * 3 + seed) * 260;
      const r1 = 1400;
      const wdt = 6 + rand(i * 5 + seed) * 22;
      const x0 = cx + Math.cos(a) * r0, y0 = cy + Math.sin(a) * r0;
      const x1 = cx + Math.cos(a + 0.012 * wdt) * r1, y1 = cy + Math.sin(a + 0.012 * wdt) * r1;
      const x2 = cx + Math.cos(a - 0.012 * wdt) * r1, y2 = cy + Math.sin(a - 0.012 * wdt) * r1;
      return <polygon key={i} points={`${x0},${y0} ${x1},${y1} ${x2},${y2}`} fill={color} />;
    })}
  </svg>
);

/** caption line at the bottom (as in the reference) */
export const Caption: React.FC<{ text: string; o?: number }> = ({ text, o = 0.8 }) => (
  <div
    style={{
      position: "absolute", left: 0, right: 0, bottom: 74, textAlign: "center",
      fontFamily: "Inter", fontSize: 15, color: "#fff", opacity: o, letterSpacing: 0.3,
      textShadow: "0 1px 4px rgba(120,60,20,.35)",
    }}
  >
    {text}
  </div>
);

/** tiny editorial info block (top-left in room shots) */
export const InfoBlock: React.FC<{ lines: string[]; o?: number; x?: number; y?: number; color?: string }> = ({
  lines, o = 0.85, x = 92, y = 120, color = "#fff",
}) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: "Inter", fontSize: 15, lineHeight: "22px", color, opacity: o }}>
    {lines.map((l, i) => (
      <div key={i} style={{ marginBottom: i === 1 ? 14 : 0 }}>{l}</div>
    ))}
  </div>
);

/** full-frame color wipe (yellow pencil flash etc.) */
export const Flash: React.FC<{ color: string; o: number; blur?: number }> = ({ color, o, blur = 0 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 40% 50%, ${color} 0%, ${color} 40%, ${shade(color)} 100%)`, opacity: o, filter: blur ? `blur(${blur}px)` : undefined }} />
);
const shade = (c: string) => (c === C.yellow ? C.yellowD : c);

/** watermark @w4hy03 — small, bottom centre, on every frame */
export const Watermark: React.FC = () => {
  const f = useCurrentFrame();
  const o = lerp(f, [0, 12], [0, 0.78], eOut);
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center",
        fontFamily: "Rubik", fontWeight: 700, fontSize: 20, letterSpacing: 1,
        color: "rgba(255,255,255,.95)", opacity: o,
        textShadow: "0 0 6px rgba(0,0,0,.35), 0 1px 2px rgba(0,0,0,.45)",
      }}
    >
      @w4hy03
    </div>
  );
};
