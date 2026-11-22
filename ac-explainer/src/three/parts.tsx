// Clay-style 3D parts for the AC explainer (all procedural, no external models)
import React, { useMemo } from "react";
import * as THREE from "three";
import { C, rand } from "../lib";

type V3 = [number, number, number];
type P = { position?: V3; rotation?: V3; scale?: number | V3 };

/* ---------- rounded box (extruded rounded rectangle, bevelled) ---------- */
const rbCache = new Map<string, THREE.BufferGeometry>();
export const roundedBoxGeo = (w: number, h: number, d: number, r = 0.08) => {
  // perfectly symmetric rounded box: rounded-rect profile (absarc corners) + uniform bevel.
  // The bevel grows the profile by `b` on every side, so the profile is shrunk by 2b to keep w×h×d exact.
  const key = [w, h, d, r].join("|");
  if (rbCache.has(key)) return rbCache.get(key)!;
  const b = Math.min(r * 0.6, d / 2 - 0.001, w / 4, h / 4);
  const pw = w - 2 * b, ph = h - 2 * b;
  const rc = Math.max(0.0005, Math.min(r - b * 0.5, pw / 2 - 0.0005, ph / 2 - 0.0005));
  const sh = new THREE.Shape();
  const L = -pw / 2, R = pw / 2, B = -ph / 2, T = ph / 2;
  sh.moveTo(L + rc, B);
  sh.lineTo(R - rc, B); sh.absarc(R - rc, B + rc, rc, -Math.PI / 2, 0, false);
  sh.lineTo(R, T - rc); sh.absarc(R - rc, T - rc, rc, 0, Math.PI / 2, false);
  sh.lineTo(L + rc, T); sh.absarc(L + rc, T - rc, rc, Math.PI / 2, Math.PI, false);
  sh.lineTo(L, B + rc); sh.absarc(L + rc, B + rc, rc, Math.PI, Math.PI * 1.5, false);
  const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 6, curveSegments: 12 });
  g.center();
  g.computeVertexNormals();
  rbCache.set(key, g);
  return g;
};
export const RBox: React.FC<P & { size: V3; r?: number; color?: string; opacity?: number; rough?: number; emissive?: string }> = ({ size, r = 0.08, color = "#fff6ee", opacity = 1, rough = 0.6, emissive, ...p }) => (
  <mesh geometry={roundedBoxGeo(size[0], size[1], size[2], r)} {...p} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={rough} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} emissive={emissive ?? "#000"} emissiveIntensity={emissive ? 0.6 : 0} />
  </mesh>
);

/* ---------- lights ---------- */
export const Lights: React.FC<{ shadow?: boolean; dir?: V3; i?: number }> = ({ shadow = true, dir = [3, 6, 6], i = 2.3 }) => (
  <>
    <ambientLight intensity={0.95} color="#ffeadb" />
    <hemisphereLight args={["#fff6ee", "#e8b48c", 0.8]} />
    <directionalLight position={dir} intensity={i} color="#fff1e0" castShadow={shadow}
      shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-6} shadow-camera-right={6}
      shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.0005} />
  </>
);

/* ---------- soft sprite ---------- */
let sprite: THREE.CanvasTexture | null = null;
export const softSprite = () => {
  if (sprite) return sprite;
  const cv = document.createElement("canvas"); cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  sprite = new THREE.CanvasTexture(cv);
  return sprite;
};

/* ---------- particles flowing along a curve; color by position along the loop ---------- */
export const Flow: React.FC<{
  curve: THREE.Curve<THREE.Vector3>; t: number; count?: number; speed?: number; size?: number;
  colorAt: (u: number) => string; jitter?: number; from?: number; to?: number; opacity?: number;
}> = ({ curve, t, count = 80, speed = 0.08, size = 0.12, colorAt, jitter = 0.04, from = 0, to = 1, opacity = 1 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const col = geo.getAttribute("color") as THREE.BufferAttribute;
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const u0 = (i / count + t * speed) % 1;
    const u = from + u0 * (to - from);
    const p = curve.getPointAt(u);
    pos.setXYZ(i, p.x + (rand(i) - 0.5) * jitter, p.y + (rand(i + 7) - 0.5) * jitter, p.z + (rand(i + 13) - 0.5) * jitter);
    c.set(colorAt(u)); col.setXYZ(i, c.r, c.g, c.b);
  }
  pos.needsUpdate = true; col.needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial map={softSprite()} vertexColors size={size} transparent opacity={opacity} depthWrite={false} sizeAttenuation />
    </points>
  );
};

/** blend cold-blue <-> hot-orange */
export const heatColor = (k: number) => {
  const a = new THREE.Color(C.cold), b = new THREE.Color(C.orange), r = new THREE.Color(C.red);
  return (k < 0.7 ? a.clone().lerp(b, k / 0.7) : b.clone().lerp(r, (k - 0.7) / 0.3)).getStyle();
};

/* ---------- air puffs: particles drifting from a source along a direction ---------- */
export const AirStream: React.FC<P & { t: number; color: string; count?: number; len?: number; spread?: number; speed?: number; size?: number; opacity?: number; dir?: V3 }> = ({
  t, color, count = 60, len = 3, spread = 1, speed = 0.6, size = 0.14, opacity = 0.85, dir = [0, -1, 1], ...p
}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const d = new THREE.Vector3(...dir).normalize();
  const pa = geo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < count; i++) {
    const u = (rand(i) + t * speed) % 1;
    const side = (rand(i + 3) - 0.5) * spread;
    const wob = Math.sin(t * 2 + i) * 0.08;
    pa.setXYZ(i, side + d.x * u * len + wob, d.y * u * len + (rand(i + 9) - 0.5) * 0.15, d.z * u * len + wob);
  }
  pa.needsUpdate = true;
  return (
    <points geometry={geo} {...p}>
      <pointsMaterial map={softSprite()} color={color} size={size} transparent opacity={opacity} depthWrite={false} sizeAttenuation />
    </points>
  );
};

/* ---------- copper pipe along a curve ---------- */
export const Pipe: React.FC<{ curve: THREE.Curve<THREE.Vector3>; r?: number; color?: string; opacity?: number; closed?: boolean }> = ({ curve, r = 0.07, color = C.copper, opacity = 1, closed = true }) => {
  const g = useMemo(() => new THREE.TubeGeometry(curve, 320, r, 16, closed), [curve, r, closed]);
  return (
    <mesh geometry={g} castShadow>
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} />
    </mesh>
  );
};

/* ---------- fin coil (evaporator / condenser) ---------- */
export const Coil: React.FC<P & { w?: number; h?: number; fins?: number; color?: string; tube?: string; frost?: number }> = ({
  w = 2.2, h = 0.7, fins = 34, color = "#d9d4cf", tube = C.copper, frost = 0, ...p
}) => (
  <group {...p}>
    {Array.from({ length: fins }).map((_, i) => (
      <mesh key={i} position={[-w / 2 + (i + 0.5) * (w / fins), 0, 0]}>
        <boxGeometry args={[0.012, h, 0.28]} />
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color(C.coldL), frost)} metalness={0.5} roughness={0.35} />
      </mesh>
    ))}
    {[-0.22, 0, 0.22].map((y, k) => (
      <mesh key={k} position={[0, y * h * 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, w + 0.05, 12]} />
        <meshStandardMaterial color={tube} metalness={0.5} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

/* ---------- cross-flow fan (indoor blower) ---------- */
export const Blower: React.FC<P & { rot: number; len?: number; r?: number; color?: string }> = ({ rot, len = 2, r = 0.16, color = "#e9e2da", ...p }) => (
  <group {...p}>
    <group rotation={[rot, 0, 0]}>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <mesh key={i} position={[0, Math.cos(a) * r, Math.sin(a) * r]} rotation={[a + 0.5, 0, 0]}>
            <boxGeometry args={[len, 0.012, 0.07]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, len, 10]} />
        <meshStandardMaterial color="#a9a29b" />
      </mesh>
    </group>
  </group>
);

/* ---------- axial fan (outdoor) ---------- */
export const AxialFan: React.FC<P & { rot: number; r?: number; color?: string }> = ({ rot, r = 0.55, color = "#3b3633", ...p }) => (
  <group {...p}>
    <group rotation={[0, 0, rot]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0.35, 0, (i / 3) * Math.PI * 2]} position={[0, 0, 0]}>
          <boxGeometry args={[0.24, r * 1.9, 0.02]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 20]} />
        <meshStandardMaterial color={C.orange} />
      </mesh>
    </group>
  </group>
);

/* ---------- indoor (split) unit ---------- */
export const IndoorUnit: React.FC<P & { t: number; louver?: number; cut?: number; fan?: number; frost?: number; glow?: number }> = ({
  t, louver = 0, cut = 0, fan = 0, frost = 0, glow = 0, ...p
}) => (
  <group {...p}>
    {/* back plate */}
    <RBox size={[2.6, 0.95, 0.12]} r={0.05} color="#efe6dd" position={[0, 0, -0.32]} />
    {/* body (front shell becomes transparent in cutaway) */}
    <RBox size={[2.6, 0.95, 0.66]} r={0.16} color="#fffaf5" opacity={1 - cut * 0.82} rough={0.45} />
    {/* top intake grille */}
    {Array.from({ length: 16 }).map((_, i) => (
      <mesh key={i} position={[-1.1 + i * 0.147, 0.48, -0.02]}>
        <boxGeometry args={[0.05, 0.012, 0.42]} />
        <meshStandardMaterial color="#d9cfc5" />
      </mesh>
    ))}
    {/* louver flap */}
    <group position={[0, -0.42, 0.28]} rotation={[-louver * 1.0, 0, 0]}>
      <RBox size={[2.1, 0.05, 0.22]} r={0.02} color="#f3ebe3" position={[0, 0, 0.1]} />
    </group>
    {/* status light */}
    <mesh position={[0.95, -0.25, 0.34]}>
      <sphereGeometry args={[0.025, 12, 12]} />
      <meshBasicMaterial color={glow > 0 ? C.cold : "#cfc6bd"} />
    </mesh>
    {/* internals (visible in cutaway) */}
    {cut > 0.01 && (
      <group>
        {/* filter mesh */}
        <mesh position={[0, 0.3, 0.05]} rotation={[-0.5, 0, 0]}>
          <planeGeometry args={[2.3, 0.4, 24, 6]} />
          <meshStandardMaterial color="#9fb7c8" wireframe transparent opacity={0.8 * cut} />
        </mesh>
        <Coil position={[0, 0.05, 0.08]} rotation={[-0.35, 0, 0]} w={2.3} h={0.42} frost={frost} />
        <Blower position={[0, -0.22, -0.05]} rot={fan} len={2.2} />
        {/* drain tray */}
        <mesh position={[0, -0.12, 0.22]}>
          <boxGeometry args={[2.3, 0.04, 0.16]} />
          <meshStandardMaterial color="#d8cdc2" />
        </mesh>
      </group>
    )}
  </group>
);

/* ---------- outdoor unit ---------- */
export const OutdoorUnit: React.FC<P & { fan: number; cut?: number; hot?: number }> = ({ fan, cut = 0, hot = 0, ...p }) => (
  <group {...p}>
    <RBox size={[2.2, 1.6, 0.85]} r={0.1} color="#f4eee8" opacity={1 - cut * 0.85} />
    {/* fan opening ring + grille */}
    <mesh position={[-0.35, 0, 0.43]}>
      <torusGeometry args={[0.6, 0.04, 12, 48]} />
      <meshStandardMaterial color="#cfc4b9" />
    </mesh>
    {[-0.45, -0.25, -0.05, 0.15, 0.35].map((y) => (
      <mesh key={y} position={[-0.35, y * 1.2, 0.45]}>
        <boxGeometry args={[1.18 * Math.sqrt(Math.max(0, 1 - (y * 1.2 / 0.6) ** 2)) + 0.01, 0.015, 0.015]} />
        <meshStandardMaterial color="#bdb2a7" />
      </mesh>
    ))}
    <AxialFan rot={fan} position={[-0.35, 0, 0.3]} r={0.52} />
    {/* side coil (condenser) */}
    <Coil position={[0.0, 0, -0.36]} w={2.0} h={1.3} fins={40} color={new THREE.Color("#d9d4cf").lerp(new THREE.Color("#ffb38a"), hot).getStyle()} />
    {/* compressor + valves on right side */}
    <group position={[0.7, -0.25, 0.05]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.22, 0.4, 8, 20]} />
        <meshStandardMaterial color="#45403c" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
    {/* service valves */}
    <mesh position={[1.12, -0.5, 0.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, 0.2, 12]} />
      <meshStandardMaterial color="#b5aca3" metalness={0.6} />
    </mesh>
    <mesh position={[1.12, -0.32, 0.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.035, 0.2, 12]} />
      <meshStandardMaterial color="#b5aca3" metalness={0.6} />
    </mesh>
    {/* feet */}
    {[-0.8, 0.8].map((x) => (
      <mesh key={x} position={[x, -0.85, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.9]} />
        <meshStandardMaterial color="#c9bfb5" />
      </mesh>
    ))}
  </group>
);

/* ---------- water drop ---------- */
export const Drop: React.FC<P & { color?: string }> = ({ color = C.cold, ...p }) => (
  <group {...p}>
    <mesh>
      <sphereGeometry args={[0.1, 20, 20]} />
      <meshPhysicalMaterial color={color} roughness={0.1} transmission={0.2} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.1, 0]}>
      <coneGeometry args={[0.07, 0.14, 20]} />
      <meshPhysicalMaterial color={color} roughness={0.1} clearcoat={1} />
    </mesh>
  </group>
);

/* ---------- room shell (portrait friendly) ---------- */
export const RoomShell: React.FC<{ warm?: number; window?: boolean }> = ({ warm = 0, window = true }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color={new THREE.Color("#f6e7dc").lerp(new THREE.Color("#ffd2b3"), warm).getStyle()} />
    </mesh>
    <mesh position={[0, 5, -3]} receiveShadow>
      <planeGeometry args={[30, 12]} />
      <meshStandardMaterial color={new THREE.Color("#f2ddd0").lerp(new THREE.Color("#ffc9a6"), warm).getStyle()} />
    </mesh>
    <mesh position={[-3.2, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[30, 12]} />
      <meshStandardMaterial color="#e8bba3" />
    </mesh>
    {window && (
      <group position={[1.6, 2.3, -2.98]}>
        <mesh>
          <planeGeometry args={[1.8, 2.2]} />
          <meshBasicMaterial color={new THREE.Color("#fffaf3").lerp(new THREE.Color("#ffe1a8"), warm).getStyle()} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.06, 2.2, 0.04]} />
          <meshStandardMaterial color="#f0dccf" />
        </mesh>
        <mesh position={[0, 0.2, 0.02]}>
          <boxGeometry args={[1.8, 0.06, 0.04]} />
          <meshStandardMaterial color="#f0dccf" />
        </mesh>
      </group>
    )}
  </group>
);

/* ---------- adjustable wrench (kunci inggris): chrome body, angled jaw head, movable jaw, knurled worm screw ---------- */
const wrenchGeos = (() => {
  const ext = (sh: THREE.Shape, depth: number, bev = 0.025) => {
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 24 });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  // handle: tapered bar with a rounded end and a hanging hole (symmetric about the Y axis)
  const hd = new THREE.Shape();
  hd.moveTo(-0.13, 0.05); hd.lineTo(-0.105, -1.25); hd.absarc(0, -1.25, 0.105, Math.PI, 0, false); hd.lineTo(0.13, 0.05); hd.closePath();
  const hole = new THREE.Path(); hole.absarc(0, -1.22, 0.045, 0, Math.PI * 2, true); hd.holes.push(hole);
  // head with the fixed jaw: rounded body, open slot on the right
  const he = new THREE.Shape();
  he.moveTo(-0.16, 0.0);
  he.lineTo(-0.28, 0.22);
  he.quadraticCurveTo(-0.34, 0.52, -0.12, 0.64);  // back of the head
  he.lineTo(0.02, 0.66);                          // tip of fixed jaw
  he.lineTo(0.02, 0.42);                          // fixed jaw face
  he.lineTo(0.12, 0.36);                          // slot bottom
  he.lineTo(0.12, 0.22);
  he.quadraticCurveTo(0.12, 0.05, 0.16, 0.0);
  he.closePath();
  // movable jaw (slides in the slot)
  const mj = new THREE.Shape();
  mj.moveTo(0.0, 0.0); mj.lineTo(0.0, 0.26); mj.lineTo(0.09, 0.3); mj.lineTo(0.13, 0.22); mj.lineTo(0.13, 0.0); mj.closePath();
  return { handle: ext(hd, 0.07), head: ext(he, 0.11), jaw: ext(mj, 0.09, 0.015) };
})();

export const Wrench: React.FC<P & { open?: number }> = ({ open = 0.5, ...p }) => (
  <group {...p}>
    <mesh geometry={wrenchGeos.handle} castShadow>
      <meshStandardMaterial color="#e3e6ea" metalness={0.25} roughness={0.32} />
    </mesh>
    {/* orange rubber grip */}
    <mesh position={[0, -0.75, 0]}>
      <boxGeometry args={[0.235, 0.7, 0.13]} />
      <meshStandardMaterial color={C.orange} roughness={0.7} />
    </mesh>
    <mesh geometry={wrenchGeos.head} castShadow>
      <meshStandardMaterial color="#e3e6ea" metalness={0.25} roughness={0.32} />
    </mesh>
    <mesh geometry={wrenchGeos.jaw} position={[0.14, 0.18 + open * 0.06, 0]} castShadow>
      <meshStandardMaterial color="#cdd1d6" metalness={0.25} roughness={0.35} />
    </mesh>
    {/* knurled worm screw */}
    <group position={[0.15, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.045, 0.045, 0.16, 20]} />
        <meshStandardMaterial color="#aeb3ba" metalness={0.3} roughness={0.3} />
      </mesh>
      {[-0.05, -0.025, 0, 0.025, 0.05].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.046, 0.008, 6, 20]} />
          <meshStandardMaterial color="#959aa1" metalness={0.3} />
        </mesh>
      ))}
    </group>
  </group>
);

/** orthogonal pipe route with neat rounded bends (straight runs + quarter-bends of radius r) */
export const routedPath = (pts: [number, number, number][], r = 0.08) => {
  const P = pts.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath<THREE.Vector3>();
  let cur = P[0].clone();
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1];
    const d1 = b.clone().sub(a).normalize(), d2 = c.clone().sub(b).normalize();
    const rr = Math.min(r, b.distanceTo(a) / 2, c.distanceTo(b) / 2);
    const p1 = b.clone().addScaledVector(d1, -rr), p2 = b.clone().addScaledVector(d2, rr);
    path.add(new THREE.LineCurve3(cur, p1));
    path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2));
    cur = p2;
  }
  path.add(new THREE.LineCurve3(cur, P[P.length - 1].clone()));
  return path;
};
