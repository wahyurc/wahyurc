// Shared overlay helpers for scenes (fixed layout bands keep text from overlapping)
import React from "react";
import { C, eSoft, lerp, on, pop } from "./lib";

export type V3 = [number, number, number];
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** camera path through keyframes [time, pos, look] with eased segments */
export const camPath = (t: number, keys: [number, V3, V3][]) => {
  if (t <= keys[0][0]) return { pos: keys[0][1], look: keys[0][2] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0, l0] = keys[i], [t1, p1, l1] = keys[i + 1];
    if (t <= t1) { const k = lerp(t, [t0, t1], [0, 1], eSoft); return { pos: mix(p0, p1, k), look: mix(l0, l1, k) }; }
  }
  const l = keys[keys.length - 1]; return { pos: l[1], look: l[2] };
};
export const vis = (t: number, at: number, out = 1e9, d = 0.35) => Math.min(on(t, at, d), lerp(t, [out - d, out], [1, 0]));

/** info card (band 430–700 by default) */
export const Card: React.FC<{ t: number; at: number; out?: number; title: React.ReactNode; lines?: React.ReactNode[]; color: string; x?: number; y?: number; w?: number; align?: "left" | "center" }> = ({ t, at, out = 1e9, title, lines = [], color, x = 70, y = 430, w, align = "left" }) => {
  const k = vis(t, at, out);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, padding: "18px 24px", borderRadius: 22, background: "rgba(255,250,244,.96)", boxShadow: "0 14px 30px rgba(120,60,20,.16)", borderLeft: `10px solid ${color}`, fontFamily: "Rubik", textAlign: align }}>
      <div style={{ fontWeight: 900, fontSize: 44, color: C.ink, lineHeight: 1.1 }}>{title}</div>
      {lines.map((l, i) => <div key={i} style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 30, color: "#6d5a4d", marginTop: 6 }}>{l}</div>)}
    </div>
  );
};
/** big centred statement */
export const Big: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode; y?: number; size?: number }> = ({ t, at, out = 1e9, children, y = 1180, size = 60 }) => (
  <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", fontFamily: "Rubik", fontWeight: 900, fontSize: size, lineHeight: 1.08, color: C.ink, opacity: vis(t, at, out, 0.3), transform: `scale(${pop(t, at)})`, textShadow: "0 4px 0 rgba(255,255,255,.85)" }}>{children}</div>
);
/** numbered step chips (bottom band 1050–1370) */
export const Steps: React.FC<{ t: number; items: [number, string, React.ReactNode, string?][]; out?: number; y?: number }> = ({ t, items, out = 1e9, y = 1060 }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", flexDirection: "column", gap: 12, opacity: lerp(t, [out - 0.3, out], [1, 0]) }}>
    {items.map(([at, n, txt, col], i) => {
      const k = on(t, at, 0.4);
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: k, transform: `translateX(${(1 - k) * -40}px)` }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: col ?? C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
          <div style={{ padding: "9px 18px", borderRadius: 16, background: "rgba(255,250,244,.96)", fontFamily: "Rubik", fontWeight: 800, fontSize: 34, color: C.ink, boxShadow: "0 8px 20px rgba(120,60,20,.14)" }}>{txt}</div>
        </div>
      );
    })}
  </div>
);
export const Pill: React.FC<{ bg: string; color?: string; children: React.ReactNode; size?: number }> = ({ bg, color = "#fff", children, size = 34 }) => (
  <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: 999, background: bg, color, fontFamily: "Rubik", fontWeight: 900, fontSize: size }}>{children}</span>
);
