import { motion } from 'framer-motion';
import type { Song } from '../data/songs';
import { useAudio } from '../store/audioStore';

function Equalizer() {
  return (
    <div className="flex h-3.5 items-end" aria-hidden>
      <span className="eq-bar h-full" />
      <span className="eq-bar h-full" />
      <span className="eq-bar h-full" />
      <span className="eq-bar h-full" />
    </div>
  );
}

export function SongFrame({ song }: { song: Song }) {
  const current   = useAudio((s) => s.current);
  const isPlaying = useAudio((s) => s.isPlaying);
  const play      = useAudio((s) => s.play);
  const toggle    = useAudio((s) => s.toggle);

  const isActive = current?.id === song.id;
  const isLive   = isActive && isPlaying;

  const onClick = () => {
    if (isActive) toggle();
    else play(song);
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.035, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={[
        'group relative block w-full aspect-[4/3]',
        'rounded-[6px] overflow-hidden',
        'ring-1 ring-black/80',
        'shadow-[0_2px_0_rgba(0,0,0,0.35),inset_0_0_0_2px_rgba(0,0,0,0.55)]',
        'transition-shadow duration-300',
        isActive ? 'shadow-[0_0_0_2px_#d4a24c,0_0_22px_rgba(212,162,76,0.55)]' : '',
      ].join(' ')}
      aria-label={`${isLive ? 'Pause' : 'Play'} ${song.title} on YouTube`}
      aria-pressed={isLive}
    >
      {/* poster gradient — placeholder mini artwork */}
      <div className={`absolute inset-0 bg-gradient-to-br ${song.poster}`} />

      {/* paper / glow overlays */}
      <div className="absolute inset-0 mix-blend-multiply opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(0,0,0,0.78)_100%)]" />

      {/* title block */}
      <div className="absolute inset-x-0 bottom-0 px-2 pb-1.5 pt-2 text-left">
        <p className="font-hand text-bollywood-cream text-[15px] leading-tight drop-shadow-md line-clamp-1">
          {song.title}
        </p>
        <p className="font-body italic text-[9px] text-bollywood-cream/85 leading-tight line-clamp-1">
          {song.film} · {song.year}
        </p>
      </div>

      {/* play / pause / equalizer pill */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5 rounded-full bg-bollywood-ink/75 px-1.5 py-1 backdrop-blur-sm">
        {isLive ? (
          <Equalizer />
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" className="fill-bollywood-cream">
            {isActive ? (
              <>
                <rect x="1" y="1" width="3" height="8" />
                <rect x="6" y="1" width="3" height="8" />
              </>
            ) : (
              <polygon points="2,1 9,5 2,9" />
            )}
          </svg>
        )}
      </div>

      {/* corner YouTube glyph (always visible, denotes external playback) */}
      <div className="absolute top-1.5 left-1.5 rounded-sm bg-bollywood-ink/70 px-1 py-[1px] backdrop-blur-sm">
        <svg width="14" height="10" viewBox="0 0 24 17" className="fill-bollywood-rose">
          <path d="M23.5 2.6a3 3 0 0 0-2.1-2.1C19.6 0 12 0 12 0S4.4 0 2.6.5A3 3 0 0 0 .5 2.6 31 31 0 0 0 0 8.5a31 31 0 0 0 .5 5.9 3 3 0 0 0 2.1 2.1C4.4 17 12 17 12 17s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 8.5a31 31 0 0 0-.5-5.9z" />
          <polygon points="9.5,12 16,8.5 9.5,5" fill="#1a0f0a" />
        </svg>
      </div>

      {/* hover warm light leak */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_right,rgba(255,210,150,0.45),transparent_60%)]" />
    </motion.button>
  );
}
