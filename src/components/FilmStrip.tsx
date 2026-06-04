import { Fragment } from 'react';
import type { Song } from '../data/songs';
import { SongFrame } from './SongFrame';

type Props = {
  side: 'left' | 'right';
  songs: Song[];
};

/**
 * Vertical 35mm-style film strip running the full height of the viewport.
 * Two columns of rounded-rectangle sprocket holes flank the frame stack,
 * with hairline cream dividers in the celluloid bands between songs.
 */
export function FilmStrip({ side, songs }: Props) {
  const edge = side === 'left' ? 'left-0' : 'right-0';

  return (
    <aside
      className={[
        'fixed top-0', edge,
        'h-screen z-30 pointer-events-none',
        'hidden md:block',
        'w-36 md:w-40 lg:w-48',
      ].join(' ')}
      aria-label={`${side} film strip song selector`}
    >
      {/* celluloid body */}
      <div className="absolute inset-0 celluloid border-x border-black/70" />

      {/* sprocket columns — outer + inner edges */}
      <div className="sprocket-col absolute inset-y-0 left-0 w-[22px]" />
      <div className="sprocket-col absolute inset-y-0 right-0 w-[22px]" />

      {/* frame stack — evenly distributed top-to-bottom with cream hairlines between */}
      <div className="relative h-full flex flex-col justify-evenly py-4 px-[30px] pointer-events-auto">
        {songs.map((song, i) => (
          <Fragment key={song.id}>
            <SongFrame song={song} />
            {i < songs.length - 1 && (
              <div className="self-stretch h-[2px] mx-1 rounded-sm bg-bollywood-cream/55 shadow-[0_0_4px_rgba(244,231,207,0.35)]" />
            )}
          </Fragment>
        ))}
      </div>

      {/* warm gradient fades at the very top + bottom of the strip */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
    </aside>
  );
}
