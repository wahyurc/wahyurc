import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { Carousel, Cover } from "./stills";
import { FPS, H, TOTAL, W } from "./lib";

export const Root: React.FC = () => (
  <>
    <Composition id="RamKecilMenang" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="Carousel" component={Carousel} durationInFrames={1} fps={FPS} width={1080} height={1350} defaultProps={{ index: 1 }} />
  </>
);
