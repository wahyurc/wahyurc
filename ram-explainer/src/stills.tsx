// Companion images for posting: a 9:16 cover (TikTok / Reels) and a 4:5 Instagram carousel.
// Same 3D clay look and palette as the video. Each layout uses fixed, non-overlapping bands.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFonts } from "./fonts";
import { C } from "./lib";
import { Stage } from "./three/Stage";
import { Lights } from "./three/parts";
import { Building, Chip, Laptop, MemChip, PCB, SoC } from "./three/hw";

loadFonts();
const font = "Rubik";
const Floor: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
    <planeGeometry args={[40, 40]} />
    <meshStandardMaterial color="#f1dfd0" />
  </mesh>
);
const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.05, backgroundImage: "radial-gradient(#000 0.7px, transparent 0.9px)", backgroundSize: "3px 3px" }} />
);
const Halftone: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.35, backgroundImage: "radial-gradient(#e2a27e 1.6px, transparent 2px)", backgroundSize: "10px 10px", WebkitMaskImage: "radial-gradient(ellipse 45% 25% at 0% 100%, #000 0%, transparent 100%), radial-gradient(ellipse 40% 20% at 100% 0%, #000 0%, transparent 100%)" }} />
);
const Chip2: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ children, bg = C.orange, color = "#fff", size = 32 }) => (
  <span style={{ display: "inline-block", padding: "10px 26px", borderRadius: 999, background: bg, color, fontFamily: font, fontWeight: 800, fontSize: size, letterSpacing: 2 }}>{children}</span>
);

/* ===================== COVER 1080×1920 =====================
   Bands: chip 300 · headline 370–760 · 3D 700–1350 · answer pill 1390–1500 · handle 1560
   (all key text stays inside the centre 1080×1440 so the IG grid crop keeps it) */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #fbf4ee 0%, #f6ece3 60%, #efd9c7 100%)" }}>
    <Stage width={1080} height={1920} cam={{ pos: [0.1, 6.0, 9.6], look: [0.05, 1.25, -0.1], fov: 40 }} bg="#f6ece3">
      <Lights dir={[3, 7, 5]} />
      <Floor />
      <Laptop position={[-0.85, 0, 0.95]} rotation={[0, 0.18, 0]} scale={0.66} body="#8e9095" lid="#85878c" screen="#262220" progress={1} barColor={C.cold} />
      <Laptop position={[0.9, 0, -1.25]} rotation={[0, -0.18, 0]} scale={0.66} body="#3a3330" lid="#2f2927" rgb t={1.3} screen="#1d1917" progress={0.42} barColor={C.orange} />
    </Stage>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(246,236,227,.97) 0%, rgba(246,236,227,.92) 38%, rgba(246,236,227,0) 44%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}><Chip2>KOK BISA?</Chip2></div>
    <div style={{ position: "absolute", left: 50, right: 50, top: 380, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: -4, color: C.ink, textShadow: "0 6px 0 #fff" }}>
      <span style={{ color: C.orange }}>16 GB</span> &gt;<br />32 GB<span style={{ color: C.orange }}>?</span>
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 700, textAlign: "center", fontFamily: font, fontWeight: 800, fontSize: 44, color: "#6d5a4d" }}>MacBook vs laptop gaming</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1470, textAlign: "center" }}>
      <span style={{ display: "inline-block", padding: "18px 34px", borderRadius: 28, background: C.ink, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: 54 }}>
        Rahasianya: <span style={{ color: C.orangeL }}>SoC</span> + <span style={{ color: C.yellow }}>NPU</span>
      </span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", fontFamily: font, fontWeight: 800, fontSize: 34, color: "#8a7a6d" }}>@w4hy03</div>
    <Halftone />
    <Grain />
  </AbsoluteFill>
);

/* ===================== CAROUSEL 1080×1350 =====================
   Bands: chip 70 · title 130–330 · 3D 330–1040 · text card 1060–1250 · footer 1280 */
const SW = 1080, SH = 1350;
const Slide: React.FC<{ n: number; chip: string; title: React.ReactNode; card: React.ReactNode; scene: React.ReactNode; cam: { pos: [number, number, number]; look: [number, number, number] }; chipBg?: string }> = ({ n, chip, title, card, scene, cam, chipBg }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #fbf4ee 0%, #f6ece3 60%, #efd9c7 100%)" }}>
    <Stage width={SW} height={SH} cam={{ ...cam, fov: 40 }} bg="#f6ece3">
      <Lights dir={[3, 8, 5]} />
      <Floor />
      {scene}
    </Stage>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(246,236,227,.97) 0%, rgba(246,236,227,.88) 22%, rgba(246,236,227,0) 30%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(246,236,227,.97) 0%, rgba(246,236,227,.85) 20%, rgba(246,236,227,0) 30%)" }} />
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

const B: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => <b style={{ color: c, fontWeight: 800 }}>{children}</b>;

export const Carousel: React.FC<{ index: number }> = ({ index }) => {
  if (index === 1)
    return (
      <Slide n={1} chip="KOK BISA?" title={<><span style={{ color: C.orange }}>16{"\u00a0"}GB</span> lebih cepat dari <span style={{ color: C.orange }}>32{"\u00a0"}GB</span>?</>}
        cam={{ pos: [0.1, 6.4, 9.0], look: [0.05, 0.5, -0.1] }}
        scene={<>
          <Laptop position={[-0.85, 0, 0.95]} rotation={[0, 0.18, 0]} scale={0.66} body="#8e9095" lid="#85878c" screen="#262220" progress={1} barColor={C.cold} />
          <Laptop position={[0.9, 0, -1.25]} rotation={[0, -0.18, 0]} scale={0.66} body="#3a3330" lid="#2f2927" rgb t={1.3} screen="#1d1917" progress={0.42} barColor={C.orange} />
        </>}
        card={<>Untuk <B c={C.orangeD}>AI lokal</B>, jawabannya bukan soal <B c={C.ink}>besar RAM</B> — tapi <B c={C.coldD}>siapa yang bisa memakainya</B>. Geser →</>} />
    );
  if (index === 2)
    return (
      <Slide n={2} chip="LAPTOP GAMING" title={<>Kantor <span style={{ color: C.orange }}>beda gedung</span></>}
        cam={{ pos: [0.6, 8.2, 8.2], look: [0.2, 0, 0.2] }}
        scene={<group position={[0, 0, -0.4]}>
          <PCB size={[7.5, 10]} position={[0, -0.04, 0.6]} />
          <Chip title="CPU" sub="prosesor" size={1.25} position={[-1.7, 0.04, -2.3]} />
          <Building w={0.95} d={0.95} h={1.7} lit="#ffb56b" position={[-1.7, 0.19, -2.3]} />
          <Chip title="GPU" sub="kartu grafis" size={1.2} position={[1.7, 0.04, -1.4]} />
          <Building w={0.9} d={0.9} h={1.3} lit="#9fd2ff" position={[1.7, 0.19, -1.4]} />
          {[[0.75, -2.35], [2.65, -2.35], [0.75, -0.45], [2.65, -0.45]].map(([x, z], i) => <MemChip key={i} position={[x, 0.04, z]} w={0.62} d={0.46} label="VRAM" />)}
        </group>}
        card={<>GPU cuma punya <B c={C.coldD}>VRAM 8 GB</B>. RAM 32 GB ada di tempat lain — data harus <B c={C.orangeD}>disalin</B> lewat jalur <B c={C.ink}>PCIe</B> yang sempit.</>} />
    );
  if (index === 3)
    return (
      <Slide n={3} chip="APPLE SILICON" title={<>Satu chip = <span style={{ color: C.orange }}>SoC</span></>}
        cam={{ pos: [0.3, 6.0, 4.4], look: [0.1, 0, 0.1] }}
        scene={<SoC memK={1} glowK={0.4} />}
        card={<><B c={C.ink}>System on a Chip</B>: CPU, GPU & NPU dalam satu chip. Memorinya di <B c={C.coldD}>paket yang sama</B> — dipakai bersama, <B c={C.orangeD}>tanpa salin</B>.</>} />
    );
  if (index === 4)
    return (
      <Slide n={4} chip="ANGGOTA BARU" chipBg={C.yellow} title={<><span style={{ color: C.orangeD }}>NPU</span> = prosesor khusus AI</>}
        cam={{ pos: [-0.7, 3.4, 3.2], look: [-0.85, 0.1, 0.3] }}
        scene={<>
          <SoC memK={1} glowK={0.2} />
          <mesh position={[-1.025, 0.175, 0.45]}>
            <boxGeometry args={[0.52, 0.03, 0.2]} />
            <meshStandardMaterial color={C.yellow} emissive={C.yellow} emissiveIntensity={0.5} transparent opacity={0.35} />
          </mesh>
        </>}
        card={<>Kenali wajah, bersihkan suara, ubah ucapan jadi teks — <B c={C.orangeD}>lebih hemat daya</B>. Di Mac namanya <B c={C.ink}>Neural Engine</B> (M5: 16 inti).</>} />
    );
  if (index === 5)
    return (
      <Slide n={5} chip="ADIL & JUJUR" title={<>Main game? <span style={{ color: C.orange }}>Laptop gaming</span> juaranya</>}
        cam={{ pos: [0.1, 6.4, 9.0], look: [0.4, -0.4, -1.2] }}
        scene={<Laptop position={[0.4, 0, -1.0]} rotation={[0, -0.12, 0]} scale={0.9} body="#3a3330" lid="#2f2927" rgb t={2.1} screen="#1d1917" progress={1} barColor={C.orange} />}
        card={<>VRAM laptop gaming <B c={C.orangeD}>±384 GB/s</B> vs memori terpadu M5 <B c={C.coldD}>153 GB/s</B>. Windows baru (Intel, AMD, Snapdragon) juga sudah punya <B c={C.ink}>NPU</B>.</>} />
    );
  return (
    <Slide n={6} chip="GIMANA DENGAN KAMU?" title={<>Laptopmu sudah punya <span style={{ color: C.orange }}>NPU</span>?</>}
      cam={{ pos: [0, 5.6, 5.4], look: [0, 0, 0] }}
      scene={<group rotation={[0, 0.5, 0]} scale={0.85}><SoC memK={1} glowK={0.6} /></group>}
      card={<><span style={{ fontSize: 44 }}>💬</span> Jawab di komentar · <span style={{ color: C.red }}>♥</span> Like kalau baru tahu · <B c={C.orangeD}>Follow</B> buat penjelasan berikutnya</>} />
  );
};
