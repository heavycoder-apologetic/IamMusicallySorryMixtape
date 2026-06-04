import { useScrollProgress } from '../hooks/useScrollProgress';

/* ---------- helpers ---------- */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRgb = (a: [number, number, number], b: [number, number, number], t: number) =>
  `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(lerp(a[2], b[2], t))})`;

/**
 * Background gradient endpoints — interpolated by scroll progress.
 *
 *   p = 0  → deep plum / wine / sepia (matches the hero feel)
 *   p = 1  → dusty rose / muted mauve glow, base color rgba(145, 72, 86, *)
 */
const DARK = {
  stop1: [26, 8, 16]   as [number, number, number],   // #1a0810
  stop2: [42, 16, 24]  as [number, number, number],   // #2a1018
  stop3: [31, 14, 8]   as [number, number, number],   // #1f0e08
  roseAlpha:  0.22,
  amberAlpha: 0.18,
};

const LIGHT = {
  stop1: [74, 32, 42]   as [number, number, number],   // dusty wine
  stop2: [145, 72, 86]  as [number, number, number],   // dusty rose (the hero glow)
  stop3: [120, 80, 60]  as [number, number, number],   // warm sepia
  roseAlpha:  0.65,
  amberAlpha: 0.38,
};

export function BackgroundEffects() {
  const p = useScrollProgress();

  const stop1 = lerpRgb(DARK.stop1, LIGHT.stop1, p);
  const stop2 = lerpRgb(DARK.stop2, LIGHT.stop2, p);
  const stop3 = lerpRgb(DARK.stop3, LIGHT.stop3, p);
  const roseA  = lerp(DARK.roseAlpha,  LIGHT.roseAlpha,  p).toFixed(3);
  const amberA = lerp(DARK.amberAlpha, LIGHT.amberAlpha, p).toFixed(3);

  const bg = `
    radial-gradient(circle at 45% 35%, rgba(145, 72, 86, ${roseA}), transparent 55%),
    radial-gradient(circle at 80% 70%, rgba(180, 120, 90, ${amberA}), transparent 50%),
    linear-gradient(135deg, ${stop1} 0%, ${stop2} 50%, ${stop3} 100%)
  `;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base gradient — interpolated dark→light as you scroll */}
      <div className="absolute inset-0" style={{ background: bg }} />

      {/* bokeh dots — drift gently with scroll */}
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{ transform: `translate3d(0, ${-p * 60}px, 0)` }}
      >
        {Array.from({ length: 18 }).map((_, i) => {
          const left = (i * 53) % 100;
          const top  = (i * 37) % 100;
          const size = 30 + ((i * 17) % 90);
          const hue  = i % 2 === 0 ? '#d4a24c' : '#d76283';
          return (
            <span
              key={i}
              className="absolute rounded-full blur-2xl opacity-30"
              style={{
                left: `${left}%`,
                top:  `${top}%`,
                width: size,
                height: size,
                background: hue,
              }}
            />
          );
        })}
      </div>

      {/* light leaks — warm streaks, intensify slightly with scroll */}
      <div
        className="absolute -top-32 -right-32 h-[60vh] w-[60vh] rounded-full bg-gradient-to-br from-amber-300 via-rose-400 to-transparent blur-3xl animate-lightleak"
        style={{ opacity: 0.30 + p * 0.20 }}
      />
      <div
        className="absolute -bottom-40 -left-32 h-[55vh] w-[55vh] rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-transparent blur-3xl animate-lightleak"
        style={{ opacity: 0.22 + p * 0.20 }}
      />

      {/* vignette — softens as you scroll into the lighter mauve */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${(0.75 - p * 0.35).toFixed(2)}) 100%)`,
        }}
      />
    </div>
  );
}

/** Render LAST in the tree so the grain sits above everything. */
export function FilmGrain() {
  return <div className="film-grain" aria-hidden />;
}
