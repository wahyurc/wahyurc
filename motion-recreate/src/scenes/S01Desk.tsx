// Scene 1 (0.00s – 3.20s): top-down desk, flipping ebook, 3D cursor, exploding pencil cup,
// "For beginners" tags pop, camera dives low to the "Learn Prompt" card + big cursor.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Stage } from "../three/Stage";
import { Book, Card, Cube, Cursor3D, Lights, OpenBook, Particles, PencilCup, Pencil } from "../three/objects";
import { dotsTex, learnCardTex, pageTex, tagTex } from "../three/textures";
import { C, eBack, eOut, lerp } from "../lib";
import { Caption, Halftone } from "../fx";

const WindowShadowCaster: React.FC = () => (
  // invisible frame between sun and floor -> window-pane shadow shapes on the desk
  <group position={[0, 0, 5]} rotation={[0, 0, 0.5]}>
    {[-3, -1, 1, 3].map((x) => (
      <mesh key={x} position={[x, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 14, 0.1]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    ))}
    <mesh position={[0, 2.2, 0]} castShadow>
      <boxGeometry args={[14, 0.35, 0.1]} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} />
    </mesh>
  </group>
);

export const S01Desk: React.FC = () => {
  const f = useCurrentFrame();
  const flip = f < 22 ? (f / 5.5) % 1 : 1;
  const burst = lerp(f, [6, 30], [0, 1], eOut);
  const pop = (start: number) => lerp(f, [start, start + 7], [0, 1], eBack);
  const learn = pop(38);

  // camera: top-down push-in, then dive low & roll toward the Learn Prompt card
  const k = lerp(f, [34, 66], [0, 1]);
  const whip = lerp(f, [69, 77], [0, 1], (t) => t * t);
  const pos: [number, number, number] = [
    lerp(f, [0, 34], [0.5, 0.25]) * (1 - k) + 2.3 * k + whip * 3,
    lerp(f, [0, 34], [-0.7, -0.45]) * (1 - k) + -5.8 * k,
    lerp(f, [0, 34], [9.5, 7.6]) * (1 - k) + 2.4 * k,
  ];
  const look: [number, number, number] = [0.3 * (1 - k) + 1.3 * k + whip * 4, 0.1 * (1 - k) + -0.2 * k, 0.9 * k];

  return (
    <AbsoluteFill>
      <Stage cam={{ pos, look, fov: 34, roll: -0.25 * k - whip * 0.6 }} bg="#f1d6c1" fog={[12, 30]}>
        <Lights dir={[5, 6, 9]} intensity={2.6} />
        <WindowShadowCaster />
        {/* desk surface */}
        <mesh receiveShadow position={[0, 0, -0.01]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#f2d8c4" roughness={0.95} />
        </mesh>
        <Particles t={f / 24} count={260} spread={[12, 9, 3]} color="#fff3e8" size={0.05} />
        <Particles t={f / 24} count={90} spread={[10, 8, 2]} color={C.orange} size={0.045} seed={9} />

        {/* open ebook, pages flipping */}
        <OpenBook flip={flip} position={[0, 0.1, 0.06]} scale={1.3} left="chart" right="orange" flipTex="white" />
        {/* extra pages fanned out to the right */}
        <Card tex={pageTex("code")} w={0.9} h={1.25} position={[1.75, -0.15, 0.04]} rotation={[0, 0, 0.04]} />
        <Card tex={pageTex("white", 2)} w={0.9} h={1.25} position={[2.35, -0.45, 0.02]} rotation={[0, 0, -0.06]} />

        {/* floating cover top-right */}
        <Book position={[2.5, 2.0, 0.9 + Math.sin(f / 10) * 0.05]} rotation={[0.15, -0.2, -0.28 + f * 0.002]} scale={0.75} />

        {/* pencil cup top-left with pencils bursting outward */}
        <PencilCup burst={burst} rotation={[Math.PI / 2, 0, 0]} position={[-2.6, 2.4, 0]} scale={0.9} color="#c97c50" />

        {/* small cubes */}
        <group position={[-1.75, -0.25, 0.2]} rotation={[0.2, 0.3, f * 0.01]}>
          <Cube color={C.orangeL} size={0.38} />
          <mesh position={[0, 0, 0.27]}>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshStandardMaterial color={C.yellow} />
          </mesh>
        </group>
        <Cube color={C.yellow} size={0.18} position={[-3.6, -1.4, 0.1]} rotation={[0.3, 0.2, 0.5]} />
        <Cube color={C.orange} size={0.15} position={[-1.2, -2.5, 0.1]} rotation={[0.3, 0.4, 0.2]} />
        <Cube color="#b0582c" size={0.2} position={[-0.6, -2.0, 0.1]} rotation={[0.1, 0.2, 0.7]} />

        {/* the 3D cursor clicking the book */}
        <Cursor3D
          position={[0.35 + Math.sin(f / 6) * 0.04, -0.35 - lerp(f, [0, 20], [0.2, 0]), 0.55 + (f % 12 < 3 ? -0.08 : 0)]}
          rotation={[0.2, 0.1, 0.25]}
          scale={0.9}
        />

        {/* "For beginners" tags popping */}
        {[
          { s: 12, p: [-0.95, -0.05, 0.4], r: 0.08, t: tagTex("For beginners", "Install to claude") },
          { s: 15, p: [0.55, -0.15, 0.55], r: -0.05, t: tagTex("For beginners", "Install to claude") },
          { s: 18, p: [-0.3, 0.45, 0.5], r: 0.1, t: tagTex("Learn Prompt", "Copy and paste") },
          { s: 24, p: [-1.8, -1.2, 0.9], r: 0.55, t: tagTex("For beginners", "Install to claude") },
          { s: 30, p: [1.9, 1.1, 1.1], r: -0.12, t: tagTex("For beginners", "Install to claude") },
        ].map((o, i) => (
          <Card key={i} tex={o.t} w={0.95} h={0.3} depth={0.04} position={o.p as any} rotation={[0.25, 0, o.r]} scale={pop(o.s) * 0.9} />
        ))}

        {/* Learn Prompt card + big cursor (revealed by the camera dive) */}
        <Card tex={learnCardTex()} w={1.6} h={0.53} depth={0.08} position={[1.35, -1.55, 0.95]} rotation={[1.25, 0.1, 0.22]} scale={learn} />
        <Cursor3D position={[2.25, -2.6, 0.75]} rotation={[1.3, 0.2, 0.45]} scale={learn * 1.05} color="#ff8a2a" />
        {/* orange pegboard block on the right */}
        <mesh position={[4.0, -0.9, 0.9]} rotation={[0.1, 0.2, 0.4]} castShadow>
          <boxGeometry args={[0.8, 0.45, 1.5]} />
          <meshStandardMaterial map={dotsTex()} color="#ffb08a" />
        </mesh>
        <Pencil position={[2.8, 0.2, 0.9]} rotation={[0.6, 0.2, 2.6]} color="#b8b0a8" len={1.0} />
        <mesh position={[-0.2, -2.3, 0.3]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.28, 18]} />
          <meshStandardMaterial color="#9a3b14" />
        </mesh>
      </Stage>
      <Halftone opacity={0.45} />
      <Caption text="Motion Graphic with Claude · the ebook by w4hy03" o={lerp(f, [0, 6, 64, 70], [0, 0.8, 0.8, 0])} />
    </AbsoluteFill>
  );
};
