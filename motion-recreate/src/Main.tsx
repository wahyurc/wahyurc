import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { loadFonts } from "./fonts";
import { TimeScale } from "./lib";
import { Grain, Vignette, Watermark } from "./fx";
import { S01Desk } from "./scenes/S01Desk";
import { S02Room, S03Learn, S04Pull } from "./scenes/S02to04Room";
import { S05Marker } from "./scenes/S05Marker";
import { S06FlatLay, S07Code, S08Burst } from "./scenes/S06to08";
import { S09Sky, S11Folder, S14End } from "./scenes/S09to14";

loadFonts();

// [component, from, duration, designedDuration] in frames @24fps.
// Every cut sits on the music's beat grid (120 BPM = 12 frames per beat, bar = 48 frames);
// scenes are time-stretched (designed / actual) so their animation still fills the slot.
const CUTS: [React.FC, number, number, number][] = [
  [S01Desk, 0, 72, 77], //     0.00 – 3.00  desk top-down -> Learn Prompt
  [S02Room, 72, 60, 53], //    3.00 – 5.50  study room, cursor rush
  [S03Learn, 132, 48, 48], //  5.50 – 7.50  "Learn" button click (click on beat at 6.50)
  [S04Pull, 180, 36, 38], //   7.50 – 9.00  pull back, yellow pencil flash
  [S05Marker, 216, 60, 58], // 9.00 – 11.50 highlighter macro
  [S06FlatLay, 276, 48, 44], // 11.50 – 13.50 flat-lay storyboard
  [S07Code, 324, 48, 54], //   13.50 – 15.50 sticky notes -> 3D "code"
  [S08Burst, 372, 6, 7], //    15.50 – 15.75 halftone burst
  [S09Sky, 378, 66, 65], //    15.75 – 18.50 creator reveal + "One ebook"
  [S11Folder, 444, 36, 40], // 18.50 – 20.00 ring + folder + files
  // 20.00 – 26.00 HyperFrames segment (website UI + kinetic type) – see hf/index.html
  [S14End, 624, 108, 108], //  26.00 – 30.50 end card
];

export const TOTAL = 732;

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: "#f4ece2" }}>
    {CUTS.map(([Comp, from, dur, designed], i) => (
      <Sequence key={i} from={from} durationInFrames={dur} premountFor={10} layout="absolute-fill">
        <TimeScale.Provider value={designed / dur}>
          <Comp />
        </TimeScale.Provider>
      </Sequence>
    ))}
    <Sequence from={480} durationInFrames={144}>
      <OffthreadVideo src={staticFile("hf_segment.mp4")} muted />
    </Sequence>
    <Vignette />
    <Grain />
    <Watermark />
    <Audio src={staticFile("soundtrack.wav")} />
  </AbsoluteFill>
);
