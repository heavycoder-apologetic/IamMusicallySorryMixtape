import { useEffect } from 'react';
import { FilmStrip } from './components/FilmStrip';
import { StickyCassette } from './components/StickyCassette';
import { LyricSection } from './components/LyricSection';
import { BackgroundEffects, FilmGrain } from './components/BackgroundEffects';
import { FloatingMotifs } from './components/FloatingMotifs';
import { YouTubePlayer } from './components/YouTubePlayer';
import { LEFT_SONGS, RIGHT_SONGS, TERA_MUJHSE } from './data/songs';
import { useAudio, ytPlayer } from './store/audioStore';

const LINES = [
  { line: 'I’m sorry.',                                whisper: 'I really am.' },
  { line: 'I should have said it sooner.',             whisper: 'before the song faded out.' },
  { line: 'If words won’t fix it,',                    whisper: 'maybe these old songs will.' },
  { line: 'Every track in this tape is for you.',      whisper: 'side A, the gentle ones.' },
  { line: 'Can we please rewind?',                     whisper: 'just to the part where we still smiled.' },
];

/**
 * On the user's first real interaction, start Tera Mujhse — but call
 * `player.playVideo()` directly inside the gesture handler so the browser's
 * audio-autoplay heuristics treat it as user-initiated. If the user already
 * picked a song, we don't override their choice.
 */
function useFirstInteractionBackgroundMusic() {
  useEffect(() => {
    let triggered = false;
    const tryStart = () => {
      if (triggered) return;
      triggered = true;
      const store = useAudio.getState();
      if (store.current) return; // user already picked something
      const p = ytPlayer.get();
      try {
        p?.unMute?.();
        p?.setVolume?.(100);
        p?.playVideo?.();   // synchronous, in-gesture → unlocks audio
      } catch {/* ignore */}
      store.play(TERA_MUJHSE); // updates store + label
    };
    const evts = ['click', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;
    const opts = { once: true, passive: true } as const;
    evts.forEach((e) => window.addEventListener(e, tryStart, opts));
    return () => evts.forEach((e) => window.removeEventListener(e, tryStart));
  }, []);
}

export default function App() {
  useFirstInteractionBackgroundMusic();

  return (
    <main className="relative bg-vintage-gradient text-bollywood-cream">
      {/* fixed layered background */}
      <BackgroundEffects />

      {/* ambient floating music notes + hearts */}
      <FloatingMotifs />

      {/* fixed side film strips */}
      <FilmStrip side="left"  songs={LEFT_SONGS} />
      <FilmStrip side="right" songs={RIGHT_SONGS} />

      {/* scrolling stack: header → sticky cassette pinned while lyrics scroll past → footer */}
      <div className="relative">
        {/* Intro hero — the apology */}
        <section className="relative h-screen flex flex-col items-center justify-center px-6 md:px-44 lg:px-56 text-center z-20 pointer-events-none">
          <p className="font-hand text-bollywood-gold/90 text-2xl md:text-3xl mb-3">
            a little tape, made with shaking hands…
          </p>
          <h1 className="font-display italic text-6xl md:text-7xl lg:text-8xl text-bollywood-cream leading-[1.05] text-shadow-emboss">
            I’m <span className="text-bollywood-rose">sorry</span>
            <span className="font-hand text-bollywood-rose ml-3 align-middle text-5xl md:text-6xl">♡</span>
          </h1>
          <p className="mt-4 font-hand text-3xl md:text-5xl text-bollywood-cream/95 leading-tight">
            ◀◀ can we please <span className="italic">rewind?</span>
          </p>
          <p className="mt-8 font-body italic text-bollywood-cream/75 max-w-xl">
            i made you a mixtape. five songs from when love was simpler.
            pick a frame, scroll the reel, let me try again.
          </p>
        </section>

        {/* Sticky 2D cassette starts here; siblings below scroll past it */}
        <div className="relative">
          <StickyCassette />

          {/* lyric reveals positioned ON TOP of the sticky cassette via negative margin */}
          <div className="relative -mt-[100vh] z-20 pointer-events-none">
            {LINES.map((l, i) => (
              <LyricSection
                key={i}
                line={l.line}
                whisper={l.whisper}
                align={i % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        </div>

        {/* Outro — the closing apology */}
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-6 md:px-8 text-center z-20">
          <p className="font-hand text-bollywood-gold text-3xl md:text-5xl">
            ◀◀ end of side A
          </p>

          {/* THE closing statement — a lyric, flanked by music notes */}
          <p className="mt-14 font-display italic text-4xl md:text-6xl lg:text-[4.5rem] leading-[1.2] text-bollywood-cream max-w-5xl text-shadow-emboss px-4">
            <span className="text-bollywood-gold/85 mr-3 md:mr-5 inline-block">♫</span>
            Aapki Manzil main hoon, Meri Manzil aap hai
            <span className="text-bollywood-gold/85 ml-3 md:ml-5 inline-block">♫</span>
          </p>

          <p className="mt-14 font-hand text-4xl md:text-6xl text-bollywood-rose">
            i miss you <span className="text-bollywood-cream/90">·</span> i love you
            <span className="ml-3">♡</span>
          </p>

          <p className="mt-10 font-display italic text-3xl md:text-4xl text-bollywood-gold/90">
            forgive me?
          </p>
        </section>
      </div>

      {/* tiny YouTube screen — only visible when a song with a video plays */}
      <YouTubePlayer />

      {/* film grain — must sit above 3D canvas + UI */}
      <FilmGrain />
    </main>
  );
}
