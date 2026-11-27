import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, H, TOTAL, W } from "./lib";

export const Root: React.FC = () => (
  <Composition id="WifiExplainer" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
