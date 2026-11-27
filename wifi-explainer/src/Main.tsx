import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFonts } from "./fonts";
import { FPS, SCENES, TOTAL } from "./lib";
import { Captions, Grain, SceneFade, Vignette, Watermark } from "./fx";
import { Hook, Outro, Roads, Terms, Tips, Walls, Waves } from "./scenes/scenes";

loadFonts();
const OVER = 0.6;

const Scene: React.FC<{ a: number; b: number; Comp: React.FC<{ t: number }> }> = ({ a, b, Comp }) => {
  const t = (useCurrentFrame() + Math.round(a * FPS)) / FPS;
  return (
    <SceneFade t={t} a={a} b={b}>
      <Comp t={t} />
    </SceneFade>
  );
};

const LIST: [keyof typeof SCENES, React.FC<{ t: number }>][] = [
  ["hook", Hook], ["terms", Terms], ["waves", Waves], ["roads", Roads], ["walls", Walls], ["tips", Tips], ["outro", Outro],
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: "#f6ece3" }}>
    {LIST.map(([key, Comp]) => {
      const [a, b] = SCENES[key];
      const from = Math.round(a * FPS);
      const dur = Math.min(TOTAL, Math.round((b + OVER) * FPS)) - from;
      return (
        <Sequence key={key} from={from} durationInFrames={dur} premountFor={15} layout="absolute-fill">
          <Scene a={a} b={b} Comp={Comp} />
        </Sequence>
      );
    })}
    <Vignette />
    <Grain />
    <Captions />
    <Watermark />
    <Audio src={staticFile("mix.wav")} />
  </AbsoluteFill>
);
