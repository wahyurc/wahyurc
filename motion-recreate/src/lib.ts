import { Easing, interpolate } from "remotion";

export const FPS = 24;
export const W = 1920;
export const H = 1080;

export const C = {
  cream: "#f4ece2",
  peach: "#f3d9c4",
  peachD: "#e9c3a6",
  orange: "#ff6a1a",
  orangeD: "#e2500c",
  orangeL: "#ff9a52",
  yellow: "#ffc21f",
  yellowD: "#f2a60c",
  red: "#e8402a",
  purple: "#6b3fa0",
  ink: "#1f1a17",
  white: "#fffaf4",
};

/** seconds -> frames */
export const s = (sec: number) => Math.round(sec * FPS);

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** clamped interpolate with optional easing */
export const lerp = (
  f: number,
  input: number[],
  output: number[],
  ease: (t: number) => number = Easing.inOut(Easing.cubic)
) => interpolate(f, input, output, { ...clampOpts, easing: ease });

export const eOut = Easing.out(Easing.cubic);
export const eIn = Easing.in(Easing.cubic);
export const eBack = Easing.out(Easing.back(1.8));
export const eExpo = Easing.out(Easing.exp);
export const eLin = (t: number) => t;

/** deterministic pseudo random */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
