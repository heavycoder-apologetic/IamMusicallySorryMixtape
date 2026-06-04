/**
 * Ambient layer of slowly-drifting music notes + hearts.
 * Pure CSS animation, no per-frame JS — sits above the background, below UI.
 */

const MOTIFS = ['♪', '♫', '♬', '♡', '♡', '♪', '❀', '♫', '♡', '♪', '♬', '♡'];

export function FloatingMotifs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {MOTIFS.map((m, i) => {
        const isHeart = m === '♡' || m === '❀';
        const left     = (i * 47 + 7) % 96;
        const delay    = ((i * 1.7) % 14).toFixed(2);
        const duration = (22 + (i * 3.1) % 18).toFixed(1);
        const size     = 14 + ((i * 9) % 22);
        const drift    = ((i % 2 === 0 ? 1 : -1) * (20 + (i * 11) % 60));
        return (
          <span
            key={i}
            className="motif"
            style={{
              left:           `${left}%`,
              fontSize:       `${size}px`,
              color:          isHeart ? 'rgba(215, 98, 131, 0.55)' : 'rgba(244, 231, 207, 0.55)',
              animationDelay:    `${delay}s`,
              animationDuration: `${duration}s`,
              ['--drift' as string]: `${drift}px`,
            }}
          >
            {m}
          </span>
        );
      })}
    </div>
  );
}
