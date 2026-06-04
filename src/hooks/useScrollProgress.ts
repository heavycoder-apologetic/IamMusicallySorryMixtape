import { useEffect, useRef, useState } from 'react';

/**
 * Returns 0..1 progress through the document.
 * Uses rAF + passive listener so it can drive 3D animations without GSAP.
 * GSAP ScrollTrigger is also used elsewhere for section reveals — this hook
 * exists separately so the R3F scene can subscribe to a plain number.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(p);
      raf.current = null;
    };
    const onScroll = () => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return progress;
}

/**
 * Same idea but exposes a ref + subscribe pattern, useful inside R3F's
 * useFrame where we don't want React re-renders for every scroll tick.
 */
export function useScrollProgressRef() {
  const ref = useRef(0);
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      ref.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return ref;
}
