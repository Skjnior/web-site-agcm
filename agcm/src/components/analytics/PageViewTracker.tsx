'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const lastPath = useRef<string>('');

  useEffect(() => {
    // Éviter de tracker les pages de connexion/administration pour ne pas polluer (optionnel)
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return;

    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    // Éviter le double tracking sur le même chemin (Next.js peut trigger l'effect plusieurs fois)
    if (lastPath.current === fullPath) return;
    lastPath.current = fullPath;

    const track = async () => {
      try {
        await fetch('/api/internal/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': 'internal-page-view-secret', // On utilise la clé par défaut pour simplifier
          },
          body: JSON.stringify({
            path: fullPath,
            method: 'GET',
            userAgent: navigator.userAgent,
            referer: document.referrer || undefined,
            userId: session?.user?.id || null,
            // L'IP sera détectée côté serveur par l'API
          }),
        });
      } catch (e) {
        // Silently fail
      }
    };

    // Petit délai pour s'assurer que le titre de la page est à jour si besoin
    const timeout = setTimeout(track, 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams, session]);

  return null;
}
