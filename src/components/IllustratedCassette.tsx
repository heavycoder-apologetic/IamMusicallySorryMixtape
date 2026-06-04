import { useEffect, useRef } from 'react';
import { useScrollProgressRef } from '../hooks/useScrollProgress';
import { useAudio } from '../store/audioStore';

/* ============================================================
 * IllustratedCassette
 *
 * Flat 2D black-and-white SVG cassette. Replaces the previous R3F scene.
 * Reels rotate via direct setAttribute on <g> elements driven by
 * requestAnimationFrame, so the React tree never re-renders on scroll.
 *
 * Coordinates are in a 600×350 viewBox. The SVG scales to its container.
 * ============================================================ */

/* ---------- A single reel (origin at 0,0) ---------- */
function Reel() {
  const R = 78;        // outer wound-tape radius
  const SPOKES = 6;
  const TEETH  = 16;

  return (
    <g>
      {/* dark wound tape disc */}
      <circle cx={0} cy={0} r={R} fill="#141414" stroke="#000" strokeWidth={1.5} />

      {/* concentric tape rings — faint white spirals */}
      {Array.from({ length: 10 }).map((_, i) => (
        <circle
          key={`ring-${i}`}
          cx={0} cy={0}
          r={R - 8 - i * 6}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      {/* 6 light spokes radiating from hub to rim */}
      {Array.from({ length: SPOKES }).map((_, i) => {
        const angle = (i / SPOKES) * 360;
        return (
          <rect
            key={`spoke-${i}`}
            x={-3.5}
            y={-(R - 10)}
            width={7}
            height={R - 30}
            fill="#e8e3d2"
            rx={3}
            transform={`rotate(${angle})`}
          />
        );
      })}

      {/* inner hub plate */}
      <circle cx={0} cy={0} r={24} fill="#1a1a1a" stroke="#000" strokeWidth={1} />

      {/* sprocket teeth ring (small dots inside hub) */}
      {Array.from({ length: TEETH }).map((_, i) => {
        const angle = (i / TEETH) * Math.PI * 2;
        const x = Math.cos(angle) * 18;
        const y = Math.sin(angle) * 18;
        return <circle key={`tooth-${i}`} cx={x} cy={y} r={1.7} fill="#080808" />;
      })}

      {/* light spindle plate */}
      <circle cx={0} cy={0} r={11} fill="#b6b3aa" stroke="#000" strokeWidth={1} />

      {/* 3 drive notches */}
      {Array.from({ length: 3 }).map((_, i) => {
        const angle = (i / 3) * 360;
        return (
          <rect
            key={`notch-${i}`}
            x={-1.3} y={-7.5}
            width={2.6} height={6}
            fill="#000"
            transform={`rotate(${angle + 90})`}
          />
        );
      })}

      {/* center spindle hole */}
      <circle cx={0} cy={0} r={2.4} fill="#000" />
    </g>
  );
}

/* ---------- Cross-head screw (⊗) ---------- */
function ScrewSVG({ cx, cy, r = 9 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#e8e6df" stroke="#1a1a1a" strokeWidth={1.6} />
      <line
        x1={cx - r * 0.6} y1={cy - r * 0.6}
        x2={cx + r * 0.6} y2={cy + r * 0.6}
        stroke="#1a1a1a" strokeWidth={1.6} strokeLinecap="round"
      />
      <line
        x1={cx - r * 0.6} y1={cy + r * 0.6}
        x2={cx + r * 0.6} y2={cy - r * 0.6}
        stroke="#1a1a1a" strokeWidth={1.6} strokeLinecap="round"
      />
    </g>
  );
}

/* ============================================================ */

export function IllustratedCassette() {
  const scroll    = useScrollProgressRef();
  const isPlaying = useAudio((s) => s.isPlaying);
  const current   = useAudio((s) => s.current);

  const leftReel  = useRef<SVGGElement>(null);
  const rightReel = useRef<SVGGElement>(null);

  // mirror props into refs so the rAF loop doesn't need to re-bind
  const playingRef = useRef(isPlaying);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);

  const playRot = useRef(0);

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();

    const tick = (t: number) => {
      const dt = (t - prev) / 1000;
      prev = t;

      const p = scroll.current;            // 0..1
      const REVS = 8;

      // tiny constant rotation while a song is "playing"
      if (playingRef.current) playRot.current += dt * 90; // 90°/sec

      const leftRot   = -p * REVS * 360 + playRot.current;
      const rightRot  =  p * REVS * 360 + playRot.current;
      const leftScale  = 0.55 + p * 0.45;   // left fills as you scroll
      const rightScale = 1.0  - p * 0.45;   // right empties

      leftReel.current?.setAttribute(
        'transform',
        `translate(205 162) rotate(${leftRot.toFixed(2)}) scale(${leftScale.toFixed(3)})`,
      );
      rightReel.current?.setAttribute(
        'transform',
        `translate(395 162) rotate(${rightRot.toFixed(2)}) scale(${rightScale.toFixed(3)})`,
      );

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scroll]);

  // The cassette IS the "Sorry Mixtape". The subtitle reflects the current track.
  const title    = 'Sorry Mixtape';
  const subtitle = current ? current.title : 'a musical sorry';

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 600 350"
        className="w-full h-auto drop-shadow-[0_18px_36px_rgba(0,0,0,0.5)]"
        role="img"
        aria-label="illustrated cassette"
      >
        {/* ===== BODY ===== */}
        <rect
          x={10} y={10}
          width={580} height={330}
          rx={8}
          fill="#fbf6e8"
          stroke="#1a1a1a"
          strokeWidth={3}
        />

        {/* ===== TOP EDGE DETAILS ===== */}
        {/* 4 small filled dark holes — deck spindle openings */}
        <circle cx={150} cy={40} r={7} fill="#1a1a1a" />
        <circle cx={205} cy={40} r={7} fill="#1a1a1a" />
        <circle cx={395} cy={40} r={7} fill="#1a1a1a" />
        <circle cx={450} cy={40} r={7} fill="#1a1a1a" />

        {/* central head bay (small dark rectangle with cross) */}
        <rect x={280} y={25} width={40} height={30} rx={3} fill="#1a1a1a" />
        <line x1={293} y1={33} x2={307} y2={47} stroke="#fbf6e8" strokeWidth={1.6} strokeLinecap="round" />
        <line x1={293} y1={47} x2={307} y2={33} stroke="#fbf6e8" strokeWidth={1.6} strokeLinecap="round" />

        {/* ===== REEL WINDOW ===== */}
        {/* lighter outer "frame" around the window */}
        <rect
          x={55} y={75}
          width={490} height={170}
          rx={8}
          fill="#e8e3d2"
          stroke="#1a1a1a"
          strokeWidth={2}
        />
        {/* dark inner window */}
        <rect
          x={65} y={85}
          width={470} height={150}
          rx={4}
          fill="#0d0d0d"
        />

        {/* tape strip across the bottom of the window */}
        <line
          x1={130} y1={225} x2={470} y2={225}
          stroke="#dcd9cc" strokeWidth={2}
        />

        {/* ===== REELS — rotating + scaling via refs ===== */}
        <g ref={leftReel}  transform="translate(205 162)"><Reel /></g>
        <g ref={rightReel} transform="translate(395 162)"><Reel /></g>

        {/* ===== LABEL ===== */}
        <rect
          x={45} y={255}
          width={510} height={75}
          rx={3}
          fill="#f5efd9"
          stroke="#1a1a1a"
          strokeWidth={2}
        />
        {/* notebook ruled lines */}
        <line x1={55} y1={283} x2={545} y2={283} stroke="rgba(20,20,20,0.10)" strokeWidth={1} />
        <line x1={55} y1={303} x2={545} y2={303} stroke="rgba(20,20,20,0.10)" strokeWidth={1} />

        {/* SIDE A / 45 MIN corner badges */}
        <text x={60} y={275} className="font-display" fontSize={12} fontWeight="700" fill="#0a0a0a">
          SIDE A
        </text>
        <text x={540} y={275} className="font-display" fontSize={12} fontWeight="700" textAnchor="end" fill="#0a0a0a">
          45 MIN
        </text>

        {/* Title — large serif italic, centered */}
        <text
          x={300} y={303}
          className="font-display"
          fontSize={32}
          fontWeight="700"
          fontStyle="italic"
          textAnchor="middle"
          fill="#0a0a0a"
        >
          {title}
        </text>

        {/* Subtitle — handwriting */}
        <text
          x={300} y={324}
          className="font-hand"
          fontSize={16}
          textAnchor="middle"
          fill="#1a1a1a"
        >
          {subtitle}
        </text>

        {/* ===== CORNER SCREWS ===== */}
        <ScrewSVG cx={35}  cy={40}  />
        <ScrewSVG cx={565} cy={40}  />
        <ScrewSVG cx={35}  cy={310} />
        <ScrewSVG cx={565} cy={310} />
      </svg>
    </div>
  );
}
