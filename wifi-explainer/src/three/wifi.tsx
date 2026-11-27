// Detailed, clay-styled 3D objects for the WiFi explainer (procedural, no brand logos)
import React, { useMemo } from "react";
import * as THREE from "three";
import { C, rand } from "../lib";
import { RBox, roundedBoxGeo } from "./parts";
import { canvasTex } from "./hw";

type V3 = [number, number, number];
type P = { position?: V3; rotation?: V3; scale?: number | V3 };

export const BAND24 = C.orange; // 2.4 GHz colour
export const BAND5 = C.coldD; // 5 GHz colour

/* =================== ROUTER ===================
   body 1.6 × 0.32 × 1.0 · top vent slots · front LED row · 4 hinged antennas · rear ports · feet */
export const Router: React.FC<P & { leds?: number; antennaTilt?: number; t?: number }> = ({ leds = 1, antennaTilt = 0.12, t = 0, ...p }) => {
  const ledCols = [C.cold, "#3aa56b", BAND24, BAND5];
  return (
    <group {...p}>
      {/* body */}
      <RBox size={[1.6, 0.3, 1.0]} r={0.1} color="#f4ede6" position={[0, 0.2, 0]} rough={0.45} />
      {/* top: darker inset panel with vent slots */}
      <RBox size={[1.3, 0.03, 0.62]} r={0.03} color="#e2d6ca" position={[0, 0.355, -0.05]} />
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[-0.5 + i * 0.1, 0.372, -0.05]}>
          <boxGeometry args={[0.04, 0.012, 0.48]} />
          <meshStandardMaterial color="#b9ab9e" />
        </mesh>
      ))}
      {/* front LED strip */}
      <mesh position={[0, 0.2, 0.505]}>
        <boxGeometry args={[0.9, 0.06, 0.01]} />
        <meshStandardMaterial color="#2c2624" />
      </mesh>
      {ledCols.map((c, i) => {
        const on = leds > 0 ? 0.55 + 0.45 * Math.max(0, Math.sin(t * (3 + i) + i)) : 0;
        return (
          <mesh key={i} position={[-0.3 + i * 0.2, 0.2, 0.512]}>
            <circleGeometry args={[0.022, 16]} />
            <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(0.35 + 0.65 * on)} />
          </mesh>
        );
      })}
      {/* rear ports: 1 WAN (yellow) + 3 LAN */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.36 + i * 0.24, 0.17, -0.505]}>
          <boxGeometry args={[0.15, 0.1, 0.02]} />
          <meshStandardMaterial color={i === 0 ? C.yellow : "#2c2624"} />
        </mesh>
      ))}
      {/* feet */}
      {[[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.035, z]}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
          <meshStandardMaterial color="#8c8079" />
        </mesh>
      ))}
      {/* 4 antennas on the back edge with hinge knuckles */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <group key={i} position={[x, 0.33, -0.45]} rotation={[-antennaTilt, 0, (i - 1.5) * 0.12]}>
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color="#d9cdc1" />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 0.8, 16]} />
            <meshStandardMaterial color="#efe6dd" />
          </mesh>
          <mesh position={[0, 0.83, 0]}>
            <sphereGeometry args={[0.036, 14, 14]} />
            <meshStandardMaterial color="#efe6dd" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* =================== SMARTPHONE (with WiFi indicator built from arcs) =================== */
const arcGeo = (r: number) => new THREE.RingGeometry(r - 0.035, r, 32, 1, Math.PI / 4, Math.PI / 2);
const ARCS = [arcGeo(0.12), arcGeo(0.21), arcGeo(0.3)];
export const Phone: React.FC<P & { bars?: number; label?: string; screen?: string; warn?: boolean }> = ({ bars = 3, label, screen = "#1f1b19", warn = false, ...p }) => (
  <group {...p}>
    <mesh geometry={roundedBoxGeo(0.9, 1.8, 0.09, 0.12)} castShadow>
      <meshStandardMaterial color="#3b3431" roughness={0.35} />
    </mesh>
    <mesh position={[0, 0, 0.047]}>
      <planeGeometry args={[0.8, 1.68]} />
      <meshBasicMaterial color={screen} />
    </mesh>
    {/* punch-hole camera */}
    <mesh position={[0, 0.76, 0.048]}>
      <circleGeometry args={[0.025, 16]} />
      <meshBasicMaterial color="#0d0b0a" />
    </mesh>
    {/* side buttons */}
    <mesh position={[0.455, 0.35, 0]}><boxGeometry args={[0.02, 0.22, 0.04]} /><meshStandardMaterial color="#2a2422" /></mesh>
    <mesh position={[0.455, 0.05, 0]}><boxGeometry args={[0.02, 0.12, 0.04]} /><meshStandardMaterial color="#2a2422" /></mesh>
    {/* WiFi indicator: dot + 3 arcs; arcs light up to `bars` */}
    <group position={[0, -0.05, 0.05]}>
      <mesh position={[0, 0.0, 0]}><circleGeometry args={[0.035, 16]} /><meshBasicMaterial color={bars > 0 ? "#fffaf4" : "#5a504a"} /></mesh>
      {ARCS.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, 0.0, 0]}>
          <meshBasicMaterial color={i < bars ? "#fffaf4" : "#5a504a"} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {warn && (
        <mesh position={[0.3, 0.05, 0.001]}>
          <circleGeometry args={[0.07, 20]} />
          <meshBasicMaterial color={C.red} />
        </mesh>
      )}
    </group>
    {label && (
      <mesh position={[0, -0.55, 0.049]}>
        <planeGeometry args={[0.6, 0.16]} />
        <meshBasicMaterial map={canvasTex("ph" + label, 256, 64, (g) => { g.fillStyle = "#1f1b19"; g.fillRect(0, 0, 256, 64); g.fillStyle = "#fffaf4"; g.font = "800 44px Inter"; g.textAlign = "center"; g.fillText(label, 128, 48); })} />
      </mesh>
    )}
  </group>
);

/* =================== CELL TOWER (lattice mast, panel antennas, beacon) =================== */
export const CellTower: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => {
  const H = 4.2, base = 0.7, top = 0.18;
  const half = (y: number) => base + (top - base) * (y / H);
  const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const steel = <meshStandardMaterial color="#b9b2ab" metalness={0.5} roughness={0.35} />;
  return (
    <group {...p}>
      {/* tapered legs */}
      {legs.map(([sx, sz], i) => {
        const a = new THREE.Vector3(sx * base, 0, sz * base), b = new THREE.Vector3(sx * top, H, sz * top);
        const mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        return <mesh key={i} position={mid} quaternion={q}><cylinderGeometry args={[0.035, 0.05, len, 10]} />{steel}</mesh>;
      })}
      {/* horizontal rings + X braces every 0.6 */}
      {Array.from({ length: 7 }).map((_, k) => {
        const y = 0.3 + k * 0.6, h = half(y), y2 = Math.min(H, y + 0.6), h2 = half(y2);
        return (
          <group key={k}>
            {[0, 1, 2, 3].map((side) => (
              <mesh key={side} position={[side === 1 ? h : side === 3 ? -h : 0, y, side === 0 ? -h : side === 2 ? h : 0]} rotation={[0, side % 2 ? Math.PI / 2 : 0, 0]}>
                <boxGeometry args={[h * 2, 0.025, 0.025]} />{steel}
              </mesh>
            ))}
            {k < 6 && [0, 1, 2, 3].map((side) => {
              const ang = Math.atan2(0.6, h + h2);
              return [1, -1].map((d) => (
                <mesh key={side + "" + d} position={[side === 1 ? (h + h2) / 2 : side === 3 ? -(h + h2) / 2 : 0, y + 0.3, side === 0 ? -(h + h2) / 2 : side === 2 ? (h + h2) / 2 : 0]} rotation={[0, side % 2 ? Math.PI / 2 : 0, d * ang]}>
                  <boxGeometry args={[Math.hypot(h + h2, 0.6), 0.018, 0.018]} />{steel}
                </mesh>
              ));
            })}
          </group>
        );
      })}
      {/* platform + three panel antennas */}
      <mesh position={[0, H, 0]}><cylinderGeometry args={[0.5, 0.5, 0.05, 24]} /><meshStandardMaterial color="#9d968f" metalness={0.4} /></mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <group key={i} position={[Math.sin(a) * 0.42, H + 0.45, Math.cos(a) * 0.42]} rotation={[0, a, 0]}>
            <RBox size={[0.22, 0.85, 0.08]} r={0.03} color="#f4ede6" />
          </group>
        );
      })}
      <mesh position={[0, H + 0.95, 0]}><cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />{steel}</mesh>
      <mesh position={[0, H + 1.12, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color={Math.sin(t * 5) > 0 ? C.red : "#7a2a1f"} /></mesh>
    </group>
  );
};

/* =================== TRAVELLING WAVE (tube along a sine, rebuilt per frame) ===================
   wavelength in scene units; amplitude can vary along x (attenuation after walls) */
export const Wave: React.FC<{ from: number; to: number; lambda: number; amp: number; phase: number; color: string; y?: number; z?: number; r?: number; ampAt?: (x: number) => number; opacity?: number }> = ({
  from, to, lambda, amp, phase, color, y = 0, z = 0, r = 0.035, ampAt, opacity = 1,
}) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const n = Math.max(40, Math.round(((to - from) / lambda) * 40));
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      const a = amp * (ampAt ? ampAt(x) : 1);
      pts.push(new THREE.Vector3(x, y + a * Math.sin(((x - from) / lambda) * Math.PI * 2 - phase), z));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, r, 8, false);
  }, [from, to, lambda, amp, phase, y, z, r, ampAt]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
};

/** expanding ring pulses (top-down coverage), e.g. router broadcasting */
export const Pulses: React.FC<P & { t: number; color: string; maxR: number; speed?: number; count?: number; opacity?: number }> = ({ t, color, maxR, speed = 0.6, count = 3, opacity = 0.7, ...p }) => (
  <group {...p}>
    {Array.from({ length: count }).map((_, i) => {
      const k = ((t * speed + i / count) % 1);
      return (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} scale={0.05 + k * maxR}>
          <ringGeometry args={[0.96, 1, 64]} />
          <meshBasicMaterial color={color} transparent opacity={opacity * (1 - k)} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

/* =================== WALLS & OBSTACLES =================== */
const brickTex = () => canvasTex("brick", 512, 512, (g, w, h) => {
  g.fillStyle = "#e9d8c8"; g.fillRect(0, 0, w, h);
  const bw = 96, bh = 40;
  for (let r = 0; r < h / bh + 1; r++) for (let c = -1; c < w / bw + 1; c++) {
    const x = c * bw + (r % 2 ? bw / 2 : 0), y = r * bh;
    g.fillStyle = ["#c9673f", "#d17447", "#bf5f39", "#cc6e44"][(r * 7 + c * 3 + 20) % 4];
    g.fillRect(x + 4, y + 4, bw - 8, bh - 8);
  }
});
export const BrickWall: React.FC<P & { size: V3 }> = ({ size, ...p }) => {
  const t = brickTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(size[2] / 0.9, size[1] / 0.9);
  return (
    <group {...p}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial map={t} roughness={0.85} />
      </mesh>
    </group>
  );
};
export const ConcreteWall: React.FC<P & { size: V3 }> = ({ size, ...p }) => (
  <group {...p}>
    <RBox size={size} r={0.02} color="#c9c2ba" rough={0.95} />
    {Array.from({ length: 30 }).map((_, i) => (
      <mesh key={i} position={[size[0] / 2 + 0.001, (rand(i) - 0.5) * size[1] * 0.9, (rand(i + 3) - 0.5) * size[2] * 0.9]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.02 + rand(i + 7) * 0.03, 10]} />
        <meshStandardMaterial color="#a9a199" />
      </mesh>
    ))}
  </group>
);
export const MetalPlate: React.FC<P & { size: V3 }> = ({ size, ...p }) => (
  <group {...p}>
    <mesh castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#c3c7cc" metalness={0.85} roughness={0.25} />
    </mesh>
    {[-1, 1].map((sy) => [-1, 1].map((sz) => (
      <mesh key={sy + "" + sz} position={[size[0] / 2 + 0.005, sy * size[1] * 0.42, sz * size[2] * 0.42]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        <meshStandardMaterial color="#8f949a" metalness={0.8} />
      </mesh>
    )))}
  </group>
);
export const Aquarium: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <group {...p}>
    {/* glass */}
    <mesh>
      <boxGeometry args={[0.7, 1.0, 1.3]} />
      <meshPhysicalMaterial color="#dff1ff" transparent opacity={0.25} roughness={0.05} clearcoat={1} depthWrite={false} />
    </mesh>
    {/* water */}
    <mesh position={[0, -0.06, 0]}>
      <boxGeometry args={[0.66, 0.84, 1.26]} />
      <meshStandardMaterial color="#5fb8ff" transparent opacity={0.45} depthWrite={false} />
    </mesh>
    {/* gravel + plant + fish */}
    <mesh position={[0, -0.45, 0]}><boxGeometry args={[0.66, 0.08, 1.26]} /><meshStandardMaterial color="#d9b48c" /></mesh>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0, -0.2, -0.4 + i * 0.12]} rotation={[0.1 * i, 0, 0.15 * (i - 1)]}><coneGeometry args={[0.04, 0.45, 8]} /><meshStandardMaterial color="#6fae6a" /></mesh>
    ))}
    {[0, 1].map((i) => (
      <group key={i} position={[0, 0.05 + i * 0.18, Math.sin(t * 0.8 + i * 2) * 0.4]} rotation={[0, Math.cos(t * 0.8 + i * 2) > 0 ? 0 : Math.PI, 0]}>
        <mesh scale={[0.6, 0.6, 1]}><sphereGeometry args={[0.08, 14, 14]} /><meshStandardMaterial color={C.orange} /></mesh>
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.05, 0.07, 3]} /><meshStandardMaterial color={C.orangeL} /></mesh>
      </group>
    ))}
    {/* frame */}
    {[0.5, -0.5].map((y) => (
      <mesh key={y} position={[0, y, 0]}><boxGeometry args={[0.74, 0.04, 1.34]} /><meshStandardMaterial color="#3b3431" /></mesh>
    ))}
  </group>
);
export const Mirror: React.FC<P> = (p) => (
  <group {...p}>
    <RBox size={[0.06, 1.3, 0.8]} r={0.02} color="#c99a6b" />
    <mesh position={[0.032, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.7, 1.2]} />
      <meshStandardMaterial color="#e8f2f8" metalness={0.9} roughness={0.05} />
    </mesh>
  </group>
);

/* =================== ROADS & TRAFFIC =================== */
const roadTex = (lanes: number) => canvasTex("road" + lanes, 512, 1024, (g, w, h) => {
  g.fillStyle = "#4a4340"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#f4ede6"; g.fillRect(10, 0, 10, h); g.fillRect(w - 20, 0, 10, h);
  for (let l = 1; l < lanes; l++) {
    const x = (w / lanes) * l - 4;
    for (let y = 0; y < h; y += 90) { g.fillStyle = C.yellow; g.fillRect(x, y, 8, 50); }
  }
});
export const Road: React.FC<P & { lanes: number; width: number; length: number }> = ({ lanes, width, length, ...p }) => {
  const t = roadTex(lanes); t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, length / 3);
  return (
    <group {...p}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial map={t} roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (width / 2 + 0.08), 0.06, 0]}><boxGeometry args={[0.16, 0.12, length]} /><meshStandardMaterial color="#e4d8cc" /></mesh>
      ))}
    </group>
  );
};
export const Car: React.FC<P & { color?: string }> = ({ color = C.cold, ...p }) => (
  <group {...p}>
    <RBox size={[0.42, 0.16, 0.8]} r={0.05} color={color} position={[0, 0.14, 0]} rough={0.35} />
    <RBox size={[0.36, 0.13, 0.42]} r={0.05} color="#e9f2f8" position={[0, 0.27, -0.03]} rough={0.2} />
    {[[-0.2, -0.25], [0.2, -0.25], [-0.2, 0.25], [0.2, 0.25]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.07, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 0.06, 16]} /><meshStandardMaterial color="#2a2422" /></mesh>
    ))}
    <mesh position={[0, 0.15, 0.405]}><boxGeometry args={[0.3, 0.04, 0.01]} /><meshBasicMaterial color="#fff6d8" /></mesh>
  </group>
);

/* =================== HOUSEHOLD DEVICES =================== */
export const Microwave: React.FC<P & { on?: number }> = ({ on = 1, ...p }) => (
  <group {...p}>
    <RBox size={[1.1, 0.62, 0.7]} r={0.05} color="#f1ebe5" />
    {/* door window */}
    <mesh position={[-0.12, 0, 0.352]}><planeGeometry args={[0.7, 0.44]} /><meshStandardMaterial color="#2c2624" /></mesh>
    <mesh position={[-0.12, 0, 0.353]}><planeGeometry args={[0.62, 0.36]} /><meshBasicMaterial color={new THREE.Color("#ffcf8a").multiplyScalar(0.3 + 0.7 * on)} /></mesh>
    {/* handle + control panel + display */}
    <mesh position={[0.27, 0, 0.37]}><boxGeometry args={[0.03, 0.38, 0.04]} /><meshStandardMaterial color="#cfc4b9" /></mesh>
    <mesh position={[0.43, 0, 0.352]}><planeGeometry args={[0.18, 0.5]} /><meshStandardMaterial color="#e2d6ca" /></mesh>
    <mesh position={[0.43, 0.17, 0.355]}><planeGeometry args={[0.14, 0.07]} /><meshBasicMaterial color="#1f2a1f" /></mesh>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0.43, 0.04 - i * 0.1, 0.36]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.02, 14]} /><meshStandardMaterial color="#8c8079" /></mesh>
    ))}
  </group>
);
export const Headphones: React.FC<P> = (p) => (
  <group {...p}>
    <mesh position={[0, 0.25, 0]}><torusGeometry args={[0.3, 0.04, 12, 40, Math.PI]} /><meshStandardMaterial color="#3b3431" /></mesh>
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 0.3, 0.22, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.13, 0.1, 24]} /><meshStandardMaterial color={C.orange} /></mesh>
        <mesh position={[-s * 0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.02, 24]} /><meshStandardMaterial color="#2c2624" /></mesh>
      </group>
    ))}
  </group>
);
export const Speaker: React.FC<P & { pump?: number }> = ({ pump = 0, ...p }) => (
  <group {...p}>
    <RBox size={[0.9, 1.4, 0.7]} r={0.05} color="#3b3431" />
    {[[0.25, 0.32, 0.12], [-0.3, 0.16, 0.05]].map(([y, r, d], i) => (
      <group key={i} position={[0, y, 0.352]} scale={1 + (i === 0 ? pump * 0.06 : 0)}>
        <mesh><circleGeometry args={[r, 40]} /><meshStandardMaterial color="#2a2422" /></mesh>
        <mesh position={[0, 0, 0.005 + d * 0.1]}><circleGeometry args={[r * 0.75, 40]} /><meshStandardMaterial color="#5a514c" /></mesh>
        <mesh position={[0, 0, 0.01 + d * 0.2]}><circleGeometry args={[r * 0.25, 30]} /><meshStandardMaterial color={C.orange} /></mesh>
      </group>
    ))}
  </group>
);
export const MeshNode: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <group {...p}>
    <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.28, 0.3, 0.5, 40]} /><meshStandardMaterial color="#f4ede6" roughness={0.45} /></mesh>
    <mesh position={[0, 0.505, 0]}><cylinderGeometry args={[0.26, 0.26, 0.012, 40]} /><meshStandardMaterial color="#e2d6ca" /></mesh>
    <mesh position={[0, 0.06, 0]}><torusGeometry args={[0.295, 0.012, 8, 40]} /><meshBasicMaterial color={new THREE.Color(C.cold).multiplyScalar(0.6 + 0.4 * Math.sin(t * 3))} /></mesh>
  </group>
);
export const Cabinet: React.FC<P & { open?: number }> = ({ open = 0, ...p }) => (
  <group {...p}>
    <RBox size={[1.4, 1.8, 0.7]} r={0.04} color="#d9a77a" />
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 0.7, 0, 0.36]} rotation={[0, s * open * 1.4, 0]}>
        <RBox size={[0.68, 1.72, 0.04]} r={0.02} color="#e4b88d" position={[-s * 0.35, 0, 0]} />
        <mesh position={[-s * 0.62, 0, 0.03]}><boxGeometry args={[0.03, 0.25, 0.03]} /><meshStandardMaterial color="#8c6a4e" /></mesh>
      </group>
    ))}
  </group>
);

/* =================== FURNITURE (for house + floor plan) =================== */
export const Sofa: React.FC<P & { color?: string }> = ({ color = C.orange, ...p }) => (
  <group {...p}>
    <RBox size={[1.8, 0.35, 0.8]} r={0.08} color={color} position={[0, 0.25, 0]} />
    <RBox size={[1.8, 0.5, 0.2]} r={0.08} color={color} position={[0, 0.55, -0.3]} />
    {[-1, 1].map((s) => <RBox key={s} size={[0.2, 0.45, 0.8]} r={0.07} color={color} position={[s * 0.85, 0.4, 0]} />)}
  </group>
);
export const Bed: React.FC<P> = (p) => (
  <group {...p}>
    <RBox size={[1.4, 0.3, 2.0]} r={0.06} color="#d9a77a" position={[0, 0.15, 0]} />
    <RBox size={[1.3, 0.16, 1.9]} r={0.07} color="#fffaf4" position={[0, 0.38, 0]} />
    <RBox size={[1.3, 0.1, 1.1]} r={0.05} color={C.coldL} position={[0, 0.48, 0.38]} />
    <RBox size={[0.5, 0.12, 0.3]} r={0.05} color="#fffaf4" position={[-0.3, 0.52, -0.75]} />
    <RBox size={[0.5, 0.12, 0.3]} r={0.05} color="#fffaf4" position={[0.3, 0.52, -0.75]} />
    <RBox size={[1.4, 0.7, 0.1]} r={0.04} color="#c98f62" position={[0, 0.5, -1.0]} />
  </group>
);
export const Shelf: React.FC<P> = (p) => (
  <group {...p}>
    <RBox size={[1.2, 0.06, 0.4]} r={0.02} color="#d9a77a" />
    {[-1, 1].map((s) => <mesh key={s} position={[s * 0.5, -0.12, -0.1]}><boxGeometry args={[0.05, 0.2, 0.05]} /><meshStandardMaterial color="#8c6a4e" /></mesh>)}
  </group>
);
