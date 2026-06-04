import { useAudio } from '../store/audioStore';
import { IllustratedCassette } from './IllustratedCassette';

/**
 * Sticky middle layer: the cassette stays pinned to the viewport while the
 * lyric sections scroll past it. Caption + open-on-YouTube affordance sit
 * beneath the cassette.
 */
export function StickyCassette() {
  const current     = useAudio((s) => s.current);
  const isPlaying   = useAudio((s) => s.isPlaying);
  const toggle      = useAudio((s) => s.toggle);
  const openCurrent = useAudio((s) => s.openCurrent);

  return (
    <div className="sticky top-0 h-screen w-full z-10 pointer-events-none flex items-center justify-center">
      {/* the 2D cassette — centered in the viewport */}
      <div className="pointer-events-auto w-full max-w-[min(92vw,820px)] px-4">
        <IllustratedCassette />
      </div>

      {/* caption beneath cassette */}
      <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-2 pointer-events-none">
        <p className="font-hand text-bollywood-gold/90 text-2xl md:text-3xl text-shadow-soft">
          {current ? `Now playing — ${current.title}` : 'Press a frame to begin'}
        </p>
        {current && (
          <div className="flex items-center gap-4 pointer-events-auto">
            <button
              onClick={toggle}
              className="font-body italic text-bollywood-cream/90 hover:text-bollywood-cream underline-offset-4 hover:underline transition"
            >
              {isPlaying ? '❚❚ pause' : '▶ resume'}
            </button>
            <span className="text-bollywood-cream/30">·</span>
            <button
              onClick={openCurrent}
              className="font-body italic text-bollywood-rose/90 hover:text-bollywood-rose underline-offset-4 hover:underline transition inline-flex items-center gap-1"
            >
              open on YouTube
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M14 4h6v6M20 4L9 15M10 4H4v16h16v-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* scroll cue */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-bollywood-cream/70 text-xs tracking-[0.4em] uppercase font-body">
        <span className="inline-block animate-pulse">◀◀ scroll to rewind</span>
      </div>
    </div>
  );
}
