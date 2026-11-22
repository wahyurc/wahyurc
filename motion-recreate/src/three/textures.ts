import * as THREE from "three";
import { C } from "../lib";

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

const cache = new Map<string, THREE.CanvasTexture>();

export const makeTex = (key: string, w: number, h: number, draw: Draw) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
};

export const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

const lines = (g: CanvasRenderingContext2D, x: number, y: number, w: number, n: number, gap: number, color = "#d9d2ca", th = 8) => {
  g.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const lw = w * (0.6 + 0.4 * Math.abs(Math.sin(i * 2.3 + x)));
    rr(g, x, y + i * gap, lw, th, th / 2);
    g.fill();
  }
};

/* ---------- Book cover : "MOTION GRAPHIC WITH CLAUDE" ---------- */
export const coverTex = () =>
  makeTex("cover", 768, 1024, (g, w, h) => {
    g.fillStyle = C.yellow;
    g.fillRect(0, 0, w, h);
    // squiggles / film strips
    g.lineWidth = 16;
    const cols = ["#ff7a2e", "#7bd3c0", "#e94b8a", "#8a5cd1", "#ff9f1c"];
    for (let i = 0; i < 9; i++) {
      g.strokeStyle = cols[i % cols.length];
      g.beginPath();
      g.moveTo(-20, 150 + i * 34);
      for (let x = 0; x <= w + 40; x += 40) g.lineTo(x, 150 + i * 34 + Math.sin(x / 60 + i) * 30);
      g.stroke();
    }
    // film strip
    g.fillStyle = "#3a2a2a";
    g.save();
    g.translate(560, 120);
    g.rotate(-0.5);
    g.fillRect(0, 0, 260, 60);
    g.fillStyle = "#f8e9c8";
    for (let i = 0; i < 8; i++) g.fillRect(10 + i * 32, 8, 18, 10), g.fillRect(10 + i * 32, 42, 18, 10);
    g.restore();
    // robot head
    g.fillStyle = C.purple;
    rr(g, 270, 70, 230, 170, 30);
    g.fill();
    g.fillStyle = "#4b2a78";
    rr(g, 345, 30, 80, 50, 12);
    g.fill();
    g.fillStyle = "#2b1a40";
    g.beginPath(); g.arc(330, 160, 42, 0, 7); g.fill();
    g.beginPath(); g.arc(440, 160, 42, 0, 7); g.fill();
    g.fillStyle = "#f3eaff";
    g.beginPath(); g.arc(330, 160, 22, 0, 7); g.fill();
    g.beginPath(); g.arc(440, 160, 22, 0, 7); g.fill();
    g.fillStyle = "#ffd36b";
    rr(g, 365, 92, 40, 18, 4); g.fill();
    // title
    g.textAlign = "center";
    g.fillStyle = "#fff6e6";
    g.strokeStyle = "#e2500c";
    g.lineWidth = 10;
    g.font = "124px Bungee";
    g.strokeText("MOTION", w / 2, 440); g.fillText("MOTION", w / 2, 440);
    g.font = "112px Bungee";
    g.strokeText("GRAPHIC", w / 2, 560); g.fillText("GRAPHIC", w / 2, 560);
    // bottom red / orange shape
    g.fillStyle = C.orangeD;
    g.beginPath();
    g.moveTo(0, 610);
    g.bezierCurveTo(200, 580, 520, 650, w, 600);
    g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
    g.fillStyle = C.red;
    g.beginPath(); g.arc(80, 980, 140, 0, 7); g.fill();
    g.beginPath(); g.arc(700, 1000, 120, 0, 7); g.fill();
    g.fillStyle = "#fff6e6";
    g.font = "48px Bungee";
    g.fillText("WITH", w / 2, 680);
    g.font = "150px Bungee";
    g.fillText("CLAUDE", w / 2, 840);
    g.font = "34px Bungee";
    g.fillText("W 4 H Y 0 3", w / 2, 950);
  });

/* ---------- ebook pages ---------- */
export const pageTex = (kind: "white" | "orange" | "story" | "chart" | "code", seed = 0) =>
  makeTex("page-" + kind + seed, 512, 704, (g, w, h) => {
    const orange = kind === "orange" || kind === "story";
    g.fillStyle = orange ? C.orange : "#fffdf9";
    g.fillRect(0, 0, w, h);
    g.fillStyle = orange ? "#fff" : C.orange;
    rr(g, 36, 36, 120, 24, 12); g.fill();
    g.fillStyle = orange ? "#fff" : C.ink;
    g.font = "700 38px Rubik";
    const titles: Record<string, string> = {
      white: "Paste to Claude", orange: "Remotion", story: "Storyboard", chart: "Result in the Chat", code: "Folder and files",
    };
    if (kind === "story") {
      g.fillStyle = "#fff"; rr(g, 36, 84, 64, 64, 8); g.fill();
      g.fillStyle = C.orange; g.font = "800 36px Rubik"; g.fillText("13", 46, 130);
      g.fillStyle = "#fff"; g.font = "700 40px Rubik"; g.fillText("Storyboard", 116, 128);
    } else g.fillText(titles[kind], 36, 120);
    lines(g, 36, 160, w - 72, 3, 22, orange ? "rgba(255,255,255,.55)" : "#ddd5cc", 8);
    if (orange) {
      g.fillStyle = "#fff8f0";
      g.beginPath(); g.ellipse(w / 2, 380, 190, 150, 0, 0, 7); g.fill();
      g.strokeStyle = C.orange; g.lineWidth = 6;
      rr(g, 160, 320, 90, 60, 8); g.stroke();
      rr(g, 270, 320, 90, 60, 8); g.stroke();
      g.beginPath(); g.arc(200, 440, 22, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(290, 470); g.lineTo(290, 420); g.lineTo(330, 410); g.lineTo(330, 460); g.stroke();
      lines(g, 36, 580, 200, 3, 26, "rgba(255,255,255,.6)", 7);
      lines(g, 270, 580, 200, 3, 26, "rgba(255,255,255,.6)", 7);
    } else if (kind === "chart") {
      g.fillStyle = "#1d1b22"; rr(g, 60, 240, 300, 150, 14); g.fill();
      g.fillStyle = "#fff"; g.font = "800 40px Rubik"; g.fillText("PELITA", 90, 300);
      lines(g, 90, 330, 220, 2, 22, "#555", 7);
      g.strokeStyle = "#333"; g.lineWidth = 4;
      g.beginPath(); g.arc(120, 520, 40, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(120, 560); g.lineTo(120, 660); g.stroke();
      lines(g, 220, 470, 240, 6, 30);
    } else if (kind === "code") {
      g.fillStyle = "#211d22"; rr(g, 36, 220, w - 72, 260, 14); g.fill();
      lines(g, 60, 250, w - 140, 7, 30, "#ff7a3a", 9);
      lines(g, 36, 520, w - 72, 5, 30);
    } else {
      g.fillStyle = C.orange; rr(g, 36, 240, 140, 30, 6); g.fill();
      g.fillStyle = "#1d1b22"; rr(g, 36, 300, w - 72, 180, 14); g.fill();
      lines(g, 60, 330, w - 140, 4, 34, "#e8e1d8", 9);
      lines(g, 36, 520, w - 72, 5, 30);
    }
  });

/* ---------- orange tag pill : "For beginners / Install to claude" ---------- */
export const tagTex = (title: string, sub: string) =>
  makeTex("tag-" + title + sub, 640, 200, (g, w, h) => {
    g.fillStyle = C.orange;
    rr(g, 0, 0, w, h, 50); g.fill();
    g.fillStyle = "#fff";
    g.font = "700 64px Rubik";
    g.fillText(title, 44, 92);
    g.globalAlpha = 0.85;
    g.font = "500 36px Inter";
    g.fillText(sub, 44, 148);
    g.globalAlpha = 1;
    g.fillStyle = "#ffd29a";
    g.beginPath(); g.arc(w - 80, h / 2, 42, 0, 7); g.fill();
    g.fillStyle = C.orangeD;
    g.beginPath(); g.moveTo(w - 92, 78); g.lineTo(w - 64, 100); g.lineTo(w - 92, 122); g.fill();
  });

/* ---------- white card : "Learn Prompt" ---------- */
export const learnCardTex = () =>
  makeTex("learncard", 900, 300, (g, w, h) => {
    g.fillStyle = "#fffaf6";
    rr(g, 0, 0, w, h, 50); g.fill();
    g.strokeStyle = "#f0e2d6"; g.lineWidth = 6; g.stroke();
    g.fillStyle = C.ink;
    g.font = "700 100px Rubik";
    g.fillText("Learn Prompt", 60, 145);
    g.fillStyle = "#6b625b";
    g.font = "500 52px Inter";
    g.fillText("Copy and paste, no coding", 64, 225);
    g.fillStyle = C.orange;
    g.beginPath(); g.arc(w - 110, 110, 64, 0, 7); g.fill();
    // grad cap
    g.fillStyle = "#fff";
    g.beginPath(); g.moveTo(w - 160, 105); g.lineTo(w - 110, 80); g.lineTo(w - 60, 105); g.lineTo(w - 110, 130); g.closePath(); g.fill();
    g.fillRect(w - 135, 112, 50, 26);
  });

/* ---------- chair : orange with white dot grid ---------- */
export const dotsTex = () =>
  makeTex("dots", 256, 256, (g, w, h) => {
    g.fillStyle = C.orange; g.fillRect(0, 0, w, h);
    g.fillStyle = "#fff1e4";
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      g.beginPath(); g.arc(32 + x * 64, 32 + y * 64, 9, 0, 7); g.fill();
    }
  });

/* ---------- sticky note ---------- */
export const stickyTex = (text: string, color: string) =>
  makeTex("sticky-" + text + color, 400, 300, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(0, 0, w, 24);
    g.fillStyle = "rgba(60,30,10,.75)";
    g.font = "700 54px Caveat";
    text.split("\n").forEach((l, i) => g.fillText(l, 36, 110 + i * 60));
  });

/* ---------- highlighter page "Set Up a three.js Project" ---------- */
export const setupPageTex = () =>
  makeTex("setup", 1600, 1000, (g, w, h) => {
    g.fillStyle = "#fffdf9"; g.fillRect(0, 0, w, h);
    g.fillStyle = C.orange; rr(g, 120, 90, 380, 54, 27); g.fill();
    g.fillStyle = "#fff"; g.font = "700 30px Rubik"; g.fillText("CHAPTER 5 · THREE.JS", 150, 128);
    g.fillStyle = "#8a7f77"; g.font = "800 120px Rubik"; g.fillText("Set Up a three.js Project", 110, 290);
    g.fillStyle = C.orange; g.beginPath(); g.arc(160, 410, 34, 0, 7); g.fill();
    g.fillStyle = "#9b918a"; g.font = "600 78px Rubik"; g.fillText("Ask for a new project", 230, 438);
    lines(g, 120, 520, 1100, 2, 54, "#e8cfc4", 16);
    g.fillStyle = C.orange; g.beginPath(); g.arc(160, 700, 34, 0, 7); g.fill();
    g.fillStyle = "#9b918a"; g.fillText("Ask for a rotating box", 230, 728);
    lines(g, 120, 800, 1100, 3, 54, "#e8cfc4", 16);
  });

export const darkCardTex = () =>
  makeTex("dark", 1000, 700, (g, w, h) => {
    g.fillStyle = "#1e1a1b"; rr(g, 0, 0, w, h, 40); g.fill();
    for (let i = 0; i < 260; i++) {
      g.fillStyle = i % 3 ? "rgba(255,255,255,.18)" : "rgba(255,90,40,.6)";
      g.fillRect((i * 97) % w, (i * 53) % h, 4 + (i % 5) * 6, 4);
    }
    g.fillStyle = "#f4ece2"; g.font = "800 92px Rubik";
    g.fillText("Set up a new three.js", 60, 380);
    g.fillText("scene in one turn", 60, 490);
    g.font = "500 30px Inter"; g.fillStyle = "#aaa";
    g.fillText("Ask Claude to scaffold the project", 60, 140);
  });

/* ---------- folder label ---------- */
export const folderTex = (label: string) =>
  makeTex("folder-" + label, 700, 360, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#ffd36e"); gr.addColorStop(1, "#ffa83a");
    g.fillStyle = gr; rr(g, 0, 0, w, h, 26); g.fill();
    g.fillStyle = "rgba(255,255,255,.18)";
    for (let y = 0; y < h; y += 10) for (let x = (y / 10) % 2 ? 5 : 0; x < w; x += 10) g.fillRect(x, y, 3, 3);
    g.fillStyle = C.orangeD; g.font = "italic 900 72px Rubik";
    g.save(); g.translate(60, 230); g.rotate(-0.06); g.fillText(label, 0, 0); g.restore();
  });

export const fileTex = (ext: string) =>
  makeTex("file-" + ext, 500, 360, (g, w, h) => {
    g.fillStyle = "#fffaf4"; rr(g, 0, 0, w, h, 24); g.fill();
    g.fillStyle = C.ink; g.font = "600 64px Inter"; g.fillText(ext, 40, 100);
    lines(g, 40, 160, w - 80, 4, 40, "#eee6dc", 12);
  });

/* ---------- generic soft round sprite ---------- */
export const dotSprite = () =>
  makeTex("sprite", 64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  });

export const cloudTex = () =>
  makeTex("cloud", 512, 256, (g) => {
    g.fillStyle = "#fffaf6";
    g.filter = "blur(4px)";
    [[120, 170, 70], [200, 130, 90], [300, 120, 80], [380, 160, 70], [250, 180, 80], [160, 190, 60], [430, 190, 50]].forEach(([x, y, r]) => {
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    });
  });
