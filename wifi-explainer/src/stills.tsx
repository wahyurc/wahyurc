// Companion images for posting: a 9:16 cover (TikTok / Reels) and a 4:5 Instagram carousel.
// Same 3D clay objects and palette as the video. Each layout uses fixed, non-overlapping bands.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFonts } from "./fonts";
import { C } from "./lib";
import { Stage } from "./three/Stage";
import { Lights } from "./three/parts";
import { BAND24, BAND5, BrickWall, Car, CellTower, Headphones, Microwave, Phone, Pulses, Road, Router, Shelf, Wave } from "./three/wifi";
import { DimBracket, Floor, House, L24, L5, PlanWalls } from "./scenes/scenes";

loadFonts();
const font = "Rubik";
const T = 1.3; // frozen animation time for the stills
const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.05, backgroundImage: "radial-gradient(#000 0.7px, transparent 0.9px)", backgroundSize: "3px 3px" }} />
);
const Halftone: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.35, backgroundImage: "radial-gradient(#e2a27e 1.6px, transparent 2px)", backgroundSize: "10px 10px", WebkitMaskImage: "radial-gradient(ellipse 45% 25% at 0% 100%, #000 0%, transparent 100%), radial-gradient(ellipse 40% 20% at 100% 0%, #000 0%, transparent 100%)" }} />
);
const Chip2: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ children, bg = C.orange, color = "#fff", size = 32 }) => (
  <span style={{ display: "inline-block", padding: "10px 26px", borderRadius: 999, background: bg, color, fontFamily: font, fontWeight: 800, fontSize: size, letterSpacing: 2 }}>{children}</span>
);
const Pill2: React.FC<{ children: React.ReactNode; bg: string; size?: number }> = ({ children, bg, size = 40 }) => (
  <span style={{ display: "inline-block", padding: "12px 28px", borderRadius: 999, background: bg, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: size }}>{children}</span>
);
const B: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => <b style={{ color: c, fontWeight: 800 }}>{children}</b>;

/* ===================== COVER 1080×1920 =====================
   Bands: chip 300 · headline 370–700 · sub 720 · 3D 820–1380 · answer pill 1430 · handle 1560
   (key text stays inside the centre 1080×1440 so the IG grid crop keeps it) */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #fbf4ee 0%, #f6ece3 60%, #efd9c7 100%)" }}>
    <Stage width={1080} height={1920} cam={{ pos: [0, 2.6, 7.2], look: [0, 1.05, 0], fov: 40 }} bg="#f6ece3">
      <Lights dir={[3, 7, 5]} />
      <Floor />
      <Router position={[0, 0, 0]} rotation={[0, -0.35, 0]} scale={0.9} t={T} />
      <Pulses position={[0, 0.08, 0]} t={0.4} color={BAND24} maxR={2.6} speed={0.6} opacity={0.75} />
      <Pulses position={[0, 0.08, 0]} t={1.2} color={BAND5} maxR={1.5} speed={0.6} opacity={0.75} />
    </Stage>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(246,236,227,.97) 0%, rgba(246,236,227,.93) 38%, rgba(246,236,227,0) 46%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}><Chip2>KOK BISA?</Chip2></div>
    <div style={{ position: "absolute", left: 50, right: 50, top: 380, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 132, lineHeight: 0.98, letterSpacing: -4, color: C.ink, textShadow: "0 6px 0 #fff" }}>
      WiFi <span style={{ color: C.coldD }}>5 GHz</span><br />kencang tapi<br /><span style={{ color: C.orange }}>gampang hilang</span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1430, textAlign: "center" }}>
      <span style={{ display: "inline-block", padding: "18px 34px", borderRadius: 28, background: C.ink, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: 52 }}>
        <span style={{ color: C.orangeL }}>2,4 GHz</span> vs <span style={{ color: "#7cc0ff" }}>5 GHz</span>
      </span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: font, fontWeight: 800, fontSize: 34, color: "#8a7a6d" }}>@w4hy03</div>
    <Halftone />
    <Grain />
  </AbsoluteFill>
);

/* ===================== CAROUSEL 1080×1350 =====================
   Bands: chip 70 · title 130–330 · 3D 330–1040 · text card 1060–1250 · footer 1280 */
const SW = 1080, SH = 1350;
const Slide: React.FC<{ n: number; chip: string; title: React.ReactNode; card: React.ReactNode; scene: React.ReactNode; cam: { pos: [number, number, number]; look: [number, number, number] }; chipBg?: string; overlay?: React.ReactNode; floor?: boolean }> = ({ n, chip, title, card, scene, cam, chipBg, overlay, floor = true }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #fbf4ee 0%, #f6ece3 60%, #efd9c7 100%)" }}>
    <Stage width={SW} height={SH} cam={{ ...cam, fov: 40 }} bg="#f6ece3">
      <Lights dir={[3, 8, 5]} />
      {floor && <Floor />}
      {scene}
    </Stage>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(246,236,227,.97) 0%, rgba(246,236,227,.88) 22%, rgba(246,236,227,0) 30%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(246,236,227,.97) 0%, rgba(246,236,227,.85) 20%, rgba(246,236,227,0) 30%)" }} />
    {overlay}
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center" }}><Chip2 bg={chipBg}>{chip}</Chip2></div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 140, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 76, lineHeight: 1.02, letterSpacing: -2, color: C.ink, textShadow: "0 4px 0 #fff" }}>{title}</div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 1060, padding: "22px 30px", borderRadius: 28, background: "rgba(255,250,244,.97)", boxShadow: "0 14px 30px rgba(120,60,20,.15)", fontFamily: "Inter", fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: "#3b322c", textAlign: "center" }}>{card}</div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 1280, display: "flex", justifyContent: "space-between", fontFamily: font, fontWeight: 800, fontSize: 28, color: "#8a7a6d" }}>
      <span>@w4hy03</span><span>{n}/6 {n < 6 ? "→" : ""}</span>
    </div>
    <Halftone />
    <Grain />
  </AbsoluteFill>
);
export const Carousel: React.FC<{ index: number }> = ({ index }) => {
  if (index === 1)
    return (
      <Slide n={1} chip="PERNAH NGALAMIN?" title={<>Pindah kamar, WiFi <span style={{ color: C.coldD }}>5{" "}GHz</span> <span style={{ color: C.orange }}>hilang</span></>}
        cam={{ pos: [0, 4.4, 6.6], look: [0, 0.55, 0] }}
        scene={<>
          <House />
          <Router position={[-0.9, 0.99, -0.82]} scale={0.38} t={T} />
          <Pulses position={[-0.9, 1.05, -0.82]} t={0.7} color={BAND5} maxR={1.3} speed={0.7} />
          <Phone position={[1.1, 0.95, 0.2]} rotation={[-0.25, 0, 0]} scale={0.28} bars={0} warn />
        </>}
        card={<>Katanya <B c={C.coldD}>5 GHz</B> lebih kencang. Tapi kenapa sinyalnya justru <B c={C.orangeD}>hilang</B> begitu pindah ruangan? Geser →</>} />
    );
  if (index === 2)
    return (
      <Slide n={2} chip="LURUSKAN DULU" title={<><span style={{ color: C.coldD }}>5{" "}GHz</span> ≠ <span style={{ color: C.orange }}>5G</span></>}
        cam={{ pos: [0, 1.5, 7.0], look: [0, 0.75, 0] }}
        scene={<>
          <CellTower position={[-0.85, 0, -0.4]} scale={0.5} t={T} />
          <Router position={[0.9, 0, 0.3]} rotation={[0, -0.4, 0]} scale={0.62} t={T} />
        </>}
        card={<><B c={C.orangeD}>5G</B> = generasi ke-5 jaringan seluler di HP. <B c={C.coldD}>5 GHz</B> = frekuensi gelombang radio dari router WiFi. Mirip nama, beda barang.</>} />
    );
  if (index === 3)
    return (
      <Slide n={3} chip="ROUTER DI RUMAH" title={<>Dua jenis <span style={{ color: C.orange }}>gelombang</span></>}
        cam={{ pos: [0.25, 0.75, 7.4], look: [0.25, 0.65, 0] }} floor={false}
        scene={<>
          <Router position={[-1.45, 0.0, 0]} rotation={[0.25, 0.5, 0]} scale={0.34} t={T} />
          <Wave from={-1.25} to={2.1} lambda={L24} amp={0.26} phase={0} color={BAND24} y={1.35} r={0.04} />
          <Wave from={-1.25} to={2.1} lambda={L5} amp={0.18} phase={0} color={BAND5} y={0.25} r={0.035} />
          <DimBracket x0={-1.25 + L24 * 0.25} len={L24} y={1.75} color={BAND24} k={1} />
          <DimBracket x0={-1.25 + L5 * 0.25} len={L5} y={0.57} color={BAND5} k={1} />
        </>}
        overlay={<div style={{ position: "absolute", left: 0, right: 0, top: 930, display: "flex", justifyContent: "center", gap: 18 }}>
          <Pill2 bg={BAND24} size={36}>2,4 GHz ↔ ±12 cm</Pill2><Pill2 bg={BAND5} size={36}>5 GHz ↔ ±6 cm</Pill2>
        </div>}
        card={<>Angka GHz = berapa miliar kali gelombang <B c={C.ink}>bergetar per detik</B>. Makin tinggi frekuensinya, makin <B c={C.orangeD}>pendek</B> gelombangnya.</>} />
    );
  if (index === 4)
    return (
      <Slide n={4} chip="KENAPA 5 GHz KENCANG?" title={<>Soal <span style={{ color: C.orange }}>lebar jalan</span></>}
        cam={{ pos: [0.15, 5.2, 4.4], look: [0.15, 0, -2.6] }}
        scene={<>
          <Road position={[-0.75, 0.01, -3]} lanes={6} width={2.0} length={14} />
          <Road position={[1.25, 0.01, -3]} lanes={2} width={0.75} length={14} />
          <Car position={[-1.5, 0.01, -1.2]} color="#f4ede6" scale={0.9} />
          <Car position={[-0.85, 0.01, -4.2]} color={C.cold} scale={0.9} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <Car key={i} position={[i % 2 ? 1.08 : 1.42, 0.01, -0.6 - i * 1.05]} color={["#f4ede6", C.orangeL, "#d9cdc1"][i % 3]} scale={0.38} />)}
          <group position={[1.25, 0.05, -1.4]} scale={0.42}><Router t={T} /></group>
          <group position={[1.25, 0.12, -2.7]} scale={0.75}><Headphones /></group>
          <group position={[1.25, 0.2, -4.1]} scale={0.5}><Microwave on={1} /></group>
        </>}
        overlay={<div style={{ position: "absolute", left: 60, right: 60, top: 350, display: "flex", justifyContent: "space-between" }}>
          <Pill2 bg={BAND5} size={34}>5 GHz: tol lebar & sepi</Pill2><Pill2 bg={BAND24} size={34}>2,4 GHz: sempit</Pill2>
        </div>}
        card={<><B c={C.coldD}>5 GHz</B> punya jalur lebih banyak & lebar. <B c={C.orangeD}>2,4 GHz</B> dipakai rebutan router tetangga, Bluetooth, bahkan microwave.</>} />
    );
  if (index === 5)
    return (
      <Slide n={5} chip="TAPI ADA HARGANYA" title={<><span style={{ color: C.coldD }}>5{" "}GHz</span> mudah <span style={{ color: C.orange }}>teredam</span></>}
        cam={{ pos: [0.15, 1.2, 7.4], look: [0.15, 0.6, 0] }}
        scene={<>
          <Router position={[-1.55, 0, 0.2]} rotation={[0, 0.6, 0]} scale={0.4} t={T} />
          <Wave from={-1.4} to={2.0} lambda={L24} amp={0.24} phase={0} color={BAND24} y={1.35} ampAt={(x) => (x < 0.25 ? 1 : 0.62)} />
          <Wave from={-1.4} to={2.0} lambda={L5} amp={0.18} phase={0} color={BAND5} y={0.6} ampAt={(x) => (x < 0.25 ? 1 : 0.2)} />
          <BrickWall size={[0.28, 1.9, 1.6]} position={[0.2, 0.95, 0]} />
        </>}
        overlay={<div style={{ position: "absolute", left: 60, right: 60, top: 930, display: "flex", justifyContent: "space-between" }}>
          <Pill2 bg={BAND24} size={32}>2,4 GHz: masih kuat</Pill2><Pill2 bg={BAND5} size={32}>5 GHz: melemah</Pill2>
        </div>}
        card={<>Gelombang pendek lebih mudah diserap <B c={C.ink}>bata & beton</B>, dipantulkan <B c={C.ink}>logam</B>, dan diserap <B c={C.coldD}>air</B> (akuarium). Mirip bass pesta tetangga: yang tembus tembok cuma bass.</>} />
    );
  return (
    <Slide n={6} chip="BIAR WIFI LANCAR" title={<><span style={{ color: C.orange }}>3</span> tips posisi router</>}
      cam={{ pos: [0, 13.0, 4.2], look: [0, 0, 0.6] }}
      scene={<>
        <PlanWalls />
        <Shelf position={[0, 1.04, 0]} scale={0.6} />
        <Router position={[0, 1.1, 0]} scale={0.36} t={T} />
        <Pulses position={[0, 0.1, 0]} t={0.5} color={BAND24} maxR={2.8} speed={0.5} opacity={0.6} />
      </>}
      card={<><B c={C.orangeD}>①</B> tengah rumah, agak tinggi <B c={C.orangeD}>②</B> jauhi logam, cermin, akuarium <B c={C.orangeD}>③</B> rumah besar? mesh<br /><b style={{ fontWeight: 800 }}>💬 Router di rumahmu ditaruh di mana?</b></>} />
  );
};
