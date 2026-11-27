import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import CAPS from "./captions.json";
import { C, FPS, eBack, eOut, eSoft, lerp } from "./lib";

/* ---------------- look ---------------- */
export const Halftone: React.FC<{ opacity?: number; color?: string }> = ({ opacity = 0.35, color = "#e2a27e" }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none", opacity,
      backgroundImage: `radial-gradient(${color} 1.6px, transparent 2px)`, backgroundSize: "10px 10px",
      WebkitMaskImage:
        "radial-gradient(ellipse 45% 22% at 0% 100%, #000 0%, transparent 100%), radial-gradient(ellipse 40% 18% at 100% 0%, #000 0%, transparent 100%)",
    }}
  />
);
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(150,70,30,.26) 100%)" }} />
);
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.06, backgroundImage: "radial-gradient(#000 0.7px, transparent 0.9px)", backgroundSize: "3px 3px", backgroundPosition: `${(f * 7) % 3}px ${(f * 5) % 3}px` }} />
  );
};
export const Bloom: React.FC<{ x?: string; y?: string; o?: number; color?: string }> = ({ x = "70%", y = "12%", o = 0.5, color = "255,245,230" }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o, background: `radial-gradient(circle at ${x} ${y}, rgba(${color},.9) 0%, rgba(${color},.25) 22%, transparent 48%)` }} />
);

/* ---------------- typography ---------------- */
/** section chip + big title at the top safe zone */
export const Title: React.FC<{ t: number; at: number; chip?: string; title: string; accent?: string; sub?: string; out?: number; y?: number; color?: string }> = ({
  t, at, chip, title, accent, sub, out = 1e9, y = 230, color = C.ink,
}) => {
  const a = lerp(t, [at, at + 0.5], [0, 1], eSoft);
  const o = lerp(t, [out - 0.35, out], [1, 0]);
  const words = title.split(" ");
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, opacity: o, textAlign: "center" }}>
      {chip && (
        <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 999, background: C.orange, color: "#fff", fontFamily: "Rubik", fontWeight: 800, fontSize: 30, letterSpacing: 2, transform: `scale(${lerp(t, [at, at + 0.4], [0, 1], eBack)})`, boxShadow: "0 8px 18px rgba(200,80,20,.3)" }}>
          {chip}
        </div>
      )}
      <div style={{ marginTop: 22, fontFamily: "Rubik", fontWeight: 900, fontSize: title.length > 18 ? 74 : 92, lineHeight: 1.0, letterSpacing: -2, color }}>
        {words.map((w, i) => {
          const k = lerp(t, [at + 0.08 + i * 0.07, at + 0.5 + i * 0.07], [0, 1], eSoft);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 22, opacity: k, transform: `translateY(${(1 - k) * 40}px)`, color: w === accent ? C.orange : undefined, textShadow: "0 3px 0 rgba(255,255,255,.7), 0 14px 26px rgba(160,70,20,.18)" }}>
              {w}
            </span>
          );
        })}
      </div>
      {sub && <div style={{ marginTop: 14, fontFamily: "Inter", fontWeight: 600, fontSize: 36, color: "#6d5a4d", opacity: a }}>{sub}</div>}
    </div>
  );
};

/** small callout label with a leader dot, popping on its cue */
export const Label: React.FC<{ t: number; at: number; x: number; y: number; text: string; color?: string; dark?: boolean; out?: number; size?: number; align?: "left" | "right" }> = ({
  t, at, x, y, text, color = C.orange, dark, out = 1e9, size = 34, align = "left",
}) => {
  const k = lerp(t, [at, at + 0.35], [0, 1], eBack);
  const o = Math.min(lerp(t, [at, at + 0.15], [0, 1]), lerp(t, [out - 0.3, out], [1, 0]));
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(${align === "right" ? "-100%" : "0"}, -50%) scale(${k})`, transformOrigin: align === "right" ? "100% 50%" : "0 50%", display: "flex", alignItems: "center", gap: 12, flexDirection: align === "right" ? "row-reverse" : "row" }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", border: `5px solid ${color}`, boxShadow: `0 0 0 6px ${color}33` }} />
      <div style={{ padding: "10px 20px", borderRadius: 16, background: dark ? C.ink : "#fffaf5", color: dark ? "#fff" : C.ink, fontFamily: "Rubik", fontWeight: 700, fontSize: size, boxShadow: "0 10px 24px rgba(120,60,20,.18)", borderLeft: `8px solid ${color}`, whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
};

/** burned-in captions synced to the voice (TikTok/Reels safe zone) */
const KEY = /^(WiFi|5G|GHz|2,4|5|router|gelombang|frekuensi|kencang|lebar|sepi|sempit|ramai|teredam|menyerapnya|memantulkannya|bass|tembok|mesh|tengah|tinggi|logam|akuarium|buffering|like|komentar|follow)/i;
export const Captions: React.FC<{ fromFrame?: number }> = ({ fromFrame = 0 }) => {
  const t = (useCurrentFrame() + fromFrame) / FPS;
  const cap = (CAPS as { s: number; e: number; t: string }[]).find((c) => t >= c.s - 0.05 && t <= c.e + 0.05);
  if (!cap) return null;
  const k = lerp(t, [cap.s - 0.05, cap.s + 0.15], [0, 1], eOut);
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: 1390, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "16px 28px", borderRadius: 22, background: "rgba(31,26,23,.82)", color: "#fff", fontFamily: "Rubik", fontWeight: 700, fontSize: 44, lineHeight: 1.22, textAlign: "center", whiteSpace: "pre-line", transform: `translateY(${(1 - k) * 14}px)`, opacity: k, boxShadow: "0 12px 30px rgba(0,0,0,.18)" }}>
        {cap.t.split("\n").map((line, li) => (
          <div key={li}>
            {line.split(" ").map((w, i) => (
              <span key={i} style={{ color: KEY.test(w) ? C.orangeL : undefined }}>{w} </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const HeaderFade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(180deg, rgba(246,236,227,.95) 0%, rgba(246,236,227,.85) 18%, rgba(246,236,227,0) 32%)" }} />
);

export const Watermark: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1650, textAlign: "center", fontFamily: "Rubik", fontWeight: 700, fontSize: 26, letterSpacing: 1, color: "rgba(255,255,255,.95)", textShadow: "0 0 6px rgba(0,0,0,.35), 0 1px 2px rgba(0,0,0,.45)", opacity: 0.8 }}>
    @w4hy03
  </div>
);

/** soft enter/exit for scene roots (crossfade + slight scale/blur) */
export const SceneFade: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  const i = lerp(t, [a, a + 0.55], [0, 1], eOut);
  const o = lerp(t, [b, b + 0.55], [1, 0], eOut);
  return (
    <AbsoluteFill style={{ opacity: i * o, transform: `scale(${1.04 - 0.04 * i})`, filter: i < 1 ? `blur(${(1 - i) * 8}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

/** thermometer (HTML) – level 0..1 */
export const Thermo: React.FC<{ x: number; y: number; level: number; o?: number; scale?: number }> = ({ x, y, level, o = 1, scale = 1 }) => {
  const col = level > 0.5 ? C.red : level > 0.3 ? C.orange : C.cold;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${scale})`, transformOrigin: "50% 100%" }}>
      <div style={{ width: 54, height: 260, borderRadius: 30, background: "#fff", boxShadow: "0 10px 24px rgba(120,60,20,.2), inset 0 0 0 4px #f0e2d6", position: "relative" }}>
        <div style={{ position: "absolute", left: 17, right: 17, bottom: 30, height: 40 + level * 170, borderRadius: 12, background: col }} />
        <div style={{ position: "absolute", left: -8, bottom: -26, width: 70, height: 70, borderRadius: "50%", background: col, boxShadow: "inset 0 -6px 0 rgba(0,0,0,.12)" }} />
      </div>
    </div>
  );
};

/** pressure gauge (HTML) – level 0..1 */
export const Gauge: React.FC<{ x: number; y: number; level: number; label: string; o?: number }> = ({ x, y, level, label, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, width: 200, textAlign: "center" }}>
    <svg width={200} height={130} viewBox="0 0 200 130">
      <path d="M 20 115 A 80 80 0 0 1 180 115" fill="none" stroke="#efe2d6" strokeWidth={22} strokeLinecap="round" />
      <path d="M 20 115 A 80 80 0 0 1 180 115" fill="none" stroke={level > 0.5 ? C.red : C.cold} strokeWidth={22} strokeLinecap="round" strokeDasharray={251} strokeDashoffset={251 * (1 - level)} />
      <line x1={100} y1={115} x2={100 + Math.cos(Math.PI * (1 - level)) * 62} y2={115 - Math.sin(Math.PI * (1 - level)) * 62} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <circle cx={100} cy={115} r={12} fill={C.ink} />
    </svg>
    <div style={{ fontFamily: "Rubik", fontWeight: 800, fontSize: 30, color: C.ink }}>{label}</div>
  </div>
);
