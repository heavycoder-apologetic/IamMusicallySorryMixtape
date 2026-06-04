export type Song = {
  id: string;
  title: string;
  film: string;
  year: number;
  /** Tailwind gradient classes for the mini-poster */
  poster: string;
  /** Full YouTube URL or an 11-char video ID. */
  youtube?: string;
  side: 'left' | 'right';
};

/** The 5 songs — same set on both sides (10 frames total). */
const SONG_DATA = [
  {
    id: 'yeh-samaa',
    title: 'Yeh Samaa, Samaa Hai Ye Pyar Ka',
    film: 'Jab Jab Phool Khile',
    year: 1965,
    poster: 'from-pink-300 via-rose-400 to-amber-300',
    youtube: 'https://youtu.be/FZCdSmTxXRo?t=26',
  },
  {
    id: 'hume-tumse',
    title: 'Hume Tumse Pyaar Kitna',
    film: 'Kudrat',
    year: 1981,
    poster: 'from-amber-300 via-orange-400 to-rose-500',
    youtube: 'https://youtu.be/ZHyAE6yhXtY?t=51',
  },
  {
    id: 'lag-ja-gale',
    title: 'Lag Ja Gale',
    film: 'Woh Kaun Thi?',
    year: 1964,
    poster: 'from-purple-300 via-fuchsia-400 to-rose-500',
    youtube: 'https://youtu.be/P4ofSL-n3s0',
  },
  {
    id: 'aapki-nazron',
    title: 'Aapki Nazron Ne Samjha',
    film: 'Anpadh',
    year: 1962,
    poster: 'from-teal-300 via-emerald-400 to-yellow-300',
    youtube: 'https://youtu.be/LbVI1fVvf8A',
  },
  {
    id: 'bahaon-mein',
    title: 'Bahaon Mein Chale Aao',
    film: 'Anamika',
    year: 1973,
    poster: 'from-rose-300 via-pink-400 to-red-500',
    youtube: 'https://youtu.be/ZGXfELGSij8',
  },
];

export const SONGS: Song[] = [
  ...SONG_DATA.map((s) => ({ ...s, side: 'left'  as const })),
  ...SONG_DATA.map((s) => ({ ...s, side: 'right' as const })),
];

export const LEFT_SONGS  = SONGS.filter((s) => s.side === 'left');
export const RIGHT_SONGS = SONGS.filter((s) => s.side === 'right');

/**
 * The mixtape's opening track — auto-played on the user's first interaction
 * with the page (because browsers block silent autoplay before a user gesture).
 */
export const TERA_MUJHSE: Song = {
  id: 'tera-mujhse',
  title: 'Tera Mujhse Hai Pehle Ka Naata Koi',
  film: 'Aa Gale Lag Jaa',
  year: 1973,
  poster: 'from-amber-300 via-rose-400 to-pink-500',
  youtube: 'https://youtu.be/PVzKTyy8C0o?si=J558dcbwL5GFCVF6&t=2',
  side: 'left',
};

/* ---------- helpers ---------- */

/** Parse `youtube` into an 11-char video ID (or null if none / invalid). */
export function getVideoId(song: Song): string | null {
  const raw = song.youtube?.trim();
  if (!raw) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1, 12);
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = url.searchParams.get('v');
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    const m = url.pathname.match(/\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Parse `?t=N` (or `&t=Ns`) start offset from the YouTube URL. */
export function getStartSeconds(song: Song): number {
  const raw = song.youtube;
  if (!raw) return 0;
  try {
    const url = new URL(raw);
    const t = url.searchParams.get('t') ?? url.searchParams.get('start');
    if (!t) return 0;
    const m = t.match(/^(\d+)s?$/);
    return m ? parseInt(m[1], 10) : 0;
  } catch { return 0; }
}

/** Fallback URL for songs without a videoId — opens a YouTube search. */
export function getSearchUrl(song: Song): string {
  const q = encodeURIComponent(`${song.title} ${song.film} song`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
