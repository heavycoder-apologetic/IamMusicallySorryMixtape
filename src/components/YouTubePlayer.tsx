import { useEffect, useRef, useState } from 'react';
import { getStartSeconds, getVideoId, TERA_MUJHSE } from '../data/songs';
import { useAudio, ytPlayer } from '../store/audioStore';

/* ---------- YT IFrame API types (minimal) ---------- */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_SCRIPT = 'https://www.youtube.com/iframe_api';

/** Load the IFrame API exactly once; resolves when window.YT.Player is ready. */
function loadYouTubeAPI(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('SSR');
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);

  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    if (!document.querySelector(`script[src="${YT_SCRIPT}"]`)) {
      const tag = document.createElement('script');
      tag.src = YT_SCRIPT;
      tag.async = true;
      document.head.appendChild(tag);
    }
  });
}

/**
 * Persistent retro mini-screen in the bottom-right. Always rendered (never
 * hidden via opacity) and pre-loaded with the mixtape's opening track so the
 * very first user gesture can call `player.playVideo()` inside the gesture
 * and audio actually starts.
 */
export function YouTubePlayer() {
  const playerRef = useRef<any>(null);
  const hostRef   = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady]   = useState(false);
  const [minimized, setMinimized] = useState(false);

  const current   = useAudio((s) => s.current);
  const reportPlayerState = useAudio((s) => s.reportPlayerState);
  const stop      = useAudio((s) => s.stop);

  /* ---- Boot the API once ---- */
  useEffect(() => {
    loadYouTubeAPI().then(() => setApiReady(true));
  }, []);

  /* ---- Create the player once with TERA_MUJHSE pre-loaded ---- */
  useEffect(() => {
    if (!apiReady || !hostRef.current || playerRef.current) return;
    const YT = window.YT;
    const initialId    = getVideoId(TERA_MUJHSE);
    const initialStart = getStartSeconds(TERA_MUJHSE);

    playerRef.current = new YT.Player(hostRef.current, {
      width: '100%',
      height: '100%',
      videoId: initialId ?? undefined,
      playerVars: {
        autoplay: 0,                 // we play manually on user gesture
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        start: initialStart,
      },
      events: {
        onReady: () => {
          ytPlayer.set(playerRef.current);
          // If user already picked a non-bg song before the player was ready,
          // sync to it.
          const c = useAudio.getState().current;
          if (c) {
            const vid = getVideoId(c);
            if (vid && vid !== initialId) {
              try {
                playerRef.current.loadVideoById({
                  videoId: vid,
                  startSeconds: getStartSeconds(c),
                });
              } catch {/* ignore */}
            }
          }
        },
        onStateChange: (e: any) => {
          const S = YT.PlayerState;
          if (e.data === S.PLAYING) reportPlayerState(true);
          else if (e.data === S.PAUSED || e.data === S.ENDED) reportPlayerState(false);
        },
      },
    });

    return () => {
      try { playerRef.current?.destroy?.(); } catch {}
      playerRef.current = null;
      ytPlayer.set(null);
    };
  }, [apiReady, reportPlayerState]);

  /* ---- Switch tracks when `current` changes (and pre-loaded id differs) ---- */
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !current) return;
    const newId = getVideoId(current);
    if (!newId) return;
    try {
      const data = p.getVideoData?.();
      if (data?.video_id === newId) {
        // same video — just (re)play
        p.playVideo?.();
        return;
      }
      p.loadVideoById({ videoId: newId, startSeconds: getStartSeconds(current) });
    } catch {/* not ready */}
  }, [current]);

  return (
    <div className="fixed z-50 bottom-4 right-4 md:bottom-6 md:right-6">
      <div className="rounded-md overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.55),inset_0_0_0_3px_#1a0f0a] ring-2 ring-bollywood-gold/70">
        <div
          className={[
            'bg-black overflow-hidden',
            minimized ? 'w-[200px] h-[6px]' : 'w-[260px] md:w-[300px] aspect-video',
          ].join(' ')}
        >
          <div ref={hostRef} className="w-full h-full" />
        </div>
      </div>

      {/* tiny caption / controls below the screen */}
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <span className="font-hand text-bollywood-cream/85 text-sm truncate max-w-[180px]">
          {current?.title ?? 'Sorry Mixtape'}
        </span>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setMinimized((m) => !m)}
            className="text-bollywood-cream/70 hover:text-bollywood-cream"
            aria-label={minimized ? 'expand player' : 'minimize player'}
          >
            {minimized ? '▢' : '—'}
          </button>
          <button
            onClick={stop}
            className="text-bollywood-cream/70 hover:text-bollywood-rose"
            aria-label="stop"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
