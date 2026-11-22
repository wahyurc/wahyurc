# Motion Graphic Recreate (Three.js + Remotion + HyperFrames)

28 s, 1920×1080, 24 fps. Watermark `@w4hy03` kecil di bawah tengah pada setiap frame.

- `ANALYSIS.md` — analisis frame-by-frame video referensi (14 scene).
- `src/` — Remotion composition `MotionGraphic`; scene 3D dibuat dengan Three.js via `@remotion/three`.
- `hf/` — HyperFrames composition (20.15–23.60 s: UI website + kinetic typography), di-render ke `public/hf_segment.mp4` lalu ditanam ke Remotion.
- `scripts/soundtrack.py` — soundtrack orisinal (sintetis).

```bash
npm install
python3 scripts/soundtrack.py public/soundtrack.wav
(cd hf && npx hyperframes render --fps 24 -o ../public/hf_segment.mp4)
npx remotion render src/index.ts MotionGraphic out/motion_graphic_recreate.mp4
```
`remotion.config.ts` menunjuk ke Chromium headless lokal dengan GL `angle`; sesuaikan path di mesin lain.
