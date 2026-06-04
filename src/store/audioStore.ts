import { create } from 'zustand';
import { getSearchUrl, getVideoId, type Song } from '../data/songs';

/**
 * Module-level ref to the YT.Player instance. The <YouTubePlayer /> component
 * sets this when the player is created; consumers (e.g. the App's first-gesture
 * handler) can call methods on it synchronously inside the user gesture, which
 * is what browsers actually want for audio autoplay to unlock.
 */
let _ytPlayer: any = null;
export const ytPlayer = {
  set: (p: any) => { _ytPlayer = p; },
  get: () => _ytPlayer,
};

/**
 * Playback flow:
 *   - If the selected song has a YouTube video ID, the <YouTubePlayer />
 *     widget plays it in-page via the IFrame API.
 *   - Otherwise we open a YouTube search in a new tab.
 *
 * The store is the single source of truth for `current` + `isPlaying`.
 * The YouTube widget subscribes and also reports back via `reportPlayerState`
 * so that the UI stays in sync with the iframe's actual state.
 */
type AudioState = {
  current: Song | null;
  isPlaying: boolean;

  play:   (song: Song) => void;
  toggle: () => void;
  stop:   () => void;
  openCurrent: () => void;

  /** Called by <YouTubePlayer /> when the embedded player changes state. */
  reportPlayerState: (playing: boolean) => void;
};

function openSearchTab(song: Song) {
  window.open(getSearchUrl(song), '_blank', 'noopener,noreferrer');
}

export const useAudio = create<AudioState>((set, get) => ({
  current: null,
  isPlaying: false,

  play: (song) => {
    set({ current: song, isPlaying: true });
    if (!getVideoId(song)) openSearchTab(song);
    // If a video ID exists, the YouTubePlayer effect picks up the change.
  },

  toggle: () => {
    const { current, isPlaying } = get();
    if (!current) return;
    const next = !isPlaying;
    set({ isPlaying: next });
    // For songs without a video ID, "resume" means re-open the search tab.
    if (next && !getVideoId(current)) openSearchTab(current);
  },

  stop: () => set({ current: null, isPlaying: false }),

  openCurrent: () => {
    const { current } = get();
    if (!current) return;
    const id = getVideoId(current);
    const url = id
      ? `https://www.youtube.com/watch?v=${id}`
      : getSearchUrl(current);
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  reportPlayerState: (playing) => {
    if (get().isPlaying !== playing) set({ isPlaying: playing });
  },
}));
