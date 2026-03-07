'use client';

import { useState, useEffect } from 'react';

/**
 * Hook pour détecter les breakpoints responsive.
 * Retourne true si la largeur de la fenêtre est >= au breakpoint.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Breakpoints Tailwind : sm=640, md=768, lg=1024, xl=1280 */
export function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    /** Nombre de cartes visibles pour carrousels : 1 mobile, 2 tablette, 3 desktop */
    cardsVisible: !isMd ? 1 : !isLg ? 2 : 3,
  };
}
