import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFonts } from "./fonts";
import { FPS, SCENES, TOTAL } from "./lib";
import { Captions, Grain, SceneFade, Vignette, Watermark } from "./fx";
import { Copy, Hook, NpuScene, Office, Outro, SocScene, TableScene } from "./scenes/scenes";

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
const Clip: React.FC<{ a: number; b: number; src: string }> = ({ a, b, src }) => {
  const t = (useCurrentFrame() + Math.round(a * FPS)) / FPS;
  return (
    <SceneFade t={t} a={a} b={b}>
      <OffthreadVideo src={staticFile(src)} muted />
    </SceneFade>
  );
};

const LIST: [keyof typeof SCENES, React.FC<{ t: number }>][] = [["hook", Hook], ["office", Office], ["copy", Copy], ["soc", SocScene], ["table", TableScene], ["npu", NpuScene], ["outro", Outro]];

export const Main: React.FC = () => {
  const [ca, cb] = SCENES.compare;
  return (
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
      <Sequence from={Math.round(ca * FPS)} durationInFrames={Math.round((cb - ca + OVER) * FPS)} layout="absolute-fill">
        <Clip a={ca} b={cb} src="hf_compare.mp4" />
      </Sequence>
      <Vignette />
      <Grain />
      <Captions />
      <Watermark />
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
