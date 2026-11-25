import { Easing, interpolate, useCurrentFrame } from "remotion";
import WORDS from "./words_aligned.json";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION_S = 84;
export const TOTAL = DURATION_S * FPS; // 2520 frames

export const C = {
  cream: "#f6eee5",
  peach: "#f3d9c4",
  orange: "#ff6a1a",
  orangeD: "#e2500c",
  orangeL: "#ff9a52",
  yellow: "#ffc21f",
  red: "#e8402a",
  cold: "#5fb8ff",
  pcb: "#d9784a",
  pcbD: "#b95a30",
  trace: "#f6c08f",
  chip: "#3b3431",
  gold: "#e9b44c",
  coldL: "#bfe4ff",
  coldD: "#2f86d6",
  ink: "#1f1a17",
  white: "#fffaf4",
  steel: "#c9c2bb",
  copper: "#c8743e",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lerp = (t: number, input: number[], output: number[], ease: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(t, input, output, { ...clamp, easing: ease });
export const eOut = Easing.out(Easing.cubic);
export const eIn = Easing.in(Easing.cubic);
export const eBack = Easing.out(Easing.back(1.7));
export const eSoft = Easing.bezier(0.22, 1, 0.36, 1);

export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** absolute video time in seconds (scenes are rendered in Sequences; pass the Sequence start) */
export const useT = (fromFrame: number) => (useCurrentFrame() + fromFrame) / FPS;

/* ---------- voiceover cues: time (s) a script word is spoken ---------- */
type Wd = { sec: number; w: string; s: number; e: number };
const words = WORDS as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** start time of the first word matching `word` (prefix match) spoken at or after `after` seconds */
export const cue = (word: string, after = 0): number => {
  const n = norm(word);
  const hit = words.find((x) => x.s >= after - 0.05 && norm(x.w).startsWith(n));
  if (!hit) throw new Error("cue not found: " + word + " after " + after);
  return hit.s;
};
/** 0->1 ramp starting when `word` is spoken */
export const on = (t: number, at: number, dur = 0.45, ease = eSoft) => lerp(t, [at, at + dur], [0, 1], ease);
/** pop with overshoot */
export const pop = (t: number, at: number, dur = 0.4) => lerp(t, [at, at + dur], [0, 1], eBack);

/** scene windows (seconds) — derived from the voice: each cut sits 0.35 s before its section's first word */
const cut = (w: string, after: number) => Math.round((cue(w, after) - 0.35) * 100) / 100;
export const SCENES = {
  hook: [0, cut("bayangkan", 5)],
  office: [cut("bayangkan", 5), cut("setiap", 20)],
  copy: [cut("setiap", 20), cut("di", 40)],
  soc: [cut("di", 40), cut("makanya", 50)],
  compare: [cut("makanya", 50), cut("jadi", 60)], // HyperFrames segment
  outro: [cut("jadi", 60), DURATION_S],
} as const;
