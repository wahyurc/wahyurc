import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFonts } from "./fonts";
import { FPS, SCENES, TOTAL } from "./lib";
import { Captions, Grain, SceneFade, Vignette, Watermark } from "./fx";
import { Analogi, Hook, Loop } from "./scenes/A_intro";
import { Evap, Katup, Komp, Kond } from "./scenes/B_components";
import { Penutup, Share, Tips } from "./scenes/C_outro";

loadFonts();

const OVER = 0.4; // seconds each scene lingers under the next one (crossfade)

const Scene: React.FC<{ a: number; b: number; Comp: React.FC<{ t: number }> }> = ({ a, b, Comp }) => {
  const from = Math.round(a * FPS);
  const t = (useCurrentFrame() + from) / FPS;
  return (
    <SceneFade t={t} a={a} b={b}>
      <Comp t={t} />
    </SceneFade>
  );
};

const LIST: [keyof typeof SCENES, React.FC<{ t: number }>][] = [
  ["hook", Hook], ["analogi", Analogi], ["loop", Loop], ["evap", Evap], ["komp", Komp], ["kond", Kond],
  ["katup", Katup], ["tips", Tips], ["penutup", Penutup], ["share", Share],
];

export const Main: React.FC = () => {
  const [ka, kb] = SCENES.kontrol;
  return (
    <AbsoluteFill style={{ background: "#f6eee5" }}>
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
      {/* HyperFrames segment: sensor + regular vs inverter */}
      <Sequence from={Math.round(ka * FPS)} durationInFrames={Math.round((kb - ka + OVER) * FPS)} layout="absolute-fill">
        <KontrolClip a={ka} b={kb} />
      </Sequence>
      <Vignette />
      <Grain />
      <Captions />
      <Watermark />
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};

const KontrolClip: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const t = (useCurrentFrame() + Math.round(a * FPS)) / FPS;
  return (
    <SceneFade t={t} a={a} b={b}>
      <OffthreadVideo src={staticFile("hf_kontrol.mp4")} muted />
    </SceneFade>
  );
};
