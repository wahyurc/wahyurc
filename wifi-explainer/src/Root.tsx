import React from "react";
import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { FPS, H, TOTAL, W } from "./lib";
import { Carousel, Cover } from "./stills";

export const Root: React.FC = () => (
  <>
    <Composition id="WifiExplainer" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
    {[1, 2, 3, 4, 5, 6].map((i) => <Still key={i} id={`Carousel${i}`} component={Carousel} defaultProps={{ index: i }} width={1080} height={1350} />)}
  </>
);
