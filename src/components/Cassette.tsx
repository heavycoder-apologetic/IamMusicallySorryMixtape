import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

import { useScrollProgressRef } from '../hooks/useScrollProgress';
import { useAudio } from '../store/audioStore';

/* ---------- Reel texture (baked) ----------
 * One CanvasTexture per reel, drawn once. The texture bakes in everything:
 *   - dark wound tape with concentric "spiral" rings
 *   - 6 light spokes radiating from hub to rim
 *   - dark hub ring with sprocket-tooth dots
 *   - lighter spindle plate with central hole + 3 drive notches
 *
 * The mesh that uses this texture rotates (rotationRef) and scales
 * (tapeAmountRef) — so we see real motion AND the wound size change.
 */
function buildReelTexture(): THREE.CanvasTexture {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  const R  = size / 2 - 6;

  // wound tape (dark filled disc)
  ctx.fillStyle = '#0d0d0d';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // subtle outer rim line
  ctx.strokeStyle = 'rgba(220,220,220,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
  ctx.stroke();

  // concentric rings — the spiraling wound tape
  for (let r = 130; r < R - 8; r += 7) {
    const major = ((r - 130) / 7) % 4 === 0;
    ctx.strokeStyle = major ? 'rgba(120,120,120,0.55)' : 'rgba(70,70,70,0.42)';
    ctx.lineWidth = major ? 2.4 : 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 6 light spokes (hub → rim)
  ctx.strokeStyle = '#cdcac1';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 130, cy + Math.sin(a) * 130);
    ctx.lineTo(cx + Math.cos(a) * (R - 40), cy + Math.sin(a) * (R - 40));
    ctx.stroke();
  }

  // hub plate — dark grey filled circle
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  ctx.fill();

  // sprocket teeth (dots ring) — characteristic cassette reel look
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const tx = cx + Math.cos(a) * 95;
    const ty = cy + Math.sin(a) * 95;
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.arc(tx, ty, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // light hub plate (the spindle plate)
  ctx.fillStyle = '#b6b3aa';
  ctx.beginPath();
  ctx.arc(cx, cy, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3 drive notches (the spindle catches) — small dark rectangles
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const nx = cx + Math.cos(a) * 36;
    const ny = cy + Math.sin(a) * 36;
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-5, -16, 10, 32);
    ctx.restore();
  }

  // center spindle hole
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

/** Build a CanvasTexture for the cassette label — readable from a distance. */
function buildLabelTexture(title: string, subtitle: string): THREE.CanvasTexture {
  const W = 1024, H = 360;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  // warm cream paper with slight gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   '#fbf7ec');
  grad.addColorStop(0.5, '#f1ecd8');
  grad.addColorStop(1,   '#dcd5be');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // hairline ruled lines (notebook feel)
  ctx.strokeStyle = 'rgba(20,20,20,0.06)';
  ctx.lineWidth = 1;
  for (let y = 90; y < H - 40; y += 28) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(W - 40, y);
    ctx.stroke();
  }

  // thick black border bars
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, 22);
  ctx.fillRect(0, H - 22, W, 22);

  // SIDE A / TIME corner badges
  ctx.fillStyle = '#0a0a0a';
  ctx.font = 'bold 32px "Playfair Display", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SIDE A', 44, 56);
  ctx.textAlign = 'right';
  ctx.fillText('45 MIN', W - 44, 56);

  // Title — BIG and bold
  ctx.fillStyle = '#0a0a0a';
  ctx.font = 'bold 132px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, W / 2, H / 2 - 6);

  // Subtitle — handwritten, darker than before
  ctx.fillStyle = '#1f1f1f';
  ctx.font = 'italic 60px "Caveat", cursive';
  ctx.fillText(subtitle, W / 2, H / 2 + 96);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

/* ---------- Reel ---------- */

type ReelProps = {
  position: [number, number, number];
  rotationRef: React.MutableRefObject<number>;
  /** 0..1 amount of tape currently on this reel. */
  tapeAmountRef: React.MutableRefObject<number>;
  texture: THREE.CanvasTexture;
};

function Reel({ position, rotationRef, tapeAmountRef, texture }: ReelProps) {
  const disc = useRef<THREE.Mesh>(null);
  const BASE_R = 0.18;
  const MAX_WIND = 0.34;

  useFrame(() => {
    if (!disc.current) return;
    disc.current.rotation.z = rotationRef.current;
    const r = BASE_R + MAX_WIND * tapeAmountRef.current;
    disc.current.scale.setScalar(r / BASE_R);
  });

  return (
    <mesh ref={disc} position={position}>
      <circleGeometry args={[BASE_R, 96]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.78}
        metalness={0.12}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ---------- Screw ---------- */

/** Cross-head screw (⊗) — circle head with X groove. */
function Screw({ position, size = 0.035 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size, size, 0.022, 20]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* cross groove — two thin bars at 90° */}
      <mesh position={[0, 0, 0.013]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[size * 1.5, 0.006, 0.003]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.013]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[size * 1.5, 0.006, 0.003]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

/** Small dark cylindrical opening — used along the top edge for deck holes. */
function DeckHole({ position, radius = 0.04 }: { position: [number, number, number]; radius?: number }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius, 0.04, 24]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
    </mesh>
  );
}

/* ---------- Main cassette ---------- */

type Props = { bodyColor?: string };

export function Cassette({ bodyColor = '#e8e6df' }: Props) {
  const root = useRef<THREE.Group>(null);
  const scroll = useScrollProgressRef();
  const current = useAudio((s) => s.current);
  const isPlaying = useAudio((s) => s.isPlaying);

  const leftRot   = useRef(0);
  const rightRot  = useRef(0);
  const leftTape  = useRef(1);
  const rightTape = useRef(0);

  const reelTex  = useMemo(() => buildReelTexture(), []);
  const labelTex = useMemo(() => {
    return buildLabelTexture(
      current?.title ?? 'rewind',
      current ? `${current.film}, ${current.year}` : 'a side of memories'
    );
  }, [current]);

  useFrame((_state, delta) => {
    const p = scroll.current;
    const REVS = 8;
    leftRot.current  = -p * REVS * Math.PI * 2;
    rightRot.current =  p * REVS * Math.PI * 2;

    leftTape.current  = 0.15 + p * 0.85;
    rightTape.current = 1.0  - p * 0.85;

    if (isPlaying) {
      const PLAY_RATE = 0.6;
      leftRot.current  += delta * PLAY_RATE;
      rightRot.current += delta * PLAY_RATE;
    }

    if (root.current) {
      const t = performance.now() * 0.0008;
      root.current.position.y = Math.sin(t) * 0.04;
      root.current.rotation.x = THREE.MathUtils.lerp(
        root.current.rotation.x, -0.12 + p * 0.04, 0.06,
      );
      root.current.rotation.y = THREE.MathUtils.lerp(
        root.current.rotation.y, Math.sin(t * 0.7) * 0.08, 0.06,
      );
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]} rotation={[-0.12, 0, 0]} scale={0.72}>
      {/* outer shell — sharp rectangle, matte off-white plastic */}
      <RoundedBox
        args={[2.85, 1.55, 0.28]}
        radius={0.025}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.85}
          metalness={0.04}
          envMapIntensity={0.3}
        />
      </RoundedBox>

      {/* visible "frame" outline around the reel window — slightly darker plastic
          that simulates the recessed cutout edge */}
      <mesh position={[0, 0.20, 0.158]}>
        <planeGeometry args={[1.85, 0.92]} />
        <meshStandardMaterial color="#c4c1b7" roughness={0.78} metalness={0.05} />
      </mesh>

      {/* dark recessed "well" behind the reels */}
      <mesh position={[0, 0.20, 0.160]}>
        <planeGeometry args={[1.7, 0.82]} />
        <meshStandardMaterial color="#161616" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* reels */}
      <Reel position={[-0.5, 0.20, 0.168]} rotationRef={leftRot}  tapeAmountRef={leftTape}  texture={reelTex} />
      <Reel position={[ 0.5, 0.20, 0.168]} rotationRef={rightRot} tapeAmountRef={rightTape} texture={reelTex} />

      {/* tape strip — bold visible line spanning between the two reels */}
      <mesh position={[0, -0.20, 0.172]}>
        <boxGeometry args={[1.5, 0.025, 0.008]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* transparent reel window — squarer corners */}
      <RoundedBox
        args={[1.7, 0.82, 0.02]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.20, 0.21]}
      >
        <meshPhysicalMaterial
          color="#f4f4f4"
          transmission={0.97}
          thickness={0.04}
          roughness={0.04}
          ior={1.4}
          transparent
          opacity={0.10}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </RoundedBox>

      {/* ---------- TOP EDGE DETAIL (deck-side) ----------
          A row of 5 small dark openings + a central rectangular slot
          (the read/write head bay on a real cassette). */}
      <DeckHole position={[-0.85, 0.66, 0.165]} />
      <DeckHole position={[-0.45, 0.66, 0.165]} />
      <DeckHole position={[ 0.45, 0.66, 0.165]} />
      <DeckHole position={[ 0.85, 0.66, 0.165]} />

      {/* central head bay — small dark recessed rectangle */}
      <mesh position={[0, 0.66, 0.165]}>
        <boxGeometry args={[0.18, 0.07, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.85} />
      </mesh>

      {/* tiny screw stamped on the central head bay */}
      <Screw position={[0, 0.66, 0.18]} size={0.022} />

      {/* ---------- LABEL ---------- */}
      <mesh position={[0, -0.5, 0.165]}>
        <planeGeometry args={[2.55, 0.6]} />
        <meshStandardMaterial map={labelTex} roughness={0.88} metalness={0.02} />
      </mesh>

      {/* ---------- CORNER SCREWS (4 corners, cross-head) ---------- */}
      <Screw position={[-1.30, 0.62, 0.18]} />
      <Screw position={[ 1.30, 0.62, 0.18]} />
      <Screw position={[-1.30, -0.65, 0.18]} />
      <Screw position={[ 1.30, -0.65, 0.18]} />

      {/* play / finger notch holes at the bottom */}
      <DeckHole position={[-0.55, -0.78, 0.165]} radius={0.032} />
      <DeckHole position={[ 0.55, -0.78, 0.165]} radius={0.032} />
    </group>
  );
}
