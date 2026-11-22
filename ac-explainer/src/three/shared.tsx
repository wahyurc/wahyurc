// Re-usable 3D set pieces: the refrigerant loop diagram and the mini cut-away house
import React, { useMemo } from "react";
import * as THREE from "three";
import { C, lerp, eBack } from "../lib";
import { AirStream, Coil, Flow, IndoorUnit, OutdoorUnit, Pipe, RBox, heatColor } from "./parts";

/** rounded-rectangle closed loop in the XY plane (clockwise from top-left) */
export const loopCurve = (w = 2.2, h = 3.0, r = 0.45) => {
  const pts: THREE.Vector3[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 8; i++) { const a = a0 - (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0)); }
  };
  const x = w / 2 - r, y = h / 2 - r;
  corner(-x, y, Math.PI); corner(x, y, Math.PI / 2); corner(x, -y, 0); corner(-x, -y, -Math.PI / 2);
  return new THREE.CatmullRomCurve3(pts, true, "centripetal");
};

/* Along the loop (u from top-left, clockwise):
   top edge   = evaporator (cold, absorbs heat)    u ~ 0.00 – 0.25
   right edge = compressor  (heats up)              u ~ 0.25 – 0.50
   bottom     = condenser   (hot -> releases heat)  u ~ 0.50 – 0.75
   left edge  = expansion   (pressure drop -> cold) u ~ 0.75 – 1.00 */
export const loopHeat = (u: number) => {
  if (u < 0.25) return 0.1 + u * 1.2;          // warming while absorbing
  if (u < 0.5) return 0.4 + (u - 0.25) * 2.4;  // compression -> very hot
  if (u < 0.75) return 1.0 - (u - 0.5) * 1.6;  // condenser cools
  return Math.max(0, 0.6 - (u - 0.75) * 2.4);  // expansion -> cold
};

export const NODES: { key: string; n: string; label: string; pos: [number, number, number]; color: string }[] = [
  { key: "evap", n: "1", label: "Evaporator", pos: [0, 1.5, 0], color: C.cold },
  { key: "komp", n: "2", label: "Kompresor", pos: [1.1, 0, 0], color: C.red },
  { key: "kond", n: "3", label: "Kondensor", pos: [0, -1.5, 0], color: C.orange },
  { key: "katup", n: "4", label: "Katup ekspansi", pos: [-1.1, 0, 0], color: C.coldD },
];

export const LoopDiagram: React.FC<{ t: number; nodes: number[]; speed?: number; glowAll?: number; pipeIn?: number }> = ({ t, nodes, speed = 0.08, glowAll = 0, pipeIn = 1 }) => {
  const curve = useMemo(() => loopCurve(), []);
  return (
    <group scale={pipeIn * 0.78} position={[0, 0.1, 0]}>
      <Pipe curve={curve} r={0.075} color="#e7c6ae" opacity={0.85} />
      <Flow curve={curve} t={t} count={130} speed={speed} size={0.17} colorAt={(u) => heatColor(loopHeat(u))} jitter={0.02} />
      {NODES.map((nd, i) => {
        const k = nodes[i] ?? 0;
        return (
          <group key={nd.key} position={nd.pos} scale={0.001 + k}>
            {i === 0 && <Coil w={0.9} h={0.32} fins={14} position={[0, 0, 0.05]} frost={0.6} />}
            {i === 2 && <Coil w={0.9} h={0.32} fins={14} position={[0, 0, 0.05]} color="#ffb38a" />}
            {i === 1 && (
              <mesh rotation={[0, 0, 0]}>
                <capsuleGeometry args={[0.2, 0.28, 8, 20]} />
                <meshStandardMaterial color="#45403c" roughness={0.4} metalness={0.3} emissive={C.red} emissiveIntensity={0.15 + glowAll * 0.3} />
              </mesh>
            )}
            {i === 3 && (
              <group>
                <mesh rotation={[0, 0, 0]}>
                  <cylinderGeometry args={[0.12, 0.05, 0.3, 20]} />
                  <meshStandardMaterial color="#b5aca3" metalness={0.6} roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.22, 0]}>
                  <cylinderGeometry args={[0.05, 0.12, 0.16, 20]} />
                  <meshStandardMaterial color="#b5aca3" metalness={0.6} roughness={0.3} />
                </mesh>
              </group>
            )}
            <mesh position={[0, 0, -0.1]}>
              <circleGeometry args={[0.42, 40]} />
              <meshBasicMaterial color={nd.color} transparent opacity={0.18 + glowAll * 0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** screen positions (px, 1080x1920) of the loop nodes for HTML labels, for the camera used with LoopDiagram */
// camera z 8.6, fov 40 -> 306.7 px per unit; loop scaled 0.78, raised 0.1
export const NODE_SCREEN = [
  { x: 540, y: 570 }, // evaporator (top)
  { x: 803, y: 930 }, // compressor (right)
  { x: 540, y: 1288 }, // condenser (bottom)
  { x: 277, y: 930 }, // expansion (left)
];
/** where each node's label sits relative to its node (keeps clear of title + captions) */
export const LABEL_OFF = [ { dx: 0, dy: -78 }, { dx: -40, dy: 120 }, { dx: 0, dy: -110 }, { dx: 40, dy: 120 } ];
export const LOOP_CAM = { pos: [0, 0, 8.6] as [number, number, number], look: [0, 0, 0] as [number, number, number], fov: 40 };

/** small cut-away house: inside room with indoor unit, wall, outdoor unit; heat carried outside */
export const MiniHouse: React.FC<{ t: number; flow: number; outHeat?: number }> = ({ t, flow, outHeat = 1 }) => {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, 0.95, 0.15), new THREE.Vector3(0.1, 1.1, 0.15), new THREE.Vector3(0.6, 1.05, 0.15),
      new THREE.Vector3(0.75, 0.4, 0.15), new THREE.Vector3(1.0, -0.25, 0.15), new THREE.Vector3(1.4, -0.3, 0.15),
    ]),
    []
  );
  return (
    <group scale={0.8}>
      {/* floor + inside walls */}
      <RBox size={[3.6, 0.15, 1.6]} r={0.05} color="#f2d8c4" position={[0, -1.1, 0]} />
      <RBox size={[2.0, 2.4, 0.12]} r={0.04} color="#f6e6da" position={[-0.6, 0.1, -0.75]} />
      <RBox size={[0.18, 2.4, 1.6]} r={0.04} color="#ecc3a8" position={[0.48, 0.1, 0]} />
      {/* roof */}
      <mesh position={[-0.6, 1.62, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.95, 1, 0.5]}>
        <cylinderGeometry args={[1.25, 1.25, 1.62, 3]} />
        <meshStandardMaterial color={C.orange} />
      </mesh>
      <IndoorUnit t={t} louver={1} glow={1} position={[-0.6, 0.85, -0.45]} scale={0.42} />
      <OutdoorUnit fan={t * 10} position={[1.35, -0.55, 0.1]} scale={0.42} />
      <Pipe curve={curve} r={0.03} color={C.copper} />
      {/* room heat travelling through the pipe and out */}
      <Flow curve={curve} t={t} count={36} speed={0.35} size={0.14} colorAt={() => C.orange} opacity={flow} />
      <AirStream t={t} color={C.orange} position={[1.4, -0.45, 0.4]} dir={[1, 0.6, 0.3]} len={1.4} spread={0.4} count={40} size={0.13} opacity={0.8 * flow * outHeat} />
      {/* cool air in room */}
      <AirStream t={t} color={C.cold} position={[-0.6, 0.62, -0.25]} dir={[0, -0.8, 1]} len={1.3} spread={0.8} count={40} size={0.12} opacity={0.7 * flow} />
      {/* ground outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.19, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#efd2bd" />
      </mesh>
    </group>
  );
};

export const popScale = (t: number, at: number) => lerp(t, [at, at + 0.4], [0, 1], eBack);
