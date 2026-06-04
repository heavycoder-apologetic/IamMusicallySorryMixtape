import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  line: string;
  whisper?: string;
  align?: 'left' | 'right' | 'center';
};

export function LyricSection({ line, whisper, align = 'center' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-reveal]'), {
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          end:   'bottom 35%',
          scrub: 0.8,
        },
        y: 60,
        opacity: 0,
        filter: 'blur(8px)',
        stagger: 0.12,
        ease: 'power2.out',
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const alignCls =
    align === 'left'  ? 'items-start text-left'   :
    align === 'right' ? 'items-end   text-right'  :
                        'items-center text-center';

  return (
    <section
      ref={ref}
      className={[
        'relative h-screen flex flex-col justify-center',
        alignCls,
        // generous outer padding so text sits beside (not over) the cassette
        'px-8 md:px-44 lg:px-56',
      ].join(' ')}
    >
      {/* the lyric block — tight max-width + soft glass backdrop for legibility */}
      <div
        data-reveal
        className={[
          'inline-block max-w-[14rem] md:max-w-[18rem] lg:max-w-[22rem]',
          'bg-black/25 backdrop-blur-[2px] rounded-md',
          'px-4 py-3 ring-1 ring-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.45)]',
        ].join(' ')}
      >
        <p className="font-display italic text-2xl md:text-3xl lg:text-4xl text-bollywood-cream leading-tight text-shadow-emboss">
          {line}
        </p>
        {whisper && (
          <p className="mt-2 font-hand text-lg md:text-xl text-bollywood-gold/95">
            {whisper}
          </p>
        )}
      </div>
    </section>
  );
}
