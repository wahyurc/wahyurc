import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { loadFonts } from "./fonts";
import { Grain, Vignette, Watermark } from "./fx";
import { S01Desk } from "./scenes/S01Desk";
import { S02Room, S03Learn, S04Pull } from "./scenes/S02to04Room";
import { S05Marker } from "./scenes/S05Marker";
import { S06FlatLay, S07Code, S08Burst } from "./scenes/S06to08";
import { S09Sky, S11Folder, S14End } from "./scenes/S09to14";

loadFonts();

// [component, from, duration] in frames @24fps — mirrors the reference cut list
const CUTS: [React.FC, number, number][] = [
  [S01Desk, 0, 77], //   0.00 – 3.20  desk top-down -> Learn Prompt
  [S02Room, 77, 53], //  3.20 – 5.40  study room, cursor rush
  [S03Learn, 130, 48], // 5.40 – 7.40  "Learn" button click
  [S04Pull, 178, 38], //  7.40 – 9.00  pull back, yellow pencil flash
  [S05Marker, 216, 58], // 9.00 – 11.40 highlighter macro
  [S06FlatLay, 274, 44], // 11.40 – 13.25 flat-lay storyboard
  [S07Code, 318, 54], //  13.25 – 15.50 sticky notes -> 3D "code"
  [S08Burst, 372, 7], //  15.50 – 15.80 halftone burst
  [S09Sky, 379, 65], //   15.80 – 18.50 creator reveal + "One ebook"
  [S11Folder, 444, 40], // 18.50 – 20.15 ring + folder + files
  // 20.15 – 23.60 HyperFrames segment (website UI + kinetic type) – see hf/index.html
  [S14End, 567, 105], // 23.60 – 28.00 end card
];

export const TOTAL = 672;

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: "#f4ece2" }}>
    {CUTS.map(([Comp, from, dur], i) => (
      <Sequence key={i} from={from} durationInFrames={dur} premountFor={10}>
        <Comp />
      </Sequence>
    ))}
    <Sequence from={484} durationInFrames={83}>
      <OffthreadVideo src={staticFile("hf_segment.mp4")} muted />
    </Sequence>
    <Vignette />
    <Grain />
    <Watermark />
    <Audio src={staticFile("soundtrack.wav")} volume={0.9} />
  </AbsoluteFill>
);
